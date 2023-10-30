import * as Connection from 'imap';
import { Box, ImapMessage, MailBoxes } from 'imap';
import { BaseMailMessage, BodyPart, PreparedMessage } from '../dto/email-message';
import { MailParser, MessageStructure } from './mail-parser';
import { List } from '../dto/list';
import { MailDecoder } from './mail-decoder';
import { LoadOptions, MessageQueryOptions } from '../dto/query-options';

const Imap = require('imap');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

/**
 * user and password are required;
 * default configuration:
 * @example
 * host: "imap.gmail.com"
 * port: 993,
 * tls: true
 */
export interface ImapCredentials {
  user: string;
  password: string;
  box: string;

  host?: string;
  port?: number;
  tls?: boolean;
}

export interface NativeMessage extends BaseMailMessage {
  struct: MessageStructure;
  rawData?: string;
}

interface AsyncOperation {
  reject: (err?: unknown) => void;
}

export class ImapMail {
  private readonly SEEN_FLAG: string = '\\Seen';
  private currentOperations: AsyncOperation[] = [];
  private _isConnected = true;

  get accountMail() {
    return this.account;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  private constructor(
    private readonly imap: Connection,
    private readonly conversationBox: string,
    private readonly account: string
  ) {
  };

  async reconnect(): Promise<void> {
    try {
      this.imap.end();
    } catch (ignore) {
    }

    return new Promise((resolve, reject) => {
      this.imap.connect();

      this.imap.once('ready', () => {
        this._isConnected = true;
        resolve();
      });
      this.imap.once('error', (err: Error) => {
        this.rejectAllOperations(err);
        reject(err);
      });
      this.imap.once('end', () => {
        this.rejectAllOperations();
        reject(null);
      });
    });
  }

  static async init(credentials: ImapCredentials, timeout = 10000): Promise<ImapMail> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        host: credentials.host ?? 'imap.gmail.com',
        port: credentials.port ?? 993,
        tls: credentials.tls ?? true,
        user: credentials.user,
        password: credentials.password,
        connTimeout: timeout,
        authTimeout: timeout * 3
      });

      const client = new ImapMail(imap, credentials.box, credentials.user);
      imap.connect();

      imap.once('ready', () => {
        resolve(client);
      });
      imap.once('error', (err: Error) => {
        client.rejectAllOperations(err);
        reject(err);
      });
      imap.once('end', () => {
        client.rejectAllOperations();
        reject(null);
      });
    });
  }

  dispose() {
    this.imap.end();
  }

  async getUidNext(): Promise<number> {
    const box = await this.openBox(this.conversationBox);
    return box.uidnext;
  }

  async setUnSeen(uid: number): Promise<void> {
    await this.openBox(this.conversationBox);
    return new Promise<void>((resolve, reject) => {
      this.imap.delFlags([uid], [this.SEEN_FLAG], (e) => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  }

  async setSeen(uid: number): Promise<void> {
    await this.openBox(this.conversationBox);
    return new Promise<void>((resolve, reject) => {
      this.imap.setFlags([uid], [this.SEEN_FLAG], (e) => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  }

  async searchEmails(from?: string, uid = 0): Promise<any> {
    const criteria: any[] = [];
    if (from) {
      criteria.push(['OR', ['TO', from], ['FROM', from]]);
    }

    if (uid) {
      criteria.push(['UID', `${ ++uid }:*`]);
    }

    return new Promise<any>((resolve, reject) => {
      this.currentOperations.push({ reject });
      this.imap.search(criteria, (err, ids) => {
        if (err) {
          reject(err);
        } else {
          resolve(ids.filter(i => i >= uid));
        }
      });
    });
  }

  async getAttachment(uid: number, partId: string): Promise<NodeJS.ReadableStream> {
    if (!uid || !partId) {
      throw new Error('uid or/and partId are required');
    }

    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      const queue = this.imap.fetch([uid], { bodies: [partId] });
      queue.once('message', (m: any) => {
        m.on('body', (stream: any) => resolve(stream));
      });
      queue.once('error', reject);
      queue.once('end', async () => {
        this.dispose();
      });
    });
  }

  async getMails(query: MessageQueryOptions): Promise<List<PreparedMessage>> {
    // console.time("Search ids");
    let ids: number[] = await this.searchEmails(query.searchEmail, query.sinceUid);
    const count = ids.length;
    // console.timeEnd("Search ids");

    // ids.forEach(i => console.log("id: " + i));

    if (query.searchEmail && query.take) {
      // console.time("pagination");
      const end = count - (query.skip || 0);
      let start = end - query.take;
      if (start < 0) {
        start = 0;
      }
      if (end <= 0) {
        return { count, items: [] };
      }
      // console.log("start: ", start);
      // console.log("end: ", end);
      ids = ids.slice(start, end);
      // console.log("ids: ", ids);
      // console.timeEnd("pagination");
    }

    if (!ids?.length) {
      return { count, items: [] };
    }

    const bodies: string[] = [];
    if (query.headers?.length) {
      bodies.push(`HEADER.FIELDS (${ query.headers.join(' ') })`);
    }
    if (query.body) {
      bodies.push('1');
    }

    // console.time("Structure and headers");
    const loadOptions: LoadOptions = {
      loadStructure: query.body || query.attachments,
      linkReplacerFunction: query.linkReplacerFunction
    }
    const messages = await this.readMessages(ids, bodies, loadOptions);
    // console.timeEnd("Structure and headers");

    const items = messages.map((message: NativeMessage) => {
      const result = {
        uid: message.uid,
        from: message.from,
        to: message.to,
        date: message.date,
        subject: message.subject,
        seen: message.seen,
        // encoding: message.encoding,
        // bodyPartId: message.bodyPartId,
        contentType: message.contentType
      } as PreparedMessage;

      if (query.attachments) {
        result.attachments = message.struct?.attachments || [];
      }
      if (query.body) {
        result.body = message.rawData?.trim() || '';
      }

      return result;
    }).reverse();

    return { count, items };
  }

  /**
   * Method reads the messages by query;
   * @param query -- list of message ids or criteria
   * @param bodies -- parts of message that need to be queried
   * @param options -- has to parameters:
   *  - loadStructure -- set true if structure is needed
   *  - rawData -- set true if you do not need to parse headers, just return string of bytes
   */
  private async readMessages(query: any, bodies: string[], options?: LoadOptions): Promise<NativeMessage[]> {
    interface OrderedMessage {
      message: Promise<NativeMessage>;
      order: number;
    }

    return new Promise<NativeMessage[]>((resolve, reject) => {
      this.currentOperations.push({ reject });
      const queue = this.imap.fetch(query, { bodies, struct: options?.loadStructure });
      const messages: OrderedMessage[] = [];

      queue.on('message', async (message, order) => {
        messages.push({
          message: this.readMessage(message, options),
          order
        });
      });
      queue.once('error', reject);
      queue.once('end', async () => {
        const result = await Promise.all(
          messages
            .sort((m1, m2) => m1.order - m2.order)
            .map(m => m.message)
        );

        resolve(result);
      });
    });
  }

  private async readMessage(m: ImapMessage, options?: LoadOptions): Promise<NativeMessage> {
    return new Promise<NativeMessage>(resolve => {
      const headerChunks: NodeJS.ReadableStream[] = [];
      const dataChunks: NodeJS.ReadableStream[] = [];
      let uid: number | undefined;
      let seen = false;
      let struct: MessageStructure | undefined;
      m.on('body', (stream, info) => {
        const isBody = options?.rawData || info.which === '1';
        const chunks = isBody ? dataChunks : headerChunks;
        chunks.push(stream);
      });
      m.once('attributes', (arg) => {
        uid = arg.uid as number;
        if (options?.loadStructure) {
          struct = MailParser.parseMessageStructure(arg.struct);
        }
        seen = arg.flags?.includes(this.SEEN_FLAG) || false;
      });
      m.once('end', async () => {
        const dataLoadOptions = { ...options };
        let structBody: BodyPart;
        if (struct?.body?.length) {
          structBody =
            struct.body.find(b => b.contentType === 'text/html') ||
            struct.body.find(b => b.contentType = 'text/plain') ||
            struct.body.find(b => !!b.charset) ||
            struct.body[0];

          if (!structBody.contentType?.includes('text')) {
            console.warn('WARNING NO GOOD STRUCT: ');
            console.warn(struct);
          }
          dataLoadOptions.charset = structBody?.charset || dataLoadOptions.charset;
          dataLoadOptions.encoding = structBody?.encoding;
        }

        const headersPayload = await Promise.all(headerChunks.map(s => MailDecoder.decodeStream(s, options)));
        const dataPayload = await Promise.all(dataChunks.map(s => MailDecoder.decodeStream(s, dataLoadOptions)));
        if (dataPayload.length > 1 || headersPayload.length > 1) {
          console.warn('WARNING OF BODY OR PAYLOAD BIGGER THAN 1');
          console.warn('body', dataPayload);
          console.warn('payload', headersPayload);
        }
        const [headersString] = headersPayload;
        const [rawData] = dataPayload;

        const headers = MailParser.parseHeaders(headersString);
        const result = {
          ...headers,
          struct,
          uid,
          seen
        } as NativeMessage;

        if (rawData) {
          const bodyStruct = struct?.body?.find(b => !!b.contentType);
          // console.log("bodyStruct: ", bodyStruct);
          result.rawData = MailParser.parseMessageBody(uid as number, rawData, struct);
          result.encoding = dataLoadOptions.encoding || bodyStruct?.encoding;
          result.contentType = bodyStruct?.contentType;
          result.bodyPartId = bodyStruct?.partId;
        }

        // if (struct.body?.length > 1) {
        //   console.warn("\n\nbody length is more than 1 is structure: ");
        //   console.log("struct: ", struct);
        //   console.log("encoded: ", dataPayload);
        //   console.log("decoded: ", result.rawData);
        // }
        resolve(result);
      });
    });
  }

  private async openBox(boxName: string): Promise<Box> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(boxName, (err, box) => {
        if (err) {
          reject(err);
        } else {
          resolve(box);
        }
      });
    });
  }

  async getBoxes(): Promise<string[]> {
    const boxes = await this.getNativeBoxes();
    return this.getBoxDto('', boxes);
  }

  private getBoxDto(boxName: string, children?: MailBoxes): string[] {
    const childrenSize = Object.keys(children ?? {}).length;
    if (!childrenSize) {
      return [boxName];
    }

    const result = [];
    for (const c in children) {
      if (c) {
        const nextBoxName = [boxName, c].filter(p => p.length).join('/');
        const boxes = this.getBoxDto(nextBoxName, children[c]?.children);
        result.push(...boxes);
      }
    }
    return result;
  }

  private async getNativeBoxes(): Promise<MailBoxes> {
    return new Promise<MailBoxes>((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
        } else {
          resolve(boxes);
        }
      });
    });
  }

  private rejectAllOperations(err?: unknown): void {
    this._isConnected = false;
    while (this.currentOperations.length > 0) {
      const operation = this.currentOperations.shift();
      operation?.reject(err);
    }
  }

}

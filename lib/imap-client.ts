import { Box, Config, ImapMessage, MailBoxes } from 'imap';
import { DateUtil, MailHeaders, MimeType } from './types/util';
import { ImapConfig } from './types/credentials';
import { LoadOptions, MessageQuery, SearchOptions } from './types/query';
import { SearchBuilder } from './search-builder';
import { MessageStructure, NativeMessage, PreparedMessage } from './types/message';
import { List } from './types/list';
import { MailParser } from './mail-parser';
import { MailDecoder } from './mail-decoder';
import * as Imap from 'imap';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

interface AsyncOperation {
  reject: (err?: unknown) => void;
}

export class ImapClient {
  private static readonly THREAD_ID_FLAG = 'x-gm-thrid'; // X-GM-THRID
  private static readonly SEEN_FLAG = '\\Seen';
  static readonly SENT_BOX = 'Sent';

  private get BODY_PART_INDEX() {
    return this.isGmail ? '1' : 'TEXT';
  }

  static readonly ALL_HEADERS: MailHeaders[] = ['FROM', 'TO', 'DATE', 'SUBJECT', 'MESSAGE-ID'];

  private currentOperations: AsyncOperation[] = [];
  private _isConnected = true;
  private openedBox: Box | undefined;
  isGmail = false;

  get accountMail() {
    return this.account;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  private constructor(
    private readonly imap: Imap,
    public readonly conversationBox: string,
    private readonly account: string
  ) {
  };

  private async openBox(boxName: string): Promise<Box> {
    if (this.openedBox?.name === boxName) {
      // console.log(`Box ${boxName} already opened`);
      return this.openedBox;
    } else {
      // console.log(`Opening box ${boxName}...`);
    }

    return new Promise<Box>((resolve, reject) => {
      this.imap.openBox(boxName, (err, box) => {
        if (err) {
          reject(err);
        } else {
          this.openedBox = box;
          resolve(box);
        }
      });
    });
  }

  async reconnect(): Promise<void> {
    this.openedBox = undefined;

    try {
      this.imap.end();
    } catch (ignore) {
    }

    return new Promise<void>((resolve, reject) => {
      this.imap.connect();

      this.imap.once('ready', () => {
        this._isConnected = true;
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        this.rejectAllOperations('Error ' + (err.message || err.name), err);
        reject(err);
      });

      this.imap.once('end', () => {
        this.rejectAllOperations('Client closed', null);
        reject(null);
      });
    });
  }

  static async init(credentials: ImapConfig, isGmail?: boolean, timeout = 2000): Promise<ImapClient> {
    return new Promise<ImapClient>(async (resolve, reject) => {
      const { user, password, conversationBox } = credentials;

      const imap = new Imap({
        ...credentials,
        user,
        password,
        tls: credentials.tls ?? true,
        socketTimeout: timeout,
        authTimeout: timeout * 2
      } as Config);

      const client = new ImapClient(imap, conversationBox, user);
      client.isGmail = !!isGmail || user.endsWith('@gmail.com');

      client.reconnect()
        .then(() => resolve(client))
        .catch(reject);
    });
  }

  dispose() {
    this.openedBox = undefined;
    this.imap.end();
  }

  async getUidNext(boxName?: string): Promise<number> {
    const box = await this.openBox(boxName ?? this.conversationBox);
    return box.uidnext;
  }

  async setUnSeen(uid: number): Promise<void> {
    await this.openBox(this.conversationBox);
    return new Promise<void>((resolve, reject) => {
      this.imap.delFlags([uid], [ImapClient.SEEN_FLAG], (e) => {
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
      this.imap.setFlags([uid], [ImapClient.SEEN_FLAG], (e) => {
        if (e) {
          reject(e);
        } else {
          resolve();
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

    const result = [] as string[];
    for (const c in children) {
      if (c) {
        const nextBoxName = [boxName, c].filter(p => p.length).join('/');
        const boxes = this.getBoxDto(nextBoxName, children?.[c]?.children);
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

  private async searchEmails(options?: SearchOptions): Promise<number[]> {
    const criteria: any[] = [];
    let searchEmail = options?.searchEmail || [];
    let uid = options?.sinceUid || 0;

    if (typeof searchEmail === 'string') {
      searchEmail = [searchEmail];
    }

    if (searchEmail?.length) {
      const opponentCriteria = SearchBuilder.buildOpponentCriteria(searchEmail);
      criteria.push(opponentCriteria);
    }

    if (options?.sinceUid) {
      criteria.push(['UID', `${++uid}:*`]);
    }

    if (options?.sentBefore) {
      const date = DateUtil.withOffset(options.sentBefore, 1);
      const dateCriteria = DateUtil.dateOnly(date);
      criteria.push(['SENTBEFORE', dateCriteria]);
    }

    if (options?.sentAfter) {
      const date = DateUtil.withOffset(options.sentAfter, -1);
      const dateCriteria = DateUtil.dateOnly(date);
      criteria.push(['SENTSINCE', dateCriteria]);
    }

    if (options?.threadId) {
      criteria.push([ImapClient.THREAD_ID_FLAG.toUpperCase(), String(options.threadId)]);
    }

    return new Promise<any>((resolve, reject) => {
      this.currentOperations.push({ reject });
      this.imap.search(criteria, (err, ids) => {
        if (err) {
          reject(err);
        } else {
          // console.log("results: ", ids);
          resolve(ids.filter(i => i >= uid));
        }
      });
    });
  }

  async getAttachment(uid: number, partId: string, box?: string): Promise<NodeJS.ReadableStream> {
    // if (!uid || !partId) {
    //   throw new BadRequestException("uid or/and partId are required");
    // }

    await this.openBox(box || this.conversationBox);
    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      const queue = this.imap.fetch([uid], { bodies: [partId] });
      queue.once('message', (m: any) => {
        m.on('body', (stream: any) => resolve(stream));
      });
      queue.once('error', reject);
    });
  }

  async getLatestEmail(searchEmail: string, query: MessageQuery): Promise<PreparedMessage | null> {
    await this.openBox(this.conversationBox);
    let latest = await this.getLatestInCurrentBox(searchEmail, query);

    if (!this.isGmail) {
      await this.openBox(ImapClient.SENT_BOX);
      const latestSent = await this.getLatestInCurrentBox(searchEmail, query);
      latest ??= latestSent;

      if (latestSent && latestSent.date.getTime() > latest!.date.getTime()) {
        latest = latestSent;
      }
    }

    return latest;
  }

  private async getLatestInCurrentBox(searchEmail: string, query: MessageQuery): Promise<PreparedMessage | null> {
    const now = new Date();
    const dateGap = 14;
    const sentAfter = DateUtil.withOffset(now, -dateGap);

    const ids = await this.searchEmails({ searchEmail, sentAfter });
    const maxId = Math.max(...ids, 0);

    if (!maxId) {
      return null;
    }

    return await this.getOne(maxId, { ...query, box: this.openedBox?.name });
  }

  async getMails(query: MessageQuery): Promise<List<PreparedMessage>> {
    // console.time("Search ids");
    const box = query.box ?? this.conversationBox;
    await this.openBox(box);

    let ids = await this.searchEmails(query);
    const count = ids.length;
    // console.timeEnd("Search ids");
    // console.log("ids count: ", count);

    // ids.forEach(i => console.log("id: " + i));

    // apply pagination if no pagination by time
    if (query.searchEmail && query.take) {
      const hasDatePagination = !!query.sentBefore;
      const paginationScaleFactor = hasDatePagination ? 1 : 10;

      const skip = Math.round((query.skip ?? 0) / paginationScaleFactor);
      const take = Math.round((query.take ?? 10) * paginationScaleFactor);

      // console.log("query: ", query);
      // console.log("page: ", { skip, take });

      // console.time("pagination");
      const end = count - skip;
      let start = end - take;
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

    const loadOptions = this.buildLoadOptions(query, box);
    const bodies = this.buildBodiesQuery(query);

    // console.time("Structure and headers");
    const messages = await this.readMessages(ids, bodies, loadOptions);
    // console.timeEnd("Structure and headers");

    const items = [] as PreparedMessage[];
    let email: NativeMessage;
    let prepared: PreparedMessage;
    let emailDate: Date;

    const sendBefore = (query.sentBefore || new Date()).getTime();
    const sendAfter = (query.sentAfter || new Date(1990, 1, 1)).getTime();

    for (let i = messages.length - 1; i >= 0; i--) {
      email = messages[i];
      emailDate = new Date(email.date);
      const timestamp = emailDate.getTime();

      if (timestamp < sendBefore && timestamp > sendAfter) {
        prepared = this.nativeMessageToPrepared(email, query, box);
        items.push(prepared);
      }
    }

    return { count, items };
  }

  async getOne(uid: number, query: MessageQuery): Promise<PreparedMessage | null> {
    const box = query?.box ?? this.conversationBox;
    const mail = await this.getOneNative(uid, query);
    return mail && this.nativeMessageToPrepared(mail, query, box);
  }

  private async getOneNative(uid: number, query: MessageQuery): Promise<NativeMessage | null> {
    const box = query?.box ?? this.conversationBox;
    await this.openBox(box);

    const loadOptions = this.buildLoadOptions(query, box);
    const bodies = this.buildBodiesQuery(query);

    const queue = this.imap.fetch([+uid], { bodies, struct: true });
    return new Promise<NativeMessage | null>((resolve, reject) => {
      let isExist = false;
      queue.once('error', reject);

      queue.once('message', async (m: ImapMessage) => {
        isExist = true;
        this.readMessage(m, loadOptions).then(resolve).catch(reject);
      });

      queue.once('end', () => {
        if (!isExist) {
          resolve(null);
        }
      });
    });
  }

  /**
   * Method reads the messages by query;
   * @param query -- list of message ids or criteria
   * @param bodies -- parts of message that need to be queried
   * @param options -- has to parameters:
   *  - loadStructure -- set true if structure is needed
   *  - rawData -- set true if you do not need to parse headers, just return string of bytes
   */
  private async readMessages(query: any, bodies: string[], options: LoadOptions): Promise<NativeMessage[]> {
    interface OrderedMessage {
      message: Promise<NativeMessage>;
      order: number;
    }

    return new Promise<NativeMessage[]>((resolve, reject) => {
      this.currentOperations.push({ reject });
      // console.log("options: ", options);
      const queue = this.imap.fetch(query, { bodies, struct: options?.loadStructure });
      const messages: OrderedMessage[] = [];

      queue.on('message', async (message, order) => {
        // console.count("message");
        messages.push({
          message: this.readMessage(message, { ...options }),
          order
        });
      });

      queue.once('error', reject);

      queue.once('end', async () => {
        // console.count("MESSAGES END");
        Promise.all(messages
          .sort((m1, m2) => m1.order - m2.order)
          .map(m => m.message))
          .then(resolve)
          .catch(reject);
      });
    });
  }

  private async readMessage(m: ImapMessage, options: LoadOptions): Promise<NativeMessage> {
    return new Promise<NativeMessage>((resolve, reject) => {
      const headerChunks: NodeJS.ReadableStream[] = [];
      const dataChunks: NodeJS.ReadableStream[] = [];
      let uid!: number;
      let seen = false;
      let struct: MessageStructure | null;
      let threadId: string | undefined;
      // console.log("start reading message");

      m.on('body', (stream, info) => {
        // console.log("message body", info);
        const isBody = info.which === this.BODY_PART_INDEX;
        const chunks = isBody ? dataChunks : headerChunks;
        chunks.push(stream);

        // setTimeout(() => { // @ts-ignore
        //   uid ??= info.seqno;
        //   m.emit("end");
        // }, 100);
      });

      m.once('attributes', (attributes) => {
        // console.count("message attributes");
        uid = attributes.uid as number;
        struct = MailParser.parseMessageStructure(attributes.struct);
        seen = attributes.flags?.includes(ImapClient.SEEN_FLAG) ?? false;
        threadId = attributes[ImapClient.THREAD_ID_FLAG];
      });

      m.once('end', async () => {
        try {
          const bodyStruct = MailParser.getBodyStruct(struct);
          options.charset = options?.charset ?? bodyStruct?.charset;
          options.encoding = options?.encoding ?? bodyStruct?.encoding;
          const [headersPayload, dataPayload] = await Promise.all([
            Promise.all(headerChunks.map(s => MailDecoder.decodeStream(s, options))),
            Promise.all(dataChunks.map(s => MailDecoder.decodeStream(s, options)))
          ]);

          if (dataPayload.length > 1 || headersPayload.length > 1) {
            console.warn('WARNING OF BODY OR PAYLOAD BIGGER THAN 1');
            console.warn('body', dataPayload);
            console.warn('payload', headersPayload);
          }

          const [headersString] = headersPayload;
          const [rawData] = dataPayload;

          const headers = MailParser.parseHeaders(this.accountMail, headersString) as NativeMessage;
          const result: NativeMessage = {
            ...headers,
            uid,
            seen,
            struct,
            threadId,
            contentType: bodyStruct?.contentType,
            encoding: options?.encoding
          };

          if (rawData) {
            // console.log("bodyStruct: ", bodyStruct);
            const { body, contentType } = MailParser.parseBodyPart(uid, rawData, struct, options);
            result.rawData = body;

            if (contentType) {
              result.contentType = contentType;
              if (bodyStruct?.contentType && contentType !== bodyStruct?.contentType) {
                console.warn('\nCONTENT TYPE DON\'T MATCH: ');
                console.warn('bodyStruct: ', bodyStruct.contentType);
                console.warn('parsed: ', contentType);
                result.contentType = body.includes('</') ? MimeType.html : MimeType.txt;
              }
            } else if (result.contentType === MimeType.html || !result.contentType) {
              result.contentType = body.includes('</') ? MimeType.html : MimeType.txt;
            }
          }

          // console.log("result: ", result);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private rejectAllOperations(cause: string, err?: unknown): void {
    err && console.warn(`reject all operation for ${this.account}. Cause: `, cause);
    this.openedBox = undefined;
    this._isConnected = false;
    while (this.currentOperations.length > 0) {
      const operation = this.currentOperations.shift();
      operation?.reject(err);
    }
  }

  private nativeMessageToPrepared<T>(native: NativeMessage, query: MessageQuery<T>, box: string): PreparedMessage<T> {
    const prepared = {
      uid: native.uid,
      from: native.from,
      to: native.to,
      date: new Date(native.date),
      subject: native.subject,
      seen: native.seen,
      threadId: native.threadId,
      contentType: native.contentType,
      messageId: native['message-id'],
      box
    } as PreparedMessage<T>;

    if (query.attachments) {
      prepared.attachments = native.struct?.attachments || [];
    }

    const isOutbound = native.from?.toLowerCase() === this.account.toLowerCase();

    if (query.body) {
      prepared.body = native.rawData?.trim() || '';

      if (query.senderDataParser && isOutbound) {
        prepared.sender = query.senderDataParser(prepared.body);
      }
    }

    if (query.includeDirection) {
      prepared.isInbound = !isOutbound;
    }
    if (query.includeAccount) {
      prepared.account = this.account;
    }

    return prepared;
  }

  private buildLoadOptions(query: MessageQuery, box: string): LoadOptions {
    return {
      loadStructure: query.body || query.attachments,
      inlineAttachmentReplacer: query.inlineAttachmentReplacer,
      account: this.account,
      box
    };
  }

  private buildBodiesQuery(query: MessageQuery): string[] {
    // return ["", "TEXT"];
    const bodies = [] as string[];
    if (query.headers?.length) {
      bodies.push(
        this.isGmail
          ? `HEADER.FIELDS (${query.headers.join(' ')})`
          : 'HEADER'
      );
    }
    if (query.body) {
      bodies.push(this.BODY_PART_INDEX);
    }
    return bodies;
  }
}

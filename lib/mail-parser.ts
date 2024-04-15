import { Attachment, BodyPart, MessageStructure, NativeMessage } from '../types/message';
import { MailDecoder } from './mail-decoder';
import { LoadOptions } from '../types/query';
import { Replacer } from './replacer';
import { MimeType } from '../types/util';

const Imap = require('imap');

export class MailParser {

  static parseHeaders(accountMail: string, data?: string): Partial<NativeMessage> {
    const headers = data?.length ? this.flattenObject<NativeMessage>(Imap.parseHeader(data)) : {};
    if (headers.from) {
      headers.from = MailParser.normalizeAddress(headers.from, accountMail);
    }
    if (headers.to) {
      headers.to = MailParser.normalizeAddress(headers.to);
    }
    return headers;
  }

  private static normalizeAddress(header: string, accountMail?: string): string {
    const address = header.includes('<') ? header.substring(
      header.indexOf('<') + 1,
      header.lastIndexOf('>')
    ) : header;

    // specify account mail in "from" field for handling strange outlook behavior
    return address.includes('=') || address.length > 128
      ? accountMail ?? address
      : address;
  }

  static parseMessageStructure(struct: any): MessageStructure | null {
    if (!struct) {
      return null;
    }

    if (struct.partID && struct.type) {
      if (struct.type === 'text' && !struct.disposition) {
        return {
          body: [{
            charset: struct.params?.charset,
            partId: struct.partID,
            encoding: struct.encoding?.toLowerCase(),
            contentType: struct.type + '/' + struct.subtype
          }],
          attachments: []
        };
      }
      if (['ATTACHMENT', 'INLINE', 'inline', 'attachment'].includes(struct.disposition?.type)) {
        let fileName = struct.params?.name || struct.disposition.params?.fileName || struct.subtype || struct.type || 'unknown';
        fileName = MailDecoder.decodeFileName(fileName);
        let attachmentId = struct?.id;
        if (typeof attachmentId === 'string') {
          attachmentId = attachmentId
            .replace('<', '')
            .replace('>', '')
            .trim();
        }

        return {
          attachments: [{
            fileName,
            partId: struct.partID,
            size: struct.size,
            encoding: struct.encoding?.toLowerCase(),
            charset: struct.params?.charset,
            contentType: struct.type + '/' + struct.subtype,
            isInline: struct.disposition.type?.toLowerCase() === 'inline',

            attachmentId
          }]
        };
      }
    } else if (Array.isArray(struct)) {
      const childStructures = struct.map(s => MailParser.parseMessageStructure(s));
      const attachments: Attachment[] = [];
      const body: BodyPart[] = [];
      childStructures.forEach(s => {
        if (s?.attachments?.length) {
          attachments.push(...s.attachments);
        }
        if (s?.body?.length) {
          body.push(...s.body);
        }
      });
      return { body, attachments };
    }

    return { attachments: [] };
  }

  static parseBodyPart(
    messageUid: number,
    rawData: string,
    struct?: MessageStructure | null,
    options?: LoadOptions
  ): { body: string; contentType?: MimeType | string } {
    const regexp = /Content-Type: (.*?); charset=".*?"/gi;
    const parts = Replacer.splitTextIntoParts(rawData, regexp);

    const extractPart = (contentType: string) => {
      const body = parts[contentType];
      if (body) {
        return { body, contentType };
      }
      return null;
    };

    const part = extractPart(MimeType.html) ?? extractPart(MimeType.txt);

    if (!part) {
      return {
        body: MailDecoder.decodeRawData(rawData, options?.encoding, options?.charset)
      };
    }

    let body = part.body
      .split('--')
      .filter(Boolean)
      .slice(0, -1)
      .join('--')
      .trim();

    if (!body) {
      return {
        body: rawData
      };
    }

    if (body.includes('Content-Transfer-Encoding:')) {
      // const encoding = finalBody.split("Content-Transfer-Encoding:")[1]?.split("\n")[0]?.trim();
      const encoding = MailParser.parseInlineHeader(body, 'Content-Transfer-Encoding');
      const data = body.split(encoding || 'no-encoding')[1]?.trim();
      body = MailDecoder.decodeRawData(data || body, encoding);
    }

    body = Replacer.replace(body, /src="cid:(.*?)"/gi, src => {
      const attachmentId = src.split('cid:')[1]?.replace(/"/g, '');
      let inlineAttachment = MailParser.parseInlineAttachment(rawData, attachmentId);
      if (!inlineAttachment) {
        const attachment = struct?.attachments?.find(a => a.attachmentId === attachmentId);
        if (attachment?.partId) {
          inlineAttachment = options?.inlineAttachmentReplacer?.(messageUid, attachment, options.account, options.box) ?? 'part:' + attachment.partId;
        }
      }
      return `src="${ (inlineAttachment || attachmentId) }"`;
    });

    part.body = body;
    return part;
  }

  static getBodyStruct(struct?: MessageStructure | null): BodyPart | null {
    if (!struct?.body?.length) {
      return null;
    }

    const bodies = struct.body
      .filter(b => b.partId?.startsWith('1') && b.contentType.includes('text'));

    return bodies.find(b => b.contentType = MimeType.html) ||
      bodies.find(b => b.contentType = MimeType.txt) ||
      bodies[0] || null;
  }

  private static parseInlineAttachment(rawData: string, attachmentId: string): string | undefined {
    const key = `X-Attachment-Id: ${ attachmentId }`;
    if (!rawData.includes(key)) {
      return undefined;
    }
    const parts = rawData.split(key);
    const headers = 'Content-Type:' + parts[0].split('Content-Type:').pop();
    const body = parts[1].split('--')[0];
    if (!body || !headers) {
      console.warn('NO BODY OR HEADERS in parseInlineAttachment()');
      return undefined;
    }

    let contentType = MailParser.parseInlineHeader(headers, 'Content-Type');
    if (contentType?.includes('name=')) {
      contentType = contentType.split('name=')[0];
    }

    const encoding = MailParser.parseInlineHeader(headers.toLowerCase(), 'encoding');
    const prefix = 'data:' + contentType + ';' + encoding;
    return prefix + ', ' + body.trim();
  }

  private static parseInlineHeader(rawData: string, header: string): string | undefined {
    const headerRightPart = rawData.split(header + ':')[1]?.trim();
    if (!headerRightPart) {
      return undefined;
    }
    let value = headerRightPart.split('\n')[0];
    if (value?.includes('\r')) {
      value = value.split('\r')[0];
    }
    return value?.trim();
  }

  private static flattenObject<T>(o: { [p: string]: string[] }): Partial<T> {
    if (!o) {
      return {};
    }
    Object.keys(o).forEach(key => {
      o[key] = (o[key][0] || '') as any;
    });
    return o as any;
  }
}

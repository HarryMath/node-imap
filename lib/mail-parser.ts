import { Attachment, BodyPart } from '../dto/email-message';
import { NativeMessage } from './imap-mail';
import { MailDecoder } from './mail-decoder';
import { Replacer } from './replacer';
import { ReplacerFunction } from '../dto/query-options';

const Imap = require("imap");

declare global {
  interface Array<T> {
    at(index: number): T | undefined;
  }
}

export interface MessageStructure {
  attachments: Attachment[];
  body?: BodyPart[];
}

export class MailParser {

  static parseHeaders(data?: string): Partial<NativeMessage> {
    const headers = data?.length ? this.flattenObject<NativeMessage>(Imap.parseHeader(data)) : {};
    if (headers.from) {
      headers.from = MailParser.normalizeAddress(headers.from);
    }
    if (headers.to) {
      headers.to = MailParser.normalizeAddress(headers.to);
    }
    return headers;
  }


  private static normalizeAddress(mail: string): string {
    return mail.includes("<") ? mail.substring(
      mail.indexOf("<") + 1,
      mail.lastIndexOf(">")
    ) : mail;
  }

  static parseMessageStructure(struct: any): MessageStructure | undefined {
    if (!struct) {
      return undefined;
    }
    if (struct?.partID && struct?.type) {
      if (struct.type === "text" && !struct.disposition) {
        return {
          body: [{
            charset: struct.params?.charset,
            partId: struct.partID,
            encoding: struct.encoding?.toLowerCase(),
            contentType: struct.type + "/" + struct.subtype,
          }],
          attachments: [],
        };
      }
      if (["ATTACHMENT", "INLINE", "inline", "attachment"].includes(struct.disposition?.type)) {
        let fileName = struct.params?.name || struct.disposition.params?.fileName || struct.subtype || struct.type || "unknown";
        fileName = MailDecoder.decodeFileName(fileName);
        let attachmentId = struct?.id;
        if (typeof attachmentId === "string") {
          attachmentId = attachmentId
            .replace("<", "")
            .replace(">", "")
            .trim();
        }
        return {
          attachments: [{
            fileName,
            partId: struct.partID,
            size: struct.size,
            encoding: struct.encoding?.toLowerCase(),
            charset: struct.params?.charset,
            contentType: struct.type + "/" + struct.subtype,
            isInline: struct.disposition.type?.toLowerCase() === "inline",

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
    return {
      attachments: []
    };
  }

  static parseBodyPart(
    messageUid: number,
    rawData: string,
    body: BodyPart,
    struct?: MessageStructure,
    replaceFunction?: ReplacerFunction
  ): { result: string; parsed: boolean } {
    const regexp = /Content-Type: (.*?); charset=".*?"/gi;
    const parts = Replacer.splitTextIntoParts(rawData, regexp);

    const part = parts["text/html"] ?? parts["text/plain"];

    if (!part) {
      // console.warn("no required content-type in body: " + split);
      // console.warn("rawData is " + rawData);
      // console.warn("body ", body);
      return  { result: MailDecoder.decodeRawData(rawData, body.encoding, body.charset), parsed: false };
    }
    let result = part.split("--")[0];
    if (!result) {
      return { result: rawData, parsed: false };
    }
    if (result.includes("Content-Transfer-Encoding:")) {
      // const encoding = finalBody.split("Content-Transfer-Encoding:")[1]?.split("\n")[0]?.trim();
      const encoding = MailParser.parseInlineHeader(result, "Content-Transfer-Encoding");
      const data = result.split(encoding || "no-encoding")[1]?.trim();
      result = MailDecoder.decodeRawData(data || result, encoding);
    }

    result = Replacer.replaceAllBetween(result, ['src="cid:', '"'], attachmentId => {
      let inlineAttachment = MailParser.parseInlineAttachment(rawData, attachmentId);
      if (!inlineAttachment) {
        const attachmentPartId = struct?.attachments?.find(a => a.attachmentId === attachmentId)?.partId;
        if (attachmentPartId) {
          inlineAttachment = replaceFunction?.(messageUid, attachmentPartId) ?? "part:" + attachmentPartId;
        }
      }
      return `src="${(inlineAttachment || attachmentId)}"`;
    });

    return { result, parsed: true };
  }

  static parseMessageBody(messageUid: number, rawData: string, struct?: MessageStructure): string {
    // const bodyPartId = struct?.body?.length ? struct.body[0].partId : undefined;
    // if (bodyPartId === "1") {
    //   console.log("body part is 1: ", rawData);
    //   console.log("body part is 1: ", struct);
    //   return rawData;
    // }
    const potentialBody: BodyPart[] = [
      struct?.body?.find(b => b.partId === "1") as BodyPart,
      struct?.body?.find(b => b.partId !== "1" && b.contentType === "text/html") as BodyPart,
      struct?.body?.find(b => b.partId !== "1" && b.contentType === "text/plain") as BodyPart
    ].filter(b => !!b && b.partId?.startsWith("1"));

    if (!potentialBody?.length) {
      return rawData;
    }

    let parsedBody: { result?: string; parsed?: boolean } = {};
    for (const body of potentialBody) {
      parsedBody = MailParser.parseBodyPart(messageUid, rawData, body, struct);
      if (parsedBody.parsed && parsedBody.result) {
        return parsedBody.result;
      }
    }
    return parsedBody?.result ?? rawData;
  }

  private static parseInlineAttachment(rawData: string, attachmentId: string): string | undefined {
    const key = `X-Attachment-Id: ${attachmentId}`;
    if (!rawData.includes(key)) {
      return undefined;
    }
    const parts = rawData.split(key);
    const headers = "Content-Type:" + parts[0].split("Content-Type:").pop();
    const body = parts[1].split("--")[0];
    if (!body || !headers) {
      console.warn("NO BODY OR HEADERS in parseInlineAttachment()");
      return undefined;
    }

    let contentType = MailParser.parseInlineHeader(headers, "Content-Type") as string;
    if (contentType.includes("name=")) {
      contentType = contentType.split("name=")?.[0]!;
    }
    const encoding = MailParser.parseInlineHeader(headers.toLowerCase(), "encoding");
    const prefix = "data:" + contentType + ";" + encoding;
    return prefix + ", " + body.trim();
  }

  private static parseInlineHeader(rawData: string, header: string): string | undefined {
    const headerRightPart = rawData.split(header + ":")[1]?.trim();
    if (!headerRightPart) {
      return undefined;
    }
    let value = headerRightPart.split("\n")[0];
    if (value?.includes("\r")) {
      value = value.split("\r")[0];
    }
    return value?.trim();
  }

  private static flattenObject<T>(o: { [p: string]: string[] }): Partial<T> {
    if (!o) {
      return {};
    }
    Object.keys(o).forEach(key => {
      o[key] = (o[key][0] || "") as any;
    });
    return o as any;
  }
}

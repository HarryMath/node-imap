import { ExtraDataParser, InlineAttachmentReplacer, MailHeaders } from "./util";
import { CharsetEncoding } from "./message";

export interface SearchOptions {
  sinceUid?: number;
  searchEmail?: string | string[];
  sentBefore?: Date;
  sentAfter?: Date;
  threadId?: string;
}

export interface LoadOptions extends CharsetEncoding {
  loadStructure?: boolean;
  inlineAttachmentReplacer?: InlineAttachmentReplacer;
  box: string;
  account: string;
}

export interface MessageQuery<SenderInfo = unknown> extends SearchOptions {
  headers?: MailHeaders[];
  body?: boolean;
  attachments?: boolean;
  skip?: number;
  take?: number;
  inlineAttachmentReplacer?: InlineAttachmentReplacer;
  senderDataParser?: ExtraDataParser<SenderInfo>;
  box?: string;

  includeDirection?: boolean;
  includeAccount?: boolean;
}

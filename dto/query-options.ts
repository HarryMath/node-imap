import { CharsetEncoding } from './email-message';

export interface MessageQueryOptions {
  headers?: ('FROM' | 'TO' | 'SUBJECT' | 'DATE')[];
  body?: boolean;
  attachments?: boolean;
  skip?: number;
  take?: number;

  searchEmail?: string;
  sinceUid?: number;
  linkReplacerFunction?: ReplacerFunction;
}

export interface LoadOptions extends CharsetEncoding {
  loadStructure?: boolean;
  rawData?: boolean;
  linkReplacerFunction?: ReplacerFunction;
}

export type ReplacerFunction = (attachmentUid: number, partId: string) => string;

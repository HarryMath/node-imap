import { Attachment } from './message';

export type InlineAttachmentReplacer = (
  attachmentUid: number,
  attachment: Attachment,
  account: string,
  box: string
) => string;

export type ExtraDataParser<T> = (body: string) => T;

export type MailHeaders = 'FROM' | 'TO' | 'SUBJECT' | 'DATE' | 'MESSAGE-ID';

export enum MimeType {
  html = 'text/html',
  txt = 'text/plain',
}

export const DateUtil = {
  withOffset: (t: Date, dayOffset: number): Date => new Date(
    t.getFullYear(),
    t.getMonth(),
    t.getDate() + dayOffset,
    t.getHours(),
    t.getMinutes()
  ),

  dateOnly: (date: Date): string => date.toISOString().split('T')[0]
};

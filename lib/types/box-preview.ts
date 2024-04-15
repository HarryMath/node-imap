import { Box } from 'imap';

export interface BoxMessagesInfo {
  /** Total number of messages in this mailbox. */
  total: number;
  /** Number of messages in this mailbox having the Recent flag (this IMAP session is the first to see these messages). */
  new: number;
  /** (Only available with status() calls) Number of messages in this mailbox not having the Seen flag (marked as not having been read). */
  unseen: number;
}

export class BoxPreview {

  constructor(
    readonly name: string,
    readonly uidNext: number,
    readonly messages: BoxMessagesInfo
  ) {}

  static createFromBox(box: Box) {
    const { name, uidnext, messages } = box;
    return new BoxPreview(
      name, uidnext, messages
    );
  }
}
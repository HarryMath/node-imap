export interface CharsetEncoding {
  charset?: string;
  encoding?: "base64" | "base-64" | "quoted-printable";
}

export interface BodyPart extends CharsetEncoding {
  contentType: string;
  partId?: string;
}

export interface Attachment extends BodyPart {
  fileName: string;
  size: number;

  isInline?: boolean;
  attachmentId?: string;
}

export interface MessageStructure {
  attachments: Attachment[];
  body?: BodyPart[];
}

export interface BaseMailMessage {
  uid: number;
  date: Date;
  from: string;
  to: string;
  subject: string;
  seen: boolean;

  bodyPartId?: string;
  encoding?: string;
  contentType?: string;

  threadId?: string;
}

export interface NativeMessage extends BaseMailMessage {
  struct?: MessageStructure | null;
  "message-id"?: string;
  rawData?: string;
}


export interface PreparedMessage<SenderInfo = unknown> extends BaseMailMessage {
  body: string;
  account?: string;
  attachments: Attachment[];
  messageId?: string;
  box: string;
  isInbound?: boolean;

  sender?: SenderInfo;
}


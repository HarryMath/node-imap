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

export interface BaseMailMessage {
  uid: number;
  date: string;
  from: string;
  to: string;
  subject: string;
  seen: boolean;

  bodyPartId?: string;
  encoding?: string;
  contentType?: string;
}

export interface PreparedMessage extends BaseMailMessage {
  body: string;
  attachments: Attachment[];
}

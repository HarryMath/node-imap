import { LoadOptions } from './imap-mail';

export abstract class MailDecoder {

  static decodeFileName(encoded: string): string {
    if (encoded.endsWith("?=") && encoded.startsWith("=?")) {
      encoded = encoded.substring(2, encoded.length - 2);
      const parts = encoded.split("?");
      const charset = parts.shift() || "nothing to split";
      encoded = "?" + parts.join("?").split(charset).join("");

      if (encoded.startsWith("?B?")) {
        encoded = encoded.split("?B?").join("");
        return Buffer.from(encoded, "base64").toString().split("?= =?").join("");
      }

      if (encoded.startsWith("?Q?")) {
        encoded = encoded.split("?Q?").join("");
        return MailDecoder.decodeQuotedPrintable(encoded, charset).split("?= =?").join("");
      }
      console.warn("Unknown filename encoding : ", encoded);
    }
    return encoded;
  }

  static decodeQuotedPrintable(raw: string, charset = "utf-8") {
    const dc = new TextDecoder(charset.toLowerCase());
    return raw.replace(/[\t\x20]$/gm, "").replace(/=(?:\r\n?|\n)/g, "")
      .replace(/((?:=[a-fA-F0-9]{2})+)/g, (m: any) => {
        const cd = m.substring(1).split("="), uArr = new Uint8Array(cd.length);
        for (let i = 0; i < cd.length; i++) {
          uArr[i] = parseInt(cd[i], 16);
        }
        return dc.decode(uArr);
      });
  }

  static async decodeStream(stream: NodeJS.ReadableStream, options?: LoadOptions): Promise<string> {
    const buffer: Buffer[] = [];
    return new Promise<string>((resolve) => {
      stream.on("data", (chunk: any) => {
        buffer.push(chunk);
      });
      stream.once("end", () => {
        const charset = MailDecoder.resolveCharset(options?.charset);
        let data = Buffer.concat(buffer).toString(charset);

        if (typeof options?.encoding === "string") {
          data = MailDecoder.decodeRawData(data, options.encoding, options?.charset);
        }

        resolve(data);
      });
    });
  }

  private static resolveCharset(charset?: string): BufferEncoding {
    if (typeof charset !== "string") {
      return "utf8" as BufferEncoding;
    }

    const normalized = charset
      .toLowerCase()
      .replace("-", "")
      .trim();

    switch (normalized) {
      case "utf8":
        return "utf8" as BufferEncoding;

      default:
        console.warn("Unknown charset: ", charset);
        return "utf8" as BufferEncoding;
    }
  }

  private static isBase64Equal(b1: string, b2: string): boolean {
    return MailDecoder.prepareBase64(b1).length === MailDecoder.prepareBase64(b2).length;
  }

  private static prepareBase64(base64: string): string {
    return base64
      .split("\n").join("")
      .split("\r").join("")
      .split("=").join("")
      .trim();
  }

  static decodeRawData(data: string, encoding: string, charset?: string): string {
    if (!encoding) {
      return data;
    }
    encoding = encoding?.toLowerCase()?.replace("-", "")?.trim();

    switch (encoding) {
      case "base64":
        if (!data.includes("text/html") && !data.includes("text/plain")) {
          const decoded = Buffer.from(data, "base64").toString();
          const encoded = new Buffer(decoded).toString("base64");
          return MailDecoder.isBase64Equal(encoded, data) ? decoded : data;
        } else {
          console.warn("WRONG INPUT FOR base64 encoding: ");
          console.log(data);
        }
        break;
      case "quotedprintable":
      case "qp":
        return MailDecoder.decodeQuotedPrintable(data, charset);
      case "7bit":
        break;
      default:
        console.warn("UNKNOWN encoding: ", encoding);
        break;
    }
    return data;
  }
}
import { LoadOptions } from './types/query';

export abstract class MailDecoder {

  static decodeFileName(encoded: string): string {
    if (encoded.endsWith('?=') && encoded.startsWith('=?')) {
      encoded = encoded.substring(2, encoded.length - 2);
      const parts = encoded.split('?');
      const charset = parts.shift() || 'nothing to split';
      encoded = '?' + parts.join('?').split(charset).join('');

      if (encoded.startsWith('?B?')) {
        encoded = encoded.split('?B?').join('');
        return Buffer.from(encoded, 'base64').toString().split('?= =?').join('');
      }

      if (encoded.startsWith('?Q?')) {
        encoded = encoded.split('?Q?').join('');
        return MailDecoder.decodeQuotedPrintable(encoded, charset).split('?= =?').join('');
      }
      console.warn('Unknown filename encoding : ', encoded);
    }
    return encoded;
  }

  static decodeQuotedPrintable(raw: string, charset = 'utf-8') {
    const dc = new TextDecoder(charset.toLowerCase());
    return raw
      .replace(/[\t\x20]$/gm, '')
      .replace(/=(?:\r\n?|\n)/g, '')
      .replace(/((?:=[a-fA-F0-9]{2})+)/g, (m: any) => {
        const cd = m.substring(1).split('='), uArr = new Uint8Array(cd.length);
        for (let i = 0; i < cd.length; i++) {
          uArr[i] = parseInt(cd[i], 16);
        }
        return dc.decode(uArr);
      });
  }

  static async decodeStream(stream: NodeJS.ReadableStream, options?: LoadOptions): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!stream._readableState.length || !stream.readable) {
      return ''; // handle empty stream
    }

    const buffer: Buffer[] = [];
    return new Promise<string>((resolve, reject) => {
      stream.on('data', (chunk: any) => {
        buffer.push(chunk);
      });

      stream.once('end', () => {
        try {
          const charset = MailDecoder.resolveCharset(options?.charset);
          let data = Buffer.concat(buffer).toString(charset);
          data = MailDecoder.decodeRawData(data, options?.encoding, options?.charset);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private static resolveCharset(charset?: string): BufferEncoding {
    if (typeof charset !== 'string') {
      return 'utf8' as BufferEncoding;
    }

    const normalized = charset
      .toLowerCase()
      .replaceAll('-', '')
      .trim();

    switch (normalized) {
      case 'utf8':
        return 'utf8';

      // case "iso88591":
      //   return "iso-8859-1" as BufferEncoding;

      case 'usascii':
        return 'ucs2';

      default:
        console.warn('Unknown charset: ', charset, normalized);
        return 'utf8' as BufferEncoding;
    }
  }

  private static isBase64Equal(b1: string, b2: string): boolean {
    return MailDecoder.prepareBase64(b1).length === MailDecoder.prepareBase64(b2).length;
  }

  private static prepareBase64(base64: string): string {
    return base64
      .split('\n').join('')
      .split('\r').join('')
      .split('=').join('')
      .trim();
  }

  static decodeRawData(data: string, encoding?: string, charset?: string): string {
    if (!encoding) {
      return data;
    }
    encoding = encoding?.toLowerCase()?.replace('-', '')?.trim();

    switch (encoding) {
      case 'base64':
        const regexp = /^[A-Za-z0-9=+/\n\r]+$/;
        if (regexp.test(data)) {
          const decoded = Buffer.from(data, 'base64').toString();
          const encoded = Buffer.from(decoded).toString('base64');
          if (!MailDecoder.isBase64Equal(encoded, data)) {
            console.warn('WRONG INPUT FOR base64 encoding: ');
            console.warn(data.substring(0, 50));
            return data;
          }
          return decoded;
        }
        return data;
      case 'quotedprintable':
      case 'qp':
        return MailDecoder.decodeQuotedPrintable(data, charset);
      case '8bit':
      case '7bit':
        break;
      default:
        console.warn('\nUNKNOWN encoding: ', encoding, '\n', data.substring(0, 300));
        break;
    }
    return data;
  }
}

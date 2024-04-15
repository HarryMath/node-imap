import { ImapMail } from './lib/imap-mail';
import { ImapConfig } from './types/credentials';

const credential: ImapConfig = {
  host: 'imap.yandex.ru',
  port: 993,
  tls: true,
  password: '...',
  user: '...',
  conversationBox: 'INBOX',
};

async function test() {
  const imap = await ImapMail.init(credential);
  // const boxes = await imap.getBoxes();
  // for (const box of boxes) {
  //   try {
  //     const boxInfo = await imap.getBoxInfo(box);
  //     console.log(JSON.stringify(boxInfo, null, 2));
  //   } catch (err) {
  //     console.warn('err open box', box);
  //   }
  // }
  //
  // const nextUid = await imap.getNextUid();
  // console.log('nextUid: ' + nextUid);

  // await imap.openBox('INBOX');

  const mails = await imap.getMails({
    // searchEmail: 'litvinskia@gmail.com',
    searchEmail: 'nikitabort22092000@gmail.com',
    body: true,
    attachments: true,
    skip: 0,
    take: 15,
  });

  console.log('mails: ', mails.items);

  console.log('attachments: ', mails.items.reduce(
    (p, c) => [...p, ...c.attachments],
    [] as any[]
  ));

  imap.dispose();
  // console.log(boxes);
}

test();

// console.log(output);
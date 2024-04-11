export interface ImapConfig {
  port: number;
  host: string;
  conversationBox: string;
  user: string;
  password: string;
  tls?: boolean
}
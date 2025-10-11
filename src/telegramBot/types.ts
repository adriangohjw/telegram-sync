export interface TelegramUpdate {
  update_id: number;
  // Source: Messages sent in private chats, groups, or supergroups
  // Context: Regular user-to-bot or user-to-user communication
  // Use case: When users directly interact with your bot
  message?: TelegramMessage;
  // Source: Messages posted in channels (public or private channels)
  // Context: Channel broadcasts where the bot is an admin
  // Use case: When monitoring channel content for media files
  channel_post?: TelegramMessage;
}

export interface DirectMessagesTopic {
  topic_id: number;
}

export interface TelegramMessage {
  message_id: number;
  message_thread_id?: number; // this is to identify the topic of the message in a group chat
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: TelegramPhotoSize[];
  video?: TelegramVideo;
  document?: TelegramDocument;
  media_group_id?: string; // to identify the media group of the message (same "album" when multiple photos are sent at once)
  caption?: string;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumbnail?: TelegramPhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: TelegramPhotoSize;
}

export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export interface MediaFile {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  type: "photo" | "video" | "document";
}

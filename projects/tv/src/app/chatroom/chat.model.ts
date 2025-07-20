// chat.model.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  isLocationBased: boolean;
  locationCode?: string; // 'ng', 'us', 'gb' etc.
  participants: User[];
  messages: Message[];
  unreadCount?: number;
}
// chat.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ChatRoom, Message, User } from './chat.model';

@Injectable()
export class ChatService {
  private currentUser: User = {
    id: 'user1',
    name: 'Ade Fan',
    avatar: 'img/avatar.png',
    location: 'ng',
    isOnline: true
  };

  private rooms: ChatRoom[] = [
    // Public rooms
    {
      id: 'welcome',
      name: '#Welcome',
      description: 'Welcome to DavidoTV! Introduce yourself here',
      isPublic: true,
      isLocationBased: false,
      participants: [],
      messages: []
    },
    {
      id: 'new-music',
      name: '#NewMusic',
      description: 'Discuss Davido\'s latest releases',
      isPublic: true,
      isLocationBased: false,
      participants: [],
      messages: []
    },
    {
      id: 'tour-upate',
      name: '#TourUpdates, ',
      description: 'Discuss Davido\'s latest releases',
      isPublic: true,
      isLocationBased: false,
      participants: [],
      messages: []
    },
    {
      id: 'fans-connect',
      name: '#FansConnect',
      description: 'Discuss Davido\'s latest releases',
      isPublic: true,
      isLocationBased: false,
      participants: [],
      messages: []
    },
    {
      id: 'throw-back',
      name: '#ThrowBackHits',
      description: 'Discuss Davido\'s latest releases',
      isPublic: true,
      isLocationBased: false,
      participants: [],
      messages: []
    },
    // Location-based rooms
    {
      id: 'africa',
      name: '#Africa',
      description: 'For fans in Africa',
      isPublic: true,
      isLocationBased: true,
      locationCode: 'african',
      participants: [],
      messages: []
    },
    {
      id: 'europe',
      name: '#Europe',
      description: 'For fans in Europe',
      isPublic: true,
      isLocationBased: true,
      locationCode: 'europe',
      participants: [],
      messages: []
    },
    {
      id: 'asia',
      name: '#Asia',
      description: 'For fans in Asia',
      isPublic: true,
      isLocationBased: true,
      locationCode: 'asia',
      participants: [],
      messages: []
    }
  ];

  private privateChats: ChatRoom[] = [];

  private activeRoomSubject = new BehaviorSubject<ChatRoom | null>(null);
  activeRoom$ = this.activeRoomSubject.asObservable();

  private roomsSubject = new BehaviorSubject<ChatRoom[]>(this.rooms);
  rooms$ = this.roomsSubject.asObservable();

  constructor() {
    this.generateMockData();
  }

  private generateMockData(): void {
  // Generate mock users
  const mockUsers: User[] = [
    { id: 'user2', name: 'Chioma Lover', avatar: 'img/avatar.png', location: 'ng', isOnline: true },
    { id: 'user3', name: 'OBO Fan', avatar: 'img/avatar.png',location: 'us', isOnline: false },
    { id: 'user4', name: '30BG Member', avatar: 'img/avatar.png', location: 'gb', isOnline: true }
  ];

  // Generate mock messages for rooms
  this.rooms.forEach(room => {
    room.participants = [this.currentUser, ...mockUsers.filter(u =>
      !room.isLocationBased || u.location === room.locationCode)];

    room.messages = Array(5).fill(null).map((_, i) => ({
      id: `msg-${room.id}-${i}`,
      sender: mockUsers[i % mockUsers.length],
      content: `Sample message ${i+1} in ${room.name}`,
      timestamp: new Date(Date.now() - (i * 60000)),
      isRead: true
    }));
  });

  // Generate private chats
  this.privateChats = mockUsers.map((user, index) => ({ // <-- Add 'index' here for the outer map
    id: `private-${user.id}`,
    name: user.name,
    description: `Private chat with ${user.name}`,
    isPublic: false,
    isLocationBased: false,
    participants: [this.currentUser, user],
    messages: Array(3).fill(null).map((_, i) => ({ // 'i' is for the inner map (messages)
      id: `private-msg-${user.id}-${i}`,
      sender: i % 2 === 0 ? user : this.currentUser,
      content: `Private message ${i+1} between you and ${user.name}`,
      timestamp: new Date(Date.now() - (i * 120000)),
      isRead: i % 2 === 0 ? false : true
    })),
    unreadCount: index % 2 === 0 ? 1 : 0 // <-- Use 'index' from the outer map here
  }));
}

  getCurrentUser(): User {
    return this.currentUser;
  }

  getPublicRooms(): Observable<ChatRoom[]> {
    return of(this.rooms.filter(r => r.isPublic && !r.isLocationBased));
  }

  getPrivateChats(): Observable<ChatRoom[]> {
    return of(this.privateChats);
  }

  getLocationBasedRooms(locationCode: string): Observable<ChatRoom[]> {
   return of(this.rooms.filter(r => r.isLocationBased && r.locationCode === locationCode));
  }

  setActiveRoom(room: ChatRoom): void {
    this.activeRoomSubject.next(room);
  }

  sendMessage(roomId: string, content: string): void {
    const room = [...this.rooms, ...this.privateChats].find(r => r.id === roomId);
    if (room) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: this.currentUser,
        content,
        timestamp: new Date(),
        isRead: false
      };
      room.messages.push(newMessage);
      this.roomsSubject.next([...this.rooms]);
    }
  }
}
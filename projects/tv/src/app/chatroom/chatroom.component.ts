// chat-room.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChatRoom, User } from './chat.model';
import { ChatService } from './chat.services';
import { NewPrivateChatDialogComponent } from './new-private-chat-dialog/new-private-chat-dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
selector: 'app-chat-room',
providers: [ChatService],
imports: [CommonModule, MatIconModule, MatTooltipModule, MatSidenavModule, MatButtonModule, MatExpansionModule, MatListModule, MatFormFieldModule, MatInputModule, FormsModule ],
template: `

<!-- chat-room.component.html -->
<div class="chat-container" [class.mobile]="isMobile">
  <!-- Sidebar -->
  <mat-sidenav-container class="sidenav-container">
    <mat-sidenav #sidenav mode="side" opened class="sidenav">
      <div class="sidebar-header">
        <h2>DavidoTV Chat</h2>
        <button mat-icon-button (click)="openNewPrivateChatDialog()" matTooltip="New private chat">
          <mat-icon>add_comment</mat-icon>
        </button>
      </div>

      <!-- Public Rooms -->
      <mat-accordion>
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>Public Rooms</mat-panel-title>
          </mat-expansion-panel-header>
          <mat-nav-list>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'welcome'"
                (click)="setActiveRoom(getRoomById('welcome'))">
              <span class="room-name">#Welcome</span>
            </a>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'new-music'"
                (click)="setActiveRoom(getRoomById('new-music'))">
              <span class="room-name">#NewMusic</span>
            </a>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'tour-upate'"
                (click)="setActiveRoom(getRoomById('tour-upate'))">
              <span class="room-name">#TourUpdates</span>
            </a>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'fans-connect'"
                (click)="setActiveRoom(getRoomById('fans-connect'))">
              <span class="room-name">#FansConnect</span>
            </a>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'throw-back'"
                (click)="setActiveRoom(getRoomById('throw-back'))">
              <span class="room-name">#ThrowBackHits</span>
            </a>
          </mat-nav-list>
        </mat-expansion-panel>

        <!-- Location Rooms -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>Location Base</mat-panel-title>
          </mat-expansion-panel-header>
          <mat-nav-list>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'africa'"
                (click)="setActiveRoom(getRoomById('africa'))">
              <span class="room-name">#Africa</span>
            </a>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'europe'"
                (click)="setActiveRoom(getRoomById('europe'))">
              <span class="room-name">#Europe</span>
            </a>
            <a mat-list-item 
                [class.active]="(activeRoom$ | async)?.id === 'asia'"
                (click)="setActiveRoom(getRoomById('asia'))">
              <span class="room-name">#Asia</span>
            </a>
          </mat-nav-list>
        </mat-expansion-panel>

        <!-- Private Chats -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>Private Messages</mat-panel-title>
          </mat-expansion-panel-header>
          <mat-nav-list>
            <a mat-list-item *ngFor="let chat of privateChats$ | async" 
                [class.active]="(activeRoom$ | async)?.id === chat.id"
                (click)="setActiveRoom(chat)">
              <span class="room-name">{{ chat.name }}</span>
              <span class="unread-badge" *ngIf="chat.unreadCount">{{ chat.unreadCount }}</span>
            </a>
          </mat-nav-list>
        </mat-expansion-panel>
      </mat-accordion>
    </mat-sidenav>

    <!-- Main Chat Area -->
    <mat-sidenav-content class="chat-content">
      <ng-container *ngIf="activeRoom$ | async as activeRoom; else noRoomSelected">
        <div class="chat-header">
          <button mat-icon-button class="menu-button" (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <h2>{{ activeRoom.name }}</h2>
          <p class="room-description">{{ activeRoom.description }}</p>
        </div>

        <div class="messages-container">
          <div *ngFor="let message of activeRoom.messages" class="message"
               [class.sent]="message.sender.id === currentUser.id">
            <img [src]="message.sender.avatar" class="avatar" alt="{{ message.sender.name }}">
            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">{{ message.sender.name }}</span>
                <span class="message-time">{{ message.timestamp | date:'shortTime' }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <mat-form-field appearance="outline" class="full-width">
            <input matInput [(ngModel)]="newMessage" placeholder="Type your message..." 
                   (keyup.enter)="sendMessage()">
            <button matSuffix mat-icon-button (click)="sendMessage()" [disabled]="!newMessage.trim()">
              <mat-icon>send</mat-icon>
            </button>
          </mat-form-field>
        </div>
      </ng-container>

      <ng-template #noRoomSelected>
        <div class="no-room-selected">
          <mat-icon>forum</mat-icon>
          <h3>Select a chat room to start chatting</h3>
          <p>Join the conversation with other Davido fans!</p>
        </div>
      </ng-template>
    </mat-sidenav-content>
  </mat-sidenav-container>
</div>

`,
styleUrls: ['./chatroom.component.scss']
})
export class ChatRoomComponent implements OnInit {
 activeRoom$: Observable<ChatRoom | null>;
  privateChats$: Observable<ChatRoom[]>;
  currentUser: User;
  newMessage = '';
  isMobile = false;

  constructor(
    private chatService: ChatService,
    private dialog: MatDialog
  ) {
    this.activeRoom$ = this.chatService.activeRoom$;
    this.privateChats$ = this.chatService.getPrivateChats();
    this.currentUser = this.chatService.getCurrentUser();
  }

  ngOnInit(): void {
    // Set default active room to Welcome
    this.setActiveRoom(this.getRoomById('welcome'));
  }

  getRoomById(id: string): ChatRoom {
    const allRooms = [...this.chatService['rooms'], ...this.chatService['privateChats']];
    return allRooms.find(room => room.id === id) || this.createDefaultRoom();
  }

  private createDefaultRoom(): ChatRoom {
    return {
      id: 'default',
      name: 'Default Room',
      description: 'Default room description',
      isPublic: true,
      isLocationBased: false,
      participants: [],
      messages: []
    };
  }

  setActiveRoom(room: ChatRoom): void {
    this.chatService.setActiveRoom(room);
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.activeRoom$) {
      this.activeRoom$.subscribe(room => {
        if (room) {
          this.chatService.sendMessage(room.id, this.newMessage);
          this.newMessage = '';
        }
      });
    }
  }

  openNewPrivateChatDialog(): void {
    const dialogRef = this.dialog.open(NewPrivateChatDialogComponent, {
      width: '350px',
      data: { currentUser: this.currentUser }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New private chat with:', result);
      }
    });
  }
}
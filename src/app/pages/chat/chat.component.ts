import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { UserProfile } from '../profile/models/userProfile.model';
import { ChatMessage } from './models/chat.model';
import { UserService } from '../profile/services/user.service';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  searchControl = new FormControl('');
  filteredUsers!: Observable<UserProfile[]>;
  latestMessages!: Observable<
    { user: UserProfile; latestMessage: ChatMessage }[]
  >;
  selectedUser: UserProfile | null = null;
  unreadMessagesCount$: Observable<number> = of(0);
  unreadMessagesMap: Map<string, boolean> = new Map<string, boolean>();
  currentUserId: string | null = null;

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.filteredUsers = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this.userService.searchMutualUsers(value))
    );

    this.currentUserId = localStorage.getItem('accessToken');
    if (this.currentUserId) {
      this.latestMessages = this.chatService
        .getLatestMessages(this.currentUserId)
        .pipe(
          tap((messages) => {
            this.unreadMessagesMap.clear();
            messages.forEach((chat) => {
              if (chat.latestMessage.receiverId === this.currentUserId) {
                this.unreadMessagesMap.set(
                  chat.user.id,
                  !chat.latestMessage.isRead
                );
              }
            });
          }),
          map((messages) =>
            messages.sort(
              (a, b) =>
                new Date(b.latestMessage.timestamp).getTime() -
                new Date(a.latestMessage.timestamp).getTime()
            )
          )
        );

      this.unreadMessagesCount$ = this.chatService.countUnreadMessages(
        this.currentUserId
      );
    }
  }

  async onUserSelected(user: UserProfile): Promise<void> {
    this.selectedUser = user;
    this.searchControl.setValue('');

    if (this.currentUserId) {
      await this.chatService.markMessagesAsReadForUser(
        user.id,
        this.currentUserId
      );
      this.unreadMessagesMap.delete(user.id);
    }
  }

  goBack() {
    this.selectedUser = null;
  }

  hasUnreadMessages(userId: string): boolean {
    return this.unreadMessagesMap.get(userId) || false;
  }
}

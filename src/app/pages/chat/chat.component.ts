import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
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

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.filteredUsers = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this.userService.searchMutualUsers(value))
    );

    const currentUserId = localStorage.getItem('accessToken');
    if (currentUserId) {
      this.latestMessages = this.chatService
        .getLatestMessages(currentUserId)
        .pipe(
          map((messages) =>
            messages.sort(
              (a, b) =>
                new Date(b.latestMessage.timestamp).getTime() -
                new Date(a.latestMessage.timestamp).getTime()
            )
          )
        );

      this.unreadMessagesCount$ =
        this.chatService.countUnreadMessages(currentUserId);
    }
  }

  async onUserSelected(user: UserProfile): Promise<void> {
    this.selectedUser = user;
    this.searchControl.setValue('');

    const currentUserId = localStorage.getItem('accessToken');
    if (currentUserId) {
      await this.chatService.markMessagesAsReadForUser(user.id, currentUserId);
    }
  }

  goBack() {
    this.selectedUser = null;
  }
}

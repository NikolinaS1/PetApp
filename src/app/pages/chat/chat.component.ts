import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, startWith, switchMap } from 'rxjs';
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
  searchControl = new FormControl();
  filteredUsers!: Observable<UserProfile[]>;
  latestMessages!: Observable<
    { user: UserProfile; latestMessage: ChatMessage }[]
  >;
  selectedUser: UserProfile | null = null;
  currentUserId: string | null = null;

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('accessToken');

    if (this.currentUserId) {
      this.filteredUsers = this.searchControl.valueChanges.pipe(
        startWith(''),
        switchMap((value) => this.userService.searchMutualUsers(value))
      );

      this.latestMessages = this.chatService.getLatestMessages(
        this.currentUserId
      );
    }
  }

  onUserSelected(user: UserProfile): void {
    this.selectedUser = user;
    this.searchControl.setValue('');
  }
}

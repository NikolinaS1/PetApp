import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserProfile } from '../../pages/profile/models/userProfile.model';
import { ChatService } from '../../pages/chat/services/chat.service';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-chat-right-panel',
  templateUrl: './chat-right-panel.component.html',
  styleUrls: ['./chat-right-panel.component.scss'],
})
export class ChatRightPanelComponent implements OnChanges {
  @Input() selectedUser: UserProfile | null = null;
  messages$: Observable<any[]> | null = null;
  messageText: string = '';
  currentUserId: string | null = null;

  constructor(
    private chatService: ChatService,
    private auth: AngularFireAuth
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUser'] && this.selectedUser) {
      this.loadMessages();
    }
  }

  private async loadMessages(): Promise<void> {
    if (this.selectedUser) {
      const currentUser = await this.auth.currentUser;
      if (currentUser) {
        this.currentUserId = currentUser.uid;
        this.messages$ = this.chatService
          .getMessages(currentUser.uid, this.selectedUser.id)
          .pipe(
            map((messages) =>
              messages.map((message) => {
                if (message.timestamp instanceof Timestamp) {
                  message.timestamp = message.timestamp.toDate();
                }
                return message;
              })
            )
          );
      }
    }
  }

  async sendMessage(): Promise<void> {
    const message = this.messageText.trim();
    if (message && this.selectedUser) {
      const currentUser = await this.auth.currentUser;
      if (currentUser) {
        const senderId = currentUser.uid;
        const receiverId = this.selectedUser.id;

        try {
          this.messageText = '';
          await this.chatService.sendMessage(senderId, receiverId, message);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  }

  goBack() {
    this.selectedUser = null;
  }
}

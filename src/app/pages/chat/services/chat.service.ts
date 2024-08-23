import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { ChatMessage } from '../models/chat.model';
import { Timestamp } from 'firebase/firestore';
import { UserProfile } from '../../profile/models/userProfile.model';
import { UserService } from '../../profile/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private firestore: AngularFirestore,
    private userService: UserService
  ) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<void> {
    try {
      const timestamp = new Date();

      const messageData: ChatMessage = {
        senderId,
        receiverId,
        message,
        timestamp,
      };

      const chatPath = `chat/${senderId}_${receiverId}/messages`;
      const chatPathReverse = `chat/${receiverId}_${senderId}/messages`;

      await this.firestore.collection(chatPath).add(messageData);
      await this.firestore.collection(chatPathReverse).add(messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getMessages(senderId: string, receiverId: string): Observable<ChatMessage[]> {
    const chatPath = `chat/${senderId}_${receiverId}/messages`;

    return this.firestore
      .collection<ChatMessage>(chatPath, (ref) => ref.orderBy('timestamp'))
      .valueChanges();
  }

  getLatestMessages(
    userId: string
  ): Observable<{ user: UserProfile; latestMessage: ChatMessage }[]> {
    return this.firestore
      .doc<UserProfile>(`users/${userId}`)
      .valueChanges()
      .pipe(
        switchMap((user) => {
          if (!user || !user.following || !user.followers) {
            return of([]);
          }

          const chatPaths = [
            ...user.following.map((f) => `chat/${userId}_${f.userId}/messages`),
            ...user.followers.map((f) => `chat/${f.userId}_${userId}/messages`),
          ];

          return combineLatest(
            chatPaths.map((path) =>
              this.firestore
                .collection(path, (ref) =>
                  ref.orderBy('timestamp', 'desc').limit(1)
                )
                .snapshotChanges()
                .pipe(
                  map((changes) =>
                    changes.length > 0
                      ? this.convertToChatMessage(changes[0].payload.doc.data())
                      : null
                  )
                )
            )
          );
        }),
        switchMap((latestMessages) => {
          const userIds = Array.from(
            new Set(
              latestMessages
                .filter((msg) => msg !== null)
                .map((msg) =>
                  msg!.senderId === userId ? msg!.receiverId : msg!.senderId
                )
            )
          );

          return this.userService.getUserProfiles(userIds).pipe(
            map((userProfiles) => {
              return userProfiles.map((userProfile) => {
                const latestMessage = latestMessages.find(
                  (msg) =>
                    msg &&
                    (msg.senderId === userProfile.id ||
                      msg.receiverId === userProfile.id)
                );

                return { user: userProfile, latestMessage: latestMessage! };
              });
            })
          );
        })
      );
  }

  private convertToChatMessage(message: any): ChatMessage {
    return {
      ...message,
      timestamp:
        message.timestamp instanceof Timestamp
          ? message.timestamp.toDate()
          : message.timestamp,
    } as ChatMessage;
  }
}

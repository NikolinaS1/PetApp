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
    const chatPathReverse = `chat/${receiverId}_${senderId}/messages`;

    return this.firestore
      .collection<ChatMessage>(chatPath, (ref) => ref.orderBy('timestamp'))
      .valueChanges();
  }

  getLatestMessages(
    userId: string
  ): Observable<{ user: UserProfile; latestMessage: ChatMessage }[]> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .valueChanges()
      .pipe(
        switchMap((user: any) => {
          if (!user || !user.following || !user.followers) {
            console.log('No following or followers data');
            return of([]);
          }

          const chatPaths = [
            ...user.following.map(
              (id: string) => `chat/${userId}_${id}/messages`
            ),
            ...user.followers.map(
              (id: string) => `chat/${id}_${userId}/messages`
            ),
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
          const userIds = new Set<string>(
            latestMessages
              .filter((msg) => msg !== null)
              .map((msg) => {
                const message = msg as ChatMessage;
                return message.senderId === userId
                  ? message.receiverId
                  : message.senderId;
              })
          );

          return this.userService.getUserProfiles(Array.from(userIds)).pipe(
            map((userProfiles) => {
              return userProfiles.map((userProfile) => {
                const latestMessage = latestMessages.find(
                  (msg) =>
                    msg &&
                    ((msg as ChatMessage).senderId === userProfile.id ||
                      (msg as ChatMessage).receiverId === userProfile.id)
                ) as ChatMessage;

                return { user: userProfile, latestMessage };
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

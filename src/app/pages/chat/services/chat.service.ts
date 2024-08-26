import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
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
        isRead: false,
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
  ): Observable<{ user: UserProfile; latestMessage: ChatMessage | null }[]> {
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

                return {
                  user: userProfile,
                  latestMessage: latestMessage
                    ? {
                        ...latestMessage,
                        message: this.truncateMessage(latestMessage.message),
                      }
                    : null,
                };
              });
            })
          );
        })
      );
  }

  private truncateMessage(message: string, maxLength: number = 40): string {
    return message.length > maxLength
      ? message.substring(0, maxLength) + '...'
      : message;
  }

  private convertToChatMessage(message: any): ChatMessage {
    return {
      ...message,
      timestamp:
        message.timestamp instanceof Timestamp
          ? message.timestamp.toDate()
          : message.timestamp,
      isRead: message.isRead || false,
    } as ChatMessage;
  }

  async markMessagesAsRead(
    senderId: string,
    receiverId: string
  ): Promise<void> {
    try {
      const chatPath = `chat/${senderId}_${receiverId}/messages`;

      const reverseChatPath = `chat/${receiverId}_${senderId}/messages`;

      const batch = this.firestore.firestore.batch();

      const messagesSnapshot = await this.firestore
        .collection(chatPath, (ref) => ref.where('isRead', '==', false))
        .get()
        .toPromise();

      messagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      const reverseMessagesSnapshot = await this.firestore
        .collection(reverseChatPath, (ref) => ref.where('isRead', '==', false))
        .get()
        .toPromise();

      reverseMessagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  countUnreadMessages(userId: string): Observable<number> {
    return this.firestore
      .collection<UserProfile>('users')
      .doc(userId)
      .valueChanges()
      .pipe(
        switchMap((user) => {
          if (!user || !user.following || !user.followers) {
            return of(0);
          }

          const chatPaths = [
            ...user.following.map((f) => `chat/${userId}_${f.userId}/messages`),
            ...user.followers.map((f) => `chat/${f.userId}_${userId}/messages`),
          ];

          const observables = chatPaths.map((path) =>
            this.firestore
              .collection<ChatMessage>(path, (ref) =>
                ref.where('isRead', '==', false)
              )
              .valueChanges()
              .pipe(
                map((messages) => {
                  const sendersWithUnreadMessages = new Set<string>();
                  messages.forEach((message) => {
                    if (message.receiverId === userId) {
                      sendersWithUnreadMessages.add(message.senderId);
                    }
                  });
                  return sendersWithUnreadMessages;
                })
              )
          );

          return combineLatest(observables).pipe(
            map((sets) => {
              const distinctSenders = new Set<string>();
              sets.forEach((set) =>
                set.forEach((senderId) => distinctSenders.add(senderId))
              );
              return distinctSenders.size;
            })
          );
        }),
        catchError((error) => {
          console.error('Error counting unread messages:', error);
          return of(0);
        })
      );
  }

  async markMessagesAsReadForUser(
    senderId: string,
    receiverId: string
  ): Promise<void> {
    try {
      const chatPath = `chat/${senderId}_${receiverId}/messages`;

      const reverseChatPath = `chat/${receiverId}_${senderId}/messages`;

      const batch = this.firestore.firestore.batch();

      const messagesSnapshot = await this.firestore
        .collection(chatPath, (ref) => ref.where('isRead', '==', false))
        .get()
        .toPromise();

      messagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      const reverseMessagesSnapshot = await this.firestore
        .collection(reverseChatPath, (ref) => ref.where('isRead', '==', false))
        .get()
        .toPromise();

      reverseMessagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

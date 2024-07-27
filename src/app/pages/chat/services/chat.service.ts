import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: AngularFirestore) {}

  private getChatCollection(senderId: string, receiverId: string) {
    const chatId = this.getChatId(senderId, receiverId);
    return this.firestore.collection(`chats/${chatId}/messages`, (ref) =>
      ref.orderBy('timestamp')
    );
  }

  private getChatId(senderId: string, receiverId: string): string {
    return senderId < receiverId
      ? `${senderId}_${receiverId}`
      : `${receiverId}_${senderId}`;
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<void> {
    try {
      const chatId = this.getChatId(senderId, receiverId);
      const timestamp = new Date();

      await this.firestore.collection(`chats/${chatId}/messages`).add({
        senderId,
        receiverId,
        message,
        timestamp,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getMessages(senderId: string, receiverId: string): Observable<any[]> {
    return this.getChatCollection(senderId, receiverId).valueChanges();
  }
}

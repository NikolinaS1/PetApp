import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: AngularFirestore) {}

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
}

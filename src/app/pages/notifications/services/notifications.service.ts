import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AppNotification } from '../models/notifications.model';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private firestore: AngularFirestore) {}

  getNotificationsForCurrentUser(): Observable<AppNotification[]> {
    const currentUserId = localStorage.getItem('accessToken');
    if (!currentUserId) {
      return of([]);
    }

    return this.firestore
      .collection('notifications')
      .doc(currentUserId)
      .collection('notifications', (ref) => ref.orderBy('timestamp', 'desc'))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as AppNotification;
            const id = a.payload.doc.id;

            const timestamp =
              data.timestamp instanceof Timestamp
                ? data.timestamp.toDate()
                : data.timestamp;

            return { id, ...data, timestamp };
          })
        )
      );
  }

  getUnreadNotificationsCount(): Observable<number> {
    const currentUserId = localStorage.getItem('accessToken');
    if (!currentUserId) {
      return of(0);
    }

    return this.firestore
      .collection('notifications')
      .doc(currentUserId)
      .collection('notifications', (ref) => ref.where('isRead', '==', false))
      .valueChanges()
      .pipe(
        map((notifications: AppNotification[]) => notifications.length),
        catchError((error) => {
          console.error('Error counting unread notifications:', error);
          return of(0);
        })
      );
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const currentUserId = localStorage.getItem('accessToken');
    if (!currentUserId) {
      throw new Error('No user is logged in.');
    }

    try {
      const notificationsPath = `notifications/${currentUserId}/notifications`;

      const batch = this.firestore.firestore.batch();

      const notificationsSnapshot = await this.firestore
        .collection(notificationsPath, (ref) =>
          ref.where('isRead', '==', false)
        )
        .get()
        .toPromise();

      notificationsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }
}

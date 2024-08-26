import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppNotification } from '../models/notifications.model';
import { Timestamp } from 'firebase/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private uid: string | null = null;

  constructor(private firestore: AngularFirestore, private router: Router) {
    this.uid = localStorage.getItem('accessToken');
  }

  getNotificationsForCurrentUser(): Observable<AppNotification[]> {
    const currentUserId = this.uid;
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
    const currentUserId = this.uid;
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
    const currentUserId = this.uid;
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

  handleNotificationClick(notification: AppNotification): void {
    const markAsRead = () => this.markNotificationAsRead(notification.id);

    let navigationUrl: string[] = [];
    if (notification.message.includes('followed you')) {
      navigationUrl = ['/profile', notification.userId];
    } else {
      navigationUrl = ['/profile', notification.userId];
    }

    this.router.navigate(navigationUrl).then(() => {
      markAsRead().catch((error) => {
        console.error('Error marking notification as read:', error);
      });
    });
  }

  navigateToUserProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  navigateToCurrentUserProfile() {
    if (this.uid) {
      this.router.navigate(['/profile', this.uid]);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const currentUserId = this.uid;
      if (!currentUserId) {
        throw new Error('No user is logged in.');
      }

      const notificationRef = this.firestore
        .collection('notifications')
        .doc(currentUserId)
        .collection('notifications')
        .doc(notificationId).ref;

      await notificationRef.update({ isRead: true });

      console.log(`Notification ${notificationId} marked as read.`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

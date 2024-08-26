import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { AppNotification } from './models/notifications.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<AppNotification[]>;

  constructor(
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notifications$ =
      this.notificationsService.getNotificationsForCurrentUser();
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.notificationsService.markAllNotificationsAsRead();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async onNotificationClicked(notification: AppNotification): Promise<void> {
    try {
      await this.notificationsService.handleNotificationClick(notification);
    } catch (error) {
      console.error('Error clicking on notification:', error);
    }
  }
}

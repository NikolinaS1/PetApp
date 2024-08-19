import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<
    { message: string; profileImageUrl: string; timestamp: Date }[]
  >;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    const userId = localStorage.getItem('accessToken');
    this.notifications$ =
      this.notificationsService.getUserNotifications(userId);
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleString();
  }
}

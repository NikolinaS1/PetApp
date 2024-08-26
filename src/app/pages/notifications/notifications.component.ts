import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { Router } from '@angular/router';
import { AppNotification } from './models/notifications.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {}
}

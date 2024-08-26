import { Injectable } from '@angular/core';
import {
  combineLatest,
  map,
  Observable,
  switchMap,
  of,
  catchError,
} from 'rxjs';
import { IPost } from '../../../components/post/models/post.model';
import { UserProfile } from '../../../pages/profile/models/userProfile.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';
import { AppNotification } from '../models/notifications.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {}

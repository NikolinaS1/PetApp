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

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private defaultProfileImageUrl = '../../../assets/profile-icon.png';

  constructor(private firestore: AngularFirestore) {}

  getNotificationsForUser(
    userId: string
  ): Observable<
    { message: string; profileImageUrl: string; timestamp: Date }[]
  > {
    return combineLatest([
      this.getPostNotifications(userId),
      this.getFollowerNotifications(userId),
    ]).pipe(
      map(([postNotifications, followerNotifications]) => [
        ...postNotifications,
        ...followerNotifications,
      ]),
      map((notifications) =>
        notifications.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )
      )
    );
  }

  private getPostNotifications(
    userId: string
  ): Observable<
    { message: string; profileImageUrl: string; timestamp: Date }[]
  > {
    return this.firestore
      .collection('posts')
      .doc(userId)
      .collection('posts')
      .valueChanges()
      .pipe(
        switchMap((posts: IPost[]) => {
          if (!posts) return of([]);

          const commentNotifications = posts.flatMap((post) =>
            (post.comments || [])
              .filter((comment) => comment.userId !== userId)
              .map((comment) =>
                this.firestore
                  .collection('users')
                  .doc(comment.userId)
                  .valueChanges()
                  .pipe(
                    map((user: UserProfile) => ({
                      message: `${
                        comment.firstName || 'Someone'
                      } commented on your post.`,
                      profileImageUrl:
                        user?.profileImageUrl || this.defaultProfileImageUrl,
                      timestamp: this.convertTimestampToDate(comment.createdAt),
                    }))
                  )
              )
          );

          const likeNotifications = posts.flatMap((post) =>
            (post.likes || [])
              .filter((like) => like.userId !== userId)
              .map((like) =>
                this.firestore
                  .collection('users')
                  .doc(like.userId)
                  .valueChanges()
                  .pipe(
                    map((user: UserProfile) => ({
                      message: `${
                        user?.firstName || 'Someone'
                      } liked your post.`,
                      profileImageUrl:
                        user?.profileImageUrl || this.defaultProfileImageUrl,
                      timestamp: this.convertTimestampToDate(like.timestamp),
                    }))
                  )
              )
          );

          return combineLatest([
            ...commentNotifications,
            ...likeNotifications,
          ]).pipe(
            catchError((error) => {
              console.error('Error fetching post notifications:', error);
              return of([]);
            })
          );
        })
      );
  }

  private getFollowerNotifications(
    userId: string
  ): Observable<
    { message: string; profileImageUrl: string; timestamp: Date }[]
  > {
    return this.firestore
      .collection('users')
      .doc(userId)
      .valueChanges()
      .pipe(
        switchMap((user: UserProfile | undefined) => {
          if (!user || !user.followers) return of([]);

          const followerNotifications = user.followers.map((follower) =>
            this.firestore
              .collection('users')
              .doc(follower.userId)
              .valueChanges()
              .pipe(
                map((followerData: UserProfile | undefined) => {
                  if (!followerData) {
                    return {
                      message: 'Someone followed you.',
                      profileImageUrl: this.defaultProfileImageUrl,
                      timestamp: this.convertTimestampToDate(
                        follower.followedAt
                      ),
                    };
                  }
                  return {
                    message: `${
                      followerData.firstName || 'Someone'
                    } followed you.`,
                    profileImageUrl:
                      followerData.profileImageUrl ||
                      this.defaultProfileImageUrl,
                    timestamp: this.convertTimestampToDate(follower.followedAt),
                  };
                }),
                catchError((error) => {
                  console.error('Error fetching follower data:', error);
                  return of({
                    message:
                      'An error occurred while fetching follower notifications.',
                    profileImageUrl: this.defaultProfileImageUrl,
                    timestamp: this.convertTimestampToDate(follower.followedAt),
                  });
                })
              )
          );

          return combineLatest(followerNotifications).pipe(
            catchError((error) => {
              console.error('Error fetching follower notifications:', error);
              return of([]);
            })
          );
        })
      );
  }

  private convertTimestampToDate(
    timestamp: Timestamp | Date | undefined
  ): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date();
  }
}

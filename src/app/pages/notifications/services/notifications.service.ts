import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { IPost } from '../../../components/post/models/post.model';
import { UserProfile } from '../../../pages/profile/models/userProfile.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
      ])
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
                      message: `${comment.firstName} ${comment.lastName} commented on your post.`,
                      profileImageUrl:
                        user?.profileImageUrl || this.defaultProfileImageUrl,
                      timestamp: new Date(), // Generate a new timestamp
                    }))
                  )
              )
          );

          const likeNotifications = posts.flatMap((post) =>
            (post.likes || [])
              .filter((likeUserId) => likeUserId !== userId)
              .map((likeUserId) =>
                this.firestore
                  .collection('users')
                  .doc(likeUserId)
                  .valueChanges()
                  .pipe(
                    map((user: UserProfile) => ({
                      message: `${user.firstName} ${user.lastName} liked your post.`,
                      profileImageUrl:
                        user?.profileImageUrl || this.defaultProfileImageUrl,
                      timestamp: new Date(), // Generate a new timestamp
                    }))
                  )
              )
          );

          return combineLatest([...commentNotifications, ...likeNotifications]);
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
        switchMap((user: UserProfile) => {
          const followerIds = user.followers || [];
          const followerNotifications = followerIds.map((followerId) =>
            this.firestore
              .collection('users')
              .doc(followerId)
              .valueChanges()
              .pipe(
                map((follower: UserProfile) => ({
                  message: `${follower.firstName} ${follower.lastName} followed you.`,
                  profileImageUrl:
                    follower?.profileImageUrl || this.defaultProfileImageUrl,
                  timestamp: new Date(), // Generate a new timestamp
                }))
              )
          );
          return followerIds.length
            ? combineLatest(followerNotifications)
            : of([]);
        })
      );
  }

  getUserNotifications(
    userId: string
  ): Observable<
    { message: string; profileImageUrl: string; timestamp: Date }[]
  > {
    return this.getNotificationsForUser(userId);
  }
}

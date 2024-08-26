import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  firstValueFrom,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';
import { Pet } from '../models/pet.model';
import { UserProfile } from '../models/userProfile.model';
import firebase from 'firebase/compat/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { IPost } from '../../../components/post/models/post.model';
import { AppNotification } from '../../notifications/models/notifications.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private profileImageUrlSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    const cachedImageUrl = localStorage.getItem('profileImageUrl');
    if (cachedImageUrl) {
      this.profileImageUrlSubject.next(cachedImageUrl);
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userProfileRef = this.firestore.collection('users').doc(uid);
      const userProfileSnapshot = await firstValueFrom(userProfileRef.get());
      if (userProfileSnapshot.exists) {
        return userProfileSnapshot.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  uploadImage(file: File, userId: string) {
    const storage = getStorage();
    const filePath = `profile-images/${userId}/${file.name}`;
    const fileRef = ref(storage, filePath);
    const uploadTask = from(uploadBytes(fileRef, file));
    return uploadTask.pipe(switchMap((result) => getDownloadURL(result.ref)));
  }

  saveImageUrl(userId: string, imageUrl: string) {
    if (imageUrl) {
      return this.firestore
        .collection('users')
        .doc(userId)
        .update({ profileImageUrl: imageUrl });
    } else {
      console.error('Invalid image URL');
      return Promise.reject(new Error('Invalid image URL'));
    }
  }

  async deleteProfileImage(userId: string, url: string): Promise<void> {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, url);

      await deleteObject(fileRef);

      await this.firestore.collection('users').doc(userId).update({
        profileImageUrl: null,
      });
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  }

  getPets(uid: string): Observable<Pet[]> {
    return this.firestore
      .collection(`pets/${uid}/pets`)
      .valueChanges({ idField: 'id' }) as Observable<Pet[]>;
  }

  searchUsers(query: string): Observable<UserProfile[]> {
    return this.firestore
      .collection('users')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as UserProfile;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        ),
        map((users) =>
          users.filter((user) => {
            const userName = `${user.firstName || ''} ${user.lastName || ''}`;
            return userName.toLowerCase().includes(query.toLowerCase());
          })
        )
      );
  }

  async followUser(followingUserId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        throw new Error('No access token found');
      }

      const batch = this.firestore.firestore.batch();
      const timestamp = new Date();

      const currentUserRef = this.firestore
        .collection('users')
        .doc(currentUserId).ref as DocumentReference<UserProfile>;
      const followingUserRef = this.firestore
        .collection('users')
        .doc(followingUserId).ref as DocumentReference<UserProfile>;

      const currentUserDoc = await currentUserRef.get();
      const currentUserData = currentUserDoc.data();
      if (!currentUserData) {
        throw new Error('Current user data not found');
      }

      const { profileImageUrl = '', firstName = '' } = currentUserData;

      const notificationId = uuidv4();
      const notificationRef = this.firestore
        .collection('notifications')
        .doc(followingUserId)
        .collection('notifications')
        .doc(notificationId);

      const notification: AppNotification = {
        id: notificationId,
        userId: currentUserId,
        profileImageUrl,
        firstName,
        message: 'followed you',
        timestamp,
        isRead: false,
      };

      batch.update(currentUserRef, {
        following: firebase.firestore.FieldValue.arrayUnion({
          userId: followingUserId,
          followedAt: timestamp,
        }),
      });

      batch.update(followingUserRef, {
        followers: firebase.firestore.FieldValue.arrayUnion({
          userId: currentUserId,
          followedAt: timestamp,
        }),
      });

      batch.set(notificationRef.ref, notification);

      await batch.commit();
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followingUserId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        throw new Error('No access token found');
      }

      const batch = this.firestore.firestore.batch();

      const currentUserRef = this.firestore
        .collection('users')
        .doc(currentUserId).ref as DocumentReference<UserProfile>;
      const followingUserRef = this.firestore
        .collection('users')
        .doc(followingUserId).ref as DocumentReference<UserProfile>;

      const currentUserDoc = await currentUserRef.get();
      const currentUserData = currentUserDoc.data() as UserProfile;
      const followingUserDoc = await followingUserRef.get();
      const followingUserData = followingUserDoc.data() as UserProfile;

      if (!currentUserData || !followingUserData) {
        throw new Error('User data not found');
      }

      const updatedFollowing =
        currentUserData.following?.filter(
          (follow) => follow.userId !== followingUserId
        ) || [];

      const updatedFollowers =
        followingUserData.followers?.filter(
          (follower) => follower.userId !== currentUserId
        ) || [];

      batch.update(currentUserRef, {
        following: updatedFollowing,
      });

      batch.update(followingUserRef, {
        followers: updatedFollowers,
      });

      const notificationsCollection = this.firestore
        .collection('notifications')
        .doc(followingUserId)
        .collection('notifications');

      const snapshot = await firstValueFrom(notificationsCollection.get());

      snapshot.forEach((doc) => {
        const docData = doc.data() as AppNotification;
        if (docData.userId === currentUserId) {
          batch.delete(doc.ref);
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  getFollowingCount(userId: string): Observable<number> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .valueChanges()
      .pipe(
        map((user: any) => {
          if (user && user.following) {
            return (
              user.following as Array<{ userId: string; followedAt: Date }>
            ).length;
          } else {
            return 0;
          }
        }),
        catchError((error) => {
          console.error('Error fetching following count:', error);
          return of(0);
        })
      );
  }

  getFollowersCount(userId: string): Observable<number> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .valueChanges()
      .pipe(
        map((user: any) => {
          if (user && user.followers) {
            return (
              user.followers as Array<{ userId: string; followedAt: Date }>
            ).length;
          } else {
            return 0;
          }
        }),
        catchError((error) => {
          console.error('Error fetching followers count:', error);
          return of(0);
        })
      );
  }

  isFollowing(userId: string, followingUserId: string): Observable<boolean> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .valueChanges()
      .pipe(
        map((user: any) => {
          if (user && user.following) {
            return (
              user.following as Array<{ userId: string; followedAt: Date }>
            ).some((follow) => follow.userId === followingUserId);
          } else {
            return false;
          }
        })
      );
  }

  async getFollowingUserDetails(userId: string): Promise<UserProfile[]> {
    try {
      const userDoc = await this.firestore
        .collection('users')
        .doc(userId)
        .get()
        .toPromise();

      const userData = userDoc.data() as {
        following: Array<{ userId: string; followedAt: Date }>;
      };
      if (!userData || !userData.following) {
        return [];
      }

      const followingIds = userData.following.map((follow) => follow.userId);

      const userDocs = await Promise.all(
        followingIds.map((id) =>
          this.firestore.collection('users').doc(id).get().toPromise()
        )
      );

      return userDocs.map((doc) => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error fetching following user details:', error);
      throw error;
    }
  }

  async getFollowersDetails(userId: string): Promise<UserProfile[]> {
    try {
      const userDoc = await this.firestore
        .collection('users')
        .doc(userId)
        .get()
        .toPromise();

      const userData = userDoc.data() as {
        followers: Array<{ userId: string; followedAt: Date }>;
      };
      if (!userData || !userData.followers) {
        return [];
      }

      const followerIds = userData.followers.map((follower) => follower.userId);

      const followerDocs = await Promise.all(
        followerIds.map((id) =>
          this.firestore.collection('users').doc(id).get().toPromise()
        )
      );

      return followerDocs.map((doc) => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error fetching follower user details:', error);
      throw error;
    }
  }

  searchMutualUsers(query: string): Observable<UserProfile[]> {
    return new Observable((observer) => {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        observer.next([]);
        observer.complete();
        return;
      }

      this.firestore
        .collection('users')
        .doc(currentUserId)
        .get()
        .toPromise()
        .then((currentUserDoc) => {
          const currentUserData = currentUserDoc.data() as {
            following?: Array<{ userId: string }>;
            followers?: Array<{ userId: string }>;
          };

          if (!currentUserData) {
            observer.next([]);
            observer.complete();
            return;
          }

          const followingIds = new Set(
            currentUserData.following?.map((follow) => follow.userId) || []
          );
          const followerIds = new Set(
            currentUserData.followers?.map((follower) => follower.userId) || []
          );
          const mutualIds = [...followingIds].filter((id) =>
            followerIds.has(id)
          );

          Promise.all(
            mutualIds.map((id) =>
              this.firestore.collection('users').doc(id).get().toPromise()
            )
          )
            .then((userDocs) => {
              const users = userDocs
                .map((doc) => {
                  const data = doc.data() as UserProfile;
                  return { id: doc.id, ...data };
                })
                .filter((user) => {
                  const userName =
                    (user.firstName || '') + ' ' + (user.lastName || '');
                  return userName.toLowerCase().includes(query.toLowerCase());
                });
              observer.next(users);
              observer.complete();
            })
            .catch((error) => {
              console.error('Error searching mutual users:', error);
              observer.error(error);
            });
        })
        .catch((error) => {
          console.error('Error retrieving current user data:', error);
          observer.error(error);
        });
    });
  }

  getUserProfiles(userIds: string[]): Observable<UserProfile[]> {
    return combineLatest(
      userIds.map((id) =>
        this.firestore
          .collection('users')
          .doc(id)
          .valueChanges()
          .pipe(
            map((data) => ({ id, ...(data as UserProfile) } as UserProfile))
          )
      )
    ).pipe(
      map((profiles) => {
        console.log('User profiles:', profiles);
        return profiles;
      })
    );
  }

  getCurrentUserProfileImage(): Observable<string | null> {
    const cachedImageUrl = this.profileImageUrlSubject.value;
    if (cachedImageUrl) {
      return of(cachedImageUrl);
    }

    return this.auth.authState.pipe(
      switchMap((user) => {
        if (user) {
          const userProfileRef = this.firestore
            .collection('users')
            .doc(user.uid);
          return userProfileRef.get().pipe(
            map((doc) => {
              const data = doc.data() as UserProfile;
              const imageUrl = data?.profileImageUrl || null;
              this.profileImageUrlSubject.next(imageUrl);
              if (imageUrl) {
                localStorage.setItem('profileImageUrl', imageUrl);
              }
              return imageUrl;
            })
          );
        } else {
          return of(null);
        }
      }),
      catchError((error) => {
        console.error('Error fetching profile image:', error);
        return of(null);
      })
    );
  }

  getProfileImageUrl(): Observable<string | null> {
    return this.profileImageUrlSubject.asObservable();
  }

  clearProfileImageCache(): void {
    this.profileImageUrlSubject.next(null);
    localStorage.removeItem('profileImageUrl');
  }

  getUserRole(uid: string): Observable<string | null> {
    return this.firestore
      .collection('users')
      .doc(uid)
      .valueChanges()
      .pipe(
        map((user: UserProfile) => user.role || null),
        catchError((error) => {
          console.error('Error fetching user role:', error);
          return of(null);
        })
      );
  }
}

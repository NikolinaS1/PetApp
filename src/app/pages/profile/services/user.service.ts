import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

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
      const batch = this.firestore.firestore.batch();

      const currentUserRef = this.firestore
        .collection('users')
        .doc(currentUserId).ref;
      const followingUserRef = this.firestore
        .collection('users')
        .doc(followingUserId).ref;

      batch.update(currentUserRef, {
        following: firebase.firestore.FieldValue.arrayUnion(followingUserId),
      });

      batch.update(followingUserRef, {
        followers: firebase.firestore.FieldValue.arrayUnion(currentUserId),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followingUserId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      const batch = this.firestore.firestore.batch();

      const currentUserRef = this.firestore
        .collection('users')
        .doc(currentUserId).ref;
      const followingUserRef = this.firestore
        .collection('users')
        .doc(followingUserId).ref;

      batch.update(currentUserRef, {
        following: firebase.firestore.FieldValue.arrayRemove(followingUserId),
      });

      batch.update(followingUserRef, {
        followers: firebase.firestore.FieldValue.arrayRemove(currentUserId),
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
            return user.following.length;
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
            return user.followers.length;
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
        map(
          (user: any) =>
            user && user.following && user.following.includes(followingUserId)
        )
      );
  }

  async getFollowingUserDetails(userId: string): Promise<UserProfile[]> {
    try {
      const userDoc = await this.firestore
        .collection('users')
        .doc(userId)
        .get()
        .toPromise();
      const userData = userDoc.data() as UserProfile;
      if (!userData || !userData.following) {
        return [];
      }

      const followingIds = userData.following;

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
      const userData = userDoc.data() as UserProfile;
      if (!userData || !userData.followers) {
        return [];
      }

      const followerIds = userData.followers;

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

  async searchMutualUsers(query: string): Promise<UserProfile[]> {
    try {
      const currentUserId = localStorage.getItem('accessToken');

      if (!currentUserId) {
        throw new Error('No current user ID found');
      }

      const currentUserDoc = await this.firestore
        .collection('users')
        .doc(currentUserId)
        .get()
        .toPromise();

      const currentUserData = currentUserDoc.data() as UserProfile;
      if (
        !currentUserData ||
        !currentUserData.following ||
        !currentUserData.followers
      ) {
        return [];
      }

      const followingIds = new Set(currentUserData.following);
      const followerIds = new Set(currentUserData.followers);

      const mutualIds = [...followingIds].filter((id) => followerIds.has(id));

      const userDocs = await Promise.all(
        mutualIds.map((id) =>
          this.firestore.collection('users').doc(id).get().toPromise()
        )
      );

      const users = userDocs
        .map((doc) => {
          const data = doc.data() as UserProfile;
          return { id: doc.id, ...data };
        })
        .filter((user) => {
          const userName = (user.firstName || '') + ' ' + (user.lastName || '');
          return userName.toLowerCase().includes(query.toLowerCase());
        });

      console.log('Filtered users:', users);
      return users;
    } catch (error) {
      console.error('Error searching mutual users:', error);
      throw error;
    }
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
    );
  }
}

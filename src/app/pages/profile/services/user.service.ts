import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  Observable,
  catchError,
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

  searchUsers(query: string): Observable<any[]> {
    return this.firestore
      .collection('users', (ref) =>
        ref
          .orderBy('firstName')
          .startAt(query)
          .endAt(query + '\uf8ff')
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as { [key: string]: any };
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  async followUser(followingUserId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');

      await this.firestore
        .collection('users')
        .doc(currentUserId)
        .update({
          following: firebase.firestore.FieldValue.arrayUnion(followingUserId),
        });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followingUserId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');

      await this.firestore
        .collection('users')
        .doc(currentUserId)
        .update({
          following: firebase.firestore.FieldValue.arrayRemove(followingUserId),
        });
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
}

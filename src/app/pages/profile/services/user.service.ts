import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom, from, map, switchMap } from 'rxjs';
import { Pet } from '../models/pet.model';
import { UserProfile } from '../models/userProfile.model';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: AngularFirestore) {}

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
}

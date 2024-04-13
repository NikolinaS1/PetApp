import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, from, switchMap } from 'rxjs';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: AngularFirestore) {}

  async getUserProfile(uid: string): Promise<any> {
    try {
      const userProfileRef = this.firestore.collection('users').doc(uid);
      const userProfileSnapshot = await firstValueFrom(userProfileRef.get());
      if (userProfileSnapshot.exists) {
        return userProfileSnapshot.data();
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
    return this.firestore
      .collection('users')
      .doc(userId)
      .update({ profileImageUrl: imageUrl });
  }
}

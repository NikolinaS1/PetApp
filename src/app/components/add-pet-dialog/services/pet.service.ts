import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, switchMap } from 'rxjs';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  constructor(private firestore: AngularFirestore) {}

  async addPetWithImage(
    petName: string,
    petDescription: string,
    file: File,
    userId: string
  ) {
    const storage = getStorage();
    const petId = this.firestore.createId();
    const filePath = `pets/${userId}/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await this.firestore
        .collection('pets')
        .doc(userId)
        .collection('pets')
        .add({
          name: petName,
          description: petDescription,
          imageUrl: imageUrl,
        });

      return 'Pet added successfully!';
    } catch (error) {
      console.error('Error adding pet with image:', error);
      throw error;
    }
  }

  saveImageUrl(userId: string, imageUrl: string) {
    if (imageUrl) {
      return this.firestore
        .collection('pets')
        .doc(userId)
        .update({ petImageUrl: imageUrl });
    } else {
      console.error('Invalid image URL');
      return Promise.reject(new Error('Invalid image URL'));
    }
  }
}

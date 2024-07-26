import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  constructor(private firestore: AngularFirestore) {}

  async addPetWithImage(
    petName: string,
    petYear: string,
    petMonth: string,
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
        .doc(petId)
        .set({
          name: petName,
          year: petYear,
          month: petMonth,
          description: petDescription,
          imageUrl: imageUrl,
        });

      return 'Pet added successfully!';
    } catch (error) {
      console.error('Error adding pet with image:', error);
      throw error;
    }
  }

  async updatePet(
    petId: string,
    petName: string,
    petYear: string,
    petMonth: string,
    petDescription: string,
    file: File | null,
    userId: string
  ) {
    const storage = getStorage();
    let imageUrl = null;

    try {
      if (file) {
        const filePath = `pets/${userId}/${file.name}`;
        const fileRef = ref(storage, filePath);
        const snapshot = await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const petRef = this.firestore
        .collection('pets')
        .doc(userId)
        .collection('pets')
        .doc(petId);

      const updateData: any = {
        name: petName,
        year: petYear,
        month: petMonth,
        description: petDescription,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      await petRef.update(updateData);

      return 'Pet updated successfully!';
    } catch (error) {
      console.error('Error updating pet with image:', error);
      throw error;
    }
  }

  async deletePet(userId: string, petId: string) {
    const storage = getStorage();
    const filePath = `pets/${userId}/${petId}`;
    const fileRef = ref(storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    try {
      await this.firestore
        .collection('pets')
        .doc(userId)
        .collection('pets')
        .doc(petId)
        .delete();

      return 'Pet deleted successfully!';
    } catch (error) {
      console.error('Error deleting a pet:', error);
      throw error;
    }
  }
}

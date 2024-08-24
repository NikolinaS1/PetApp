import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  constructor(private firestore: AngularFirestore) {}

  async saveRating(userId: string, rating: number) {
    try {
      await this.firestore.collection('ratings').doc(userId).set({
        rating: rating,
      });

      return 'App rated successfully!';
    } catch (error) {
      console.error('Error rating app:', error);
      throw error;
    }
  }

  async getRating(userId: string): Promise<number | null> {
    try {
      const doc = await this.firestore
        .collection('ratings')
        .doc(userId)
        .get()
        .toPromise();
      if (doc.exists) {
        const data = doc.data() as Rating;
        return data.rating || null;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
      throw error;
    }
  }
}

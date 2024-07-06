import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Observable, map } from 'rxjs';
import { IPost } from '../../post/models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private firestore: AngularFirestore) {}

  async addPost(text: string, imageFile: File | null, userId: string) {
    const storage = getStorage();
    const postId = this.firestore.createId();

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const filePath = `posts/${userId}/${imageFile.name}`;
        const fileRef = ref(storage, filePath);
        const snapshot = await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId)
        .set({
          userId: userId,
          text: text,
          imageUrl: imageUrl,
          postId: postId,
          createdAt: new Date(),
        });

      return 'Post added successfully!';
    } catch (error) {
      console.error('Error adding post with image:', error);
      throw error;
    }
  }

  getPosts(uid: string): Observable<IPost[]> {
    return this.firestore
      .collection('posts')
      .doc(uid)
      .collection('posts')
      .valueChanges({ idField: 'id' })
      .pipe(
        map((posts: any[]) =>
          posts.map((p) => ({
            id: p.id,
            text: p.text,
            imageUrl: p.imageUrl,
            createdAt: p.createdAt ? p.createdAt.toDate() : null,
          }))
        )
      );
  }

  saveImageUrl(userId: string, imageUrl: string) {
    if (imageUrl) {
      return this.firestore
        .collection('posts')
        .doc(userId)
        .update({ postImageUrl: imageUrl });
    } else {
      console.error('Invalid image URL');
      return Promise.reject(new Error('Invalid image URL'));
    }
  }
}
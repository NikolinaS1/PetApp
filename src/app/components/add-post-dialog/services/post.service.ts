import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore'; // Ensure correct import
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { combineLatest, from, Observable, of, switchMap } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { IPost } from '../../post/models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private firestore: AngularFirestore) {}

  async addPost(
    text: string,
    imageFile: File | null,
    userId: string,
    firstName: string,
    lastName: string,
    profileImageUrl: string
  ) {
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
          firstName: firstName,
          lastName: lastName,
          profileImageUrl: profileImageUrl,
          likes: [],
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
      .collection('posts', (ref) => ref.orderBy('createdAt', 'desc'))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as IPost;
            const id = a.payload.doc.id;
            const createdAt =
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : data.createdAt;
            return { id, ...data, createdAt };
          })
        )
      );
  }

  getAllPosts(): Observable<IPost[]> {
    return this.firestore
      .collection('posts')
      .get()
      .pipe(
        switchMap((querySnapshot) => {
          const userIds = querySnapshot.docs.map((doc) => doc.id);
          return from(userIds).pipe(
            switchMap((userId) =>
              this.firestore
                .collection('posts')
                .doc(userId)
                .collection('posts', (ref) => ref.orderBy('createdAt', 'desc'))
                .valueChanges({ idField: 'id' })
                .pipe(
                  map((posts: any[]) =>
                    posts.map((p) => ({
                      id: p.id,
                      text: p.text,
                      imageUrl: p.imageUrl,
                      createdAt: p.createdAt
                        ? p.createdAt instanceof Timestamp
                          ? p.createdAt.toDate()
                          : p.createdAt
                        : null,
                      userId: userId,
                      firstName: p.firstName,
                      lastName: p.lastName,
                      profileImageUrl: p.profileImageUrl,
                      likes: p.likes || [],
                    }))
                  )
                )
            ),
            toArray(),
            map((postsArrays) => postsArrays.flat())
          );
        })
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

  async deletePost(userId: string, postId: string) {
    const storage = getStorage();
    const filePath = `posts/${userId}/${postId}`;
    const fileRef = ref(storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    try {
      await this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId)
        .delete();

      return 'Post deleted successfully!';
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  getPostsByFollowing(currentUserId: string): Observable<IPost[]> {
    return this.getPosts(currentUserId).pipe(
      switchMap((currentUserPosts) =>
        this.firestore
          .collection('users')
          .doc(currentUserId)
          .valueChanges()
          .pipe(
            switchMap((user: any) => {
              const followingIds: string[] = user.following || [];
              const postObservables: Observable<IPost[]>[] = followingIds.map(
                (userId: string) =>
                  this.getPosts(userId).pipe(
                    map((posts) =>
                      posts.map((p) => ({
                        ...p,
                        createdAt:
                          p.createdAt instanceof Timestamp
                            ? p.createdAt.toDate()
                            : p.createdAt,
                      }))
                    )
                  )
              );
              return combineLatest(postObservables).pipe(
                map((postsArrays: IPost[][]) =>
                  postsArrays.flat().concat(currentUserPosts)
                ),
                map((posts: IPost[]) =>
                  posts.sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                  )
                )
              );
            })
          )
      )
    );
  }

  async likePost(userId: string, postId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        throw new Error('No user is logged in.');
      }

      const batch = this.firestore.firestore.batch();
      const postRef = this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId).ref;

      batch.update(postRef, {
        likes: arrayUnion(currentUserId),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error liking post:', error);
      throw new Error('Unable to like post. Please try again later.');
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        throw new Error('No user is logged in.');
      }

      const batch = this.firestore.firestore.batch();
      const postRef = this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId).ref;

      batch.update(postRef, {
        likes: arrayRemove(currentUserId),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error unliking post:', error);
      throw new Error('Unable to unlike post. Please try again later.');
    }
  }
}

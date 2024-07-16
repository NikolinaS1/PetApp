import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import {
  Observable,
  combineLatest,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  toArray,
} from 'rxjs';
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
      .valueChanges({ idField: 'id' })
      .pipe(
        map((posts: any[]) =>
          posts.map((p) => ({
            id: p.id,
            text: p.text,
            imageUrl: p.imageUrl,
            createdAt: p.createdAt ? p.createdAt.toDate() : null,
            firstName: p.firstName,
            lastName: p.lastName,
            profileImageUrl: p.profileImageUrl,
          }))
        )
      );
  }

  getAllPosts(): Observable<IPost[]> {
    return this.firestore
      .collection('posts')
      .get()
      .pipe(
        mergeMap((querySnapshot) => {
          const userIds = querySnapshot.docs.map((doc) => doc.id);
          return from(userIds).pipe(
            mergeMap((userId) =>
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
                      createdAt: p.createdAt ? p.createdAt.toDate() : null,
                      userId: userId,
                      firstName: p.firstName,
                      lastName: p.lastName,
                      profileImageUrl: p.profileImageUrl,
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
    return this.firestore
      .collection('users')
      .doc(currentUserId)
      .valueChanges()
      .pipe(
        switchMap((user: any) => {
          const followingIds: string[] = user.following || [];
          if (followingIds.length === 0) {
            return of([]);
          }
          const postObservables: Observable<IPost[]>[] = followingIds.map(
            (userId: string) =>
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
                      createdAt: p.createdAt ? p.createdAt.toDate() : null,
                      userId: userId,
                      firstName: p.firstName,
                      lastName: p.lastName,
                      profileImageUrl: p.profileImageUrl,
                    }))
                  )
                )
          );
          return combineLatest(postObservables).pipe(
            map((postsArrays: IPost[][]) => postsArrays.flat()),
            map((posts: IPost[]) =>
              posts.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
              )
            )
          );
        }),
        switchMap((posts: IPost[]) => {
          const userIds = posts.map((post) => post.userId);
          const userObservables = userIds.map((userId) =>
            this.firestore.collection('users').doc(userId).valueChanges()
          );
          return combineLatest(userObservables).pipe(
            map((users) => {
              return posts.map((post, index) => ({
                ...post,
                user: users[index],
              }));
            })
          );
        })
      );
  }
}

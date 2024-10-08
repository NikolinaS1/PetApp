import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  arrayUnion,
  arrayRemove,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { combineLatest, from, Observable, of, switchMap } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { ILike, IPost } from '../../post/models/post.model';
import { UserProfile } from '../../../pages/profile/models/userProfile.model';
import { IComment } from '../../comments-dialog/models/comments.model';
import { v4 as uuidv4 } from 'uuid';
import { AppNotification } from '../../../pages/notifications/models/notifications.model';

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
    profileImageUrl: string,
    petNames: string[]
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
          petNames: petNames,
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
            return {
              id,
              ...data,
              createdAt,
              commentCount: data.commentCount || 0,
            };
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
                .valueChanges({ idField: 'postId' })
                .pipe(
                  map((posts: any[]) =>
                    posts.map((p) => ({
                      id: p.postId,
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
                      commentCount: p.commentCount || 0,
                      petNames: p.petNames || [],
                      postId: p.postId,
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

  async deletePost(userId: string, postId: string): Promise<string> {
    const storage = getStorage();
    const filePath = `posts/${userId}/${postId}`;
    const fileRef = ref(storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    try {
      await this.deleteAllPostNotifications(userId, postId);

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

  private async deleteAllPostNotifications(
    userId: string,
    postId: string
  ): Promise<void> {
    try {
      const notificationsRef = this.firestore
        .collection('notifications')
        .doc(userId)
        .collection('notifications', (ref) =>
          ref.where('postId', '==', postId)
        );

      const notificationSnapshot = await notificationsRef.get().toPromise();

      const batch = this.firestore.firestore.batch();

      notificationSnapshot?.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(
        `All notifications related to post ${postId} have been deleted.`
      );
    } catch (error) {
      console.error('Error deleting post notifications:', error);
    }
  }

  getPostsByFollowing(currentUserId: string): Observable<IPost[]> {
    return this.firestore
      .collection('users')
      .doc(currentUserId)
      .valueChanges()
      .pipe(
        switchMap((user: any) => {
          const followingIds: string[] =
            user.following?.map((f: any) => f.userId) || [];
          followingIds.push(currentUserId);

          if (followingIds.length === 0) {
            return of([]);
          }

          const postObservables: Observable<IPost[]>[] = followingIds.map(
            (userId) =>
              this.firestore
                .collection('posts')
                .doc(userId)
                .collection('posts', (ref) => ref.orderBy('createdAt', 'desc'))
                .valueChanges({ idField: 'postId' })
                .pipe(
                  map((posts: any[]) =>
                    posts.map((p) => ({
                      postId: p.postId,
                      id: p.postId,
                      text: p.text,
                      imageUrl: p.imageUrl,
                      createdAt: p.createdAt ? p.createdAt.toDate() : null,
                      userId: userId,
                      firstName: p.firstName,
                      lastName: p.lastName,
                      profileImageUrl: p.profileImageUrl,
                      likes: p.likes || [],
                      petNames: p.petNames || [],
                      commentCount: p.commentCount || 0,
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
        })
      );
  }

  async likePost(userId: string, postId: string): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        throw new Error('No user is logged in.');
      }

      if (currentUserId === userId) {
        await this.firestore
          .collection('posts')
          .doc(userId)
          .collection('posts')
          .doc(postId)
          .update({
            likes: arrayUnion({
              userId: currentUserId,
              timestamp: new Date(),
            }),
          });
        return;
      }

      const batch = this.firestore.firestore.batch();
      const timestamp = new Date();

      const postRef = this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId).ref;

      const currentUserDoc = await this.firestore
        .collection('users')
        .doc(currentUserId)
        .ref.get();

      const currentUserData = currentUserDoc.data() as UserProfile | undefined;
      if (!currentUserData) {
        throw new Error('Current user data not found');
      }

      const { profileImageUrl = '', firstName = '' } = currentUserData;

      const notificationId = uuidv4();
      const notificationRef = this.firestore
        .collection('notifications')
        .doc(userId)
        .collection('notifications')
        .doc(notificationId);

      const notification: AppNotification = {
        id: notificationId,
        userId: currentUserId,
        profileImageUrl,
        firstName,
        message: 'liked your post',
        timestamp,
        isRead: false,
        postId,
      };

      batch.update(postRef, {
        likes: arrayUnion({
          userId: currentUserId,
          timestamp,
        }),
      });

      batch.set(notificationRef.ref, notification);

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

      const postRef = this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId).ref;

      const likeToRemove: ILike = {
        userId: currentUserId,
        timestamp: new Date(),
      };

      console.log('Attempting to remove like:', likeToRemove);

      await this.firestore.firestore.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw new Error('Post does not exist!');
        }

        const postData = postDoc.data() as IPost;
        const likes = postData.likes || [];

        console.log('Current likes:', likes);

        const likeIndex = likes.findIndex(
          (like) => like.userId === currentUserId
        );

        if (likeIndex === -1) {
          console.log('Like not found for removal.');
          return;
        }

        const likeToRemoveArray = [likes[likeIndex]];

        console.log('Removing likes:', likeToRemoveArray);

        transaction.update(postRef, {
          likes: arrayRemove(...likeToRemoveArray),
        });
      });

      const notificationsSnapshot = await this.firestore
        .collection('notifications')
        .doc(userId)
        .collection('notifications')
        .ref.where('userId', '==', currentUserId)
        .where('message', '==', 'liked your post')
        .where('postId', '==', postId)
        .get();

      const batch = this.firestore.firestore.batch();
      notificationsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('Like and notification removed successfully.');
    } catch (error) {
      console.error('Error unliking post:', error);
      throw new Error('Unable to unlike post. Please try again later.');
    }
  }

  async getLikesUserDetails(
    userId: string,
    postId: string
  ): Promise<UserProfile[]> {
    try {
      const postDoc = await this.firestore
        .collection('posts')
        .doc(userId)
        .collection('posts')
        .doc(postId)
        .get()
        .toPromise();

      const postData = postDoc.data() as IPost;
      if (!postData || !postData.likes) {
        return [];
      }

      const likesIds = postData.likes.map((like) => like.userId);

      const userDocs = await Promise.all(
        likesIds.map((id) =>
          this.firestore.collection('users').doc(id).get().toPromise()
        )
      );

      return userDocs.map((doc) => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error fetching likes user details:', error);
      throw error;
    }
  }

  async addComment(
    postId: string,
    postOwnerId: string,
    text: string
  ): Promise<void> {
    try {
      const currentUserId = localStorage.getItem('accessToken');
      if (!currentUserId) {
        throw new Error('No user is logged in.');
      }

      const userDoc = await this.firestore
        .collection('users')
        .doc(currentUserId)
        .get()
        .toPromise();
      const userData = userDoc.data() as UserProfile;

      if (!userData) {
        throw new Error('User data not found.');
      }

      const commentId = uuidv4();
      const comment: IComment = {
        commentId: commentId,
        userId: currentUserId,
        text: text,
        createdAt: new Date(),
        firstName: userData.firstName || 'Unknown',
        lastName: userData.lastName || 'User',
        profileImageUrl: userData.profileImageUrl || '',
      };

      const postRef = this.firestore
        .collection('posts')
        .doc(postOwnerId)
        .collection('posts')
        .doc(postId);

      await this.firestore.firestore.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef.ref);
        if (!postDoc.exists) {
          throw new Error('Post does not exist!');
        }

        const postData = postDoc.data() as IPost;
        const comments = postData.comments || [];
        comments.push(comment);
        const commentCount = comments.length;

        const updatedData = {
          comments: comments,
          commentCount: commentCount,
        };

        transaction.update(
          postRef.ref,
          this.removeUndefinedFields(updatedData)
        );
      });

      if (currentUserId !== postOwnerId) {
        const notificationId = uuidv4();
        const notificationRef = this.firestore
          .collection('notifications')
          .doc(postOwnerId)
          .collection('notifications')
          .doc(notificationId);

        const notification: AppNotification = {
          id: notificationId,
          userId: currentUserId,
          profileImageUrl: userData.profileImageUrl || '',
          firstName: userData.firstName || 'Unknown',
          message: 'commented on your post',
          timestamp: new Date(),
          isRead: false,
          postId: postId,
          commentId: commentId,
        };

        await notificationRef.set(notification);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  removeUndefinedFields(data: any): any {
    return Object.fromEntries(
      Object.entries(data).filter(([key, value]) => value !== undefined)
    );
  }

  getComments(postId: string, postOwnerId: string): Observable<IComment[]> {
    return this.firestore
      .collection('posts')
      .doc(postOwnerId)
      .collection('posts')
      .doc(postId)
      .valueChanges()
      .pipe(
        map((post: IPost) => {
          return (post.comments || []).map((comment) => {
            if (comment.createdAt instanceof Timestamp) {
              comment.createdAt = comment.createdAt.toDate();
            }
            return comment;
          });
        })
      );
  }

  async deleteComment(
    postId: string,
    postOwnerId: string,
    commentId: string
  ): Promise<void> {
    try {
      const postRef = this.firestore
        .collection('posts')
        .doc(postOwnerId)
        .collection('posts')
        .doc(postId);

      await this.firestore.firestore.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef.ref);
        if (!postDoc.exists) {
          throw new Error('Post does not exist!');
        }

        const postData = postDoc.data() as IPost;
        const comments = postData.comments || [];

        const updatedComments = comments.filter(
          (c) => c.commentId !== commentId
        );

        transaction.update(postRef.ref, {
          comments: updatedComments,
          commentCount: updatedComments.length,
        });
      });

      const currentUserId = localStorage.getItem('accessToken');
      if (currentUserId) {
        await this.deleteCommentNotification(postOwnerId, commentId);
      }

      console.log('Comment and related notifications deleted successfully.');
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  private async deleteCommentNotification(
    userId: string,
    commentId: string
  ): Promise<void> {
    try {
      const notificationsSnapshot = await this.firestore
        .collection('notifications')
        .doc(userId)
        .collection('notifications')
        .ref.where('commentId', '==', commentId)
        .get();

      const batch = this.firestore.firestore.batch();
      notificationsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('Comment notifications deleted successfully.');
    } catch (error) {
      console.error('Error deleting comment notifications:', error);
    }
  }
}

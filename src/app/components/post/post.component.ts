import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ILike, IPost } from './models/post.model';
import { PostService } from '../add-post-dialog/services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LikesDialogComponent } from '../likes-dialog/likes-dialog.component';
import { CommentsDialogComponent } from '../comments-dialog/comments-dialog.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  @Input() userProfile: any;
  posts: IPost[] = [];
  uid: string | null = null;
  currentUserId: string | null = localStorage.getItem('accessToken');
  @Output() postCount = new EventEmitter<number>();

  constructor(
    private postService: PostService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.uid = params.get('userId');
      this.loadPosts();
    });
  }

  openLikesDialog(event: Event, postId: string, userId: string): void {
    event.stopPropagation();
    this.dialog.open(LikesDialogComponent, {
      width: '80vw',
      maxWidth: '450px',
      height: '80vh',
      maxHeight: '500px',
      data: { userId, postId },
    });
  }

  openCommentsDialog(postId: string, userId: string): void {
    this.dialog.open(CommentsDialogComponent, {
      width: '80vw',
      maxWidth: '450px',
      height: '80vh',
      maxHeight: '500px',
      data: { userId, postId },
    });
  }

  loadPosts(): void {
    if (this.uid) {
      this.postService.getPosts(this.uid).subscribe(
        (posts) => {
          this.posts = posts;
          this.postCount.emit(posts.length);
        },
        (error) => {
          console.error('Error fetching posts:', error);
        }
      );
    } else if (this.currentUserId) {
      this.postService.getPostsByFollowing(this.currentUserId).subscribe(
        (posts) => {
          this.posts = posts;
          this.postCount.emit(posts.length);
        },
        (error) => {
          console.error('Error fetching posts by following:', error);
        }
      );
    }
  }

  toggleLike(post: IPost): void {
    if (this.currentUserId) {
      const isLiked = post.likes.some(
        (like) => like.userId === this.currentUserId
      );
      const delta = isLiked ? -1 : 1;

      this.updatePostLikes(post.postId, delta);

      if (isLiked) {
        this.postService
          .unlikePost(post.userId, post.postId)
          .then(() => {
            console.log('Post unliked successfully.');
          })
          .catch((error) => {
            console.error('Error unliking post:', error);
            this.updatePostLikes(post.postId, -delta);
          });
      } else {
        this.postService
          .likePost(post.userId, post.postId)
          .then(() => {
            console.log('Post liked successfully.');
          })
          .catch((error) => {
            console.error('Error liking post:', error);
            this.updatePostLikes(post.postId, -delta);
          });
      }
    }
  }

  updatePostLikes(postId: string, delta: number): void {
    this.posts = this.posts.map((post) => {
      if (post.postId === postId) {
        const updatedLikes = [...post.likes];
        if (delta > 0) {
          updatedLikes.push({
            userId: this.currentUserId!,
            timestamp: new Date(),
          });
        } else {
          const index = updatedLikes.findIndex(
            (like) => like.userId === this.currentUserId!
          );
          if (index > -1) {
            updatedLikes.splice(index, 1);
          }
        }

        return { ...post, likes: updatedLikes };
      }
      return post;
    });
  }

  isPostLiked(post: IPost): boolean {
    return post.likes.some((like) => like.userId === this.currentUserId);
  }

  getIcon(post: IPost): string {
    return this.isPostLiked(post) ? 'favorite' : 'favorite_border';
  }

  getIconClass(post: IPost): string {
    return this.isPostLiked(post) ? 'liked' : 'not-liked';
  }

  goToUserProfile(userId: string): void {
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }
}

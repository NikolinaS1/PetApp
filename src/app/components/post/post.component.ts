import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPost } from './models/post.model';
import { PostService } from '../add-post-dialog/services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { LikesDialogComponent } from '../likes-dialog/likes-dialog.component';

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
    private route: ActivatedRoute
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
      width: '450px',
      height: '500px',
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

  deletePost(post: IPost): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      height: 'auto',
      data: {
        message: `Are you sure you want to delete this post?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const userId = this.uid || this.currentUserId;
        if (userId) {
          this.postService
            .deletePost(userId, post.id)
            .then(() => {
              this.snackBar.open('Post deleted successfully.', 'OK', {
                duration: 5000,
              });
              this.loadPosts();
            })
            .catch((error) => {
              console.error('Error deleting post:', error);
            });
        }
      }
    });
  }

  toggleLike(post: IPost): void {
    if (this.currentUserId) {
      const isLiked = post.likes.includes(this.currentUserId);
      const delta = isLiked ? -1 : 1;

      this.updatePostLikes(post.id, delta);

      if (isLiked) {
        this.postService
          .unlikePost(post.userId, post.id)
          .then(() => {
            console.log('Post unliked successfully.');
          })
          .catch((error) => {
            console.error('Error unliking post:', error);
            this.updatePostLikes(post.id, -delta);
          });
      } else {
        this.postService
          .likePost(post.userId, post.id)
          .then(() => {
            console.log('Post liked successfully.');
          })
          .catch((error) => {
            console.error('Error liking post:', error);
            this.updatePostLikes(post.id, -delta);
          });
      }
    }
  }

  updatePostLikes(postId: string, delta: number): void {
    this.posts = this.posts.map((post) => {
      if (post.id === postId) {
        const updatedLikes = [...post.likes];
        if (delta > 0) {
          updatedLikes.push(this.currentUserId!);
        } else {
          const index = updatedLikes.indexOf(this.currentUserId!);
          if (index > -1) {
            updatedLikes.splice(index, 1);
          }
        }
        return { ...post, likes: updatedLikes };
      }
      return post;
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';
import { IPost } from './models/post.model';
import { PostService } from '../add-post-dialog/services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  userProfile: any;
  posts: IPost[] = [];

  constructor(
    private userService: UserService,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const uid = localStorage.getItem('accessToken');
    if (uid) {
      this.userService
        .getUserProfile(uid)
        .then((profile) => {
          this.userProfile = profile;
          this.getPosts();
        })
        .catch((error) => {
          console.error('Error loading user profile:', error);
        });
    }
  }

  getPosts(): void {
    const uid = localStorage.getItem('accessToken');
    if (uid) {
      this.postService.getPosts(uid).subscribe((posts) => {
        this.posts = posts;
      });
    }
  }

  deletePost(post: IPost): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      height: 'auto',
      data: {
        message: `Are you sure you want to delete that post?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const userId = localStorage.getItem('accessToken');
        if (userId) {
          this.postService
            .deletePost(userId, post.id)
            .then(() => {
              this.snackBar.open('Post deleted successfully.', 'OK', {
                duration: 5000,
              });
              this.getPosts();
            })
            .catch((error) => {
              console.error('Error deleting post:', error);
            });
        }
      }
    });
  }
}

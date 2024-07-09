import { Component, OnInit } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';
import { IPost } from './models/post.model';
import { PostService } from '../add-post-dialog/services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  userProfile: any;
  posts: IPost[] = [];
  uid: string | null = null;
  currentUserId = localStorage.getItem('accessToken');

  constructor(
    private userService: UserService,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.uid = params.get('userId');
      this.loadUserProfile();
    });
  }

  loadUserProfile(): void {
    if (this.uid) {
      this.userService
        .getUserProfile(this.uid)
        .then((profile) => {
          this.userProfile = profile;
          this.getPosts();
        })
        .catch((error) => {
          console.error('Error loading user profile:', error);
        });
    } else {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        this.userService
          .getUserProfile(accessToken)
          .then((profile) => {
            this.userProfile = profile;
            this.getPosts();
          })
          .catch((error) => {
            console.error('Error loading user profile:', error);
          });
      }
    }
  }

  getPosts(): void {
    if (this.uid) {
      this.postService.getPosts(this.uid).subscribe((posts) => {
        this.posts = posts;
      });
    } else {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        this.postService.getPosts(accessToken).subscribe((posts) => {
          this.posts = posts;
        });
      }
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
        const userId = this.uid
          ? this.uid
          : localStorage.getItem('accessToken');
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

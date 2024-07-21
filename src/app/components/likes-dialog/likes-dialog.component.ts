import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserProfile } from '../../pages/profile/models/userProfile.model';
import { Router } from '@angular/router';
import { PostService } from '../add-post-dialog/services/post.service';

@Component({
  selector: 'app-likes-dialog',
  templateUrl: './likes-dialog.component.html',
  styleUrls: ['./likes-dialog.component.scss'],
})
export class LikesDialogComponent implements OnInit {
  likesUsers: UserProfile[] = [];

  constructor(
    private postService: PostService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; postId: string }
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.userId && this.data.postId) {
      this.postService
        .getLikesUserDetails(this.data.userId, this.data.postId)
        .then((users) => {
          this.likesUsers = users;
        })
        .catch((error) => {
          console.error('Error fetching likes users:', error);
        });
    }
  }

  goToUserProfile(userId: string): void {
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }
}

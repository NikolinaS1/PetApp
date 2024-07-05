import { Component, OnInit } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';

@Component({
  selector: 'app-add-post-dialog',
  templateUrl: './add-post-dialog.component.html',
  styleUrl: './add-post-dialog.component.scss',
})
export class AddPostDialogComponent implements OnInit {
  userProfile: any;

  constructor(private userService: UserService) {}

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
        })
        .catch((error) => {
          console.error('Error loading user profile:', error);
        });
    }
  }
}

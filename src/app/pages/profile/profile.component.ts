import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
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

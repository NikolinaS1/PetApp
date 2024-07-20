import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';
import { UserProfile } from '../../pages/profile/models/userProfile.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrl: './following.component.scss',
})
export class FollowingComponent implements OnInit {
  @Input() userId: string | null = null;
  followingUsers: UserProfile[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userService
        .getFollowingUserDetails(this.userId)
        .then((users) => {
          this.followingUsers = users;
        })
        .catch((error) => {
          console.error('Error fetching following users:', error);
        });
    }
  }

  goToUserProfile(userId: string): void {
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }
}

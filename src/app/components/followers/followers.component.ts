import { Component, Input } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';
import { Router } from '@angular/router';
import { UserProfile } from '../../pages/profile/models/userProfile.model';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrl: './followers.component.scss',
})
export class FollowersComponent {
  @Input() userId: string | null = null;
  followersUsers: UserProfile[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userService
        .getFollowersDetails(this.userId)
        .then((users) => {
          this.followersUsers = users;
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

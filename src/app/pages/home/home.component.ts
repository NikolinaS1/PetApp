import { Component, OnInit } from '@angular/core';
import { PostService } from '../../components/add-post-dialog/services/post.service';
import { IPost } from '../../components/post/models/post.model';
import { UserService } from '../profile/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userProfile: any;
  posts: IPost[] = [];
  currentUserId: string | null = localStorage.getItem('accessToken');

  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.currentUserId) {
      this.postService.getPostsByFollowing(this.currentUserId).subscribe({
        next: (posts) => {
          this.posts = posts;
          console.log('Posts:', this.posts);
        },
        error: (error) => {
          console.error('Error fetching posts:', error);
        },
      });
      this.loadUserProfile(this.currentUserId);
    } else {
      console.error('No currentUserId found in localStorage.');
    }
  }

  loadUserProfile(userId: string): void {
    this.userService
      .getUserProfile(userId)
      .then((profile) => {
        this.userProfile = profile;
      })
      .catch((error) => {
        console.error('Error loading user profile:', error);
      });
  }
}

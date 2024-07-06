import { Component, OnInit } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';
import { IPost } from './models/post.model';
import { PostService } from '../add-post-dialog/services/post.service';

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
    private postService: PostService
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
}
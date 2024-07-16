import { Component, OnInit } from '@angular/core';
import { PostService } from '../../components/add-post-dialog/services/post.service';
import { IPost } from '../../components/post/models/post.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  posts: any[] = [];
  currentUserId: string | null = localStorage.getItem('accessToken');

  constructor(private postService: PostService) {}

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
    }
  }
}

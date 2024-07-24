import { Component, Inject } from '@angular/core';
import { IComment } from './models/comments.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PostService } from '../add-post-dialog/services/post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comments-dialog',
  templateUrl: './comments-dialog.component.html',
  styleUrls: ['./comments-dialog.component.scss'],
})
export class CommentsDialogComponent {
  comments: IComment[] = [];
  newComment: string = '';
  currentUserId = localStorage.getItem('accessToken');

  constructor(
    private postService: PostService,
    public dialogRef: MatDialogRef<CommentsDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA)
    public data: { postId: string; userId: string }
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.postService.getComments(this.data.postId, this.data.userId).subscribe(
      (comments) => {
        this.comments = comments;
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

  submitComment(): void {
    if (this.newComment.trim()) {
      this.postService
        .addComment(this.data.postId, this.data.userId, this.newComment)
        .then(() => {
          this.newComment = '';
          this.loadComments();
        })
        .catch((error) => {
          console.error('Error adding comment:', error);
        });
    }
  }

  deleteComment(commentId: string): void {
    this.postService
      .deleteComment(this.data.postId, this.data.userId, commentId)
      .then(() => {
        this.loadComments();
      })
      .catch((error) => {
        console.error('Error deleting comment:', error);
      });
  }

  goToUserProfile(userId: string): void {
    if (userId) {
      this.router.navigate(['/profile', userId]);
      this.dialogRef.close();
    }
  }
}

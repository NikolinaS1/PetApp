import { Component, OnInit } from '@angular/core';
import { UserService } from '../../pages/profile/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from './services/post.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-post-dialog',
  templateUrl: './add-post-dialog.component.html',
  styleUrls: ['./add-post-dialog.component.scss'],
})
export class AddPostDialogComponent implements OnInit {
  userProfile: any;
  selectedImage: File | null = null;
  status: string = '';
  imageUrl: string | null = null;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddPostDialogComponent>
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
        })
        .catch((error) => {
          console.error('Error loading user profile:', error);
        });
    }
  }

  addPost() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found in local storage.');
      return;
    }

    if (this.selectedImage || this.status.trim() !== '') {
      this.postService
        .addPost(this.status, this.selectedImage, accessToken)
        .then(() => {
          console.log('Post added successfully!');
          this.snackBar.open('New post added successfully.', 'OK', {
            duration: 5000,
          });
          this.dialogRef.close(true);
          this.selectedImage = null;
          this.status = '';
        })
        .catch((error) => {
          console.error('Error adding new post', error);
        });
    } else {
      this.snackBar.open(
        'Please select an image and/or enter some text.',
        'OK',
        {
          duration: 5000,
        }
      );
    }
  }

  onImageSelected(event: any) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp'];
    const file = event.target.files[0];

    if (file && allowedTypes.includes(file.type)) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.snackBar.open(
        'Invalid file type. Please select a valid image file.',
        'OK',
        {
          duration: 5000,
        }
      );
    }
  }
}

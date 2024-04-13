import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  selectedImage: File | null = null;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
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

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
    this.uploadProfileImage();
  }

  uploadProfileImage() {
    const userId = localStorage.getItem('accessToken');
    if (this.selectedImage && userId) {
      this.userService.uploadImage(this.selectedImage, userId).subscribe(
        (imageUrl: string) => {
          this.userService.saveImageUrl(userId, imageUrl).then(() => {
            console.log('Profile image uploaded successfully');
            this.snackBar.open('Profile image uploaded successfully.', 'OK', {
              duration: 5000,
            });
            this.loadUserProfile();
          });
        },
        (error) => {
          console.error('Error uploading profile image:', error);
          this.snackBar.open(
            'Error while trying to upload profile image.Please try again.',
            'OK',
            {
              duration: 5000,
            }
          );
        }
      );
    } else {
      console.error('No image selected or user ID missing');
    }
  }
}

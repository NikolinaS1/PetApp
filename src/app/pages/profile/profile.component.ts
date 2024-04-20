import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddPetDialogComponent } from '../../components/add-pet-dialog/add-pet-dialog.component';

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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  openAddPetDialog(): void {
    this.dialog.open(AddPetDialogComponent, {
      width: '450px',
      height: '500px',
    });
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
            'Error while trying to upload profile image. Please try again.',
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

  deleteImage() {
    const userId = localStorage.getItem('accessToken');
    if (userId && this.userProfile && this.userProfile.profileImageUrl) {
      this.userService
        .deleteProfileImage(userId, this.userProfile.profileImageUrl)
        .then(() => {
          console.log('Profile image deleted successfully');
          this.snackBar.open('Profile image deleted successfully.', 'OK', {
            duration: 5000,
          });
          this.loadUserProfile();
        })
        .catch((error) => {
          console.error('Error deleting profile image:', error);
          this.snackBar.open(
            'Error while trying to delete profile image. Please try again.',
            'OK',
            {
              duration: 5000,
            }
          );
        });
    } else {
      console.error('User ID missing or profile image URL not available');
    }
  }
}

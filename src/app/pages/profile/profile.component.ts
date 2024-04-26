import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddPetDialogComponent } from '../../components/add-pet-dialog/add-pet-dialog.component';
import { Pet } from './models/pet.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  selectedImage: File | null = null;
  pets: Pet[] = [];
  isUploading = false;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.getPets();
  }

  openAddPetDialog(): void {
    this.dialog.open(AddPetDialogComponent, {
      width: '400px',
      height: '440px',
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp'];
    const file = event.target.files[0];

    if (file && allowedTypes.includes(file.type)) {
      this.selectedImage = file;
      this.uploadProfileImage();
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

  uploadProfileImage() {
    this.isUploading = true;
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
            this.isUploading = false;
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

  getPets() {
    const uid = localStorage.getItem('accessToken');
    if (uid) {
      this.userService.getPets(uid).subscribe((pets) => {
        this.pets = pets;
      });
    }
  }
}

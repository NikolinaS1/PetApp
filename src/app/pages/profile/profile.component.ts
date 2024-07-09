import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddPetDialogComponent } from '../../components/add-pet-dialog/add-pet-dialog.component';
import { Pet } from './models/pet.model';
import { AddPostDialogComponent } from '../../components/add-post-dialog/add-post-dialog.component';
import { PetService } from '../../components/add-pet-dialog/services/pet.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute } from '@angular/router';

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
  uid: string | null = null;
  currentUserId = localStorage.getItem('accessToken');

  constructor(
    private userService: UserService,
    private petService: PetService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.uid = params.get('userId');
      if (this.uid) {
        this.loadUserProfile(this.uid);
        this.getPets(this.uid);
      } else {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          this.loadUserProfile(accessToken);
          this.getPets(accessToken);
        }
      }
    });
  }

  openAddPetDialog(): void {
    this.dialog.open(AddPetDialogComponent, {
      width: '440px',
      height: '550px',
    });
  }

  openAddPostDialog(): void {
    this.dialog.open(AddPostDialogComponent, {
      width: '600px',
      height: '430px',
    });
  }

  openEditPetDialog(pet: Pet): void {
    this.dialog.open(AddPetDialogComponent, {
      width: '440px',
      height: '550px',
      data: { pet },
    });
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
            this.loadUserProfile(userId);
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      height: 'auto',
      data: {
        message: `Are you sure you want to delete your profile image?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const userId = localStorage.getItem('accessToken');
        if (userId && this.userProfile && this.userProfile.profileImageUrl) {
          this.userService
            .deleteProfileImage(userId, this.userProfile.profileImageUrl)
            .then(() => {
              console.log('Profile image deleted successfully');
              this.snackBar.open('Profile image deleted successfully.', 'OK', {
                duration: 5000,
              });
              this.loadUserProfile(userId);
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
    });
  }

  getPets(userId: string) {
    this.userService.getPets(userId).subscribe((pets) => {
      this.pets = pets;
    });
  }

  deletePet(pet: Pet) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      height: 'auto',
      data: {
        message: `Are you sure you want to delete ${pet.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const userId = localStorage.getItem('accessToken');
        if (userId) {
          this.petService
            .deletePet(userId, pet.id)
            .then(() => {
              this.snackBar.open('Pet deleted successfully.', 'OK', {
                duration: 5000,
              });
              this.getPets(userId);
            })
            .catch((error) => {
              console.error('Error deleting a pet:', error);
            });
        }
      }
    });
  }
}

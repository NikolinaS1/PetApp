import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PetService } from './services/pet.service';
import { Pet } from '../../pages/profile/models/pet.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-pet-dialog',
  templateUrl: './add-pet-dialog.component.html',
  styleUrls: ['./add-pet-dialog.component.scss'],
})
export class AddPetDialogComponent implements OnInit {
  selectedImage: File | null = null;
  petName: string = '';
  petYear: string = '';
  petMonth: string = '';
  petDescription: string = '';
  imageUrl: string | null = null;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditing = false;
  petId: string | null = null;
  isOwner = false;

  constructor(
    private petService: PetService,
    private dialogRef: MatDialogRef<AddPetDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { pet: Pet; userId: string }
  ) {}

  ngOnInit(): void {
    const currentUserId = localStorage.getItem('accessToken');
    this.isOwner = currentUserId === this.data.userId;

    if (this.data && this.data.pet) {
      this.isEditing = true;
      const { pet } = this.data;
      this.petId = pet.id;
      this.petName = pet.name;
      this.petYear = pet.year;
      this.petMonth = pet.month;
      this.petDescription = pet.description;
      this.imageUrl = pet.imageUrl;
    }
  }

  savePet() {
    if (!this.isOwner) {
      return;
    }
    this.isSaving = true;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found in local storage.');
      return;
    }

    if (this.isEditing && this.petId) {
      this.petService
        .updatePet(
          this.petId,
          this.petName,
          this.petYear,
          this.petMonth,
          this.petDescription,
          this.selectedImage ? this.selectedImage : null,
          accessToken
        )
        .then(() => {
          this.isSaving = false;
          this.dialogRef.close();
          this.snackBar.open('Pet updated successfully.', 'OK', {
            duration: 5000,
          });
        })
        .catch((error) => {
          this.isSaving = false;
          console.error('Error updating pet:', error);
          this.snackBar.open('Error updating pet. Please try again.', 'OK', {
            duration: 5000,
          });
        });
    } else {
      this.petService
        .addPetWithImage(
          this.petName,
          this.petYear,
          this.petMonth,
          this.petDescription,
          this.selectedImage,
          accessToken
        )
        .then(() => {
          this.isSaving = false;
          this.dialogRef.close();
          this.snackBar.open('Pet added successfully.', 'OK', {
            duration: 5000,
          });
        })
        .catch((error) => {
          this.isSaving = false;
          console.error('Error adding pet:', error);
          this.snackBar.open('Error adding new pet. Please try again.', 'OK', {
            duration: 5000,
          });
        });
    }
  }

  onImageSelected(event: any) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp'];
    const file = event.target.files[0];

    if (file && allowedTypes.includes(file.type)) {
      this.selectedImage = file;
      this.imageUrl = null;
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedImage);
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
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

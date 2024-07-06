import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PetService } from './services/pet.service';
import { Pet } from '../../pages/profile/models/pet.model';

@Component({
  selector: 'app-add-pet-dialog',
  templateUrl: './add-pet-dialog.component.html',
  styleUrls: ['./add-pet-dialog.component.scss'],
})
export class AddPetDialogComponent implements OnInit {
  selectedImage: File | null = null;
  petName: string = '';
  petDescription: string = '';
  imageUrl: string | null = null;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditing = false;
  petId: string | null = null;

  constructor(
    private petService: PetService,
    private dialogRef: MatDialogRef<AddPetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pet: Pet }
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.pet) {
      this.isEditing = true;
      const { pet } = this.data;
      this.petId = pet.id;
      this.petName = pet.name;
      this.petDescription = pet.description;
      this.imageUrl = pet.imageUrl;
    }
  }

  savePet() {
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
          this.petDescription,
          this.selectedImage ? this.selectedImage : null,
          accessToken
        )
        .then(() => {
          this.isSaving = false;
          this.successMessage = 'Pet updated successfully!';
          this.dialogRef.close();
        })
        .catch((error) => {
          this.isSaving = false;
          this.errorMessage = 'Error updating pet: ' + error.message;
          console.error('Error updating pet:', error);
        });
    } else {
      this.petService
        .addPetWithImage(
          this.petName,
          this.petDescription,
          this.selectedImage,
          accessToken
        )
        .then(() => {
          this.isSaving = false;
          this.successMessage = 'Pet added successfully!';
          this.dialogRef.close();
        })
        .catch((error) => {
          this.isSaving = false;
          this.errorMessage = 'Error adding pet: ' + error.message;
          console.error('Error adding pet:', error);
        });
    }
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
    this.imageUrl = null;
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedImage);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
  }
}

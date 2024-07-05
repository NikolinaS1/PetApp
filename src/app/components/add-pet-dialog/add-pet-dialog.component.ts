import { Component, OnInit } from '@angular/core';
import { PetService } from './services/pet.service';
import { MatDialogRef } from '@angular/material/dialog';

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

  constructor(
    private petService: PetService,
    private dialogRef: MatDialogRef<AddPetDialogComponent>
  ) {}

  ngOnInit(): void {}

  addPet() {
    this.isSaving = true;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found in local storage.');
      return;
    }

    if (this.selectedImage && this.petName) {
      this.petService
        .addPetWithImage(
          this.petName,
          this.petDescription,
          this.selectedImage,
          accessToken
        )
        .then(() => {
          this.isSaving = false;
          console.log('Pet added successfully!');
          this.dialogRef.close();
          this.selectedImage = null;
          this.petName = '';
        })
        .catch((error) => {
          console.error('Error adding pet with image:', error);
        });
    } else {
      console.error('Please select an image and enter a pet name.');
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPostDialogComponent } from './add-post-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [AddPostDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
  ],
})
export class AddPostDialogModule {}

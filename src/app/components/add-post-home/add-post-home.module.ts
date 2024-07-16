import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPostHomeComponent } from './add-post-home.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AddPostDialogModule } from '../add-post-dialog/add-post-dialog.module';

@NgModule({
  declarations: [AddPostHomeComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    AddPostDialogModule,
  ],
  exports: [AddPostHomeComponent],
})
export class AddPostHomeModule {}

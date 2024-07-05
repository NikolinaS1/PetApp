import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPostDialogComponent } from './add-post-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [AddPostDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class AddPostDialogModule {}

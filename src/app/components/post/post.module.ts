import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from './post.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [PostComponent],
  imports: [CommonModule, MatIconModule, MatMenuModule, MatSnackBarModule],
  exports: [PostComponent],
})
export class PostModule {}

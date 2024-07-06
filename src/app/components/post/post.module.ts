import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from './post.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [PostComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDialogModule,
  ],
  exports: [PostComponent],
})
export class PostModule {}

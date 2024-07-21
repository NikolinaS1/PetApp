import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from './post.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LikesDialogModule } from '../likes-dialog/likes-dialog.module';

@NgModule({
  declarations: [PostComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    LikesDialogModule,
    InfiniteScrollModule,
  ],
  exports: [PostComponent],
})
export class PostModule {}

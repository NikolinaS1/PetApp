import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from './post.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [PostComponent],
  imports: [CommonModule, MatIconModule],
  exports: [PostComponent],
})
export class PostModule {}

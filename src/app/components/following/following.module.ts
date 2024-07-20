import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowingComponent } from './following.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [FollowingComponent],
  imports: [CommonModule, RouterModule],
  exports: [FollowingComponent],
})
export class FollowingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowersComponent } from './followers.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [FollowersComponent],
  imports: [CommonModule, RouterModule],
  exports: [FollowersComponent],
})
export class FollowersModule {}

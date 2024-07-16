import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { NavbarModule } from '../../components/navbar/navbar.module';
import { FooterModule } from '../../components/footer/footer.module';
import { PostModule } from '../../components/post/post.module';
import { AddPostHomeModule } from '../../components/add-post-home/add-post-home.module';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    NavbarModule,
    RouterModule.forChild(routes),
    FooterModule,
    PostModule,
    AddPostHomeModule,
  ],
})
export class HomeModule {}

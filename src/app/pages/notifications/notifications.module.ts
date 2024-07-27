import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications.component';
import { RouterModule, Routes } from '@angular/router';
import { NavbarModule } from '../../components/navbar/navbar.module';
import { FooterModule } from '../../components/footer/footer.module';

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
  },
];

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    NavbarModule,
    RouterModule.forChild(routes),
    FooterModule,
  ],
  exports: [NotificationsComponent],
})
export class NotificationsModule {}

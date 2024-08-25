import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { RouterModule, Routes } from '@angular/router';
import { NavbarModule } from '../../components/navbar/navbar.module';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    component: StatisticsComponent,
  },
];

@NgModule({
  declarations: [StatisticsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NavbarModule,
    MatIconModule,
  ],
  exports: [StatisticsComponent],
})
export class StatisticsModule {}

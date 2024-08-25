import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard/auth.guard';
import { preventLoggedInAccessGuard } from './shared/guard/prevent-logged-in-access.guard';
import { AdminGuard } from './shared/guard/admin.guard';

const routes: Routes = [
  {
    path: 'signin',
    loadChildren: () =>
      import('./pages/signin/signin.module').then((m) => m.SigninModule),
    canActivate: [preventLoggedInAccessGuard],
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./pages/signup/signup.module').then((m) => m.SignupModule),
    canActivate: [preventLoggedInAccessGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:userId',
    loadChildren: () =>
      import('./pages/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'messages',
    loadChildren: () =>
      import('./pages/chat/chat.module').then((m) => m.ChatModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./pages/notifications/notifications.module').then(
        (m) => m.NotificationsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'statistics',
    loadChildren: () =>
      import('./pages/statistics/statistics.module').then(
        (m) => m.StatisticsModule
      ),
    canActivate: [AuthGuard, AdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard/auth.guard';
import { preventLoggedInAccessGuard } from './shared/guard/prevent-logged-in-access.guard';

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
    path: 'profile',
    loadChildren: () =>
      import('./pages/profile/profile.module').then((m) => m.ProfileModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

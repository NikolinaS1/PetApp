import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from '../../../pages/profile/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private userService: UserService
  ) {}

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem('accessToken');
      this.userService.clearProfileImageCache();
      this.router.navigate(['/signin']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem('accessToken');
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

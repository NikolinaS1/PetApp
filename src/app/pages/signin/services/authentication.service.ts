import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async signIn(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      const token = await result.user.getIdToken();
      this.setLoggedInUser(token);
      console.log('Successfully logged in!', result);
      this.router.navigate(['/']);
      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      this.snackBar.open('Invalid email or password. Please try again.', 'OK', {
        duration: 5000,
      });
      throw error;
    }
  }

  setLoggedInUser(token: string) {
    localStorage.setItem('accessToken', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  forgotPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }
}

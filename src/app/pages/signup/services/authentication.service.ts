import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  async signUp(email: string, password: string) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      const token = await result.user.getIdToken();
      this.setLoggedInUser(token);
      console.log('Successfully registered!', result);
      this.router.navigate(['/']);
      return result;
    } catch (error) {
      console.error('Error registering:', error);
      this.snackBar.open(
        'The email address is already in use by another account.',
        'OK',
        {
          duration: 5000,
        }
      );
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
}

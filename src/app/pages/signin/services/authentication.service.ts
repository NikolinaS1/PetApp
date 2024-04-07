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

  async signIn(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );

      localStorage.setItem('accessToken', result.user?.uid);
      this.router.navigate(['/']);

      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  forgotPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }
}

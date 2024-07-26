import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { Observable, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar
  ) {}

  isLoggingIn = false;

  async signIn(email: string, password: string): Promise<any> {
    this.isLoggingIn = true;
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );

      localStorage.setItem('accessToken', result.user?.uid);
      this.isLoggingIn = false;
      this.router.navigate(['/']);

      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      this.isLoggingIn = false;
      this.snackBar.open(
        'Error when entering email or password. Please try again.',
        'OK',
        {
          duration: 5000,
        }
      );
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  forgotPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }

  async signInWithGoogle(): Promise<any> {
    try {
      const result = await this.afAuth.signInWithPopup(
        new GoogleAuthProvider()
      );
      const user = result.user;

      if (user) {
        const userRef = this.firestore.collection('users').doc(user.uid);
        const doc = await userRef.get().toPromise();

        if (!doc.exists) {
          await userRef.set({
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            id: user.uid,
          });
        }

        localStorage.setItem('accessToken', user.uid);
        this.router.navigate(['/']);
      }

      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      this.snackBar.open('Google sign-in error. Please try again.', 'OK', {
        duration: 5000,
      });
      throw error;
    }
  }

  getAuthState(): Observable<any> {
    return this.afAuth.authState;
  }
}

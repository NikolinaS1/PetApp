import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import firebase from 'firebase/compat/app';

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
      this.setLoggedInUser(result.user);
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

  setLoggedInUser(user: firebase.User | null) {
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }

  getLoggedInUser(): firebase.User | null {
    const userJson = localStorage.getItem('loggedInUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getLoggedInUser();
  }

  forgotPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }
}

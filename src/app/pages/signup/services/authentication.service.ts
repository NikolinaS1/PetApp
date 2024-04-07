import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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

  async signUp(email: string, password: string) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      this.setLoggedInUser(result.user);
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
}

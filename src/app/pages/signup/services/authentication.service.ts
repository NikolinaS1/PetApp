import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private firestore: AngularFirestore
  ) {}

  isRegistering = false;

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<any> {
    try {
      this.isRegistering = true;
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      const user = result.user;

      if (user) {
        await user.updateProfile({
          displayName: `${firstName} ${lastName}`,
        });

        await this.firestore.collection('users').doc(user.uid).set({
          firstName,
          lastName,
          email,
          id: user.uid,
        });

        localStorage.setItem('accessToken', user.uid);
        this.isRegistering = false;
        this.router.navigate(['/']);
      }

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

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

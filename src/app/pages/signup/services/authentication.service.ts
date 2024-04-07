import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router
  ) {}

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      const user = result.user;

      if (user) {
        await user.updateProfile({
          displayName: `${firstName} ${lastName}`,
        });
        await firebase.firestore().collection('users').doc(user.uid).set({
          firstName,
          lastName,
          email,
        });
      }

      localStorage.setItem('accessToken', user?.uid);
      this.router.navigate(['/']);

      return result;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }
}

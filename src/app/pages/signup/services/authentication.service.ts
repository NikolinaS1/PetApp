import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private auth: AngularFireAuth) {}

  signUp(params: SignUp): Observable<any> {
    return from(
      this.auth.createUserWithEmailAndPassword(params.email, params.password)
    );
  }
}

type SignUp = {
  email: string;
  password: string;
};

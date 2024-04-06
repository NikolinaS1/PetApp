import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private auth: AngularFireAuth) {}

  signIn(params: SignIn): Observable<any> {
    return from(
      this.auth
        .signInWithEmailAndPassword(params.email, params.password)
        .then((res) => {
          localStorage.setItem('token', 'true');
        })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return from(this.auth.sendPasswordResetEmail(email));
  }
}

type SignIn = {
  email: string;
  password: string;
};

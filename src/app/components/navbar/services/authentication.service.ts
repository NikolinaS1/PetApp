import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  logout() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('loggedInUser');
      this.router.navigate(['signin']);
    });
  }
}

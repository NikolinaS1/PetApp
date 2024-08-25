import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../../pages/profile/services/user.service';
import { Observable, of, switchMap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const uid = localStorage.getItem('accessToken');

    if (!uid) {
      this.router.navigate(['/signin']);
      return of(false);
    }

    return this.userService.getUserRole(uid).pipe(
      switchMap((role) => {
        if (role === 'admin') {
          return of(true);
        } else {
          this.router.navigate(['/']);
          return of(false);
        }
      }),
      catchError((error) => {
        console.error('Error fetching user role:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}

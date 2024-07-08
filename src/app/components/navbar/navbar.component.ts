import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { UserService } from '../../pages/profile/services/user.service';
import { FormControl } from '@angular/forms';
import { Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen: boolean = false;
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  isMobile = false;
  isCollapsed = true;
  searchControl = new FormControl();
  filteredUsers!: Observable<any[]>;

  constructor(
    public authenticationService: AuthenticationService,
    private userService: UserService,
    private router: Router,
    private observer: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.observer.observe(['(max-width: 700px)']).subscribe(() => {
      this.isMobile = true;
    });

    this.filteredUsers = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this.userService.searchUsers(value))
    );
  }

  toggle() {
    this.sidenav.toggle();
    this.isCollapsed = false;
  }

  /* logout() {
    this.router.navigate(['signin']);
    this.authenticationService.logout().subscribe();
  } */
}

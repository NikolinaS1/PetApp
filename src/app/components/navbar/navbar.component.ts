import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen: boolean = false;
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = false;
  isCollapsed = true;

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
    private observer: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.observer.observe(['(max-width: 700px)']).subscribe(() => {
      this.isMobile = true;
    });
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

import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { UserService } from '../../pages/profile/services/user.service';
import { FormControl } from '@angular/forms';
import { Observable, startWith, switchMap } from 'rxjs';
import { UserProfile } from '../../pages/profile/models/userProfile.model';
import { MatDialog } from '@angular/material/dialog';
import { RateAppDialogComponent } from '../rate-app-dialog/rate-app-dialog.component';
import { ChatService } from '../../pages/chat/services/chat.service';
import { NotificationsService } from '../../pages/notifications/services/notifications.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  unreadMessagesCount: number = 0;
  hasUnreadMessages: boolean = false;
  unreadNotificationsCount: number = 0;
  searchControl = new FormControl();
  filteredUsers!: Observable<UserProfile[]>;
  uid = localStorage.getItem('accessToken');
  profileImageUrl: string | null = null;
  role: string | null = null;

  constructor(
    public authenticationService: AuthenticationService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.uid) {
      this.chatService.countUnreadMessages(this.uid).subscribe((count) => {
        this.unreadMessagesCount = count;
        this.hasUnreadMessages = count > 0;
      });

      this.notificationsService
        .getUnreadNotificationsCount()
        .subscribe((count) => {
          this.unreadNotificationsCount = count;
        });

      this.userService.getProfileImageUrl().subscribe((url) => {
        this.profileImageUrl = url;
        this.cdr.markForCheck();
      });

      this.userService.getCurrentUserProfileImage().subscribe();
    }

    this.filteredUsers = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this.userService.searchUsers(value))
    );

    this.userService.getUserRole(this.uid).subscribe((role) => {
      this.role = role;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.scrollActive();
    this.scrollHeader();
  }

  scrollActive() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const section = current as HTMLElement;
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 50;
      const sectionId = section.getAttribute('id');

      if (sectionId) {
        const navMenu = document.querySelector(
          `.nav__menu a[href*=${sectionId}]`
        ) as HTMLElement;
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navMenu?.classList.add('active-link');
        } else {
          navMenu?.classList.remove('active-link');
        }
      }
    });
  }

  scrollHeader() {
    const header = document.getElementById('header') as HTMLElement;
    if (header) {
      if (window.scrollY >= 80) {
        header.classList.add('scroll-header');
      } else {
        header.classList.remove('scroll-header');
      }
    }
  }

  navigateToUserProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  navigateToCurrentUserProfile() {
    if (this.uid) {
      this.router.navigate(['/profile', this.uid]);
    }
  }

  openRateAppDialog(): void {
    this.dialog.open(RateAppDialogComponent, {
      width: '440px',
      height: 'auto',
      data: {},
    });
  }
}

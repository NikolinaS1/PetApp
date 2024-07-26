import { Directive, HostListener } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Directive({
  selector: '[googleSso]',
})
export class GoogleSsoDirective {
  constructor(private authService: AuthenticationService) {}

  @HostListener('click')
  async onClick() {
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  }
}

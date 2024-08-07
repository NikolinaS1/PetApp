import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent implements OnInit {
  form!: FormGroup;
  showPassword: boolean = false;
  isLoggingIn = false;
  isRecoveringPassword = false;

  constructor(
    public authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
        ],
      ],
    });

    this.authenticationService.getAuthState().subscribe((user) => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  forgotPassword() {
    this.isRecoveringPassword = true;

    this.authenticationService.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.isRecoveringPassword = false;
        this.snackBar.open(
          'Password reset email has been sent to your email account.',
          'OK',
          {
            duration: 5000,
          }
        );
      },
      error: (error: any) => {
        this.isRecoveringPassword = false;
        this.snackBar.open(
          'Error while trying to reset password. Please try again',
          'OK',
          {
            duration: 5000,
          }
        );
      },
    });
  }

  async onSignInWithGoogle() {
    try {
      await this.authenticationService.signInWithGoogle();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Google sign-in error:', error);
      this.snackBar.open('Google sign-in error. Please try again.', 'OK', {
        duration: 5000,
      });
    }
  }
}

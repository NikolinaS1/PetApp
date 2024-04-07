import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  form!: FormGroup;
  showPassword: boolean = false;
  isRegistering = false;
  isRecoveringPassword = false;

  constructor(
    public authenticationService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      firstname: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-ZČčĆćĐđŽžŠš]{2,}$')],
      ],
      lastname: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-ZČčĆćĐđŽžŠš]{2,}$')],
      ],
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
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

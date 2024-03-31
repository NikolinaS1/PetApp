import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninComponent } from './signin.component';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let page: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SigninComponent],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatIconModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    page = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  describe('form', () => {
    it('when email is empty, forgot button should be disabled', () => {
      setEmail('');
      expect(forgotPasswordButton().disabled).toBeTruthy();
    });

    it('when email is invalid, forgot button should be disabled', () => {
      setEmail('invalidEmail');
      expect(forgotPasswordButton().disabled).toBeTruthy();
    });

    it('when email is valid, forgot button should be enabled', () => {
      setEmail('valid.email@email.com');
      expect(forgotPasswordButton().disabled).toBeFalsy();
    });

    it('when email is empty, login button should be disabled', () => {
      setEmail('');
      setPassword('!validPassword1');
      expect(loginButton().disabled).toBeTruthy();
    });

    it('when email is invalid, login button should be disabled', () => {
      setEmail('invalidEmail');
      setPassword('!validPassword1');
      expect(loginButton().disabled).toBeTruthy();
    });

    it('when password is empty, login button should be disabled', () => {
      setEmail('valid.email@email.com');
      setPassword('');
      expect(loginButton().disabled).toBeTruthy();
    });

    it('when password is not empty, login button should be enabled', () => {
      setEmail('valid.email@email.com');
      setPassword('!validPassword1');
      expect(loginButton().disabled).toBeFalsy();
    });
  });

  function setEmail(value: string) {
    component.form.get('email')?.setValue(value);
    fixture.detectChanges();
  }

  function setPassword(value: string) {
    component.form.get('password')?.setValue(value);
    fixture.detectChanges();
  }

  function forgotPasswordButton() {
    return page.querySelector('[test-id="forgot-password-button"]');
  }

  function loginButton() {
    return page.querySelector('[test-id="login-button"]');
  }
});

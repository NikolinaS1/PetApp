import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninComponent } from './signin.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';
import { BlankComponent } from '../../mocks/blank/blank.component';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthenticationService } from './services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let page: any;
  let location: Location;
  let authenticationService: AuthenticationServiceMock;
  let snackBar: SnackBarMock;

  beforeEach(async () => {
    authenticationService = new AuthenticationServiceMock();
    snackBar = new SnackBarMock();

    await TestBed.configureTestingModule({
      declarations: [SigninComponent],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterModule.forRoot([{ path: 'home', component: BlankComponent }]),
      ],
    })
      .overrideProvider(AuthenticationService, {
        useValue: authenticationService,
      })
      .overrideProvider(MatSnackBar, { useValue: snackBar })
      .compileComponents();

    fixture = TestBed.createComponent(SigninComponent);
    location = TestBed.inject(Location);
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

  describe('Login flow', () => {
    describe('login loader', () => {
      beforeEach(() => {
        setEmail('valid.email@email.com');
        setPassword('!validPassword1');
        loginButton().click();
        fixture.detectChanges();
      });

      it('show when user clicks on login button', () => {
        expect(loginLoader()).not.toBeNull();
      });

      it('hide when user clicks on login button', () => {
        expect(loginButton()).toBeNull();
      });

      describe('when login is successful', () => {
        beforeEach(() => {
          authenticationService._signInResponse.next({ id: 'anyUserId' });
          fixture.detectChanges();
        });

        it('go to home page', (done) => {
          setTimeout(() => {
            expect(location.path()).toEqual('/home');
            done();
          }, 100);
        });
      });

      describe('when login fails', () => {
        beforeEach(() => {
          authenticationService._signInResponse.error({ message: 'anyError' });
          fixture.detectChanges();
        });

        it('do not go to home page', (done) => {
          setTimeout(() => {
            expect(location.path()).not.toEqual('/home');
            done();
          }, 100);
        });

        it('hide login loader', () => {
          expect(loginLoader()).toBeNull();
        });

        it('show login button', () => {
          expect(loginButton()).not.toBeNull();
        });

        it('show error message', () => {
          expect(snackBar._isOpened).toBeTruthy();
        });
      });
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

  function loginLoader() {
    return page.querySelector('[test-id="login-loader"]');
  }
});

class AuthenticationServiceMock {
  _signInResponse = new Subject();
  signIn() {
    return this._signInResponse.asObservable();
  }
}

class SnackBarMock {
  _isOpened = false;
  open() {
    this._isOpened = true;
  }
}

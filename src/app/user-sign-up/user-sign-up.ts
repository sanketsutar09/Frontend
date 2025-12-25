import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../Services/auth-service';
import { Router } from '@angular/router';
import { AlertComponent } from "../shared/alert/alert.component";

@Component({
  selector: 'app-user-sign-up',
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './user-sign-up.html',
  styleUrl: './user-sign-up.css'
})
export class UserSignUp implements OnInit {
  signUpForm!: FormGroup;
  signInForm!: FormGroup;
  isSignUp: boolean = true;
  screenWidth: number = 1024;

  isBrowser: boolean = false;

  forgotPasswordForm!: FormGroup;
showForgotPasswordModal = false;



  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
    }

    this.initForms();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.screenWidth = event.target.innerWidth;
    }
  }

  initForms(): void {
    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

     this.forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', Validators.required]
  });
  }

  openForgotPasswordModal(): void {
  this.showForgotPasswordModal = true;
}

closeForgotPasswordModal(): void {
  this.showForgotPasswordModal = false;
  this.forgotPasswordForm.reset();
}

onForgotPasswordSubmit(): void {
  if (this.forgotPasswordForm.invalid) {
    this.forgotPasswordForm.markAllAsTouched();
    return;
  }

  const { email, newPassword } = this.forgotPasswordForm.value;

  // this.authService.resetPassword(email, newPassword).subscribe({
  //   next: (res: any) => {
  //     this.showAlert(res.message, 'success');
  //     this.closeForgotPasswordModal();
  //   },
  //   error: (err) => {
  //     this.showAlert(err.error.message || 'Failed to reset password', 'error');
  //   }
  // });
}

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.signInForm.reset();
    this.signUpForm.reset();
  }

  onSignUpSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.authService.registerUser(this.signUpForm.value).subscribe({
      next: (res: any) => {
        this.showAlert(res.message, 'success');

      },
      error: (err) => this.showAlert(err.error.message || 'Registration failed', 'error')
    });
    this.signUpForm.reset();

  }

  onSignInSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.authService.loginUser(this.signInForm.value).subscribe({
      next: (res: any) => {

        this.signInForm.reset();
        this.authService.setUserEmail(res.user.email);
        this.authService.incrementLoginCount(res.user.email).subscribe();

        this.showAlert(res.message, 'success');

        setTimeout(() => {
          this.router.navigate(['/propertyList']);
        }, 1000);
      },
      error: (err) => this.showAlert(err.error.message || 'Login failed', 'error')
    });
    this.signInForm.reset();
  }


  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';
  showAlert(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.cd.detectChanges(); // force update

    setTimeout(() => {
      this.alertMessage = null;
    }, 1000);
  }
}

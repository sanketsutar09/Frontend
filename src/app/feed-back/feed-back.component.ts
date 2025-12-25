import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../Services/auth-service';

@Component({
  selector: 'app-feed-back',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feed-back.component.html',
  styleUrl: './feed-back.component.css'
})
export class FeedBackComponent implements OnInit {
  feedbackForm!: FormGroup;
  isBrowser = false;
  user: any = { name: '', email: '' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      feedback: ['', [Validators.required, Validators.minLength(5)]]
    });

    if (this.isBrowser) {
      const storedEmail = this.authService.getStoredUserEmail();
      if (storedEmail) {
        this.loadUserData(storedEmail);
      }

      this.authService.userEmail$.subscribe(email => {
        if (email) {
          this.loadUserData(email);
        }
      });
    }
  }

  private loadUserData(email: string) {
    this.authService.getUserProfile(email).subscribe(res => {
      this.user = res;
      this.feedbackForm.patchValue({
        name: res.name,
        email: res.email
      });
      this.cd.detectChanges();
    });
  }

  submitForm() {
    if (this.feedbackForm.valid) {
      this.authService.sendFeedback(this.feedbackForm.value).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.feedbackForm.reset();
         this.feedbackForm.patchValue({
          name: this.user.name,
          email: this.user.email
        })
        },
        error: (err) => {
          console.error(err);
          alert('Error submitting feedback');
        }
      });
    } else {
      this.feedbackForm.markAllAsTouched();
    }
  }

  get f() {
    return this.feedbackForm.controls;
  }
}

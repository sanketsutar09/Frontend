import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../Services/auth-service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements OnInit {
  contactForm!: FormGroup;
  isBrowser = false;
  user: any = { name: '', email: '' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(5)]]
    });

    if (this.isBrowser) {
      const storedEmail = this.authService.getStoredUserEmail();
      if (storedEmail) {
        this.loadUserData(storedEmail);
        this.cd.detectChanges();
      }

      // Keep listening for changes
      this.authService.userEmail$.subscribe(email => {
        if (email) {
          this.loadUserData(email);
        }
        this.cd.detectChanges();
      });
      
    }
  }

  private loadUserData(email: string) {
    this.authService.getUserProfile(email).subscribe(res => {
      this.user = res;
      this.contactForm.patchValue({
        name: res.name,
        email: res.email
      });
      this.cd.detectChanges(); // force UI update
    });
  }

  submitForm() {
  if (this.contactForm.valid) {
    this.authService.sendContactForm(this.contactForm.value).subscribe({
      next: (res) => {
        alert(res.message);
        this.contactForm.reset();
        this.contactForm.patchValue({
  name: this.user.name,
  email: this.user.email
});

this.cd.detectChanges();
        
      },
      error: (err) => {
        console.error(err);
        alert('Error submitting form');
      }
    });
  } else {
    this.contactForm.markAllAsTouched();
  }

  
}


  get f() {
    return this.contactForm.controls;
  }
}

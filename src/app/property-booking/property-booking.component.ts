import { ChangeDetectorRef, Component, Inject, NgZone, OnInit, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropService } from '../Services/prop-service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../Services/auth-service';
import { AlertComponent } from "../shared/alert/alert.component";

import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

declare var Razorpay: any;


@Component({
  selector: 'app-property-booking',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './property-booking.component.html',
  styleUrl: './property-booking.component.css'
})
export class PropertyBookingComponent implements OnInit {
  property: any;
  bookingForm!: FormGroup;
  isBrowser = false;
  user: any = { name: '', email: '' }; // prevent undefined flicker
  isLoaded = false;
    stripe!: Stripe | null;
  card!: StripeCardElement;
 
  showPopup = false;
  bookingData: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private propertyService: PropService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(){
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isLoaded = true;

//     if (isPlatformBrowser(this.platformId)) {
//   this.stripe = await loadStripe('pk_test_51SJzqjJUY0o8ZnxRW2xuNdLXVZRW0KQYHIEAhvu21TVoYFfTKUhoa3gzSjWL7DRHSWgzQO9a7IeWh2xmSX9lm956005GJUQV2Z');
//   const elements = this.stripe!.elements();
//   this.card = elements.create('card');
//   this.card.mount('#card-element');
// }

    // // Initialize Stripe
    // if (this.isBrowser) {
    //   this.stripe = await loadStripe('pk_test_51SJzqjJUY0o8ZnxRW2xuNdLXVZRW0KQYHIEAhvu21TVoYFfTKUhoa3gzSjWL7DRHSWgzQO9a7IeWh2xmSX9lm956005GJUQV2Z');
    //   if (this.stripe) {
    //     const elements = this.stripe.elements();
    //     this.card = elements.create('card');
    //     this.card.mount('#card-element');
    //   }
    // }

    // Create form once
    this.bookingForm = this.fb.group(
      {
        // Property details
        title: [{ value: '', disabled: true }],
        type: [{ value: '', disabled: true }],
        bhk: [{ value: '', disabled: true }],
        size: [{ value: '', disabled: true }],
        price: [{ value: '', disabled: true }],
        address: [{ value: '', disabled: true }],
        furnished: [{ value: '', disabled: true }],

        // User details
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        dob: ['', Validators.required],
        govIdType: ['', Validators.required],
        govIdNumber: ['', Validators.required],

        // Booking dates
        checkInDate: ['', [Validators.required, this.futureDateValidator]],
        checkOutDate: ['', Validators.required],

        // Emergency contact
        emergencyName: ['', Validators.required],
        emergencyPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

        // Notes
        notes: ['']
      },
      {
        validators: [this.checkOutAfterCheckInValidator]
      }
    );

    // Load logged-in user details
    if (this.isBrowser) {
      const storedEmail = this.authService.getStoredUserEmail();
      if (storedEmail) { this.loadUserData(storedEmail);
      }

      // Keep listening for future changes
      this.authService.userEmail$.subscribe(email => {
        if (email) {
          this.loadUserData(email);
          this.cd.detectChanges();
        }
      });
    }

    // Load property details
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyService.getPropertyById(id).subscribe((data) => {
        this.property = data;
        this.bookingForm.patchValue({
          title: data.title,
          type: data.type,
          bhk: data.bhk,
          size: data.size,
          price: data.price,
          address: data.address,
          furnished: data.furnished
        });
        this.cd.detectChanges();
      });
    }
  }

//   async ngAfterViewInit() {
//   if (isPlatformBrowser(this.platformId)) {
//     this.stripe = await loadStripe('pk_test_51SJzqjJUY0o8ZnxRW2xuNdLXVZRW0KQYHIEAhvu21TVoYFfTKUhoa3gzSjWL7DRHSWgzQO9a7IeWh2xmSX9lm956005GJUQV2Z');
//     const elements = this.stripe!.elements();

//     this.card = elements.create('card', { hidePostalCode: true });
//     this.card.mount('#card-element');
//   }
// }


  private loadUserData(email: string) {
    this.authService.getUserProfile(email).subscribe(res => {
      this.user = res;
      this.bookingForm.patchValue({
        name: res.name,
        email: res.email
      });
      this.isLoaded = true;

      // Force immediate UI update
      this.cd.detectChanges();
    });
  }

  // Custom validator: check-in date must be after today
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(control.value);
    return checkIn >= today ? null : { notFutureDate: true };
  }

  // Custom validator: check-out must be after check-in
  checkOutAfterCheckInValidator(group: AbstractControl): ValidationErrors | null {
    const checkIn = group.get('checkInDate')?.value;
    const checkOut = group.get('checkOutDate')?.value;
    if (!checkIn || !checkOut) return null;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return checkOutDate >= checkInDate ? null : { checkOutBeforeCheckIn: true };
  }

async onSubmit() {
    if (!this.bookingForm.valid || !this.stripe || !this.card) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const bookingData = { ...this.bookingForm.getRawValue(), propertyId: this.property?._id };
    const amount = this.property.price;

    // 1️⃣ Create PaymentIntent from backend
    this.propertyService.createPaymentIntent(amount).subscribe(async (res: any) => {
      const clientSecret = res.clientSecret;

      // 2️⃣ Confirm payment using Stripe
      const result = await this.stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: { name: this.bookingForm.value.name, email: this.bookingForm.value.email, address: { postal_code: '411001' } }
        }
      });

      if (result.error) {
        this.showAlert('Payment failed: ' + result.error.message, 'error');
      } else if (result.paymentIntent?.status === 'succeeded') {
        // 3️⃣ Save booking
        this.propertyService.bookProperty(bookingData).subscribe({
          next: () => this.showAlert('Property booked successfully', 'success'),
          error: () => this.showAlert('Booking failed to save', 'error')
        });
      }
    }, () => this.showAlert('Failed to initialize payment.', 'error'));
  }

  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';

  showAlert(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.cd.detectChanges(); // force update

    setTimeout(() => {
      this.alertMessage = null;
      this.router.navigate(['/'])
      this.bookingForm.reset();
    }, 3000);
  }

}

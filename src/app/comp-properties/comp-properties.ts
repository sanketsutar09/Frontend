import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ViewChildren, QueryList, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropService } from '../Services/prop-service';
import { AlertComponent } from "../shared/alert/alert.component";
import { AuthService } from '../Services/auth-service';

@Component({
  selector: 'app-comp-properties',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './comp-properties.html',
  styleUrl: './comp-properties.css'
})
export class CompProperties {
  propertyForm!: FormGroup;
  selectedImages: File[] = [];
  imageError: string = '';
  isRoomSelected = false;

  isBrowser = false;
  user: any = { name: '', email: '' }

  sangliLocations: string[] = [
    'Sangli', 'Miraj', 'Tasgaon', 'Uran Islampur', 'Vita', 'Sangli-Miraj-Kupwad', 'Palus', 'Ashta',
    'Bamani', 'Budhgaon', 'Hingangaon', 'Jat', 'Kadegaon', 'Kavathe-Mahankal', 'Khanapur (Vita)',
    'Kirloskarwadi', 'Kundal', 'Madhavnagar', 'Savlaj', 'Shirala', 'Walwa', 'Wategaon',
    'Atpadi', 'Bhingewadi', 'Bhood', 'Chikhalwadi', 'Devikhindi', 'Dighanchi', 'Kharsundi', 'Shukachari'

  ];

  @ViewChildren('fileInput0, fileInput1, fileInput2') fileInputs!: QueryList<any>;

  constructor(private fb: FormBuilder,
    private propertyService: PropService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {

  }

  ngOnInit(): void {

    this.isBrowser = isPlatformBrowser(this.platformId);

    this.propertyForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      title: ['', Validators.required],
      available: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      bhk: ['', Validators.required],
      size: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      address: ['', Validators.required],
      // location: ['', Validators.required],
      // availableFrom: ['', Validators.required],
      furnished: ['', Validators.required]
    });
    if (this.isBrowser) {
      const storedEmail = this.authService.getStoredUserEmail();
      if (storedEmail) {
        this.loadUserData(storedEmail);
        this.cd.detectChanges();
      }

      //keep listening for changes
      this.authService.userEmail$.subscribe(email => {
        if (email) {
          this.loadUserData(email);
        }
        this.cd.detectChanges();
      })
    }
  }

  private loadUserData(email: string) {
    this.authService.getUserProfile(email).subscribe(res => {
      this.user = res;
      this.propertyForm.patchValue({
        name: res.name,
        email: res.email
      });
      this.cd.detectChanges(); // force UI update
    });
  }



  onTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.isRoomSelected = value === 'Room';
    if (this.isRoomSelected) {
      this.propertyForm.get('bhk')?.disable();
      this.propertyForm.patchValue({ bhk: '' });
    } else {
      this.propertyForm.get('bhk')?.enable();
    }
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImages[index] = input.files[0];
      this.imageError = '';
    } else {
      this.imageError = 'Please select an image.';
    }
  }

  onSubmit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.entries(this.propertyForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    this.selectedImages.forEach((file, i) => {
      if (file) {
        formData.append(`image${i + 1}`, file);
      }
    });

    this.propertyService.uploadProperty(formData).subscribe({
      next: (res: any) => {
        // alert(res.message);
        this.showAlert('Property uploaded successfully', 'success');
        this.propertyForm.reset();
        this.propertyForm.patchValue({
          name: this.user.name,
          email: this.user.email
        });
        this.cd.detectChanges();
        this.selectedImages = [];
        this.fileInputs.forEach((fileInput: any) => fileInput.nativeElement.value = ''); // clear file inputs
      },
      error: (err) => {
        // alert(err.error.message || 'Upload failed');
        this.showAlert('Property upload failed', 'error');
      }
    });
  }

  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';
  showAlert(message: string, type: 'error' | 'success' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;
    this.cd.detectChanges();
    setTimeout(() => {
      this.alertMessage = '';
      // this.cd.detectChanges();
    }, 1000);
  }
}

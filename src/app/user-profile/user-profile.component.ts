
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../Services/auth-service';
import { Property, PropService } from '../Services/prop-service';
import { AlertComponent } from '../shared/alert/alert.component';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: any = { name: '', email: '', profileImage: '' };
  profileForm!: FormGroup;
  editMode = false;
  selectedFile!: File;
  isBrowser = false;
  isLoaded = false;
  bookings: any[] = [];
  ownerBookings: any[] = [];

  showConfirm = false;
  bookingToCancel: string | null = null;
  propertyToDelete: string | null = null;

  showPropertyConfirm = false;

  properties: Property[] = [];
  userEmail = '';

  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';

  // Track edit states per property
  editingMap: { [id: string]: boolean } = {};
  originalMap: { [id: string]: Property } = {};

  propertyForm!: FormGroup;

  filteredProperties: any[] = [];

  uniqueAddresses: string[] = [];
  uniqueTypes: string[] = [];
  uniqueBHKs: string[] = [];
  uniqueFurnished: string[] = [];

  sangliLocations: string[] = [
    'Sangli', 'Miraj', 'Tasgaon', 'Uran Islampur', 'Vita', 'Sangli-Miraj-Kupwad', 'Palus', 'Ashta',
    'Bamani', 'Budhgaon', 'Hingangaon', 'Jat', 'Kadegaon', 'Kavathe-Mahankal', 'Khanapur (Vita)',
    'Kirloskarwadi', 'Kundal', 'Madhavnagar', 'Savlaj', 'Shirala', 'Walwa', 'Wategaon',
    'Atpadi', 'Bhingewadi', 'Bhood', 'Chikhalwadi', 'Devikhindi', 'Dighanchi', 'Kharsundi', 'Shukachari'

  ];

  selectedAddress: string = '';
  selectedType: string = '';
  selectedBHK: string = '';
  selectedFurnished: string = '';
  searchText: string = '';

  showImageModal: boolean = false;
  modalImageUrl: string = '';

  showDetailsModal = false;
  selectedProperty: any = null;
  showAllProperties = false;

  showCardModal = false;
  showUpdateModal = false;
  updateFiles: (File | null)[] = [null, null, null];
  isRoomSelected = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private propServices: PropService,
    private propertyService: PropService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

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
      furnished: ['', Validators.required]
    });

    this.profileForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
    });

    if (this.isBrowser) {
      const storedEmail = this.authService.getStoredUserEmail?.();
      if (storedEmail) {
        this.userEmail = storedEmail;
        setTimeout(() => {
          this.loadUserData(storedEmail);
          this.loadUserProperties(storedEmail);
        });
      }

      this.authService.userEmail$.subscribe((email) => {
        if (email) {
          this.userEmail = email;
          setTimeout(() => {
            this.loadUserData(email);
            this.loadUserProperties(email);
            this.loadOwnerBookings(email);
          });
        }
      });
    }
  }

  fetchProperties(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data.map(prop => ({
          ...prop,
          currentImageIndex: 0
        }));
        this.filteredProperties = [...this.properties];

        this.uniqueAddresses = [...new Set(data.map(p => p.address))];
        this.uniqueTypes = [...new Set(data.map(p => p.type))];
        this.uniqueBHKs = [...new Set(data.map(p => p.bhk))];
        this.uniqueFurnished = [...new Set(data.map(p => p.furnished))];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error fetching properties:', err)
    });
  }

  // ------------------ Modals ------------------
  openDetailsModal(prop: any): void {
    this.selectedProperty = prop;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProperty = null;
  }

  openCardModal(prop: any): void {
    this.selectedProperty = { ...prop };
    this.showCardModal = true;
  }

  closeCardModal(): void {
    this.showCardModal = false;
    this.selectedProperty = null;
  }

  openImageModal(imgUrl: string): void {
    this.modalImageUrl = imgUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImageUrl = '';
  }

  // ------------------ Update Property ------------------
  openUpdateModal(prop: any): void {
    this.selectedProperty = { ...prop }; // clone to avoid mutation
    this.showUpdateModal = true;

    this.propertyForm.patchValue({
      name: prop.name,
      email: prop.email,
      phone: prop.phone,
      title: prop.title,
      description: prop.description,
      type: prop.type,
      bhk: prop.bhk,
      size: prop.size,
      price: prop.price,
      address: prop.address,
      furnished: prop.furnished,
      available: prop.available
    });

    this.isRoomSelected = prop.type === 'Room';
    if (this.isRoomSelected) this.propertyForm.get('bhk')?.disable();
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedProperty = null;
    this.updateFiles = [null, null, null];
    this.propertyForm.reset();
  }

  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      this.updateFiles[index] = event.target.files[0];
    }
  }

  onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.isRoomSelected = value === 'Room';
    if (this.isRoomSelected) {
      this.propertyForm.get('bhk')?.disable();
      this.propertyForm.patchValue({ bhk: '' });
    } else {
      this.propertyForm.get('bhk')?.enable();
    }
  }

  submitUpdate(): void {
    if (!this.selectedProperty || this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.entries(this.propertyForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    this.updateFiles.forEach((file, i) => {
      if (file) formData.append(`image${i + 1}`, file);
    });

    this.propertyService.updateProperty(this.selectedProperty._id, formData).subscribe({
      next: (res: any) => {
        const index = this.properties.findIndex(p => p._id === this.selectedProperty._id);
        if (index !== -1) this.properties[index] = res.property;

        this.filteredProperties = [...this.properties];
        this.showAlert('Property updated successfully', 'success');
        this.closeUpdateModal();
        this.cd.detectChanges();
      },
      error: (err) => this.showAlert('Failed to update property', 'error')
    });
  }
  

  loadUserProperties(email: string) {
    this.propServices.getPropertiesByUserEmail(email).subscribe({
      next: (res) => {
        this.properties = res;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user properties', err);
      },
    });
  }

  private loadUserData(email: string) {
    this.authService.getUserProfile(email).subscribe((res: any) => {
      this.user = res;
      this.profileForm.patchValue({
        name: res.name || '',
        email: res.email || '',
      });
      this.isLoaded = true;

      this.authService.getUserBookings(email).subscribe((bookingRes: any) => {
        this.bookings = bookingRes;
        this.cd.detectChanges();
      });

      this.cd.detectChanges();
    });
  }

  // Bookings
  isCancelable(checkInDate: string | Date): boolean {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    return checkIn > today;
  }

  openCancelModal(bookingId: string) {
    this.bookingToCancel = bookingId;
    this.showConfirm = true;
  }

  confirmCancelBooking() {
    if (!this.bookingToCancel) return;

    this.authService.cancelUserbooking(this.bookingToCancel).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(
          (b) => b._id !== this.bookingToCancel
        );
        this.showConfirm = false;
        this.bookingToCancel = null;
        this.showAlert('Booking cancelled successfully ', 'success');
      },
      error: (err) => {
        this.showAlert(
          'Failed to cancel booking. Please try again later.',
          'error'
        );
        console.error(err);
      },
    });
  }

  openDeletePropertyModal(propertyId: string) {
    this.propertyToDelete = propertyId;
    
    this.showPropertyConfirm = true;
    this.cd.detectChanges();
  }

  

  confirmDeleteProperty() {
    if (!this.propertyToDelete) return;

    this.propServices.deleteProperty(this.propertyToDelete).subscribe({
      next: () => {
        this.properties = this.properties.filter(
          (p) => p._id !== this.propertyToDelete
        );
        this.showAlert('Property deleted successfully', 'success');
        this.showPropertyConfirm = false;
        this.propertyToDelete = null;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.showAlert('Failed to delete property. Please try again later', 'error');
        this.showPropertyConfirm = false;
        this.propertyToDelete = null;
        this.cd.detectChanges();
      },
    });
  }


  closeCancelModal() {
    this.showConfirm = false;
    this.bookingToCancel = null;
    this.cd.detectChanges();
  }

  closeDeletePropertyModal() {
    this.showPropertyConfirm = false;
    this.propertyToDelete = null;
    this.cd.detectChanges();
  }


  // Profile update
  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpdateProfile() {
    if (!this.user?._id) return;

    const formData = new FormData();
    formData.append('name', this.profileForm.value.name);
    formData.append('email', this.profileForm.value.email);

    if (this.profileForm.value.password) {
      formData.append('password', this.profileForm.value.password);
    }
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.authService
      .updateUserProfile(this.user._id, formData)
      .subscribe((res: any) => {
        // alert(res.message);
        this.showAlert('Profile Updated Successfully', 'success');
        this.user = res.user;
        this.editMode = false;
        this.cd.detectChanges();
        this.profileForm.patchValue({
          name: res.user.name,
          email: res.user.email,
        });
      });
  }

  // Alerts
  showAlert(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = null;
    }, 1000);
    this.cd.detectChanges();
  }

  // // Property editing
  // enableEdit(property: Property) {
  //   this.originalMap[property._id] = { ...property };
  //   this.editingMap[property._id] = true;
  // }

  // cancelEdit(property: Property) {
  //   Object.assign(property, this.originalMap[property._id]);
  //   this.editingMap[property._id] = false;
  // }

  // updateProperty(property: Property) {
  //   if (!property || !property._id) {
  //     console.error('Property is missing _id');
  //     return;
  //   }
  //   this.propServices.updateProperty(property._id, property).subscribe({
  //     next: () => {
  //       // alert('Property updated successfully');
  //       this.showAlert('Property Updated successfully', 'success');
  //       this.editingMap[property._id] = false;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       // alert('Failed to update property');
  //       this.showAlert('Failed to update property', 'error');
  //     },
  //   });
  // }



  loadOwnerBookings(email: string) {
    this.authService.getBookingsForMyProperties(email).subscribe({
      next: (res) => {
        this.ownerBookings = res;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load bookings for my properties', err);
      }
    });
  }

saveUserInfo() {
  const email = this.authService.getStoredUserEmail();
  if (!email) {
    this.showAlert('No logged-in user found.', 'error');
    return;
  }

  this.authService.getUserProfile(email).subscribe({
    next: (user) => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 20;
      let y = 30;

      // ---- Header ----
      doc.setFontSize(22);
      doc.setTextColor(30, 60, 120); // dark blue
      doc.text('User Profile', 105, y, { align: 'center' });

      y += 10;
      doc.setLineWidth(0.5);
      doc.line(margin, y, 210 - margin, y); // horizontal line
      y += 10;

      // ---- Fields to include ----
      const fields: { label: string; value: any }[] = [
        { label: 'Name', value: user.name || '' },
        { label: 'Email', value: user.email || '' },
        { label: 'Password', value: user.password || '' },
        { label: 'Created At', value: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A' }
      ];

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);

      fields.forEach(field => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${field.label}:`, margin, y);

        doc.setFont('helvetica', 'bold');
        doc.text(`${field.value}`, margin + 50, y);

        y += 12;

        // Add page if y exceeds limit
        if (y > 280) {
          doc.addPage();
          y = 30;
        }
      });

      // ---- Footer ----
      y = 280;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated by Tenant Management System', 105, y, { align: 'center' });

      // ---- Save PDF ----
      doc.save(`${user.name || 'user'}_profile.pdf`);
      this.showAlert('User info saved as PDF!', 'success');
    },
    error: (err) => {
      console.error(err);
      this.showAlert('Failed to fetch user info', 'error');
    }
  });
}
}


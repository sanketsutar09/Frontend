import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropService } from '../Services/prop-service';
import { CommonModule } from '@angular/common';
import { UserDashboard } from "../user-dashboard/user-dashboard";
import { AuthService } from '../Services/auth-service';
import { UserFooterComponent } from "../user-footer/user-footer.component";
import { AboutUsComponent } from "../about-us/about-us.component";
import { ContactUsComponent } from "../contact-us/contact-us.component";
import { AlertComponent } from "../shared/alert/alert.component";

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDashboard, UserFooterComponent, AboutUsComponent, ContactUsComponent, AlertComponent],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css'
})
export class PropertyList implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];

  uniqueAddresses: string[] = [];
  uniqueTypes: string[] = [];
  uniqueBHKs: string[] = [];
  uniqueFurnished: string[] = [];

  selectedAddress: string = '';
  selectedType: string = '';
  selectedBHK: string = '';
  selectedFurnished: string = '';
  searchText: string = '';

  showImageModal: boolean = false;
  modalImageUrl: string = '';
  showDetailsModal = false;
  selectedProperty: any = null;
  isLoggedIn = false;
  showAllProperties = false;

  minPrice: number | null = null;
  maxPrice: number | null = null;

  minSize: number | null = null;
  maxSize: number | null = null;

  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';


  constructor(
    private propertyService: PropService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        // Initialize currentImageIndex for each property
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

    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.cd.detectChanges();
    })
  }

  getImageUrl(filename: string): string {
    return `http://localhost:3000/uploads/${filename}`;
  }


  openDetailsModal(prop: any): void {
    this.selectedProperty = prop;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProperty = null;
  }



  filterProperties(): void {
    this.filteredProperties = this.properties.filter(prop => {
      const matchesAddress = !this.selectedAddress || prop.address === this.selectedAddress;
      const matchesType = !this.selectedType || prop.type === this.selectedType;
      const matchesBHK = !this.selectedBHK || prop.bhk === this.selectedBHK;
      const matchesFurnished = !this.selectedFurnished || prop.furnished === this.selectedFurnished;
      const matchesSearch = !this.searchText || prop.address.toLowerCase().includes(this.searchText.toLowerCase());

      // Price filter: if minPrice/maxPrice set, property price should be in range
    const matchesPrice = 
      (this.minPrice === null || prop.price >= this.minPrice) &&
      (this.maxPrice === null || prop.price <= this.maxPrice);

    // Size filter: if minSize/maxSize set, property size should be in range
    const matchesSize = 
      (this.minSize === null || prop.size >= this.minSize) &&
      (this.maxSize === null || prop.size <= this.maxSize);

      return matchesAddress && matchesType && matchesBHK && matchesFurnished && matchesSearch && matchesPrice &&
      matchesSize;
    });
  }

  openImageModal(imgUrl: string): void {
    this.modalImageUrl = imgUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImageUrl = '';
  }

  // Image carousel navigation
  nextImage(prop: any): void {
    if (!prop.images || prop.images.length === 0) return;
    prop.currentImageIndex = (prop.currentImageIndex + 1) % prop.images.length;
  }

  prevImage(prop: any): void {
    if (!prop.images || prop.images.length === 0) return;
    prop.currentImageIndex =
      (prop.currentImageIndex - 1 + prop.images.length) % prop.images.length;
  }

  trackByIndex(index: number): number {
    return index;
  }

  bookProperty(id: string) {
    if (this.isLoggedIn) {
      // console.log("Booking property with ID:", id);
      this.router.navigate(['/bookProperty', id]);
      this.cd.detectChanges();
    } else {
      this.showAlert('Please sign in to book property', 'error');
    }
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  this.alertMessage = message;
  this.alertType = type;
  this.cd.detectChanges(); // force update

  setTimeout(() => {
    this.alertMessage = null;
  }, 3000);
}

}

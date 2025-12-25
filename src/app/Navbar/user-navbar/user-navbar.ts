import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth-service';
import { AlertComponent } from "../../shared/alert/alert.component";

@Component({
  selector: 'app-user-navbar',
  imports: [CommonModule, AlertComponent],
  templateUrl: './user-navbar.html',
  styleUrl: './user-navbar.css'
})
export class UserNavbar {
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  menuOpen = false;
  dropdownOpen = false;
  isBrowser: boolean;
  isLoggedIn = false;
  mobileMenuOpen = false;



  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  onSignOut() {
    this.authService.clearUserEmail();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
    this.cd.detectChanges();

  }

  get screenIsMdOrLarger(): boolean {
    if (this.isBrowser) {
      return window.innerWidth >= 768;
    }
    return false;
  }

  onPropertyList() {
    this.router.navigate(['/']);
  }

  uploadProperty() {
    if (this.isLoggedIn) {
      this.router.navigate(['/uploadProperty']);

    } else {
      this.cd.detectChanges();
      this.showAlert('Please sign in to upload a property', 'error');
    }
  }

  onUserLogin() {
    this.router.navigate(['/UserSignUp']);
    this.dropdownOpen = false;
  }

  onUserProfile() {
    this.router.navigate(['/userProfile']);
  }

  toggleDropdown(event?: MouseEvent) {
    event?.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  onFeedBack() {
    this.router.navigate(['/feedBack']);
  }

  onContactUs() {
    this.router.navigate(['/contactUs']);
  }

  onAboutUs() {
    this.router.navigate(['/aboutUs']);
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
    }, 3000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.dropdownOpen = false;
    }
  }
}

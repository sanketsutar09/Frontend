import { Component } from '@angular/core';
import { UserNavbar } from './Navbar/user-navbar/user-navbar';
import { AdminNavbar } from "./Navbar/admin-navbar/admin-navbar";
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./Navbar/navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'FRONTEND';
}

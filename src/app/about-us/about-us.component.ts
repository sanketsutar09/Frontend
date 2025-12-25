import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  imports: [],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
 team = [
    {
      name: 'Emily Carter',
      role: 'Founder & CEO',
      img: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'James Lee',
      role: 'Head of Design',
      img: 'https://randomuser.me/api/portraits/men/46.jpg'
    },
    {
      name: 'Sophia Brown',
      role: 'Marketing Director',
      img: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      name: 'Michael Green',
      role: 'Lead Developer',
      img: 'https://randomuser.me/api/portraits/men/58.jpg'
    }
  ];
}

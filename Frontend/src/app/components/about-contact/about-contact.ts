import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AboutComponent } from '../about/about';
import { ContactComponent } from '../contact/contact';

@Component({
  selector: 'app-about-contact',
  standalone: true,
  imports: [CommonModule, AboutComponent, ContactComponent],
  templateUrl: './about-contact.html',
  styleUrls: ['./about-contact.css']
})
export class AboutContactComponent {
  // This component now serves as a container for the About and Contact components
}

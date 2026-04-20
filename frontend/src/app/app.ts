import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastComponent } from './components/toast/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'zine-frontend';
}

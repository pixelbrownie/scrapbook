import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credentials = { username: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.toastService.show('Welcome back!', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.toastService.show('Invalid username or password', 'error');
      }
    });
  }
}

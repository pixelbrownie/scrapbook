import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  user = { username: '', email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    this.authService.signup(this.user).subscribe({
      next: () => {
        this.toastService.show('Account created! Please log in.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.toastService.show('Error creating account. Try another username.', 'error');
      }
    });
  }
}

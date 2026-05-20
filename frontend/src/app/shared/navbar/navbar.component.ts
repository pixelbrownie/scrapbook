import { Component, signal, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="nav-inner">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">pixelbrownie</span>
        </a>

        <!-- Center links -->
        <div class="nav-links">
          <a routerLink="/explore" routerLinkActive="active" class="nav-link">Explore</a>
          <a routerLink="/search" routerLinkActive="active" class="nav-link">Search</a>
          <a *ngIf="auth.isLoggedIn()" routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
        </div>

        <!-- Right actions -->
        <div class="nav-right">
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="btn btn-ghost">Sign in</a>
            <a routerLink="/signup" class="btn btn-primary btn-sm">Get started</a>
          </ng-container>

          <ng-container *ngIf="auth.isLoggedIn()">
            <a routerLink="/editor" class="btn btn-primary btn-sm">
              <span>+ New Zine</span>
            </a>

            <!-- Avatar / Profile dropdown -->
            <div class="avatar-wrap" (click)="toggleDropdown()">
              <div class="avatar" [style.background-image]="auth.currentUser()?.avatar ? 'url(' + auth.currentUser()?.avatar + ')' : 'none'">
                <span *ngIf="!auth.currentUser()?.avatar">{{ userInitial() }}</span>
              </div>

              <div class="dropdown" *ngIf="dropdownOpen()">
                <div class="dropdown-header">
                  <span class="dropdown-name">{{ auth.currentUser()?.username }}</span>
                  <span class="dropdown-email">{{ auth.currentUser()?.email }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/dashboard" class="dropdown-item" (click)="closeDropdown()">
                  <span class="di-icon">⬡</span> Dashboard
                </a>
                <a routerLink="/profile" class="dropdown-item" (click)="closeDropdown()">
                  <span class="di-icon">◈</span> My Profile
                </a>
                <a routerLink="/settings" class="dropdown-item" (click)="closeDropdown()">
                  <span class="di-icon">⚙</span> Settings
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item danger" (click)="logout()">
                  <span class="di-icon">↩</span> Log out
                </button>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 0 32px;
      height: 68px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }

    .navbar.scrolled {
      background: rgba(255,249,229,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(243,176,195,0.3);
      box-shadow: 0 2px 16px rgba(243,176,195,0.15);
    }

    .nav-inner {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--dark);
    }

    .logo-icon {
      font-size: 1.4rem;
      color: var(--pink-dark);
      animation: pulse 2s ease-in-out infinite;
    }

    .logo-text {
      font-family: var(--font-heading);
      font-weight: 900;
      font-size: 1.25rem;
      letter-spacing: -0.5px;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: 50px;
      text-decoration: none;
      color: var(--gray);
      font-family: var(--font-heading);
      font-weight: 500;
      font-size: 0.95rem;
      transition: all var(--transition);
    }

    .nav-link:hover, .nav-link.active {
      color: var(--dark);
      background: var(--pink-light);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-sm {
      padding: 9px 20px;
      font-size: 0.9rem;
    }

    .avatar-wrap {
      position: relative;
      cursor: pointer;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--pink);
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
      color: var(--dark);
      border: 2px solid var(--pink-dark);
      transition: transform var(--transition-bounce);
    }

    .avatar:hover { transform: scale(1.08); }

    .dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 220px;
      background: var(--white);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-lift), 0 0 0 1px rgba(243,176,195,0.2);
      overflow: hidden;
      animation: fadeUp 0.2s ease forwards;
    }

    .dropdown-header {
      padding: 14px 16px;
      background: var(--pink-light);
    }

    .dropdown-name {
      display: block;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.95rem;
    }

    .dropdown-email {
      display: block;
      font-size: 0.78rem;
      color: var(--gray);
      margin-top: 2px;
    }

    .dropdown-divider {
      height: 1px;
      background: #f3f4f6;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 16px;
      font-size: 0.9rem;
      color: var(--dark);
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: var(--font-body);
      transition: background var(--transition);
    }

    .dropdown-item:hover { background: var(--bg-cream); }
    .dropdown-item.danger { color: #ef4444; }
    .dropdown-item.danger:hover { background: #fff1f2; }

    .di-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }
  `]
})
export class NavbarComponent {
  scrolled = signal(false);
  dropdownOpen = signal(false);

  constructor(public auth: AuthService, private router: Router) {}

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.avatar-wrap')) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.dropdownOpen.set(false);
  }

  userInitial(): string {
    return this.auth.currentUser()?.username?.[0]?.toUpperCase() ?? '?';
  }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
  }
}

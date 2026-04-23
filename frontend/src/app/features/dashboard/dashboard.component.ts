import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZineService, Zine } from '../../core/services/zine.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard stars-bg">
      <div class="dash-inner">

        <!-- Header -->
        <div class="dash-header fade-up">
          <div>
            <h1>my zine collection</h1>
            <p class="dash-sub">{{ myZines().length }} zine{{ myZines().length !== 1 ? 's' : '' }} in your collection</p>
          </div>
          <a routerLink="/editor" class="btn btn-primary">+ New Zine</a>
        </div>

        <!-- Loading -->
        <div class="loading-grid" *ngIf="loading()">
          <div class="skeleton-book" *ngFor="let s of [1,2,3,4]"></div>
        </div>

        <!-- Empty state -->
        <div class="empty-state card" *ngIf="!loading() && myZines().length === 0">
          <div class="empty-icon">📖</div>
          <h3>No zines yet!</h3>
          <p>Start your first zine and fold it into a mini-book.</p>
          <a routerLink="/editor" class="btn btn-primary mt-16">Make your first zine ♡</a>
        </div>

        <!-- Zine shelf -->
        <div class="zine-shelf" *ngIf="!loading() && myZines().length > 0">
          <div
            class="zine-book"
            *ngFor="let zine of myZines()"
            [style.--book-color]="zine.theme_color"
          >
            <!-- 3D book -->
            <div class="book-body" (click)="openZine(zine)">
              <div class="book-front" [style.background-color]="zine.theme_color">
                <img *ngIf="zine.cover_image_url" [src]="zine.cover_image_url" class="book-cover-img" alt="" />
                <div class="book-front-title">{{ zine.title }}</div>
              </div>
              <div class="book-side" [style.background-color]="darken(zine.theme_color)"></div>
              <div class="book-pages"></div>
            </div>

            <!-- Controls below book -->
            <div class="book-controls">
              <span class="book-title-text">{{ zine.title }}</span>
              <div class="book-actions">
                <!-- Privacy toggle -->
                <label class="toggle" title="{{ zine.is_public ? 'Public' : 'Private' }}">
                  <input type="checkbox" [checked]="zine.is_public" (change)="togglePrivacy(zine)" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="privacy-label">{{ zine.is_public ? '🌍 Public' : '🔒 Private' }}</span>

                <button class="btn btn-ghost btn-xs" (click)="editZine(zine)">Edit</button>
                <button class="btn btn-danger btn-xs" (click)="deleteZine(zine)">✕</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      padding: 100px 24px 60px;
    }

    .dash-inner {
      max-width: 1100px;
      margin: 0 auto;
    }

    .dash-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .dash-header h1 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-family: var(--font-heading);
      letter-spacing: -0.5px;
    }

    .dash-sub {
      color: var(--gray);
      font-size: 0.95rem;
      margin-top: 4px;
    }

    /* ── Shelf ── */
    .zine-shelf {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 40px 32px;
    }

    .zine-book {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* ── 3D Book ── */
    .book-body {
      position: relative;
      width: 160px;
      height: 220px;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }

    .book-body:hover {
      transform: translateY(-12px) rotate(-3deg) scale(1.05);
    }

    .book-front {
      position: absolute;
      inset: 0;
      border-radius: 4px 12px 12px 4px;
      overflow: hidden;
      box-shadow: 4px 4px 16px rgba(0,0,0,0.15);
      display: flex;
      align-items: flex-end;
    }

    .book-cover-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .book-front-title {
      position: relative;
      z-index: 1;
      padding: 10px 12px;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
      background: linear-gradient(transparent, rgba(0,0,0,0.4));
      width: 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .book-body:hover .book-front-title {
      opacity: 1;
    }

    .book-side {
      position: absolute;
      left: -12px;
      top: 4px;
      bottom: 4px;
      width: 12px;
      border-radius: 3px 0 0 3px;
      box-shadow: -2px 0 6px rgba(0,0,0,0.1);
    }

    .book-pages {
      position: absolute;
      right: -4px;
      top: 4px;
      bottom: 4px;
      width: 4px;
      background: repeating-linear-gradient(
        to bottom,
        #f0f0f0, #f0f0f0 1px,
        #e0e0e0 1px, #e0e0e0 2px
      );
      border-radius: 0 2px 2px 0;
    }

    /* ── Controls ── */
    .book-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .book-title-text {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .book-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .privacy-label {
      font-size: 0.75rem;
      color: var(--gray);
    }

    .btn-xs {
      padding: 5px 10px;
      font-size: 0.78rem;
    }

    /* ── Loading skeletons ── */
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 40px 32px;
    }

    .skeleton-book {
      width: 160px;
      height: 220px;
      border-radius: 4px 12px 12px 4px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e9ecef 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── Empty ── */
    .empty-state {
      text-align: center;
      padding: 60px 40px;
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.4rem; margin-bottom: 8px; }
    .empty-state p { color: var(--gray); }
  `]
})
export class DashboardComponent implements OnInit {
  myZines = signal<Zine[]>([]);
  loading = signal(true);

  constructor(
    private zineService: ZineService,
    private toast: ToastService,
    private router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.zineService.getMyZines().subscribe({
      next: (zines) => {
        this.myZines.set(zines);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Could not load your zines.', 'error');
        this.loading.set(false);
      },
    });
  }

  openZine(zine: Zine) {
    this.router.navigate(['/zine', zine.slug]);
  }

  editZine(zine: Zine) {
    this.router.navigate(['/editor', zine.slug]);
  }

  togglePrivacy(zine: Zine) {
    this.zineService.togglePrivacy(zine.slug).subscribe({
      next: (res) => {
        this.myZines.update(arr => arr.map(z =>
          z.slug === zine.slug ? { ...z, is_public: res.is_public } : z
        ));
        this.toast.show(res.is_public ? 'Zine is now public 🌍' : 'Zine is now private 🔒', 'success');
      },
      error: () => this.toast.show('Could not update privacy.', 'error'),
    });
  }

  deleteZine(zine: Zine) {
    if (!confirm(`Delete "${zine.title}"? This cannot be undone.`)) return;
    this.zineService.deleteZine(zine.slug).subscribe({
      next: () => {
        this.myZines.update(arr => arr.filter(z => z.slug !== zine.slug));
        this.toast.show('Zine deleted.', 'info');
      },
      error: () => this.toast.show('Could not delete zine.', 'error'),
    });
  }

  darken(hex: string): string {
    // Simple darken: reduce brightness
    try {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      const d = (v: number) => Math.max(0, v - 40).toString(16).padStart(2,'0');
      return `#${d(r)}${d(g)}${d(b)}`;
    } catch { return hex; }
  }
}

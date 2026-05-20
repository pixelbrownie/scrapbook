import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ZineService, Zine } from '../../core/services/zine.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="explore-page stars-bg">
      <div class="explore-inner">
        <div class="explore-header fade-up">
          <h1>explore zines ✦</h1>
          <p>Discover mini-magazines made by the community</p>
        </div>

        <div class="explore-grid" *ngIf="!loading()">
          <div class="explore-card card" *ngFor="let zine of zines()">
            <a [routerLink]="['/zine', zine.slug]" class="card-link">
              <div class="ec-cover" [style.background-color]="zine.theme_color">
                <img *ngIf="zine.cover_image_url" [src]="zine.cover_image_url" class="ec-img" alt="" />
                <div class="ec-overlay">
                  <span class="ec-peek">Peek inside →</span>
                </div>
              </div>
            </a>
            <div class="ec-body">
              <div class="ec-meta">
                <a [routerLink]="['/user', zine.owner.username]" class="ec-author" (click)="$event.stopPropagation()">&#64;{{ zine.owner.username }}</a>
                <span class="ec-date">{{ zine.created_at | date:'shortDate' }}</span>
              </div>
              <h3>{{ zine.title }}</h3>
              <p *ngIf="zine.description">{{ zine.description }}</p>
            </div>
          </div>
        </div>

        <div class="loading-grid" *ngIf="loading()">
          <div class="skeleton-card" *ngFor="let s of [1,2,3,4,5,6]"></div>
        </div>

        <div class="empty-state card" *ngIf="!loading() && zines().length === 0">
          <div class="empty-icon">🌸</div>
          <h3>No public zines yet</h3>
          <p>Be the first to publish one!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .explore-page {
      min-height: 100vh;
      padding: 100px 24px 60px;
    }

    .explore-inner {
      max-width: 1100px;
      margin: 0 auto;
    }

    .explore-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .explore-header h1 {
      font-size: clamp(2rem, 4vw, 3rem);
      margin-bottom: 8px;
    }

    .explore-header p {
      color: var(--gray);
    }

    .explore-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }

    .explore-card { overflow: hidden; }

    .card-link { display: block; text-decoration: none; }

    .ec-cover {
      height: 200px;
      position: relative;
      overflow: hidden;
    }

    .ec-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .ec-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26,26,46,0);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }

    .explore-card:hover .ec-overlay {
      background: rgba(26,26,46,0.35);
    }

    .explore-card:hover .ec-img {
      transform: scale(1.05);
    }

    .ec-peek {
      color: white;
      font-family: var(--font-heading);
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .explore-card:hover .ec-peek { opacity: 1; }

    .ec-body { padding: 16px 18px; }

    .ec-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--gray);
      margin-bottom: 6px;
    }

    .ec-author {
      font-weight: 600;
      color: var(--pink-dark);
      text-decoration: none;
    }
    .ec-author:hover { text-decoration: underline; }

    .ec-body h3 {
      font-size: 1rem;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ec-body p {
      font-size: 0.85rem;
      color: var(--gray);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }

    .skeleton-card {
      height: 280px;
      border-radius: var(--radius);
      background: linear-gradient(90deg, #f3f4f6 25%, #e9ecef 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-state {
      text-align: center;
      padding: 60px;
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .empty-state h3 { font-size: 1.3rem; margin-bottom: 6px; }
    .empty-state p { color: var(--gray); }
  `]
})
export class ExploreComponent implements OnInit {
  zines = signal<Zine[]>([]);
  loading = signal(true);

  constructor(private zineService: ZineService) {}

  ngOnInit() {
    this.zineService.getPublicZines().subscribe({
      next: (z) => { this.zines.set(z); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

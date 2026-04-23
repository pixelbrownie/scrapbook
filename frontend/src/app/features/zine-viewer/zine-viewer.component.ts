import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ZineService, Zine } from '../../core/services/zine.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

const PAGE_ORDER = ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'back'];

@Component({
  selector: 'app-zine-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="viewer-page stars-bg" *ngIf="zine(); else loading">

      <!-- Header -->
      <div class="viewer-header">
        <a routerLink="/explore" class="btn btn-ghost">← Explore</a>
        <div class="viewer-title">
          <h1>{{ zine()!.title }}</h1>
          <span class="viewer-author">by {{ zine()!.owner.username }}</span>
        </div>
        <a *ngIf="isOwner()" [routerLink]="['/editor', zine()!.slug]" class="btn btn-secondary">Edit ✏️</a>
      </div>

      <!-- 3D Book Scene -->
      <div class="book-scene">
        <div class="flip-book" [style.transform]="getFlipbookTransform()">
          <div class="leaf" *ngFor="let leaf of leaves; let i = index"
               [style.zIndex]="i < currentLeaf() ? i + 1 : leaves.length - i"
               [class.flipped]="i < currentLeaf()"
               (click)="flipLeaf(i)">
            
            <div class="page-front" [style.background-color]="cellBg(leaf.front)">
               <img *ngIf="cellImg(leaf.front)" [src]="cellImg(leaf.front)" class="bpp-image" />
               <div *ngIf="cellText(leaf.front)" class="bpp-text" [style.color]="cellTextColor(leaf.front)">
                 {{ cellText(leaf.front) }}
               </div>
               <div class="bpp-label" *ngIf="!cellImg(leaf.front) && !cellText(leaf.front)">
                 {{ leaf.front === 'cover' ? 'Cover' : leaf.front }}
               </div>
            </div>

            <div class="page-back" [style.background-color]="cellBg(leaf.back)">
               <img *ngIf="cellImg(leaf.back)" [src]="cellImg(leaf.back)" class="bpp-image" />
               <div *ngIf="cellText(leaf.back)" class="bpp-text" [style.color]="cellTextColor(leaf.back)">
                 {{ cellText(leaf.back) }}
               </div>
               <div class="bpp-label" *ngIf="!cellImg(leaf.back) && !cellText(leaf.back)">
                 {{ leaf.back === 'back' ? 'Back' : leaf.back }}
               </div>
            </div>

          </div>
        </div>

        <!-- Navigation -->
        <div class="viewer-nav">
          <button class="nav-btn" (click)="flipBook(-1)" [disabled]="currentLeaf() === 0">
            <span>←</span>
          </button>
          <div class="page-dots">
            <div *ngFor="let leaf of leaves; let i = index"
              class="dot"
              [class.active]="i === currentLeaf()"
              (click)="goToLeaf(i)">
            </div>
            <div class="dot" [class.active]="leaves.length === currentLeaf()" (click)="goToLeaf(leaves.length)"></div>
          </div>
          <button class="nav-btn" (click)="flipBook(1)" [disabled]="currentLeaf() === leaves.length">
            <span>→</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Loading state -->
    <ng-template #loading>
      <div class="viewer-loading stars-bg">
        <div class="loading-book">
          <div class="lb-cover"></div>
          <div class="lb-pages"></div>
        </div>
        <p>Loading your zine...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .viewer-page {
      min-height: 100vh;
      padding-top: 68px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Header ── */
    .viewer-header {
      width: 100%;
      max-width: 900px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .viewer-title {
      text-align: center;
      flex: 1;
    }

    .viewer-title h1 {
      font-size: 1.4rem;
      margin-bottom: 2px;
    }

    .viewer-author {
      font-size: 0.85rem;
      color: var(--gray);
    }

    /* ── Book Scene ── */
    .book-scene {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 20px;
      width: 100%;
      perspective: 2000px;
    }
    .flip-book {
      width: 240px;
      height: 336px;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .leaf {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: left center;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
      cursor: pointer;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }
    .leaf.flipped {
      transform: rotateY(-180deg);
      box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    }
    .page-front, .page-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0,0,0,0.1);
      overflow: hidden;
      background: white;
    }
    .page-front {
      border-radius: 2px 8px 8px 2px;
    }
    .page-back {
      transform: rotateY(180deg);
      border-radius: 8px 2px 2px 8px;
    }
    .bpp-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      inset: 0;
    }
    .bpp-text {
      font-size: 1.1rem;
      text-align: center;
      padding: 24px;
      z-index: 1;
    }
    .bpp-label {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      color: #cbd5e1;
      z-index: 1;
    }

    /* ── Navigation ── */
    .viewer-nav {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 20px;
    }

    .nav-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid var(--pink);
      background: var(--white);
      color: var(--dark);
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-bounce);
      box-shadow: var(--shadow-warm);
    }

    .nav-btn:hover:not(:disabled) {
      background: var(--pink);
      transform: scale(1.1);
    }

    .nav-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .nav-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .page-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e5e7eb;
      cursor: pointer;
      transition: all var(--transition-bounce);
    }

    .dot.active {
      background: var(--pink-dark);
      transform: scale(1.4);
    }

    .dot:hover { background: var(--pink); }

    /* ── Loading ── */
    .viewer-loading {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding-top: 68px;
    }

    .loading-book {
      width: 120px;
      height: 160px;
      position: relative;
      animation: floatAnim 2s ease-in-out infinite;
    }

    .lb-cover {
      width: 100%;
      height: 100%;
      background: var(--pink);
      border-radius: 4px 12px 12px 4px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .lb-pages {
      position: absolute;
      right: -6px;
      top: 4px;
      bottom: 4px;
      width: 6px;
      background: repeating-linear-gradient(
        to bottom,
        #f0f0f0, #f0f0f0 2px,
        #ddd 2px, #ddd 4px
      );
    }

    .viewer-loading p {
      color: var(--gray);
      font-family: var(--font-heading);
    }
  `]
})
export class ZineViewerComponent implements OnInit {
  zine = signal<Zine | null>(null);
  leaves = [
    { front: 'cover', back: 'page1' },
    { front: 'page2', back: 'page3' },
    { front: 'page4', back: 'page5' },
    { front: 'page6', back: 'back' }
  ];
  currentLeaf = signal(0);

  constructor(
    private route: ActivatedRoute,
    private zineService: ZineService,
    public auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.zineService.getZine(slug).subscribe({
      next: z => this.zine.set(z),
      error: () => this.toast.show('Could not load zine.', 'error'),
    });
  }

  cellImg(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.image_url ?? '';
  }

  cellBg(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.bg_color ?? (key === 'cover' ? (this.zine()?.theme_color ?? '#F3B0C3') : '#ffffff');
  }

  cellText(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.text_content ?? '';
  }

  cellTextColor(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.text_color ?? '#1a1a2e';
  }

  getFlipbookTransform(): string {
    if (this.currentLeaf() === 0) return 'translateX(0)';
    if (this.currentLeaf() === this.leaves.length) return 'translateX(240px)';
    return 'translateX(120px)';
  }

  flipLeaf(index: number) {
    if (index === this.currentLeaf()) {
      // Clicked top right, flip to next
      this.currentLeaf.set(this.currentLeaf() + 1);
    } else if (index === this.currentLeaf() - 1) {
      // Clicked top left, unflip
      this.currentLeaf.set(this.currentLeaf() - 1);
    } else {
      if (index > this.currentLeaf()) {
        this.currentLeaf.set(index + 1);
      } else {
        this.currentLeaf.set(index);
      }
    }
  }

  flipBook(dir: number) {
    const next = this.currentLeaf() + dir;
    if (next < 0 || next > this.leaves.length) return;
    this.currentLeaf.set(next);
  }

  goToLeaf(i: number) {
    this.currentLeaf.set(i);
  }

  isOwner(): boolean {
    return this.auth.currentUser()?.username === this.zine()?.owner?.username;
  }
}

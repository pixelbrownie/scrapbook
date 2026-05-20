import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ZineService, Zine } from '../../core/services/zine.service';
import { AuthService, User } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { apiErrorMessage } from '../../core/utils/api-error';

type SocialTab = 'zines' | 'followers' | 'following';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-page stars-bg">
      <div class="profile-inner" *ngIf="user()">

        <div class="profile-card card fade-up">
          <div class="profile-avatar" (click)="triggerAvatarUpload()" title="Click to change photo">
            <img *ngIf="user()!.avatar" [src]="user()!.avatar" alt="avatar" />
            <span *ngIf="!user()!.avatar" class="avatar-initial">
              {{ user()!.username[0].toUpperCase() }}
            </span>
            <span class="avatar-overlay">📷</span>
          </div>
          <input #avatarInput type="file" accept="image/*" hidden (change)="onAvatarSelected($event)" />

          <div class="profile-info">
            <h1>&#64;{{ user()!.username }}</h1>
            <p class="profile-email" *ngIf="user()!.email">{{ user()!.email }}</p>
            <p class="profile-bio" *ngIf="!editingBio()">
              {{ user()!.bio || 'No bio yet...' }}
              <button class="btn btn-ghost" style="font-size:0.8rem; padding:4px 8px;" (click)="startEditBio()">edit</button>
            </p>
            <div class="bio-edit" *ngIf="editingBio()">
              <textarea class="input" rows="2" [(ngModel)]="bioDraft" placeholder="Tell the world about yourself..."></textarea>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn btn-primary btn-sm" (click)="saveBio()">Save</button>
                <button class="btn btn-ghost btn-sm" (click)="editingBio.set(false)">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-stats card">
          <button class="stat" [class.active]="tab() === 'zines'" (click)="setTab('zines')">
            <span class="stat-num">{{ myZines().length }}</span>
            <span class="stat-label">zines</span>
          </button>
          <button class="stat" [class.active]="tab() === 'followers'" (click)="setTab('followers')">
            <span class="stat-num">{{ user()!.followers_count ?? 0 }}</span>
            <span class="stat-label">followers</span>
          </button>
          <button class="stat" [class.active]="tab() === 'following'" (click)="setTab('following')">
            <span class="stat-num">{{ user()!.following_count ?? 0 }}</span>
            <span class="stat-label">following</span>
          </button>
        </div>

        <div *ngIf="tab() === 'zines'">
          <h2 class="section-title">All Zines</h2>
          <div class="zines-grid" *ngIf="myZines().length > 0">
            <div class="zine-card card" *ngFor="let zine of myZines()">
              <div class="zine-cover" [style.background-color]="zine.theme_color">
                <img *ngIf="zine.cover_image_url" [src]="zine.cover_image_url" class="zc-img" alt="" />
                <span class="zine-visibility">{{ zine.is_public ? '🌍' : '🔒' }}</span>
              </div>
              <div class="zine-card-body">
                <h3>{{ zine.title }}</h3>
                <p class="zine-date">{{ zine.created_at | date:'mediumDate' }}</p>
                <div class="zine-card-actions">
                  <a [routerLink]="['/editor', zine.slug]" class="btn btn-secondary btn-xs">Edit</a>
                  <a [routerLink]="['/zine', zine.slug]" class="btn btn-ghost btn-xs">View</a>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state card" *ngIf="myZines().length === 0 && !loading()">
            <div class="empty-icon">📖</div>
            <h3>No zines yet</h3>
            <a routerLink="/editor" class="btn btn-primary mt-16">Create your first zine</a>
          </div>
        </div>

        <div *ngIf="tab() === 'followers'" class="social-list">
          <div class="social-row card" *ngFor="let u of followers()">
            <a [routerLink]="['/user', u.username]" class="social-link">
              <div class="mini-avatar">
                <img *ngIf="u.avatar" [src]="u.avatar" alt="" />
                <span *ngIf="!u.avatar">{{ u.username[0].toUpperCase() }}</span>
              </div>
              <span class="social-name">&#64;{{ u.username }}</span>
            </a>
          </div>
          <p class="empty-hint" *ngIf="followers().length === 0">No followers yet. Share your zines!</p>
        </div>

        <div *ngIf="tab() === 'following'" class="social-list">
          <div class="social-row card" *ngFor="let u of following()">
            <a [routerLink]="['/user', u.username]" class="social-link">
              <div class="mini-avatar">
                <img *ngIf="u.avatar" [src]="u.avatar" alt="" />
                <span *ngIf="!u.avatar">{{ u.username[0].toUpperCase() }}</span>
              </div>
              <span class="social-name">&#64;{{ u.username }}</span>
            </a>
          </div>
          <p class="empty-hint" *ngIf="following().length === 0">
            Not following anyone yet.
            <a routerLink="/search">Find creators</a>
          </p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-page { min-height: 100vh; padding: 100px 24px 60px; }
    .profile-inner { max-width: 900px; margin: 0 auto; }

    .profile-card {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      padding: 32px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .profile-avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: var(--pink);
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--pink-dark);
      cursor: pointer;
      position: relative;
    }

    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initial { font-family: var(--font-heading); font-size: 2.2rem; font-weight: 700; }
    .avatar-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.35);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .profile-avatar:hover .avatar-overlay { opacity: 1; }

    .profile-info { flex: 1; min-width: 200px; }
    .profile-info h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .profile-email { color: var(--gray); font-size: 0.9rem; margin-bottom: 8px; }
    .profile-bio { font-size: 0.95rem; color: var(--dark); }
    .bio-edit { margin-top: 8px; }

    .profile-stats {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      margin-bottom: 28px;
    }

    .stat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 16px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: inherit;
      transition: background var(--transition);
    }

    .stat:hover, .stat.active { background: var(--pink-light); }
    .stat-num { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--pink-dark); }
    .stat-label { font-size: 0.8rem; color: var(--gray); }

    .section-title { font-size: 1.3rem; margin-bottom: 20px; font-family: var(--font-heading); }

    .zines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .zine-card { overflow: hidden; }
    .zine-cover { height: 140px; position: relative; overflow: hidden; }
    .zc-img { width: 100%; height: 100%; object-fit: cover; }
    .zine-visibility { position: absolute; top: 8px; right: 8px; font-size: 1.1rem; }
    .zine-card-body { padding: 14px 16px; }
    .zine-card-body h3 { font-size: 0.95rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .zine-date { font-size: 0.78rem; color: var(--gray); margin-bottom: 10px; }
    .zine-card-actions { display: flex; gap: 6px; }
    .btn-xs { padding: 5px 10px; font-size: 0.78rem; }
    .btn-sm { padding: 8px 16px; font-size: 0.85rem; }

    .social-list { display: flex; flex-direction: column; gap: 10px; }
    .social-row { padding: 14px 18px; }
    .social-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .mini-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--pink);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-family: var(--font-heading);
      border: 2px solid var(--pink-dark);
    }
    .mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .social-name { font-family: var(--font-heading); font-weight: 600; }
    .empty-hint { text-align: center; color: var(--gray); padding: 32px; }
    .empty-hint a { color: var(--pink-dark); font-weight: 600; }

    .empty-state { text-align: center; padding: 48px; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
  `],
})
export class ProfileComponent implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  user = signal<User | null>(null);
  myZines = signal<Zine[]>([]);
  followers = signal<User[]>([]);
  following = signal<User[]>([]);
  loading = signal(true);
  editingBio = signal(false);
  bioDraft = '';
  tab = signal<SocialTab>('zines');

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private zineService: ZineService,
    private userService: UserService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.refreshProfile();
    this.zineService.getMyZines().subscribe({
      next: (z) => { this.myZines.set(z); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  refreshProfile() {
    this.http.get<User>(`${environment.apiUrl}/auth/me/`).subscribe({
      next: (u) => {
        this.user.set(u);
        this.auth.currentUser.set(u);
        localStorage.setItem('pb_user', JSON.stringify(u));
        this.loadSocial(u.username);
      },
    });
  }

  loadSocial(username: string) {
    this.userService.getFollowers(username).subscribe({
      next: (u) => this.followers.set(u),
    });
    this.userService.getFollowing(username).subscribe({
      next: (u) => this.following.set(u),
    });
  }

  setTab(t: SocialTab) {
    this.tab.set(t);
  }

  triggerAvatarUpload() {
    this.avatarInput.nativeElement.click();
  }

  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.userService.uploadAvatar(file).subscribe({
      next: (u) => {
        this.user.set(u);
        this.auth.currentUser.set(u);
        localStorage.setItem('pb_user', JSON.stringify(u));
        this.toast.show('Profile photo updated!', 'success');
        this.avatarInput.nativeElement.value = '';
      },
      error: (err) => {
        this.toast.show(apiErrorMessage(err, 'Could not upload photo.'), 'error');
        this.avatarInput.nativeElement.value = '';
      },
    });
  }

  startEditBio() {
    this.bioDraft = this.user()?.bio ?? '';
    this.editingBio.set(true);
  }

  saveBio() {
    this.auth.updateMe({ bio: this.bioDraft }).subscribe({
      next: (u) => {
        this.user.set(u);
        this.toast.show('Bio updated!', 'success');
        this.editingBio.set(false);
      },
      error: () => this.toast.show('Could not update bio.', 'error'),
    });
  }
}

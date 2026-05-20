import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ZineService, Zine } from '../../core/services/zine.service';
import { AuthService, User } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { apiErrorMessage } from '../../core/utils/api-error';

type SocialTab = 'zines' | 'followers' | 'following';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page stars-bg">
      <div class="profile-inner" *ngIf="profile()">

        <div class="profile-card card fade-up">
          <div class="profile-avatar">
            <img *ngIf="profile()!.avatar" [src]="profile()!.avatar" alt="" />
            <span *ngIf="!profile()!.avatar" class="avatar-initial">
              {{ profile()!.username[0].toUpperCase() }}
            </span>
          </div>

          <div class="profile-info">
            <h1>&#64;{{ profile()!.username }}</h1>
            <p class="profile-bio">{{ profile()!.bio || 'No bio yet.' }}</p>
          </div>

          <button
            *ngIf="!profile()!.is_self && auth.isLoggedIn()"
            class="btn follow-btn"
            [class.btn-primary]="!profile()!.is_following"
            [class.btn-secondary]="profile()!.is_following"
            [disabled]="followLoading()"
            (click)="toggleFollow()"
          >
            {{ followLoading() ? '...' : (profile()!.is_following ? 'Following' : 'Follow') }}
          </button>

          <a *ngIf="profile()!.is_self" routerLink="/profile" class="btn btn-secondary">Edit profile</a>
        </div>

        <div class="profile-stats card">
          <button class="stat" [class.active]="tab() === 'zines'" (click)="setTab('zines')">
            <span class="stat-num">{{ zines().length }}</span>
            <span class="stat-label">zines</span>
          </button>
          <button class="stat" [class.active]="tab() === 'followers'" (click)="setTab('followers')">
            <span class="stat-num">{{ profile()!.followers_count ?? 0 }}</span>
            <span class="stat-label">followers</span>
          </button>
          <button class="stat" [class.active]="tab() === 'following'" (click)="setTab('following')">
            <span class="stat-num">{{ profile()!.following_count ?? 0 }}</span>
            <span class="stat-label">following</span>
          </button>
        </div>

        <div *ngIf="tab() === 'zines'" class="zines-grid">
          <div class="zine-card card" *ngFor="let zine of zines()">
            <a [routerLink]="['/zine', zine.slug]" class="zine-cover" [style.background-color]="zine.theme_color">
              <img *ngIf="zine.cover_image_url" [src]="zine.cover_image_url" class="zc-img" alt="" />
            </a>
            <div class="zine-card-body">
              <h3>{{ zine.title }}</h3>
              <p class="zine-date">{{ zine.created_at | date:'mediumDate' }}</p>
            </div>
          </div>
          <div class="empty-state card" *ngIf="zines().length === 0 && !loading()">
            <p>No public zines yet.</p>
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
          <p class="empty-hint" *ngIf="followers().length === 0">No followers yet.</p>
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
          <p class="empty-hint" *ngIf="following().length === 0">Not following anyone yet.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-page { min-height: 100vh; padding: 100px 24px 60px; }
    .profile-inner { max-width: 900px; margin: 0 auto; }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 32px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .profile-avatar {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: var(--pink);
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--pink-dark);
    }

    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initial { font-family: var(--font-heading); font-size: 2.2rem; font-weight: 700; }
    .profile-info { flex: 1; min-width: 180px; }
    .profile-info h1 { font-size: 1.5rem; margin-bottom: 6px; }
    .profile-bio { color: var(--gray); font-size: 0.95rem; }
    .follow-btn { flex-shrink: 0; }

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

    .zines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .zine-card { overflow: hidden; }
    .zine-cover { display: block; height: 140px; position: relative; overflow: hidden; text-decoration: none; }
    .zc-img { width: 100%; height: 100%; object-fit: cover; }
    .zine-card-body { padding: 14px 16px; }
    .zine-card-body h3 { font-size: 0.95rem; margin-bottom: 4px; }
    .zine-date { font-size: 0.78rem; color: var(--gray); }

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
    .empty-hint, .empty-state { text-align: center; color: var(--gray); padding: 32px; }
  `],
})
export class UserProfileComponent implements OnInit {
  profile = signal<User | null>(null);
  zines = signal<Zine[]>([]);
  followers = signal<User[]>([]);
  following = signal<User[]>([]);
  tab = signal<SocialTab>('zines');
  loading = signal(true);
  followLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private zineService: ZineService,
    public auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');
      if (!username) return;
      this.loadProfile(username);
    });
  }

  loadProfile(username: string) {
    this.loading.set(true);
    this.userService.getProfile(username).subscribe({
      next: (user) => {
        this.profile.set(user);
        this.loading.set(false);
        this.loadZines(username);
        this.loadSocial(username);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.show(apiErrorMessage(err, 'User not found.'), 'error');
      },
    });
  }

  loadZines(username: string) {
    this.zineService.getUserPublicZines(username).subscribe({
      next: (z) => this.zines.set(z),
      error: () => this.zines.set([]),
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

  toggleFollow() {
    const p = this.profile();
    if (!p || p.is_self) return;
    this.followLoading.set(true);
    const req = p.is_following
      ? this.userService.unfollow(p.username)
      : this.userService.follow(p.username);

    req.subscribe({
      next: (res) => {
        this.profile.update((u) =>
          u ? { ...u, is_following: res.following, followers_count: res.followers_count } : u,
        );
        this.followLoading.set(false);
        this.loadSocial(p.username);
        this.toast.show(res.following ? `Following @${p.username}` : `Unfollowed @${p.username}`, 'success');
      },
      error: (err) => {
        this.followLoading.set(false);
        this.toast.show(apiErrorMessage(err, 'Could not update follow.'), 'error');
      },
    });
  }
}

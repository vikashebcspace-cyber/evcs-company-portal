import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, TokenPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'company_access_token';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/company/login/`, { email, password })
      .pipe(tap(res => { if (this.isBrowser) localStorage.setItem(this.TOKEN_KEY, res.access); }));
  }

  logout() {
    if (this.isBrowser) localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    } catch {
      return null;
    }
  }

  getCompanyId(): number | null {
    return this.getPayload()?.company_id ?? null;
  }

  getCompanyName(): string {
    return this.getPayload()?.company_name ?? '';
  }

  getBuildingName(): string {
    return this.getPayload()?.building_name ?? '';
  }
}

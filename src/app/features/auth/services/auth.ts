import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { SecureStorageService } from '../../../core/services/secure-storage.service';
import { Router } from '@angular/router';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface LoginResponse {
  user: any;
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.api}auth`;
  private firebaseAuth = (() => {
    const app = getApps().length ? getApps()[0] : initializeApp(environment.firebase);
    return getAuth(app);
  })();

  constructor(
    private http: HttpClient,
    private storage: SecureStorageService,
    private readonly router:Router
  ) {}

  login(correo: string, clave: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { correo, clave })
      .pipe(tap((resp) => this.setSession(resp)));
  }

  loginWithGoogle(): Observable<LoginResponse> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      switchMap((result) => from(result.user.getIdToken())),
      switchMap((idToken) =>
        this.http.post<LoginResponse>(`${this.apiUrl}/google/usuario`, { idToken })
      ),
      tap((resp) => this.setSession(resp))
    );
  }

  private setSession(resp: LoginResponse): void {
    console.log('Guardando sesión segura');

    localStorage.setItem('accessToken', resp.accessToken);
    this.storage.setJson('user', resp.user);
  }

  get token(): string | null {
    return localStorage.getItem('accessToken');
  }

  get user(): any {
    return this.storage.getJson<any>('user');
  }

  logout(): void {
   this.storage.delete('accessToken');
   this.storage.delete('user');
   this.router.navigate(['/']);
  }

  refreshToken(): Observable<{ token: string; rtoken: string }> {
    const rtoken = this.token;

    if (!rtoken) {
      throw new Error('No refresh token');
    }

    return this.http
      .get<{ token: string; rtoken: string }>(`${this.apiUrl}/refresh-token`)
      .pipe(
        tap((resp:any) => {
          console.log('Token refrescado, actualizando sesión segura', resp);
          localStorage.setItem('accessToken', resp.token);
           this.storage.setJson('user', resp.user);
        }),
      );
  }
}

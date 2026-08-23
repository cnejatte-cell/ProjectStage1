import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000';

  login(credentials: { username: string; password: string }): Observable<any> {
    // Backend Django REST Framework (décommenter en production)
    /*
    return this.http.post<any>(`${this.apiUrl}/api-token-auth/`, credentials).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.role) {
          localStorage.setItem('role', res.role);
        }
      })
    );
    */

    // Mode Test Frontend : enregistrement direct du token et du rôle ADMIN
    localStorage.setItem('token', 'fake-jwt-token-123456');
    localStorage.setItem('role', 'ADMIN');
    return of({ token: 'fake-jwt-token-123456', role: 'ADMIN' });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  // Vérification des rôles (Opérateurs || corrigés)
  isNurse(): boolean {
    const role = this.getUserRole();
    return role === 'NURSE' || role === 'Infirmiere' || role === 'Infirmière';
  }

  isDoctor(): boolean {
    const role = this.getUserRole();
    return role === 'DOCTOR' || role === 'Medecin' ||  role === 'Médecin';
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ADMIN' || role === 'Administrateur';
  }
}
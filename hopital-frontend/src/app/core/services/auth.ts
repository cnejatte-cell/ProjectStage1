import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8080/api';

  // =========================
  // LOGIN
  // =========================

  login(credentials: { username: string; password: string }): Observable<any> {
  // 1. Nettoyage des espaces involontaires dans le nom d'utilisateur
  const payload = {
    username: credentials.username ? credentials.username.trim() : '',
    password: credentials.password
  };

  console.log('Données envoyées au serveur Django :', payload);

  return this.http.post<any>(`${this.apiUrl}/login/`, payload).pipe(
    tap((res) => {
      console.log('LOGIN RESPONSE =', res);

      // Stockage du Token
      if (res.token) {
        localStorage.setItem('token', res.token);
      }

      // Stockage du Rôle
      if (res.role) {
        const role = String(res.role).trim().toUpperCase();
        localStorage.setItem('role', role);
      }

      // Stockage du Nom d'utilisateur
      if (res.username) {
        localStorage.setItem('username', res.username);
      }

      console.log('TOKEN STOCKÉ =', localStorage.getItem('token'));
      console.log('ROLE STOCKÉ =', localStorage.getItem('role'));
    })
  );
}
  // =========================
  // GETTERS & STATUS
  // =========================

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const role = localStorage.getItem('role');
    return role ? role.trim().toUpperCase() : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }

  // =========================
  // ROLE HELPERS
  // =========================

  isNurse(): boolean {
    return this.getUserRole() === 'NURSE';
  }

  isDoctor(): boolean {
    return this.getUserRole() === 'DOCTOR';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }
}
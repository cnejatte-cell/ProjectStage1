import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserAccount {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'MEDECIN' | 'INFIRMIER' | 'DOCTOR' | 'NURSE';
  telephone?: string;
  is_active?: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8080/api/admin/users/';

 private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  });
}

  getUsers(): Observable<UserAccount[]> {
    return this.http.get<UserAccount[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  createUser(user: UserAccount): Observable<UserAccount> {
    return this.http.post<UserAccount>(this.apiUrl, user, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, user: Partial<UserAccount>): Observable<UserAccount> {
    return this.http.put<UserAccount>(`${this.apiUrl}${id}/`, user, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }
}
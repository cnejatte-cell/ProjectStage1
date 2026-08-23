import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';

interface Consultation {
  id?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  apiUrl = 'http://localhost:8000/api';
  credentials = { username: '', password: '' };
  errorMessage = '';

  onSubmit(): void {
    // Stocke les fausses données de session
    localStorage.setItem('token', 'fake-jwt-token-123456');
    localStorage.setItem('role', 'ADMIN');

    // Force la re-navigation vers la page des patients
    this.router.navigateByUrl('/patients').then((success) => {
      if (!success) {
        console.error('La navigation vers /patients a échoué. Vérifiez vos routes.');
      }
    });

    // Subscribe to the HTTP call instead of returning it
    this.http.get<Consultation[]>(`${this.apiUrl}/consultations/`).subscribe({
      next: (data) => {
        console.log('Consultations:', data);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des consultations:', err);
      }
    });
  }
}
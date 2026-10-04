import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

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

  credentials = { username: '', password: '' };
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        console.log('Login success:', res);

        // Récupération du rôle stocké dans le service/localStorage
        const role = this.authService.getUserRole();
        console.log('ROLE:', role);

        // =========================
        // REDIRECTION SELON LE RÔLE
        // =========================
        if (role === 'ADMIN') {
          this.router.navigateByUrl('/patients');
        } else if (role === 'NURSE') {
          this.router.navigateByUrl('/infirmiere');
        } else if (role === 'DOCTOR') {
          this.router.navigateByUrl('/medecin');
        } else {
          console.warn('Role inconnu :', role);
          this.errorMessage = 'Rôle utilisateur non reconnu.';
        }
      },
      error: (err) => {
        console.error('Erreur détaillée:', err);
        this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
      }
    });
  }
}
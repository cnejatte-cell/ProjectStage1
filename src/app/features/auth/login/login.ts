import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  apiUrl = 'http://localhost:8080/api'; // أو الرابط الخاص بالـ backend لديكِ
  credentials = { username: '', password: '' };
  errorMessage = '';

  onSubmit(): void {

  this.authService.login(this.credentials).subscribe({

    next: (res) => {

      console.log('Login success:', res);

      const role = this.authService.getUserRole();

      console.log('ROLE:', role);


      // =========================
      // ADMIN
      // =========================

      if (role === 'ADMIN') {

        this.router.navigateByUrl('/patients');

      }


      // =========================
      // INFIRMIERE
      // =========================

      else if (role === 'NURSE') {

        this.router.navigateByUrl('/infirmiere');

      }


      // =========================
      // MEDECIN
      // =========================

      else if (role === 'DOCTOR') {

        this.router.navigateByUrl('/medecin');

      }


      // =========================
      // ROLE INCONNU
      // =========================

      else {

        console.warn(
          'Role inconnu :',
          role
        );

        this.errorMessage =
          'Rôle utilisateur non reconnu.';
      }

    },

    error: (err) => {

      console.error(
        'Erreur détaillée:',
        err
      );

      this.errorMessage =
        'Nom d\'utilisateur ou mot de passe incorrect';

    }

  });
  }
}
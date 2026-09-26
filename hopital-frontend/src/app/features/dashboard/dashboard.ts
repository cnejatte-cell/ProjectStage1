import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import {
  ClinicService,
  Patient,
  Admission,
  Constante
} from '../../clinic.service';

import { AuthService } from '../../core/services/auth';

interface PatientUrgence {
  patient: Patient;
  admission: Admission;
  urgence: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // =========================
  // ROLE & RECHERCHE
  // =========================
  userRole = '';
  searchTerm = '';

  // =========================
  // ETATS
  // =========================
  loading = true;
  errorMessage = '';

  // =========================
  // DONNEES
  // =========================
  patients: Patient[] = [];
  admissions: Admission[] = [];
  constantes: Constante[] = [];

  // =========================
  // STATISTIQUES
  // =========================
  totalPatients = 0;
  totalAdmissions = 0;
  patientsChezInfirmiere = 0;
  patientsChezMedecin = 0;
  admissionsTerminees = 0;

  // =========================
  // URGENCES
  // =========================
  patientsVerts: PatientUrgence[] = [];
  patientsJaunes: PatientUrgence[] = [];
  patientsRouges: PatientUrgence[] = [];
  patientsGris: PatientUrgence[] = [];

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.userRole = (this.authService.getUserRole() || '').trim().toUpperCase();
    console.log('ROLE DASHBOARD =', this.userRole);
    this.loadDashboard();
  }

  // =========================
  // ACTUALISER DASHBOARD
  // =========================
  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // RESET
    this.patients = [];
    this.admissions = [];
    this.constantes = [];

    this.totalPatients = 0;
    this.totalAdmissions = 0;
    this.patientsChezInfirmiere = 0;
    this.patientsChezMedecin = 0;
    this.admissionsTerminees = 0;

    this.patientsVerts = [];
    this.patientsJaunes = [];
    this.patientsRouges = [];
    this.patientsGris = [];

    this.loadPatients();
  }

  // =========================
  // ROLE HELPERS
  // =========================
  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  isNurse(): boolean {
    return this.userRole === 'NURSE';
  }

  isDoctor(): boolean {
    return this.userRole === 'DOCTOR';
  }

  // =========================
  // LOAD PATIENTS
  // =========================
  loadPatients(): void {
    this.clinicService.getPatients().subscribe({
      next: patients => {
        console.log('PATIENTS DASHBOARD =', patients);
        this.patients = patients;
        this.totalPatients = patients.length;
        this.loadAdmissions();
      },
      error: error => {
        console.error('ERREUR PATIENTS =', error);
        this.errorMessage = 'Impossible de charger les patients.';
        this.patients = [];
        this.totalPatients = 0;
        this.loadAdmissions();
      }
    });
  }

  // =========================
  // LOAD ADMISSIONS
  // =========================
  loadAdmissions(): void {
    this.clinicService.getAdmissions().subscribe({
      next: admissions => {
        console.log('ADMISSIONS DASHBOARD =', admissions);
        this.admissions = admissions;

        this.totalAdmissions = admissions.length;

        this.patientsChezInfirmiere = admissions.filter(admission => {
          const statut = admission.statut?.trim().toUpperCase();
          return statut === 'EN_ATTENTE';
        }).length;

        this.patientsChezMedecin = admissions.filter(admission => {
          const statut = admission.statut?.trim().toUpperCase();
          return statut === 'CHEZ_MEDECIN';
        }).length;

        this.admissionsTerminees = admissions.filter(admission => {
          const statut = admission.statut?.trim().toUpperCase();
          return statut === 'TERMINE';
        }).length;

        this.loadConstantes();
      },
      error: error => {
        console.error('ERREUR ADMISSIONS =', error);
        this.errorMessage = 'Impossible de charger les admissions.';
        this.admissions = [];
        this.totalAdmissions = 0;
        this.loadConstantes();
      }
    });
  }

  // =========================
  // LOAD CONSTANTES
  // =========================
  loadConstantes(): void {
    this.clinicService.getConstantes().subscribe({
      next: constantes => {
        console.log('CONSTANTES DASHBOARD =', constantes);
        this.constantes = constantes;
        this.organizePatientsByUrgence();
        this.finishLoading();
      },
      error: error => {
        console.error('ERREUR CONSTANTES =', error);
        this.constantes = [];
        this.finishLoading();
      }
    });
  }

  // =========================
  // ORGANISER PAR URGENCE
  // =========================
  organizePatientsByUrgence(): void {
    this.patientsVerts = [];
    this.patientsJaunes = [];
    this.patientsRouges = [];
    this.patientsGris = [];

    const admissionsActives = this.admissions.filter(
      admission => admission.statut?.trim().toUpperCase() !== 'TERMINE'
    );

    admissionsActives.forEach(admission => {
      if (!admission.id) return;

      const constantesAdmission = this.constantes.filter(
        constante => constante.admission === admission.id
      );

      if (constantesAdmission.length === 0) {
        const patient = this.getPatientFromAdmission(admission);
        if (!patient) return;

        this.patientsGris.push({
          patient,
          admission,
          urgence: 'GRIS'
        });
        return;
      }

      const derniereConstante = constantesAdmission[constantesAdmission.length - 1];
      const urgence = derniereConstante.degre_urgence?.trim().toUpperCase();
      const patient = this.getPatientFromAdmission(admission);

      if (!patient) return;

      const patientUrgence: PatientUrgence = {
        patient,
        admission,
        urgence: urgence || 'GRIS'
      };

      if (urgence === 'ROUGE') {
        this.patientsRouges.push(patientUrgence);
      } else if (urgence === 'JAUNE') {
        this.patientsJaunes.push(patientUrgence);
      } else if (urgence === 'VERT') {
        this.patientsVerts.push(patientUrgence);
      } else {
        this.patientsGris.push(patientUrgence);
      }
    });
  }

  // =========================
  // TROUVER PATIENT
  // =========================
  getPatientFromAdmission(admission: Admission): Patient | undefined {
    const patientId = admission.patient?.id;
    return this.patients.find(patient => patient.id === patientId);
  }

  // =========================
  // FIN CHARGEMENT
  // =========================
  finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }

  // =========================
  // GETTERS & DECONNEXION
  // =========================
  get totalUrgences(): number {
    return (
      this.patientsRouges.length +
      this.patientsJaunes.length +
      this.patientsVerts.length +
      this.patientsGris.length
    );
  }

  onLogout(): void {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Voulez-vous vraiment vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Déconnexion',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'medlink-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
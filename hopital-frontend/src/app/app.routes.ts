import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { PatientListComponent } from './features/patients/patient-list/patient-list';
import { MedicalRecordComponent } from './features/patients/medical-record/medical-record';
import { InfirmiereComponent } from './features/infirmiere/infirmiere';
import { MedecinComponent } from './features/medecin/medecin';
import { HistoriqueComponent } from './features/historique/historique';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

import { AdmissionsComponent } from './features/admissions/admissions';
import { RendezVousComponent } from './features/rendez-vous/rendez-vous';
import { UserManagementComponent } from './features/user-management/user-management';

export const routes: Routes = [
  // 1. PAGE D'ACCUEIL
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // 2. AUTHENTIFICATION
  {
    path: 'login',
    component: LoginComponent
  },

  // 3. ESPACES DÉDIÉS STRICTS PAR RÔLE
  {
    path: 'infirmiere',
    component: InfirmiereComponent,
    canActivate: [authGuard],
    data: { roles: ['NURSE', 'INFIRMIER'] }
  },
  {
    path: 'medecin',
    component: MedecinComponent,
    canActivate: [authGuard],
    data: { roles: ['DOCTOR', 'MEDECIN'] }
  },

  // 4. ESPACES D'ADMINISTRATION (RÉSERVÉS STRICTEMENT À L'ADMIN)
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'patients',
    component: PatientListComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] } // Restreint à l'ADMIN pour ne plus être accessible par NURSE/DOCTOR
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },

  // 5. FONCTIONNALITÉS PARTAGÉES SPÉCIFIQUES
  {
    path: 'rendez-vous',
    component: RendezVousComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'DOCTOR'] }
  },
  {
    path: 'admissions',
    component: AdmissionsComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE'] }
  },

  // 6. DOSSIER MÉDICAL & HISTORIQUE
  {
    path: 'patients/:id/medical-record',
    component: MedicalRecordComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'DOCTOR', 'NURSE'] }
  },
  {
    path: 'historique',
    component: HistoriqueComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'DOCTOR'] }
  },

  // 7. ROUTE INCONNUE
  {
    path: '**',
    redirectTo: 'login'
  }
];
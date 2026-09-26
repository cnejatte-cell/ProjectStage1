import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { PatientListComponent } from './features/patients/patient-list/patient-list';
import { MedicalRecordComponent } from './features/patients/medical-record/medical-record';
import { InfirmiereComponent } from './features/infirmiere/infirmiere';
import { MedecinComponent } from './features/medecin/medecin';
import { HistoriqueComponent } from './features/historique/historique';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

// Imports corrigés sans l'extension .component
import { AdmissionsComponent } from './features/admissions/admissions';
import { RendezVousComponent } from './features/rendez-vous/rendez-vous';

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

  // 3. TABLEAU DE BORD
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },

  // 4. PATIENTS
  {
    path: 'patients',
    component: PatientListComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },

  // 5. RENDEZ-VOUS
  {
    path: 'rendez-vous',
    component: RendezVousComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },

  // 6. ADMISSIONS
  {
    path: 'admissions',
    component: AdmissionsComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },

  // 7. ESPACES SPÉCIFIQUES
  {
    path: 'infirmiere',
    component: InfirmiereComponent,
    canActivate: [authGuard],
    data: { roles: ['NURSE'] }
  },
  {
    path: 'medecin',
    component: MedecinComponent,
    canActivate: [authGuard],
    data: { roles: ['DOCTOR'] }
  },

  // 8. DOSSIER MÉDICAL & HISTORIQUE
  {
    path: 'patients/:id/medical-record',
    component: MedicalRecordComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },
  {
    path: 'historique',
    component: HistoriqueComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'DOCTOR'] }
  },

  // 9. ROUTE INCONNUE (DOIT ÊTRE LA TOUTE DERNIÈRE !)
  {
    path: '**',
    redirectTo: 'login'
  }
];
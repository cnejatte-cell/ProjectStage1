import { Routes } from '@angular/router';

// ===============================
// IMPORT DES COMPONENTS
// ===============================

import { LoginComponent } from './features/auth/login/login';

import { PatientListComponent } 
  from './features/patients/patient-list/patient-list';

import { MedicalRecordComponent } 
  from './features/patients/medical-record/medical-record';

import { InfirmiereComponent } 
  from './features/infirmiere/infirmiere';

import { MedecinComponent }
  from './features/medecin/medecin';

import { HistoriqueComponent }
  from './features/historique/historique';

import { DashboardComponent }
  from './features/dashboard/dashboard';

import { authGuard } 
  from './core/guards/auth-guard';


// ===============================
// ROUTES
// ===============================

export const routes: Routes = [

  // ==========================================
  // 1. PAGE D'ACCUEIL
  // ==========================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // ==========================================
  // 2. LOGIN
  // Accessible sans authentification
  // ==========================================

  {
    path: 'login',
    component: LoginComponent
  },


  // ==========================================
  // 3. LISTE DES PATIENTS
  //
  // ADMIN
  // NURSE
  // DOCTOR
  // ==========================================

  {
    path: 'patients',

    component: PatientListComponent,

    canActivate: [authGuard],

    data: {
      roles: [
        'ADMIN',
        'NURSE',
        'DOCTOR'
      ]
    }
  },


  // ==========================================
  // 4. ESPACE INFIRMIÈRE
  //
  // Accessible uniquement à :
  // NURSE
  // ==========================================

  {
    path: 'infirmiere',

    component: InfirmiereComponent,

    canActivate: [authGuard],

    data: {
      roles: [
        'NURSE'
      ]
    }
  },

  {
  path: 'medecin',

  component: MedecinComponent,

  canActivate: [authGuard],

  data: {
    roles: [
      'DOCTOR'
    ]
  }
  },



  // ==========================================
  // 5. DOSSIER MÉDICAL DU PATIENT
  //
  // Exemple :
  // /patients/2/medical-record
  //
  // Accessible à :
  // ADMIN
  // NURSE
  // DOCTOR
  // ==========================================

  {
    path: 'patients/:id/medical-record',

    component: MedicalRecordComponent,

    canActivate: [authGuard],

    data: {
      roles: [
        'ADMIN',
        'NURSE',
        'DOCTOR'
      ]
    }
  },

  {
  path: 'historique',

  component: HistoriqueComponent,

  canActivate: [authGuard],

  data: {
    roles: [
      'ADMIN',
      'DOCTOR'
    ]
  }
  },

  {
    path: 'dashboard',

    component: DashboardComponent,

    canActivate: [authGuard],

    data: {
      roles: [
        'ADMIN',
        'NURSE',
        'DOCTOR'
      ]
    }
  },


  // ==========================================
  // 6. ROUTE INCONNUE
  //
  // Si l'utilisateur écrit une URL
  // qui n'existe pas
  // ==========================================

  {
    path: '**',
    redirectTo: 'login'
  }

];
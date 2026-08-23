import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { PatientListComponent } from './features/patients/patient-list/patient-list';
import { MedicalRecordComponent } from './features/patients/medical-record/medical-record';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Accessible par tous les utilisateurs connectés
  {
    path: 'patients',
    component: PatientListComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },

  // Dossier médical par patient
  {
    path: 'patients/:id/medical-record',
    component: MedicalRecordComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'NURSE', 'DOCTOR'] }
  },

  { path: '**', redirectTo: 'login' }
];
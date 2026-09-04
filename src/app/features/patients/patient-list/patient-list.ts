import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ClinicService, Patient } from '../../../core/services/clinic';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss'
})
export class PatientListComponent implements OnInit {
  public router = inject(Router);
  public authService = inject(AuthService);
  private clinicService = inject(ClinicService);

  searchTerm = '';
  patients: Patient[] = [];

  // Formulaire de saisie (Ajout ou Modification)
  newPatient = {
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    genre: 'M' as 'M' | 'F'
  };

  isEditing = false;
  editingPatientId: number | null = null;

  ngOnInit(): void {
    this.chargerPatients();
  }

  // Chargement des données
  chargerPatients(): void {
    this.clinicService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => console.error('Erreur chargement patients', err)
    });
  }

  ouvrirDossier(id: number): void {
  this.router.navigate([
    '/patients',
    id,
    'medical-record'
  ]);
  }

  // Filtrage pour la recherche (Correction des ||)
  get filteredPatients(): Patient[] {
    if (!this.searchTerm.trim()) {
      return this.patients;
    }
    const term = this.searchTerm.toLowerCase();
    return this.patients.filter(patient =>
      patient.nom.toLowerCase().includes(term) ||
      patient.prenom.toLowerCase().includes(term)
    );
  }

  // Soumission du formulaire (Correction des ||)
  onSubmit(): void {
    if (
      !this.newPatient.nom ||
      !this.newPatient.prenom ||
      !this.newPatient.telephone
    ) {
      alert('Veuillez remplir les champs obligatoires (Nom, Prénom, Téléphone, Age)');
      return;
    }

    const patientPayload: any = {
      nom: this.newPatient.nom,
      prenom: this.newPatient.prenom,
      telephone: this.newPatient.telephone,
      date_naissance: this.newPatient.date_naissance || undefined,
      sexe: this.newPatient.genre || 'M'
    };

    if (this.isEditing && this.editingPatientId !== null) {
      // إرسال طلب التعديل (PUT) إلى الـ Backend
      this.clinicService.updatePatient(this.editingPatientId, patientPayload).subscribe({
        next: () => {
          this.chargerPatients();
          this.resetForm();
        },
        error: (err) => console.error('Erreur lors de la modification', err)
      });
    } else {
      // إرسال طلب الإضافة (POST) إلى الـ Backend
      this.clinicService.createPatient(patientPayload).subscribe({
        next: () => {
          this.chargerPatients();
          this.resetForm();
        },
        error: (err) => console.error('Erreur lors de la création', err)
      });
    }
  }

  // Préparation pour modification (Correction du ||)
  onEdit(patient: Patient): void {
    this.isEditing = true;
    this.editingPatientId = patient.id ?? null;
    this.newPatient = {
      nom: patient.nom,
      prenom: patient.prenom,
      telephone: patient.telephone,
      date_naissance: patient.date_naissance || '',
      genre: patient.genre || 'M'
    };
  }

  // Suppression d'un patient
  onDelete(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous supprimer ce patient ?')) {
      this.clinicService.deletePatient(id).subscribe({
        next: () => this.chargerPatients(),
        error: (err) => console.error('Erreur lors de la suppression', err)
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingPatientId = null;
    this.newPatient = {
      nom: '',
      prenom: '',
      telephone: '',
      date_naissance: '',
      genre: 'M'
    };
  }

  onViewMedicalRecord(patientId: number): void {
    this.router.navigate(['/patients', patientId, 'medical-record']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
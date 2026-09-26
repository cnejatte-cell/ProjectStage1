import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Import pointe vers clinic.ts (nom exact du fichier dans services/)
import { ClinicService, Admission, Patient } from '../../core/services/clinic';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admissions.html',
  styleUrls: ['./admissions.scss']
})
export class AdmissionsComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private cdr = inject(ChangeDetectorRef);

  patients: Patient[] = [];
  admissions: Admission[] = [];

  patientError = '';
  motifError = '';

  currentAdmission: Partial<Admission> = {
    patient: undefined,
    diagnostic: '',
    date_admission: new Date().toISOString().slice(0, 16),
    statut: 'En cours'
  };

  ngOnInit(): void {
    this.chargerPatients();
    this.chargerAdmissions();
  }

  chargerPatients(): void {
    this.clinicService.getPatients().subscribe({
      next: (data: Patient[]) => {
        this.patients = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erreur chargement patients:', err)
    });
  }

  chargerAdmissions(): void {
    this.clinicService.getAdmissions().subscribe({
      next: (data: Admission[]) => {
        this.admissions = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erreur chargement admissions:', err)
    });
  }

  getPatientName(patient: any): string {
    if (!patient) return 'Patient inconnu';

    if (typeof patient === 'object') {
      return `${patient.nom || ''} ${patient.prenom || ''}`.trim() || `Patient #${patient.id}`;
    }

    const found = this.patients.find(p => p.id === Number(patient));
    return found ? `${found.nom} ${found.prenom}` : `Patient #${patient}`;
  }

  validatePatient(): boolean {
    if (!this.currentAdmission.patient) {
      this.patientError = 'Veuillez sélectionner un patient.';
      return false;
    }
    this.patientError = '';
    return true;
  }

  validateMotif(): boolean {
    if (!this.currentAdmission.diagnostic?.trim()) {
      this.motifError = 'Le motif/diagnostic est obligatoire.';
      return false;
    }
    this.motifError = '';
    return true;
  }

  saveAdmission(): void {
    const isPatientValid = this.validatePatient();
    const isMotifValid = this.validateMotif();

    if (!isPatientValid || !isMotifValid) return;

    const patientId: number = Number(this.currentAdmission.patient);

    this.clinicService.createAdmission(patientId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Admission enregistrée avec succès.',
          customClass: { popup: 'medlink-popup' }
        });

        this.currentAdmission = {
          patient: undefined,
          diagnostic: '',
          date_admission: new Date().toISOString().slice(0, 16),
          statut: 'En cours'
        };
        this.patientError = '';
        this.motifError = '';
        this.chargerAdmissions();
      },
      error: (err: any) => {
        console.error('Erreur création admission:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de créer l\'admission.',
          customClass: { popup: 'medlink-popup' }
        });
      }
    });
  }
}
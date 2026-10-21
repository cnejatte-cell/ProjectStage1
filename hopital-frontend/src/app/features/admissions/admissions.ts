import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Import pointe vers clinic.ts
import { ClinicService, Admission, Patient } from '../../core/services/clinic';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admissions.html',
  styleUrls: ['./admissions.scss']
  
})
export class AdmissionsComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private readonly statuts: Record<string, { label: string; css: string }> = {
  EN_COURS:        { label: 'En cours',          css: 'st-blue' },
  EN_ATTENTE:      { label: 'En attente',        css: 'st-gray' },
  CHEZ_INFIRMIERE: { label: "Chez l'infirmière", css: 'st-cyan' },
  CHEZ_LE_MEDECIN: { label: 'Chez le médecin',   css: 'st-indigo' },
  TERMINE:         { label: 'Terminé',           css: 'st-green' },
  ANNULE:          { label: 'Annulé',            css: 'st-red' }
};

getStatutLabel(s?: string): string {
  const key = (s || 'EN_COURS').toUpperCase();
  return this.statuts[key]?.label
    ?? key.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase());
}

getStatutClass(s?: string): string {
  return this.statuts[(s || 'EN_COURS').toUpperCase()]?.css ?? 'st-gray';
}

getInitials(name: string): string {
  return (name || '').split(' ').filter(Boolean).slice(0, 2)
    .map(p => p[0].toUpperCase()).join('');
}


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

   onLogout(): void {
  localStorage.clear();
  sessionStorage.clear();
  this.router.navigate(['/login']);
}

  chargerPatients(): void {
    this.clinicService.getPatients().subscribe({
      next: (data: any) => {
        let list: Patient[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.results)) {
          list = data.results;
        } else if (data && Array.isArray(data.content)) {
          list = data.content;
        }

        this.patients = list;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erreur chargement patients:', err)
    });
  }

  chargerAdmissions(): void {
    this.clinicService.getAdmissions().subscribe({
      next: (data: any) => {
        let list: Admission[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.results)) {
          list = data.results;
        } else if (data && Array.isArray(data.content)) {
          list = data.content;
        }

        this.admissions = list;
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

    // Construction de l'objet complet attendu par l'API Django
    const payload = {
      patient: Number(this.currentAdmission.patient),
      diagnostic: this.currentAdmission.diagnostic,
      date_admission: this.currentAdmission.date_admission,
      statut: this.currentAdmission.statut || 'En cours'
    };

    this.clinicService.createAdmission(payload).subscribe({
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
        if (err.error) {
          console.error('Détails validation Django:', err.error);
        }
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
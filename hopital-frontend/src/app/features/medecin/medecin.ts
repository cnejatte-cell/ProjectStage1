import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import {
  ClinicService,
  Admission,
  Constante,
  Consultation,
  Medicament
} from '../../core/services/clinic';

@Component({
  selector: 'app-medecin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './medecin.html',
  styleUrl: './medecin.css'
})
export class MedecinComponent implements OnInit {

  private clinicService = inject(ClinicService);

  // =========================
  // ADMISSIONS
  // =========================
  admissions: Admission[] = [];
  selectedAdmission: Admission | null = null;

  // =========================
  // CONSTANTES
  // =========================
  constantes: Constante[] = [];
  selectedConstantes: Constante[] = [];

  // =========================
  // CONSULTATION
  // =========================
  consultation = {
    examen_clinique: '',
    diagnostic: '',
    remarques: ''
  };
  isConsultationSaved:boolean = false

  // =========================
  // ORDONNANCE
  // =========================
  consultationId: number | null = null;
  ordonnanceId: number | null = null;
  medicaments: Medicament[] = [];
  prescriptions: any[] = [];
  selectedMedicamentId: number | null = null;

  prescription = {
    dosage: '',
    frequence: '',
    duree: '',
    instructions: ''
  };

  // =========================
  // MESSAGES
  // =========================
  loading = false;
  errorMessage = '';
  successMessage = '';

  // =========================
  // INITIALISATION
  // =========================
  ngOnInit(): void {
    console.log('MEDECIN COMPONENT WORKS');
    this.loadAdmissions();
    this.loadConstantes();
    this.loadMedicaments();
  }

  // =========================
  // CHARGER ADMISSIONS
  // =========================
  loadAdmissions(): void {
    this.loading = true;
    this.clinicService.getAdmissions().subscribe({
      next: (data) => {
        this.admissions = data.filter(admission => {
          const statut = admission.statut?.trim().toUpperCase();
          return statut === 'CHEZ_LE_MEDECIN';
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur admissions :', error);
        this.showToast('error', 'Impossible de charger les admissions.');
        this.loading = false;
      }
    });
  }

  // =========================
  // CHARGER CONSTANTES
  // =========================
  loadConstantes(): void {
    this.clinicService.getConstantes().subscribe({
      next: (data) => {
        this.constantes = data;
      },
      error: (error) => {
        console.error('Erreur constantes :', error);
      }
    });
  }

  loadMedicaments(): void {
    this.clinicService.getMedicaments().subscribe({
      next: (data) => {
        this.medicaments = data;
      },
      error: (error) => {
        console.error('Erreur medicaments :', error);
        this.showToast('error', 'Impossible de charger les médicaments.');
      }
    });
  }

  loadPrescriptions(): void {
    if (!this.ordonnanceId) return;

    this.clinicService.getPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data.filter(
          p => p.ordonnance === this.ordonnanceId
        );
      },
      error: (error) => {
        console.error('Erreur prescriptions :', error);
      }
    });
  }

  // Helper pour afficher le nom du médicament dans l'IHM
  getMedicamentName(id: number): string {
    const med = this.medicaments.find(m => m.id === id);
    return med ? med.nom : 'Médicament inconnu';
  }

  // =========================
  // SELECTIONNER PATIENT
  // =========================
  selectAdmission(admission: Admission): void {
    this.selectedAdmission = admission;
    this.successMessage = '';
    this.errorMessage = '';

    this.selectedConstantes = this.constantes.filter(
      c => c.admission === admission.id
    );

    this.consultation = {
      examen_clinique: '',
      diagnostic: '',
      remarques: ''
    };this.consultationId = null;
    this.ordonnanceId = null;
    this.prescriptions = [];
    this.selectedMedicamentId = null;
    this.prescription = {
      dosage: '',
      frequence: '',
      duree: '',
      instructions: ''
    };
  }

  terminateAdmission(): void {
    if (!this.selectedAdmission?.id) {
      this.showAlert('Attention', 'Aucune admission sélectionnée.', 'warning');
      return;
    }

    this.clinicService.updateStatutAdmission(
      this.selectedAdmission.id,
      'TERMINE'
    ).subscribe({
      next: () => {
        this.showAlert('Succès !', 'Admission terminée avec succès.', 'success');

        this.selectedAdmission = null;
        this.consultationId = null;
        this.ordonnanceId = null;
        this.prescriptions = [];

        this.loadAdmissions();
      },
      error: (error) => {
        console.error('Erreur lors de la fermeture de l admission :', error);
        this.showAlert('Erreur', 'Erreur lors de la fermeture de l admission.', 'error');
      }
    });
  }

  createOrdonnance(): void {
    if (!this.consultationId) {
      this.showAlert('Attention', 'Veuillez d abord enregistrer la consultation.', 'warning');
      return;
    }

    this.clinicService.addOrdonnance({
      consultation: this.consultationId,
      instructions_generales: ''
    }).subscribe({
      next: (response) => {
        this.ordonnanceId = response.id!;
        this.loadPrescriptions();
        this.showToast('success', 'Ordonnance créée avec succès. Vous pouvez ajouter des médicaments.');
      },
      error: (error) => {
        console.error('Erreur ordonnance :', error);
        this.showAlert('Erreur', 'Erreur lors de la création de l ordonnance.', 'error');
      }
    });
  }

  addPrescription(): void {
    if (!this.ordonnanceId) {
      this.showAlert('Attention', 'Veuillez créer une ordonnance d abord.', 'warning');
      return;
    }

    if (!this.selectedMedicamentId) {
      this.showAlert('Attention', 'Veuillez choisir un médicament.', 'warning');
      return;
    }

    const data = {
      ordonnance: this.ordonnanceId,
      medicament: this.selectedMedicamentId,
      dosage: this.prescription.dosage,
      frequence: this.prescription.frequence,
      duree: this.prescription.duree,
      instructions: this.prescription.instructions
    };

    this.clinicService.addPrescription(data).subscribe({
      next: () => {
        this.showToast('success', 'Médicament ajouté à l ordonnance avec succès.');
        this.loadPrescriptions();

        this.selectedMedicamentId = null;
        this.prescription = {
          dosage: '',
          frequence: '',
          duree: '',
          instructions: ''
        };
      },
      error: (error) => {
        console.error('ERREUR PRESCRIPTION :', error);
        this.showAlert('Erreur', 'Erreur lors de l ajout du médicament.', 'error');
      }
    });
  }

  printOrdonnance(): void {
    window.print();
  }

  cancelSelection(): void {
    this.selectedAdmission = null;
    this.selectedConstantes = [];
    this.consultation = {
      examen_clinique: '',
      diagnostic: '',
      remarques: ''
    };
    this.consultationId = null;
    this.ordonnanceId = null;
    this.prescriptions = [];
    this.selectedMedicamentId = null;
    this.prescription = {
      dosage: '',
      frequence: '',
      duree: '',
      instructions: ''
    };
  }

  // =========================
  // ENREGISTRER CONSULTATION
  // =========================
 saveConsultation(): void {
  if (!this.selectedAdmission?.id) {
    this.showAlert('Attention', 'Veuillez sélectionner une admission.', 'warning');
    return;
  }

  if (!this.consultation.examen_clinique.trim()) {
    this.showAlert('Champ obligatoire', 'Veuillez saisir l examen clinique.', 'warning');
    return;
  }

  if (!this.consultation.diagnostic.trim()) {
    this.showAlert('Champ obligatoire', 'Veuillez saisir le diagnostic.', 'warning');
    return;
  }

  const admissionId = this.selectedAdmission.id;

  // On passe les 2 arguments attendus par le service : (admissionId, consultation)
 this.clinicService.addConsultation(admissionId, this.consultation).subscribe({
  next: (response: any) => {
    // Vérifiez le nom exact du champ renvoyé par Django (souvent response.id)
    this.consultationId = response.id; 
    this.ordonnanceId = response.id || response.ordonnace_id
    // Si vous utilisez un booléen pour afficher la suite :
    this.isConsultationSaved = true; 

    this.showAlert(
      'Succès !',
      'Consultation enregistrée avec succès. Vous pouvez maintenant créer une ordonnance ou générer le PDF.',
      'success'
    );
  },
  error: (error) => {
    console.error('Erreur consultation :', error);
  }
});
 }
  // =========================
  // HELPER SWEETALERT2
  // =========================
  private showAlert(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info'): void {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    });
  }

  private showToast(icon: 'success' | 'error' | 'info', title: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
}
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import {
  ClinicService,
  Admission,
  Constante,
  Patient
} from '../../core/services/clinic';

@Component({
  selector: 'app-infirmiere',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './infirmiere.html',
  styleUrls: ['./infirmiere.css']
})
export class InfirmiereComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private cdr = inject(ChangeDetectorRef);

  // =========================================
  // PATIENTS
  // =========================================

  patients: Patient[] = [];
  showPatientForm = false;

  newPatient: Patient = {
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    genre: 'M'
  };

  // =========================================
  // ADMISSIONS
  // =========================================

  admissions: Admission[] = [];
  selectedAdmission: Admission | null = null;
  selectedPatientForAdmission: Patient | null = null;
  diagnostic = '';

  // =========================================
  // CONSTANTES & URGENCE
  // =========================================

  casUrgence = ''; // Motifs d'urgence (ex: ACCIDENT, ARRET_CARDIAQUE, BRULURE_GRAVE, MALAISE)

  constante: Constante = {
    admission: 0,
    temperature: 0,
    tension: '',
    glycemie: 0,
    degre_urgence: 'GRIS'
  };

  // =========================================
  // INITIALISATION
  // =========================================

  ngOnInit(): void {
    console.log('INFIRMIERE COMPONENT WORKS');
    this.loadPatients();
    this.loadAdmissions();
  }

  // =========================================
  // CHARGER PATIENTS
  // =========================================

  loadPatients(): void {
    console.log('CHARGEMENT DES PATIENTS...');

    this.clinicService
      .getPatients()
      .subscribe({
        next: (data) => {
          console.log('PATIENTS RECUS :', data);
          this.patients = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('ERREUR CHARGEMENT PATIENTS :', error);
          this.showToast('error', 'Impossible de charger la liste des patients.');
        }
      });
  }

  // =========================================
  // FORMULAIRE PATIENT
  // =========================================

  openPatientForm(): void {
    this.showPatientForm = true;
    this.newPatient = {
      nom: '',
      prenom: '',
      telephone: '',
      date_naissance: '',
      genre: 'M'
    };
  }

  cancelPatientForm(): void {
    this.showPatientForm = false;
    this.newPatient = {
      nom: '',
      prenom: '',
      telephone: '',
      date_naissance: '',
      genre: 'M'
    };
  }

  savePatient(): void {
    if (!this.newPatient.nom.trim()) {
      this.showAlert('Champ requis', 'Veuillez saisir le nom du patient.', 'warning');
      return;
    }

    if (!this.newPatient.prenom.trim()) {
      this.showAlert('Champ requis', 'Veuillez saisir le prénom du patient.', 'warning');
      return;
    }

    if (!this.newPatient.telephone.trim()) {
      this.showAlert('Champ requis', 'Veuillez saisir le téléphone du patient.', 'warning');
      return;
    }

    this.clinicService
      .createPatient(this.newPatient)
      .subscribe({
        next: (patient) => {
          console.log('PATIENT CREE :', patient);
          this.showToast('success', 'Patient ajouté avec succès.');
          this.showPatientForm = false;
          this.newPatient = {
            nom: '',
            prenom: '',
            telephone: '',
            date_naissance: '',
            genre: 'M'
          };
          this.loadPatients();
        },
        error: (error) => {
          console.error('ERREUR CREATION PATIENT :', error);
          this.showAlert('Erreur', 'Erreur lors de l\'ajout du patient.', 'error');
        }
      });
  }

  // =========================================
  // CHARGER ADMISSIONS
  // =========================================

  loadAdmissions(): void {
    console.log('CHARGEMENT DES ADMISSIONS...');

    this.clinicService
      .getAdmissions()
      .subscribe({
        next: (data) => {
          this.admissions = data.filter(admission => {
            const statut = admission.statut?.trim().toUpperCase();
            return statut === 'EN_ATTENTE';
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('ERREUR API ADMISSIONS :', error);
          this.showToast('error', 'Impossible de charger la liste des admissions.');
        }
      });
  }

  // =========================================
  // ADMISSION PATIENT
  // =========================================

  prendreAdmission(patient: Patient): void {
    this.selectedPatientForAdmission = patient;
    this.diagnostic = '';
  }

  creerAdmission(): void {
    if (!this.selectedPatientForAdmission) {
      this.showAlert('Attention', 'Veuillez sélectionner un patient.', 'warning');
      return;
    }

    const patientId = this.selectedPatientForAdmission.id!;

    this.clinicService
      .createAdmission(patientId)
      .subscribe({
        next: (admission) => {
          this.showToast('success', 'Admission créée avec succès.');
          this.selectedPatientForAdmission = null;
          this.diagnostic = '';
          this.selectedAdmission = admission;

          this.casUrgence = '';
          this.constante = {
            admission: admission.id!,
            temperature: 0,
            tension: '',
            glycemie: 0,
            degre_urgence: 'GRIS'
          };

          this.loadAdmissions();
        },
        error: (error) => {
          console.error('ERREUR CREATION ADMISSION :', error);
          this.showAlert('Erreur', 'Erreur lors de la création de l\'admission.', 'error');
        }
      });
  }

  annulerAdmission(): void {
    this.selectedPatientForAdmission = null;
    this.diagnostic = '';
  }

  selectAdmission(admission: Admission): void {
    this.selectedAdmission = admission;
    this.casUrgence = '';
    this.constante = {
      admission: admission.id!,
      temperature: 0,
      tension: '',
      glycemie: 0,
      degre_urgence: 'GRIS'
    };
  }

  // =========================================
  // CALCUL AUTOMATIQUE DEGRÉ D'URGENCE
  // =========================================

  calculerDegreUrgence(): void {
    const temp = this.constante.temperature;
    const gly = this.constante.glycemie ?? 0;
    const cas = this.casUrgence;

    let sys = 0;
    if (this.constante.tension) {
      const parts = this.constante.tension.split('/');
      sys = parseFloat(parts[0]) || 0;

      // Convertit les cmHg en mmHg (ex: 12 devient 120)
      if (sys > 0 && sys < 30) {
        sys = sys * 10;
      }
    }

    // 1. CRITÈRES ROUGES
    if (
      cas === 'ACCIDENT' ||
      cas === 'ARRET_CARDIAQUE' ||
      cas === 'BRULURE_GRAVE' ||
      (temp > 0 && (temp >= 40 || temp < 35)) ||
      sys >= 180 || (sys > 0 && sys <= 80) ||
      (gly > 0 && (gly < 0.5 || gly > 3.0))
    ) {
      this.constante.degre_urgence = 'ROUGE';
      return;
    }

    // 2. CRITÈRES JAUNES
    if (
      cas === 'MALAISE' ||
      (temp > 0 && (temp >= 38.5 || temp <= 35.5)) ||
      sys >= 140 || (sys > 0 && sys <= 90) ||
      (gly > 0 && (gly < 0.7 || gly > 1.8))
    ) {
      this.constante.degre_urgence = 'JAUNE';
      return;
    }

    // 3. CRITÈRES VERTS
    if (temp > 0 || sys > 0 || gly > 0 || cas === 'AUCUN') {
      this.constante.degre_urgence = 'VERT';
      return;
    }

    this.constante.degre_urgence = 'GRIS';
  }

  // =========================================
  // ENREGISTRER CONSTANTES
  // =========================================

  saveConstantes(): void {
    if (!this.selectedAdmission) {
      this.showAlert('Attention', 'Veuillez sélectionner une admission.', 'warning');
      return;
    }

    const admissionId = this.selectedAdmission.id!;

    if (!this.constante.temperature || this.constante.temperature <= 0) {
      this.showAlert('Champ requis', 'Veuillez saisir la température.', 'warning');
      return;
    }

    if (!this.constante.tension.trim()) {
      this.showAlert('Champ requis', 'Veuillez saisir la tension.', 'warning');
      return;
    }

    if (this.constante.glycemie === undefined || this.constante.glycemie === null || this.constante.glycemie <= 0) {
      this.showAlert('Champ requis', 'Veuillez saisir la glycémie.', 'warning');
      return;
    }

    this.constante.admission = admissionId;

    this.clinicService
      .addConstantes(this.constante)
      .subscribe({
        next: () => {
          this.clinicService
            .updateStatutAdmission(admissionId, 'CHEZ_LE_MEDECIN')
            .subscribe({
              next: () => {
                this.showAlert(
                  'Succès !',
                  'Les constantes ont été enregistrées. Le patient est maintenant chez le médecin.',
                  'success'
                );
                this.selectedAdmission = null;
                this.casUrgence = '';
                this.constante = {
                  admission: 0,
                  temperature: 0,
                  tension: '',
                  glycemie: 0,
                  degre_urgence: 'GRIS'
                };
                this.loadAdmissions();
              },
              error: (error) => {
                console.error('ERREUR MODIFICATION STATUT :', error);
                this.showAlert(
                  'Avertissement',
                  'Les constantes sont enregistrées, mais le statut de l\'admission n\'a pas pu être modifié.',
                  'warning'
                );
              }
            });
        },
        error: (error) => {
          console.error('ERREUR ENREGISTREMENT CONSTANTES :', error);
          this.showAlert('Erreur', 'Erreur lors de l\'enregistrement des constantes.', 'error');
        }
      });
  }

  // =========================================
  // HELPERS SWEETALERT2
  // =========================================

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
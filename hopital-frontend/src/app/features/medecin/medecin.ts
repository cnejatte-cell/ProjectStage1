import { Component, OnInit, inject, } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';

import {
  ClinicService,
  Admission,
  Constante,
  Consultation,
  Medicament
} from '../../core/services/clinic';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medecin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './medecin.html',
  styleUrl: './medecin.css',
 
})
export class MedecinComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // =========================
  // ADMISSIONS
  // =========================
  admissions: Admission[] = [];
  selectedAdmission: any | null = null;

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
  isConsultationSaved: boolean = false;

  // =========================
  // ORDONNANCE & AUTOCOMPLETE
  // =========================
  consultationId: number | null = null;
  ordonnanceId: number | null = null;
  medicaments: Medicament[] = [];
  prescriptions: any[] = [];
  selectedMedicamentId: number | null = null;
  medicamentSearchTerm: string = '';

  // Définition de prescription avec la propriété medicament facultative
  prescription: {
    medicament?: number | null;
    dosage?: string;
    frequence?: string;
    duree?: string;
    instructions?: string;
  } = {
    medicament: null,
    dosage: '',
    frequence: '',
    duree: '',
    instructions: ''
  };

  // =========================
  // MESSAGES ET ETAT
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

   /**
   * Méthode de déconnexion
   */
  logout(): void {
    // 1. Vider le stockage local (token JWT, rôle, etc.)
    localStorage.clear();

    // 2. Rediriger l'utilisateur vers la page de connexion
    this.router.navigate(['/login']);
  }
chargerPatients(): void {
  this.clinicService.getAdmissions().subscribe({
    next: (data) => {
    
      this.cdr.detectChanges();   // force l'affichage
    }
  });
}

  // =========================
  // CHARGER DATA
  // =========================
  loadAdmissions(): void {
    this.loading = true;

    this.clinicService.getAdmissions().subscribe({
      next: (data) => {
        this.admissions = data.filter(admission => {
          if (!admission.statut) return false;
          const s = admission.statut.toString().trim().toUpperCase();
          return s === 'CHEZ_LE_MEDECIN' || s === 'CHEZ_MEDECIN' || s.includes('MEDECIN');
        });
        this.loading = false;
        this.cdr.detectChanges(); 
        
      },
      error: (err: any) => {
        console.error('Erreur de chargement :', err);
        this.showToast('error', 'Impossible de charger les admissions.');
        this.loading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  loadConstantes(): void {
    this.clinicService.getConstantes().subscribe({
      next: (data) => {
        this.constantes = data;
      },
      error: (error: any) => {
        console.error('Erreur constantes :', error);
      }
    });
  }

  loadMedicaments(): void {
    this.clinicService.getMedicaments().subscribe({
      next: (data) => {
        this.medicaments = data;
      },
      error: (error: any) => {
        console.error('Erreur medicaments :', error);
        this.showToast('error', 'Impossible de charger les médicaments.');
      }
    });
  }

  loadPrescriptions(ordonnanceId: number): void {
    if (!ordonnanceId) return;
    this.clinicService.getPrescriptionsByOrdonnance(ordonnanceId).subscribe({
      next: (data: any[]) => {
        this.prescriptions = data;
      },
      error: (err: any) => console.error('Erreur de chargement des prescriptions :', err)
    });
  }

  get filteredMedicaments(): Medicament[] {
    if (!this.medicamentSearchTerm) {
      return this.medicaments;
    }
    const term = this.medicamentSearchTerm.toLowerCase();
    return this.medicaments.filter(m => m.nom.toLowerCase().includes(term));
  }

  getMedicamentName(medId: any): string {
    if (!medId) return '-';
    if (typeof medId === 'object' && medId.nom) {
      return medId.nom;
    }
    const found = this.medicaments.find(m => m.id === medId || m.id === Number(medId));
    return found ? found.nom : 'Médicament #' + medId;
  }

  onMedicamentSelect(): void {
    const med = this.medicaments.find(
      m => m.nom.toLowerCase() === this.medicamentSearchTerm.trim().toLowerCase()
    );
    this.selectedMedicamentId = med?.id ?? null;
    this.prescription.medicament = this.selectedMedicamentId;
  }

  // =========================
  // ACTIONS PATIENT & CONSULTATION
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
    };
    this.consultationId = null;
    this.ordonnanceId = null;
    this.prescriptions = [];
    this.selectedMedicamentId = null;
    this.medicamentSearchTerm = '';
    this.isConsultationSaved = false;
    this.prescription = {
      medicament: null,
      dosage: '',
      frequence: '',
      duree: '',
      instructions: ''
    };
  }

  saveConsultation(): void {
    if (!this.selectedAdmission?.id) {
      this.showAlert('Attention', 'Veuillez sélectionner une admission.', 'warning');
      return;
    }

    if (!this.consultation.examen_clinique.trim()) {
      this.showAlert('Champ obligatoire', 'Veuillez saisir l\'examen clinique.', 'warning');
      return;
    }

    if (!this.consultation.diagnostic.trim()) {
      this.showAlert('Champ obligatoire', 'Veuillez saisir le diagnostic.', 'warning');
      return;
    }

    const admissionId = this.selectedAdmission.id;

    this.clinicService.addConsultation(admissionId, this.consultation).subscribe({
      next: (response: any) => {
        this.consultationId = response.id;
        this.ordonnanceId = response.ordonnance ? (response.ordonnance.id || response.ordonnance) : null;
        this.isConsultationSaved = true;

        if (this.ordonnanceId) {
          this.loadPrescriptions(this.ordonnanceId);
        }

        this.showAlert(
          'Succès !',
          'Consultation enregistrée avec succès. Vous pouvez maintenant créer ou remplir l\'ordonnance.',
          'success'
        );
      },
      error: (error: any) => {
        console.error('Erreur consultation :', error);
        this.showAlert('Erreur', 'Erreur lors de l\'enregistrement de la consultation.', 'error');
      }
    });
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
        this.cancelSelection();
        this.loadAdmissions();
      },
      error: (error: any) => {
        console.error('Erreur lors de la fermeture de l\'admission :', error);
        this.showAlert('Erreur', 'Erreur lors de la fermeture de l\'admission.', 'error');
      }
    });
  }

  // =========================
  // ORDONNANCE & PRESCRIPTION
  // =========================
  createOrdonnance(): void {
    if (!this.consultationId) {
      this.showToast('error', 'Veuillez d\'abord enregistrer la consultation.');
      return;
    }

    const payload = {
      consultation: this.consultationId
    };

    this.clinicService.createOrdonnance(payload).subscribe({
      next: (res: any) => {
        this.ordonnanceId = res.id;
        this.loadPrescriptions(res.id);
        this.showToast('success', 'Ordonnance créée avec succès.');
      },
      error: (err: any) => {
        console.error('Détails de l\'erreur Django :', err.error || err);
        this.showToast('error', 'Erreur lors de la création de l\'ordonnance.');
      }
    });
  }

  addPrescription(): void {
    if (!this.ordonnanceId) {
      Swal.fire('Attention', 'Aucune ordonnance active', 'warning');
      return;
    }

    if (!this.prescription.medicament && !this.selectedMedicamentId) {
      Swal.fire('Attention', 'Veuillez sélectionner un médicament', 'warning');
      return;
    }

    const payload = {
      ordonnance: this.ordonnanceId,
      medicament: this.prescription.medicament || this.selectedMedicamentId,
      dosage: this.prescription.dosage || '',
      frequence: this.prescription.frequence || '',
      duree: this.prescription.duree || '',
      instructions: this.prescription.instructions || ''
    };

    this.clinicService.createPrescription(payload).subscribe({
      next: () => {
        this.prescription = {
          medicament: null,
          dosage: '',
          frequence: '',
          duree: '',
          instructions: ''
        };
        this.selectedMedicamentId = null;
        this.medicamentSearchTerm = '';

        if (this.ordonnanceId !== null) {
          this.loadPrescriptions(this.ordonnanceId);
        }

        Swal.fire('Succès', 'Médicament ajouté à l\'ordonnance', 'success');
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible d\'ajouter le médicament', 'error');
      }
    });
  }

 printOrdonnance(): void {
  if (!this.prescriptions || this.prescriptions.length === 0) {
    Swal.fire('Attention', 'Aucun médicament enregistré dans cette ordonnance', 'warning');
    return;
  }

  // Génération dynamique des lignes de la table
  const rows = this.prescriptions.map((p, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${this.getMedicamentName(p.medicament)}</td>
      <td>${p.dosage || '-'}</td>
      <td>${p.frequence || '-'}</td>
      <td>${p.duree || '-'}</td>
    </tr>
  `).join('');

  const patientNom = this.selectedAdmission?.patient_nom || this.selectedAdmission?.patient || 'Patient';
  const dateJour = new Date().toLocaleDateString('fr-FR');

  const printWindow = window.open('', '', 'height=800,width=1000');

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Ordonnance Médicale</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #000; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .details { display: flex; justify-content: space-between; background: #f8fafc; padding: 12px; border: 1px solid #ccc; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #444; padding: 10px; text-align: left; font-size: 14px; }
            th { background-color: #f1f5f9; text-transform: uppercase; font-size: 12px; }
            .footer { margin-top: 80px; display: flex; justify-content: flex-end; }
            .signature { text-align: center; width: 250px; border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin:0;">CABINET MÉDICAL</h2>
              <small>Consultations & Soins Médicaux</small>
            </div>
            <h1 style="margin:0; font-size: 22px;">ORDONNANCE MÉDICALE</h1>
            <div>
              <strong>N° Consultation :</strong> #${this.consultationId || '-'}
            </div>
          </div>

          <div class="details">
            <div><strong>Patient(e) :</strong> ${patientNom}</div>
            <div><strong>Date :</strong> ${dateJour}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>MÉDICAMENT</th>
                <th>DOSAGE</th>
                <th>FRÉQUENCE</th>
                <th>DURÉE</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            <div class="signature">
              Signature & Cachet du Médecin
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  }
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
    this.medicamentSearchTerm = '';
    this.isConsultationSaved = false;
    this.prescription = {
      medicament: null,
      dosage: '',
      frequence: '',
      duree: '',
      instructions: ''
    };
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
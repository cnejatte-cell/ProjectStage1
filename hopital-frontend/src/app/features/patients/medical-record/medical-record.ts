import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClinicService, Patient, Admission, Constante, Consultation, Ordonnance, Prescription, Medicament } from '../../../clinic.service';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-record.html',
  styleUrl: './medical-record.css'
})
export class MedicalRecordComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private clinicService = inject(ClinicService);
  private cdr = inject(ChangeDetectorRef);

  patientId = 0;
  patient: Patient | null = null;
  admissions: Admission[] = [];
  constantes: Constante[] = [];
  consultations: Consultation[] = [];
  ordonnances: Ordonnance[] = [];
  prescriptions: Prescription[] = [];
  medicaments: Medicament[] = [];

  loading = true;
  errorMessage = '';

  selectedAdmissionForConstantes: number | null = null;

  // Typage strict initial de l'objet constante
  nouvelleConstante = {
    temperature: null as number | null,
    tension: '',
    glycemie: null as number | null,
    degre_urgence: 'VERT' as 'ROUGE' | 'JAUNE' | 'VERT' | 'GRIS'
  };

  selectedConsultationId: number | null = null;
  instructionsGenerales = '';
  selectedOrdonnanceId: number | null = null;

  nouvellePrescription = {
    medicament: null as number | null,
    dosage: '',
    frequence: '',
    duree: '',
    instructions: ''
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.errorMessage = 'ID du patient introuvable.';
        this.loading = false;
        return;
      }
      this.patientId = Number(id);
      this.loadMedicalRecord();
    });
  }

  loadMedicalRecord(): void {
    this.loading = true;
    this.errorMessage = '';
    this.clinicService.getPatient(this.patientId).subscribe({
      next: patient => {
        this.patient = patient;
        this.loadAdmissions();
      },
      error: (error: any) => {
        console.error('ERREUR PATIENT =', error);
        this.errorMessage = 'Impossible de charger les informations du patient.';
        this.loading = false;
      }
    });
  }

  loadAdmissions(): void {
    this.clinicService.getAdmissions().subscribe({
      next: admissions => {
        this.admissions = admissions.filter(
          admission => admission.patient?.id === this.patientId
        );
        this.loadConstantes();
      },
      error: (error: any) => {
        console.error('ERREUR ADMISSIONS =', error);
        this.loading = false;
      }
    });
  }

  loadConstantes(): void {
    this.clinicService.getConstantes().subscribe({
      next: constantes => {
        const admissionIds = this.admissions
          .map(admission => admission.id)
          .filter(id => id !== undefined) as number[];

        this.constantes = constantes.filter(constante =>
          admissionIds.includes(constante.admission)
        );
        this.loadConsultations();
      },
      error: (error: any) => {
        console.error('ERREUR CONSTANTES =', error);
        this.loadConsultations();
      }
    });
  }

  saveConstantes(admissionId: number): void {
    if (!this.nouvelleConstante.temperature || !this.nouvelleConstante.tension) {
      alert('Veuillez renseigner la température et la tension.');
      return;
    }

    const payload: Partial<Constante> = {
      admission: admissionId,
      temperature: Number(this.nouvelleConstante.temperature),
      tension: this.nouvelleConstante.tension,
      glycemie: this.nouvelleConstante.glycemie ? Number(this.nouvelleConstante.glycemie) : null,
      degre_urgence: this.nouvelleConstante.degre_urgence
    };

    this.clinicService.createConstante(payload).subscribe({
      next: () => {
        this.selectedAdmissionForConstantes = null;
        // Cast réappliqué lors de la réinitialisation
        this.nouvelleConstante = {
          temperature: null,
          tension: '',
          glycemie: null,
          degre_urgence: 'VERT' as 'ROUGE' | 'JAUNE' | 'VERT' | 'GRIS'
        };
        this.loadMedicalRecord();
      },
      error: (error: any) => {
        console.error('ERREUR SAISIE CONSTANTES =', error);
        alert('Impossible d\'enregistrer les constantes.');
      }
    });
  }

  loadConsultations(): void {
    this.clinicService.getConsultations().subscribe({
      next: consultations => {
        const admissionIds = this.admissions
          .map(admission => admission.id)
          .filter(id => id !== undefined) as number[];

        this.consultations = consultations.filter(consultation =>
          admissionIds.includes(consultation.admission)
        );
        this.loadOrdonnances();
      },
      error: (error: any) => {
        console.error('ERREUR CONSULTATIONS =', error);
        this.loadOrdonnances();
      }
    });
  }

  loadOrdonnances(): void {
    this.clinicService.getOrdonnances().subscribe({
      next: (ordonnances: Ordonnance[]) => {
        const consultationIds = this.consultations
          .map(consultation => consultation.id)
          .filter(id => id !== undefined) as number[];

        this.ordonnances = ordonnances.filter((ordonnance: any) => {
          const consultationId =
            typeof ordonnance.consultation === 'object'
              ? ordonnance.consultation?.id
              : Number(ordonnance.consultation);

          return consultationIds.includes(consultationId);
        });
        this.loadPrescriptions();
      },
      error: (error: any) => {
        console.error('ERREUR ORDONNANCES =', error);
        this.ordonnances = [];
        this.loadPrescriptions();
      }
    });
  }

  loadPrescriptions(): void {
    this.clinicService.getPrescriptions().subscribe({
      next: (prescriptions: Prescription[]) => {
        const ordonnanceIds = this.ordonnances
          .map(ordonnance => ordonnance.id)
          .filter(id => id !== undefined) as number[];

        this.prescriptions = prescriptions.filter(prescription =>
          ordonnanceIds.includes(prescription.ordonnance)
        );
        this.loadMedicaments();
      },
      error: (error: any) => {
        console.error('ERREUR PRESCRIPTIONS =', error);
        this.prescriptions = [];
        this.loadMedicaments();
      }
    });
  }

  loadMedicaments(): void {
    this.clinicService.getMedicaments().subscribe({
      next: medicaments => {
        this.medicaments = medicaments;
        this.finishLoading();
      },
      error: (error: any) => {
        console.error('ERREUR MEDICAMENTS =', error);
        this.finishLoading();
      }
    });
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }

  getConstantesAdmission(admissionId: number): Constante[] {
    return this.constantes.filter(
      constante => constante.admission === admissionId
    );
  }

  getConsultation(admissionId: number): Consultation | undefined {
    return this.consultations.find(
      consultation => consultation.admission === admissionId
    );
  }

  getOrdonnance(consultationId: number): Ordonnance | undefined {
    return this.ordonnances.find((ordonnance: any) => {
      const ordonnanceConsultationId =
        typeof ordonnance.consultation === 'object'
          ? ordonnance.consultation?.id
          : Number(ordonnance.consultation);

      return ordonnanceConsultationId === Number(consultationId);
    });
  }

  getPrescriptionsOrdonnance(ordonnanceId: number): Prescription[] {
    return this.prescriptions.filter(
      prescription => prescription.ordonnance === ordonnanceId
    );
  }

  getMedicamentName(medicamentId: number): string {
    const medicament = this.medicaments.find(m => m.id === medicamentId);
    return medicament ? medicament.nom : 'Médicament inconnu';
  }

  createOrdonnance(consultationId: number): void {
    this.selectedConsultationId = consultationId;
    this.instructionsGenerales = '';
  }

  saveOrdonnance(): void {
    if (!this.selectedConsultationId) return;

    this.clinicService
      .createOrdonnance(
        this.selectedConsultationId,
        this.instructionsGenerales
      )
      .subscribe({
        next: () => {
          this.selectedConsultationId = null;
          this.loadMedicalRecord();
        },
        error: (error: any) => console.error(error)
      });
  }

  cancelOrdonnance(): void {
    this.selectedConsultationId = null;
  }

  openPrescription(ordonnanceId: number): void {
    this.selectedOrdonnanceId = ordonnanceId;
    this.nouvellePrescription = {
      medicament: null,
      dosage: '',
      frequence: '',
      duree: '',
      instructions: ''
    };
  }

  cancelPrescription(): void {
    this.selectedOrdonnanceId = null;
  }

  savePrescription(): void {
    if (!this.selectedOrdonnanceId) return;

    if (!this.nouvellePrescription.medicament) {
      alert('Veuillez sélectionner un médicament.');
      return;
    }

    const prescription: Prescription = {
      ordonnance: this.selectedOrdonnanceId,
      medicament: this.nouvellePrescription.medicament,
      dosage: this.nouvellePrescription.dosage,
      frequence: this.nouvellePrescription.frequence,
      duree: this.nouvellePrescription.duree,
      instructions: this.nouvellePrescription.instructions
    };

    this.clinicService.addPrescription(prescription).subscribe({
      next: () => {
        this.selectedOrdonnanceId = null;
        this.loadMedicalRecord();
      },
      error: (error: any) => console.error(error)
    });
  }

  printMedicalRecord(): void {
    const printContent = document.getElementById('medical-record-print');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dossier Médical</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            button, select, input, textarea { display: none !important; }
            .card { margin-bottom: 20px; border: 1px solid #dee2e6; }
          </style>
        </head>
        <body>
          <h2 class="mb-4">Dossier Médical</h2>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}
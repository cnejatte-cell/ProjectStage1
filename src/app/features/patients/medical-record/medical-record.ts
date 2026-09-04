import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  ClinicService,
  Patient,
  Admission,
  Constante,
  Consultation,
  Ordonnance,
  Prescription,
  Medicament
} from '../../../clinic.service';


@Component({
  selector: 'app-medical-record',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './medical-record.html',

  styleUrl: './medical-record.css'
})
export class MedicalRecordComponent
  implements OnInit {


  private route =
    inject(ActivatedRoute);

  private clinicService =
    inject(ClinicService);

  private cdr = inject(ChangeDetectorRef);


  // =============================
  // ID
  // =============================

  patientId = 0;


  // =============================
  // DATA
  // =============================

  patient: Patient | null = null;

  admissions: Admission[] = [];

  constantes: Constante[] = [];

  consultations: Consultation[] = [];

  ordonnances: Ordonnance[] = [];

  prescriptions: Prescription[] = [];

  medicaments: Medicament[] = [];


  // =============================
  // STATES
  // =============================

  loading = true;

  errorMessage = '';


  // =============================
  // ORD0NNANCE FORM
  // =============================

  selectedConsultationId:
    number | null = null;

  instructionsGenerales = '';


  // =============================
  // PRESCRIPTION FORM
  // =============================

  selectedOrdonnanceId:
    number | null = null;


  nouvellePrescription = {

    medicament:
      null as number | null,

    dosage: '',

    frequence: '',

    duree: '',

    instructions: ''

  };


  // =============================
  // INIT
  // =============================

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      params => {

        const id =
          params.get('id');


        if (!id) {

          this.errorMessage =
            'ID du patient introuvable.';

          this.loading =
            false;

          return;

        }


        this.patientId =
          Number(id);


        console.log(
          'PATIENT ID =',
          this.patientId
        );


        this.loadMedicalRecord();

      }
    );

  }


  // =============================
  // LOAD DOSSIER
  // =============================

  loadMedicalRecord(): void {


    this.loading =
      true;

    this.errorMessage =
      '';


    // -------------------------
    // PATIENT
    // -------------------------

    this.clinicService
      .getPatient(
        this.patientId
      )
      .subscribe({

        next: patient => {

          this.patient =
            patient;

          console.log(
            'PATIENT CHARGE =',
            patient
          ); 


          this.loadAdmissions();

        },


        error: error => {

          console.error(
            'ERREUR PATIENT =',
            error
          );


          this.errorMessage =
            'Impossible de charger les informations du patient.';


          this.loading =
            false;

        }

      });

  }


  // =============================
  // ADMISSIONS
  // =============================

  loadAdmissions(): void {


    this.clinicService
      .getAdmissions()
      .subscribe({

        next: admissions => {


          this.admissions =
            admissions.filter(
              admission =>
                admission.patient?.id ===
                this.patientId
            );


          console.log(
            'ADMISSIONS =',
            this.admissions
          );


          this.loadConstantes();

        },


        error: error => {

          console.error(
            'ERREUR ADMISSIONS =',
            error
          );


          // لا نخفي الصفحة
          this.loading =
            false;

        }

      });

  }


  // =============================
  // CONSTANTES
  // =============================

  loadConstantes(): void {


    this.clinicService
      .getConstantes()
      .subscribe({

        next: constantes => {


          const admissionIds =
            this.admissions
              .map(
                admission =>
                  admission.id
              )
              .filter(
                id =>
                  id !== undefined
              ) as number[];


          this.constantes =
            constantes.filter(
              constante =>
                admissionIds.includes(
                  constante.admission
                )
            );


          console.log(
            'CONSTANTES =',
            this.constantes
          );


          this.loadConsultations();

        },


        error: error => {

          console.error(
            'ERREUR CONSTANTES =',
            error
          );


          this.loadConsultations();

        }

      });

  }


  // =============================
  // CONSULTATIONS
  // =============================

  loadConsultations(): void {


    this.clinicService
      .getConsultations()
      .subscribe({

        next: consultations => {


          const admissionIds =
            this.admissions
              .map(
                admission =>
                  admission.id
              )
              .filter(
                id =>
                  id !== undefined
              ) as number[];


          this.consultations =
            consultations.filter(
              consultation =>
                admissionIds.includes(
                  consultation.admission
                )
            );


          console.log(
            'CONSULTATIONS =',
            this.consultations
          );


          this.loadOrdonnances();

        },


        error: error => {

          console.error(
            'ERREUR CONSULTATIONS =',
            error
          );


          this.loadOrdonnances();

        }

      });

  }


  // =============================
  // ORDONNANCES
  // =============================

  // =============================
// ORDONNANCES
// =============================

loadOrdonnances(): void {

  this.clinicService
    .getOrdonnances()
    .subscribe({

      next: (ordonnances: Ordonnance[]) => {

        console.log(
          'ORDONNANCES RECUES =',
          ordonnances
        );


        // IDs des consultations
        // appartenant à ce patient

        const consultationIds =
          this.consultations
            .map(
              consultation =>
                consultation.id
            )
            .filter(
              id =>
                id !== undefined
            ) as number[];


        // Garder seulement les ordonnances
        // du patient actuel

        this.ordonnances =
          ordonnances.filter(
            (ordonnance: any) => {

              const consultationId =
                typeof ordonnance.consultation === 'object'
                  ? ordonnance.consultation?.id
                  : Number(ordonnance.consultation);


              return consultationIds.includes(
                consultationId
              );

            }
          );


        console.log(
          'ORDONNANCES DU PATIENT =',
          this.ordonnances
        );


        this.loadPrescriptions();

      },


      error: error => {

        console.error(
          'ERREUR ORDONNANCES =',
          error
        );


        this.ordonnances =
          [];


        this.loadPrescriptions();

      }

    });

  }

  // =============================
  // PRESCRIPTIONS
  // =============================

 // =============================
// PRESCRIPTIONS
// =============================

loadPrescriptions(): void {

  this.clinicService
    .getPrescriptions()
    .subscribe({

      next: (
        prescriptions: Prescription[]
      ) => {


        console.log(
          'PRESCRIPTIONS RECUES =',
          prescriptions
        );


        // IDs des ordonnances
        // appartenant au patient

        const ordonnanceIds =
          this.ordonnances
            .map(
              ordonnance =>
                ordonnance.id
            )
            .filter(
              id =>
                id !== undefined
            ) as number[];


        // Garder seulement les prescriptions
        // du patient actuel

        this.prescriptions =
          prescriptions.filter(
            prescription =>
              ordonnanceIds.includes(
                prescription.ordonnance
              )
          );


        console.log(
          'PRESCRIPTIONS DU PATIENT =',
          this.prescriptions
        );


        this.loadMedicaments();

      },


      error: error => {

        console.error(
          'ERREUR PRESCRIPTIONS =',
          error
        );


        this.prescriptions =
          [];


        this.loadMedicaments();

      }

    });

  }
  // =============================
  // MEDICAMENTS
  // =============================

  loadMedicaments(): void {


    this.clinicService
      .getMedicaments()
      .subscribe({

        next: medicaments => {


          this.medicaments =
            medicaments;


          console.log(
            'MEDICAMENTS =',
            this.medicaments
          );


          // IMPORTANT


          console.log(
            'DOSSIER MEDICAL CHARGE AVEC SUCCES'
          );

          this.loading = false;

          this.cdr.detectChanges();


        },


        error: error => {


          console.error(
            'ERREUR MEDICAMENTS =',
            error
          );

          this.loading = false;

          this.cdr.detectChanges();


          // IMPORTANT
          // مهما حدث يجب أن تظهر الصفحة

          this.loading =
            false;

        }

      });

  }


  // =============================
  // GET CONSTANTES
  // =============================

  getConstantesAdmission(
    admissionId: number
  ): Constante[] {

    return this.constantes.filter(
      constante =>
        constante.admission ===
        admissionId
    );

  }


  // =============================
  // GET CONSULTATION
  // =============================

  getConsultation(
    admissionId: number
  ): Consultation | undefined {

    return this.consultations.find(
      consultation =>
        consultation.admission ===
        admissionId
    );

  }


  // =============================
  // GET ORD0NNANCE
  // =============================

 getOrdonnance(
  consultationId: number
 ): Ordonnance | undefined {

  console.log(
    'RECHERCHE ORDONNANCE POUR CONSULTATION =',
    consultationId
  );

  console.log(
    'LISTE ORDONNANCES =',
    this.ordonnances
  );

  return this.ordonnances.find(
    (ordonnance: any) => {

      const ordonnanceConsultationId =
        typeof ordonnance.consultation === 'object'
          ? ordonnance.consultation?.id
          : Number(ordonnance.consultation);

      return ordonnanceConsultationId === Number(consultationId);

    }
  );

  }

  // =============================
  // GET PRESCRIPTIONS
  // =============================

  getPrescriptionsOrdonnance(
    ordonnanceId: number
  ): Prescription[] {

    return this.prescriptions.filter(
      prescription =>
        prescription.ordonnance ===
        ordonnanceId
    );

  }


  // =============================
  // MEDICAMENT NAME
  // =============================

  getMedicamentName(
    medicamentId: number
  ): string {

    const medicament =
      this.medicaments.find(
        m =>
          m.id === medicamentId
      );


    return medicament
      ? medicament.nom
      : 'Médicament inconnu';

  }


  // =============================
  // CREATE ORD0NNANCE
  // =============================

  createOrdonnance(
    consultationId: number
  ): void {

    this.selectedConsultationId =
      consultationId;

    this.instructionsGenerales =
      '';

  }


  // =============================
  // SAVE ORD0NNANCE
  // =============================

  saveOrdonnance(): void {


    if (
      !this.selectedConsultationId
    ) {

      return;

    }


    this.clinicService
      .createOrdonnance(
        this.selectedConsultationId,
        this.instructionsGenerales
      )
      .subscribe({

        next: () => {

          this.selectedConsultationId =
            null;


          this.loadMedicalRecord();

        },


        error: error => {

          console.error(
            error
          );

        }

      });

  }


  // =============================
  // OPEN PRESCRIPTION
  // =============================

  openPrescription(
    ordonnanceId: number
  ): void {

    this.selectedOrdonnanceId =
      ordonnanceId;


    this.nouvellePrescription = {

      medicament:
        null,

      dosage:
        '',

      frequence:
        '',

      duree:
        '',

      instructions:
        ''

    };

  }


  // =============================
  // CANCEL PRESCRIPTION
  // =============================

  cancelPrescription(): void {

    this.selectedOrdonnanceId =
      null;

  }


  // =============================
  // CANCEL ORD0NNANCE
  // =============================

  cancelOrdonnance(): void {

    this.selectedConsultationId =
      null;

  }


  // =============================
  // SAVE PRESCRIPTION
  // =============================

  savePrescription(): void {


    if (
      !this.selectedOrdonnanceId
    ) {

      return;

    }


    if (
      !this.nouvellePrescription.medicament
    ) {

      alert(
        'Veuillez sélectionner un médicament.'
      );

      return;

    }


    const prescription:
      Prescription = {

        ordonnance:
          this.selectedOrdonnanceId,

        medicament:
          this.nouvellePrescription.medicament,

        dosage:
          this.nouvellePrescription.dosage,

        frequence:
          this.nouvellePrescription.frequence,

        duree:
          this.nouvellePrescription.duree,

        instructions:
          this.nouvellePrescription.instructions

      };


    this.clinicService
      .addPrescription(
        prescription
      )
      .subscribe({

        next: () => {

          this.selectedOrdonnanceId =
            null;


          this.loadMedicalRecord();

        },


        error: error => {

          console.error(
            error
          );

        }

      });

  }

  // =============================
// PRINT MEDICAL RECORD
// =============================

printMedicalRecord(): void {

  const printContent =
    document.getElementById(
      'medical-record-print'
    );


  if (!printContent) {

    console.error(
      'ELEMENT medical-record-print INTROUVABLE'
    );

    alert(
      'Le dossier médical est introuvable.'
    );

    return;

  }


  console.log(
    'CONTENU A IMPRIMER :',
    printContent.innerHTML
  );


  const printWindow =
    window.open(
      '',
      '_blank',
      'width=1000,height=800'
    );


  if (!printWindow) {

    alert(
      'Impossible d ouvrir la fenêtre d impression.'
    );

    return;

  }


  // Écrire directement dans la nouvelle fenêtre

  printWindow.document.open();


  printWindow.document.write(
    '<!DOCTYPE html>' +
    '<html>' +

    '<head>' +

    '<title>Dossier médical</title>' +

    '<style>' +

    'body {' +
    'font-family: Arial, sans-serif;' +
    'padding: 30px;' +
    'color: #222;' +
    '}' +

    'h2 {' +
    'border-bottom: 2px solid #333;' +
    'padding-bottom: 10px;' +
    '}' +

    '.card {' +
    'border: 1px solid #ccc;' +
    'padding: 20px;' +
    'margin-bottom: 20px;' +
    'border-radius: 8px;' +
    '}' +

    'button {' +
    'display: none !important;' +
    '}' +

    'input, textarea, select {' +
    'display: none !important;' +
    '}' +

    '</style>' +

    '</head>' +

    '<body>' +

    '<h2>📁 Dossier médical</h2>' +

    printContent.innerHTML +

    '</body>' +

    '</html>'
  );


  printWindow.document.close();


  // Attendre que la page soit chargée

  printWindow.onload = () => {

    printWindow.focus();

    setTimeout(() => {

      printWindow.print();

    }, 500);

  };

  }

}
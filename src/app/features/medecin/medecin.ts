import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

        console.log('ADMISSIONS RECUES :', data);

        /*
         * Le médecin voit les admissions
         * qui sont arrivées chez lui.
         */

        this.admissions = data.filter(
          admission =>{
           const statut =  admission.statut?.trim().toUpperCase();
           return statut === 'CHEZ_MEDECIN';
          }
        );

        console.log(
          'ADMISSIONS MEDECIN :',
          this.admissions
        );

        console.log(
          'NOMBRE :',
          this.admissions.length
        );

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Erreur admissions :',
          error
        );

        this.errorMessage =
          'Impossible de charger les admissions.';

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

        console.log(
          'CONSTANTES RECUES :',
          data
        );

        this.constantes = data;

      },

      error: (error) => {

        console.error(
          'Erreur constantes :',
          error
        );

      }

    });
  }

  loadMedicaments(): void {

  this.clinicService.getMedicaments().subscribe({

    next: (data) => {

      console.log(
        'MEDICAMENTS RECUS :',
        data
      );

      this.medicaments = data;


    },

    error: (error) => {

      console.error(
        'Erreur medicaments :',
        error
      );

      this.errorMessage =
        'Impossible de charger les médicaments.';
    }

  });
  }

  loadPrescriptions(): void {

  if (!this.ordonnanceId) {
    return;
  }

  this.clinicService.getPrescriptions().subscribe({

    next: (data) => {

      console.log(
        'PRESCRIPTIONS RECUES :',
        data
      );

      this.prescriptions = data.filter(
        prescription =>
          prescription.ordonnance === this.ordonnanceId
      );

    },

    error: (error) => {

      console.error(
        'Erreur prescriptions :',
        error
      );

    }

  });

  }


  // =========================
  // SELECTIONNER PATIENT
  // =========================

  selectAdmission(
    admission: Admission
  ): void {

    console.log(
      'Admission sélectionnée :',
      admission
    );

    this.selectedAdmission = admission;

    this.successMessage = '';

    this.errorMessage = '';

    /*
     * On cherche les constantes
     * correspondant à cette admission.
     */

    this.selectedConstantes =
      this.constantes.filter(
        constante =>
          constante.admission === admission.id
      );

    console.log(
      'CONSTANTES DU PATIENT :',
      this.selectedConstantes
    );


    /*
     * Réinitialiser le formulaire
     */

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

  terminateAdmission(): void {

  if (!this.selectedAdmission?.id) {

    alert('Aucune admission sélectionnée.');

    return;
  }


  this.clinicService.updateStatutAdmission(
     this.selectedAdmission.id,
    'TERMINE'
  ).subscribe({

    next: () => {

      this.successMessage =
        'Admission terminée avec succès.';

      // Réinitialiser les données
      this.selectedAdmission = null;

      this.consultationId = null;

      this.ordonnanceId = null;

      this.prescriptions = [];


      // Actualiser la liste des patients
      this.loadAdmissions();

    },


    error: (error) => {

      console.error(
        'Erreur lors de la fermeture de l admission :',
        error
      );

      this.errorMessage =
        'Erreur lors de la fermeture de l admission.';

    }

  });

 }


  createOrdonnance(): void {

  if (!this.consultationId) {

    alert(
      'Veuillez d abord enregistrer la consultation.'
    );

    return;
  }


  this.clinicService.addOrdonnance({

    consultation: this.consultationId,

    instructions_generales: ''

  }).subscribe({

    next: (response) => {

      console.log(
        'ORDONNANCE CREEE :',
        response
      );

      this.ordonnanceId = response.id!;

      this.loadPrescriptions();

      this.successMessage =
        'Ordonnance créée avec succès. Vous pouvez ajouter des médicaments.';
    },


    error: (error) => {

      console.error(
        'Erreur ordonnance :',
        error
      );

      this.errorMessage =
        'Erreur lors de la création de l ordonnance.';
    }

  });
  }

  addPrescription(): void {

  // Vérifier qu'une ordonnance existe
  if (!this.ordonnanceId) {

    alert('Veuillez créer une ordonnance d abord.');

    return;
  }


  // Vérifier le médicament
  if (!this.selectedMedicamentId) {

    alert('Veuillez choisir un médicament.');

    return;
  }


  // Préparer les données
  const data = {

    ordonnance: this.ordonnanceId,

    medicament: this.selectedMedicamentId,

    dosage: this.prescription.dosage,

    frequence: this.prescription.frequence,

    duree: this.prescription.duree,

    instructions: this.prescription.instructions

  };


  console.log(
    'PRESCRIPTION A ENVOYER :',
    data
  );


  // Envoyer au Backend
  this.clinicService.addPrescription(data).subscribe({

    next: (response) => {

      console.log(
        'PRESCRIPTION ENREGISTREE :',
        response
      );


      this.successMessage =
        'Médicament ajouté à l ordonnance avec succès.';

        this.loadPrescriptions();


      // Réinitialiser le formulaire

      this.selectedMedicamentId = null;

      this.prescription = {

        dosage: '',

        frequence: '',

        duree: '',

        instructions: ''

      };

    },


    error: (error) => {

      console.error(
        'ERREUR PRESCRIPTION :',
        error
      );


      this.errorMessage =
        'Erreur lors de l ajout du médicament.';

    }

  });

  }


  // =========================
  // ANNULER
  // =========================

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

    this.successMessage = '';

    this.errorMessage = '';
  }


  // =========================
  // ENREGISTRER CONSULTATION
  // =========================

  saveConsultation(): void {

    if (!this.selectedAdmission) {

      alert(
        'Veuillez sélectionner une admission.'
      );

      return;
    }


    if (
      !this.consultation.examen_clinique.trim()
    ) {

      alert(
        'Veuillez saisir l examen clinique.'
      );

      return;
    }


    if (
      !this.consultation.diagnostic.trim()
    ) {

      alert(
        'Veuillez saisir le diagnostic.'
      );

      return;
    }


    const admissionId =
      this.selectedAdmission.id!;


    console.log(
      'ENREGISTREMENT CONSULTATION :',
      this.consultation
    );


    this.clinicService.addConsultation(

      admissionId,

      this.consultation

    ).subscribe({

      next: (response: Consultation) => {

        console.log(
          'CONSULTATION ENREGISTREE :',
          response
        );

        this.consultationId = response.id!;

        console.log('CONSULTATION ID :', this.consultationId);

        this.successMessage =
          'Consultation enregistrée avec succès. Vous pouvez maintenant céer une ordonnance.';

        /*
         * Pour l'instant nous ne passons
         * pas encore à TERMINE.
         *
         * Nous allons ajouter l'ordonnance
         * juste après.
         */

      },

      error: (error) => {

        console.error(
          'Erreur consultation :',
          error
        );

        this.errorMessage =
          'Erreur lors de l enregistrement de la consultation.';
      }

    });
  }

}
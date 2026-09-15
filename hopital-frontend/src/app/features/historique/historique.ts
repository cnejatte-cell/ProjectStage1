import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import { RouterLink} from '@angular/router';

import {
  ClinicService,
  Admission
} from '../../clinic.service';


@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './historique.html',
  styleUrl: './historique.css'
})
export class HistoriqueComponent implements OnInit {

  private clinicService = inject(ClinicService);

  private router = inject(Router);

  private cdr = inject(ChangeDetectorRef);


  admissions: Admission[] = [];

  loading = false;

  errorMessage = '';


  ngOnInit(): void {

    console.log('HISTORIQUE COMPONENT WORKS');

    this.loadHistorique();

  }


  // =====================================
  // CHARGER LES ADMISSIONS TERMINEES
  // =====================================

  loadHistorique(): void {

    console.log('DEBUT CHARGEMENT');

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.clinicService.getAdmissions().subscribe({

      next: (data) => {

        console.log('ADMISSIONS RECUES :', data);

        console.log(
          'STATUTS :',
          data.map(admission => admission.statut)
        );


        // Garder seulement les admissions terminées
        this.admissions = data.filter(
          admission =>
            admission.statut
              ?.trim()
              .toUpperCase() === 'TERMINE'
        );


        console.log(
          'ADMISSIONS TERMINEES :',
          this.admissions
        );

        console.log(
          'NOMBRE TERMINE :',
          this.admissions.length
        );


        this.loading = false;

        console.log(
          'LOADING FINAL :',
          this.loading
        );


        // Mettre à jour l'affichage Angular
        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'ERREUR HISTORIQUE :',
          error
        );

        this.errorMessage =
          'Erreur lors du chargement de l historique.';

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================
  // OUVRIR LE DOSSIER MEDICAL
  // =====================================

  voirDossierMedical(admission: Admission): void {

    console.log(
      'OUVERTURE DOSSIER MEDICAL :',
      admission
    );

    if (!admission.patient?.id) {

      console.error(
        'ID PATIENT INTROUVABLE :',
        admission.patient
      );

      alert(
        'Impossible de trouver l identifiant du patient.'
      );

      return;
    }


    const patientId = admission.patient.id;


    console.log(
      'NAVIGATION VERS PATIENT :',
      patientId
    );


    this.router.navigate([
      '/patients',
      patientId,
      'medical-record'
    ]).then(

      (success) => {

        console.log(
          'NAVIGATION SUCCESS :',
          success
        );

        if (!success) {

          alert(
            'La navigation vers le dossier médical a échoué.'
          );

        }

      }

    ).catch(

      (error) => {

        console.error(
          'ERREUR NAVIGATION :',
          error
        );

      }

    );

  }

}
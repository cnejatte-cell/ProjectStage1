import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicService, Admission, Constante } from '../../core/services/clinic';

@Component({
  selector: 'app-infirmiere',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './infirmiere.html',
  styleUrls: ['./infirmiere.css']
})
export class InfirmiereComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private cdr = inject(ChangeDetectorRef);

  admissions: Admission[] = [];
  selectedAdmission: Admission | null = null;

  constante: Constante = {
    admission: 0,
    temperature: 0,
    tension: '',
    glycemie: 0,
    degre_urgence: 'VERT'
  };

 ngOnInit(): void {
  console.log('INFIRMIERE COMPONENT WORKS');

  this.loadAdmissions();
 }

  loadAdmissions(): void {
  console.log('1 - loadAdmissions appelée');

  this.clinicService.getAdmissions().subscribe({
    next: (data) => {

      console.log('2 - DATA:', data);
      console.log('3 - TYPE:', typeof data);
      console.log('4 - IS ARRAY:', Array.isArray(data));

      this.admissions = data.filter( admission => {
        const statut = admission.statut?.trim().toUpperCase();
        return (
          statut === 'EN_ETTENTE' || statut === 'AUX_CONSTANTES'
        );
      });

      console.log(
        'FINAL LENGTH =',
        this.admissions.length
      );
      this.cdr.detectChanges();
    },

    error: (error) => {
      console.error('ERREUR API:', error);
    }
  });
  }

  selectAdmission(admission: Admission): void {

    console.log('ADMISSION SELECTIONNEE:', admission);

  this.selectedAdmission = admission;

  this.constante = {
    admission: admission.id!,
    temperature: 0,
    tension: '',
    glycemie: 0,
    degre_urgence: 'VERT'
  };

  if (admission.id) {

    this.clinicService.updateStatutAdmission(
      admission.id,
      'AUX_CONSTANTES'
    ).subscribe({

      next: () => {
        admission.statut = 'AUX_CONSTANTES';

        console.log(
          'Admission passée à AUX_CONSTANTES:'
        );
      },

      error: (error) => {
        console.error(
          'Erreur changement statut:',
          error
        );
      }

    });
  }
 }

  saveConstantes(): void {

    if (!this.selectedAdmission) {
      alert('Veuillez sélectionner une admission.');
      return;
    }

    this.constante.admission = this.selectedAdmission.id!;

    this.clinicService.addConstantes(this.constante).subscribe({
      next: () => {

        alert('Les constantes ont été enregistrées avec succès.');

        if (this.selectedAdmission?.id) {
          this.clinicService.updateStatutAdmission(
            this.selectedAdmission.id,
            'CHEZ_MEDECIN'
          ).subscribe({
            next: () => {
              this.loadAdmissions();
              this.selectedAdmission = null;
            },
            error: (error) => {
              console.error('Erreur lors du changement de statut:', error);
            }
          });
        }
      },

      error: (error) => {
        console.error('Erreur lors de l enregistrement:', error);
        alert('Erreur lors de l enregistrement des constantes.');
      }
    });
  }
}
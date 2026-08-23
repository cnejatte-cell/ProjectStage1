import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { 
  ClinicService, 
  Constante, 
  Consultation, 
  Admission 
} from '../../../core/services/clinic';



@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-record.html',
  styleUrl: './medical-record.scss'
})
export class MedicalRecordComponent implements OnInit {
  private clinicService = inject(ClinicService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  admissionId!: number;
  admissions: Admission[] = [];
  constantes: Constante[] = [];
  consultations: Consultation[] = [];

  // Formulaire Infirmière
  nouvelleConstante: Constante = {
    admission: 0,
    temperature: 37,
    tension: '12/8',
    glycemie: 1.0,
    degre_urgence: 'VERT'
  };

  // Formulaire Médecin
  nouvelleConsultation: any = {
    admission: 0,
    examen_clinique: '',
    diagnostic: '',
    remarques: ''
  };

  ngOnInit(): void {
    // Récupère l'ID du patient ou de l'admission dans l'URL (/patients/:id/medical-record)
    const idParam = this.route.snapshot.paramMap.get('id');
    this.admissionId = idParam ? Number(idParam) : 0;

    this.nouvelleConstante.admission = this.admissionId;
    this.nouvelleConsultation.admission = this.admissionId;

    this.chargerDonnees();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  chargerDonnees(): void {
  this.clinicService.getAdmissions().subscribe((data) => {
    this.admissions = data;
  });

  this.clinicService.getConstantes().subscribe((data) => {
    // Conversion en Number pour éviter les incompatibilités string/number
    this.constantes = data.filter(c => Number(c.admission) === Number(this.admissionId));
  });

  if (typeof this.clinicService.getConsultations === 'function') {
    this.clinicService.getConsultations().subscribe({
      next: (data) => {
        console.log('Toutes les consultations reçues de l’API :', data);
        console.log('ID recherché dans l’URL :', this.admissionId);

        // Egalité souple (==) ou conversion explicite pour comparer les IDs
        this.consultations = data.filter(c => Number(c.admission) === Number(this.admissionId));
        
        console.log('Consultations filtrées à afficher :', this.consultations);
      },
      error: (err) => console.error('Erreur chargement consultations :', err)
    });
  }
}
  // Action Infirmière
  saisirConstantes(): void {
    this.clinicService.addConstantes(this.nouvelleConstante).subscribe({
      next: () => {
        this.clinicService.updateStatutAdmission(this.nouvelleConstante.admission, 'CHEZ_LE_MEDECIN').subscribe();
        alert('Constantes enregistrées !');
        this.chargerDonnees();
      },
      error: (err) => console.error('Erreur constantes', err)
    });
  }

  // Action Médecin
  saisirConsultation(): void {
    this.clinicService.addConsultation(this.nouvelleConsultation).subscribe({
      next: () => {
        this.clinicService.updateStatutAdmission(this.nouvelleConsultation.admission, 'FINI').subscribe();
        alert('Consultation et ordonnance enregistrées !');
        
        // Réinitialisation du formulaire
        this.nouvelleConsultation = {
          admission: this.admissionId,
          examen_clinique: '',
          diagnostic: '',
          remarques: ''
        };
        
        this.chargerDonnees();
      },
      error: (err) => console.error('Erreur consultation', err)
    });
  }

  getUrgenceBadgeClass(degre: string): string {
    switch (degre) {
      case 'ROUGE': return 'badge-rouge';
      case 'JAUNE': return 'badge-jaune';
      case 'VERT': return 'badge-vert';
      default: return 'badge-gris';
    }
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}
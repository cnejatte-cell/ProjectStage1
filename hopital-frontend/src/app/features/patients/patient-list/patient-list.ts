import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink,  RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';

// Import du service et des modèles
import {
  ClinicService,
  Admission,
  Constante,
  Patient,
  PaginatedResponse
} from '../../../core/services/clinic';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.scss']
})
export class PatientListComponent implements OnInit {

  private clinicService = inject(ClinicService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // Exposer Math pour l'utiliser dans le template si besoin
  Math = Math;
   Array = Array; // Exposer Array pour le template

  // =========================================
  // PROPRIÉTÉS DU MODAL & DU FORMULAIRE
  // =========================================
  showModal = false;
  showAdmissionModal = false;
  isEditMode = false;
  searchTerm = '';

  // Messages d'erreur
  nomError = '';
  prenomError = '';
  phoneError = '';

  // Objet Patient courant
  currentPatient: Patient = {
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    genre: 'M'
  };

  // Données d'admission
  admissionData = {
    motif: '',
    service: ''
  };

  patients: Patient[] = [];

  // =========================================
  // PAGINATION
  // =========================================
  currentPage: number = 1;
  pageSize: number = 5; // Nombre de patients affichés par page

  // Dans patient-list.ts
get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  // Patients découpés pour la page courante
  get paginatedPatients(): Patient[] {
    const filtered = this.filteredPatients;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  // Nombre total de pages selon les résultats filtrés
  get totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // =========================================
  // DÉFILEMENT AUTOMATIQUE VERS LA LISTE
  // =========================================
  scrollToListePatients(): void {
    const element = document.getElementById('liste-patients');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // =========================================
  // STATISTIQUES (KPI)
  // =========================================
  get totalHommes(): number {
    return this.patients.filter(p => (p.genre as string) === 'M' || (p.genre as string) === 'Masculin').length;
  }

  get totalFemmes(): number {
    return this.patients.filter(p => (p.genre as string) === 'F' || (p.genre as string) === 'Féminin').length;
  }

  // =========================================
  // INITIALISATION
  // =========================================
  ngOnInit(): void {
    this.chargerPatients();
  }

  chargerPatients(): void {
    this.clinicService.getPatients().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.patients = data;
        } else if (data?.content && Array.isArray(data.content)) {
          this.patients = data.content;
        } else if (data?.results && Array.isArray(data.results)) {
          this.patients = data.results;
        } else {
          this.patients = [];
        }
        this.currentPage = 1; // Réinitialise la page courante à 1 après le chargement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.showToast('error', 'Erreur lors du chargement des patients.');
      }
    });
  }

  // =========================================
  // VALIDATIONS DES CHAMPS DU FORMULAIRE
  // =========================================
  validateNom(): boolean {
    if (!this.currentPatient.nom?.trim()) {
      this.nomError = 'Le nom est obligatoire.';
      return false;
    }
    this.nomError = '';
    return true;
  }

  validatePrenom(): boolean {
    if (!this.currentPatient.prenom?.trim()) {
      this.prenomError = 'Le prénom est obligatoire.';
      return false;
    }
    this.prenomError = '';
    return true;
  }

  validatePhone(): boolean {
    const phone = (this.currentPatient.telephone || '').trim();

    if (!phone) {
      this.phoneError = 'Le numéro de téléphone est obligatoire.';
      return false;
    }

    // Mauritanie : 8 chiffres commençant par 2, 3 ou 4 (+222 / 00222 optionnel)
    const mauritaniaRegex = /^(?:\+222|00222)?[234]\d{7}$/;

    if (!mauritaniaRegex.test(phone)) {
      this.phoneError = 'Veuillez saisir un numéro mauritanien valide (8 chiffres commençant par 2, 3 ou 4).';
      return false;
    }

    this.phoneError = '';
    return true;
  }

  resetErrors(): void {
    this.nomError = '';
    this.prenomError = '';
    this.phoneError = '';
  }

  // =========================================
  // RECHERCHE (FILTRAGE MAURITANIEN LOCAL)
  // =========================================
  onSearchChange(): void {
    if (/^\d+$/.test(this.searchTerm) && this.searchTerm.length > 8) {
      this.searchTerm = this.searchTerm.slice(0, 8);
    }
    this.currentPage = 1; // Revenir à la page 1 lors d'une nouvelle recherche
  }

  get filteredPatients(): Patient[] {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      return this.patients;
    }

    const rawTerm = this.searchTerm.toLowerCase().trim();
    const cleanDigits = rawTerm.replace(/\D/g, '');

    return this.patients.filter(patient => {
      const nom = (patient.nom || '').toLowerCase();
      const prenom = (patient.prenom || '').toLowerCase();
      const matchNom = nom.includes(rawTerm);
      const matchPrenom = prenom.includes(rawTerm);

      let matchTel = false;
      if (patient.telephone) {
        const cleanPhone = patient.telephone.replace(/\D/g, '');
        const isValidMauritanianPhone = /^[234]\d{7}$/.test(cleanDigits);

        if (isValidMauritanianPhone) {
          matchTel = cleanPhone.endsWith(cleanDigits);
        } else if (cleanDigits.length > 0) {
          matchTel = cleanPhone.includes(cleanDigits);
        }
      }

      return matchNom || matchPrenom || matchTel;
    });
  }

  // =========================================
  // GESTION DU MODAL PATIENT (AJOUT / MODIF)
  // =========================================
  openAddModal(): void {
    this.isEditMode = false;
    this.resetErrors();
    this.currentPatient = {
      nom: '',
      prenom: '',
      telephone: '',
      date_naissance: '',
      genre: 'M'
    };
    this.showModal = true;
  }

  openEditModal(patient: Patient): void {
    this.isEditMode = true;
    this.resetErrors();
    this.currentPatient = { ...patient };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetErrors();
  }

  savePatient(): void {
    const isNomValid = this.validateNom();
    const isPrenomValid = this.validatePrenom();
    const isPhoneValid = this.validatePhone();

    if (!isNomValid || !isPrenomValid || !isPhoneValid) {
      return;
    }

    const request$ = this.isEditMode && this.currentPatient.id
      ? this.clinicService.updatePatient(this.currentPatient.id, this.currentPatient)
      : this.clinicService.createPatient(this.currentPatient);

    request$.subscribe({
      next: () => {
        this.showToast('success', this.isEditMode ? 'Patient modifié avec succès.' : 'Patient créé avec succès.');
        this.closeModal();
        this.chargerPatients();
      },
      error: (err) => {
        console.error('Erreur sauvegarde patient:', err);
        this.showAlert('Erreur', 'Erreur lors de l\'enregistrement.', 'error');
      }
    });
  }

  // =========================================
  // GESTION DU MODAL ADMISSION
  // =========================================
  openAdmissionModal(patient: Patient): void {
    this.currentPatient = { ...patient };
    this.admissionData = { motif: '', service: '' };
    this.showAdmissionModal = true;
  }

  closeAdmissionModal(): void {
    this.showAdmissionModal = false;
    this.admissionData = { motif: '', service: '' };
  }

  saveAdmission(): void {
    if (!this.admissionData.motif.trim()) {
      this.showToast('error', 'Le motif d\'admission est requis.');
      return;
    }

    const payload = {
      patient_id: this.currentPatient.id,
      diagnostic: this.admissionData.motif,
      service: this.admissionData.service
    };

    this.clinicService.createAdmission(payload).subscribe({
      next: () => {
        this.showToast('success', `Admission créée pour ${this.currentPatient.prenom} ${this.currentPatient.nom}`);
        this.closeAdmissionModal();
      },
      error: (err) => {
        console.error('Erreur création admission:', err);
        this.showAlert('Erreur', 'Impossible de créer l\'admission.', 'error');
      }
    });
  }

  // =========================================
  // SUPPRESSION PATIENT
  // =========================================
  onDelete(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action supprimera définitivement le patient.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'medlink-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.clinicService.deletePatient(id).subscribe({
          next: () => {
            this.showToast('success', 'Patient supprimé avec succès.');
            this.chargerPatients();
          },
          error: (err) => {
            console.error('Erreur suppression:', err);
            this.showAlert('Erreur', 'Impossible de supprimer le patient.', 'error');
          }
        });
      }
    });
  }

  // =========================================
  // MÉTHODE DE DÉCONNEXION
  // =========================================
  onLogout(): void {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Voulez-vous vraiment vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Déconnexion',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'medlink-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();

        this.showToast('info', 'Déconnexion réussie.');
        this.router.navigate(['/login']);
      }
    });
  }

  // =========================================
  // NOTIFICATIONS SWEETALERT2
  // =========================================
  private showAlert(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info'): void {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      customClass: {
        popup: 'medlink-popup'
      }
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
      timerProgressBar: true,
      customClass: {
        popup: 'medlink-toast'
      }
    });
  }
}
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

// Import du service et des modèles
import {
  ClinicService,
  Admission,
  Constante,
  Patient
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

  // =========================================
  // PROPRIÉTÉS DU MODAL & DU FORMULAIRE
  // =========================================
  showModal = false;
  isEditMode = false;
  searchTerm = '';

  // Messages d'erreur
  nomError = '';
  prenomError = '';
  phoneError = '';

  currentPatient: Patient = {
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    genre: 'M'
  };

  patients: Patient[] = [];

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
      next: (data) => {
        this.patients = data;
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

    // RegEx : 8 chiffres commençant par 2, 3 ou 4 (Chinguitel, Mauritel, Mattel)
    // Accepte également le format international (+222 ou 00222)
    const mauritaniaRegex = /^(?:\+222|00222)?[234]\d{7}$/;

    if (!mauritaniaRegex.test(phone)) {
      this.phoneError = 'Numéro invalide (Mauritel, Mattel ou Chinguitel : 8 chiffres commençant par 2, 3 ou 4).';
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
  // RECHERCHE (FILTRAGE MAURITANIEN)
  // =========================================
  onSearchChange(): void {
    if (/^\d+$/.test(this.searchTerm) && this.searchTerm.length > 8) {
      this.searchTerm = this.searchTerm.slice(0, 8);
    }
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
  // GESTION DU MODAL & SAUVEGARDE
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

    // Bloque la sauvegarde si l'un des champs est invalide
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
  // MÉTHODE DE DÉCONNEXION (AVEC REDIRECTION)
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
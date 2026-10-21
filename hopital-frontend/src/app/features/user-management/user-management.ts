import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService, UserAccount } from '../../core/services/user.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit {

  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  users: UserAccount[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;

  currentPage: number = 1;
  pageSize: number = 5;

  currentUser: UserAccount = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'INFIRMIER',
    telephone: '',
    is_active: true,
    password: ''
  };

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  onLogout(): void {
  localStorage.clear();
  sessionStorage.clear();
  this.router.navigate(['/login']);
}

  chargerUtilisateurs(): void {
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.users = data;
        } else if (data?.results && Array.isArray(data.results)) {
          this.users = data.results;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement des utilisateurs:', err)
    });
  }

  get filteredUsers(): UserAccount[] {
    if (!this.searchTerm.trim()) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u =>
      u.username?.toLowerCase().includes(term) ||
      u.first_name?.toLowerCase().includes(term) ||
      u.last_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  }

  get paginatedUsers(): UserAccount[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentUser = {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'MEDECIN',
      telephone: '',
      is_active: true,
      password: ''
    };
    this.showModal = true;
  }

  openEditModal(user: UserAccount): void {
    this.isEditMode = true;
    this.currentUser = { ...user, password: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
  const req$ = this.isEditMode && this.currentUser.id
    ? this.userService.updateUser(this.currentUser.id, this.currentUser)
    : this.userService.createUser(this.currentUser);

  req$.subscribe({
    next: () => {
      Swal.fire('Succès', `Utilisateur ${this.isEditMode ? 'modifié' : 'créé'} avec succès.`, 'success');
      this.closeModal();
      this.chargerUtilisateurs();
    },
    error: (err) => {
      console.error('Erreur API Django :', err);
      
      // Extraction des messages d'erreur renvoyés par Django REST Framework
      let errorMessage = "Impossible d'enregistrer l'utilisateur.";
      if (err.error && typeof err.error === 'object') {
        const details = Object.entries(err.error)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        if (details) errorMessage = details;
      }

      Swal.fire('Erreur Backend', errorMessage, 'error');
    }
  });
}
  onDelete(id?: number): void {
    if (!id) return;
    Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'Le compte a été supprimé.', 'success');
            this.chargerUtilisateurs();
          },
          error: (err) => Swal.fire('Erreur', 'Impossible de supprimer.', 'error')
        });
      }
    });
  }
}
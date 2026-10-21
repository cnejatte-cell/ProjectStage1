import { delay } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// =========================================
// MODÈLES / INTERFACES
// =========================================

export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  date_naissance?: string;
  genre?: 'M' | 'F';
}

export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];   // Django REST Framework (Pagination standard)
  content?: T[];   // Pour pagination personnalisée
}

export interface Admission {
  id?: number;
  patient: number | {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    date_naissance?: string;
    genre?: string;
  };
  date_admission?: string;
  diagnostic?: string;
  statut?: string;
  motif?: string;
  service?: string;
}

export interface Constante {
  id?: number;
  admission: number;
  temperature: number;
  tension: string;
  glycemie?: number;
  degre_urgence: 'ROUGE' | 'JAUNE' | 'VERT' | 'GRIS';
}

export interface Consultation {
  id?: number;
  admission: number;
  examen_clinique: string;
  diagnostic: string;
  remarques?: string;
}

export interface Medicament {
  id?: number;
  nom: string;
  description?: string;
}

export interface Prescription {
  id?: number;
  ordonnance: number;
  medicament: number;
  dosage: string;
  frequence: string;
  duree: string;
  instructions?: string;
}

export interface Ordonnance {
  id?: number;
  consultation: number;
  date_creation?: string;
  instructions_generales?: string;
  prescriptions?: Prescription[];
}

// =========================================
// SERVICE CLINIQUE
// =========================================

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8080/api';

  /**
   * Récupère le token JWT du localStorage et génère les en-têtes HTTP
   */
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // --- Patients ---
  getPatients(): Observable<Patient[] | PaginatedResponse<Patient>> {
    return this.http.get<Patient[] | PaginatedResponse<Patient>>(`${this.apiUrl}/patients/`, this.getAuthHeaders());
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients/`, patient, this.getAuthHeaders());
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}/`, patient, this.getAuthHeaders());
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patients/${id}/`, this.getAuthHeaders());
  }

  // --- Admissions ---
  createAdmission(admissionData: Partial<Admission> | any): Observable<Admission> {
    return this.http.post<Admission>(`${this.apiUrl}/admissions/`, admissionData, this.getAuthHeaders());
  }

  getAdmissions(): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/admissions/`, this.getAuthHeaders());
  }

  updateStatutAdmission(id: number, statut: string): Observable<Admission> {
    return this.http.patch<Admission>(`${this.apiUrl}/admissions/${id}/`, { statut }, this.getAuthHeaders());
  }

  // --- Médicaments ---
  getMedicaments(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(`${this.apiUrl}/medicaments/`, this.getAuthHeaders());
  }

  // --- Ordonnances ---
  getOrdonnances(): Observable<Ordonnance[]> {
    return this.http.get<Ordonnance[]>(`${this.apiUrl}/ordonnances/`, this.getAuthHeaders());
  }

  addOrdonnance(ordonnance: { consultation: number; instructions_generales?: string }): Observable<Ordonnance> {
    return this.http.post<Ordonnance>(`${this.apiUrl}/ordonnances/`, ordonnance, this.getAuthHeaders());
  }

  createOrdonnance(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ordonnances/`, data, this.getAuthHeaders());
  }

  // --- Prescriptions ---
  getPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/prescriptions/`, this.getAuthHeaders());
  }

  addPrescription(prescription: {
    ordonnance: number;
    medicament: number;
    dosage: string;
    frequence: string;
    duree: string;
    instructions?: string;
  }): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/prescriptions/`, prescription, this.getAuthHeaders());
  }

  createPrescription(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/prescriptions/`, payload, this.getAuthHeaders());
  }

  getPrescriptionsByOrdonnance(ordonnanceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/prescriptions/?ordonnance=${ordonnanceId}`, this.getAuthHeaders());
  }

  // --- Constantes ---
  addConstantes(constante: Constante): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/constantes/`, constante, this.getAuthHeaders());
  }

  getConstantes(): Observable<Constante[]> {
    return this.http.get<Constante[]>(`${this.apiUrl}/constantes/`, this.getAuthHeaders());
  }

  addVitalSigns(admissionId: number, constante: any): Observable<any> {
    const data = {
      admission: admissionId,
      temperature: constante.temperature,
      tension: constante.tension,
      glycemie: constante.glycemie || null,
      degre_urgence: constante.degre_urgence || 'VERT'
    };
    return this.http.post<any>(`${this.apiUrl}/constantes/`, data, this.getAuthHeaders());
  }

  // --- Consultations ---
  getConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.apiUrl}/consultations/`, this.getAuthHeaders());
  }

  addConsultation(admissionId: number, consultation: any): Observable<Consultation> {
    const data = {
      admission: admissionId,
      examen_clinique: consultation.examen_clinique,
      diagnostic: consultation.diagnostic,
      remarques: consultation.remarques || ''
    };
    return this.http.post<Consultation>(`${this.apiUrl}/consultations/`, data, this.getAuthHeaders());
  }

  // --- Gestion des Utilisateurs (Admin) ---
  getUsers(): Observable<any> {
    return this.http.get<any>('http://127.0.0.1:8080/admin/users/', this.getAuthHeaders());
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>('http://127.0.0.1:8080/admin/users/', user, this.getAuthHeaders());
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`http://127.0.0.1:8080/admin/users/${id}/`, user, this.getAuthHeaders());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`http://127.0.0.1:8080/admin/users/${id}/`, this.getAuthHeaders());
  }
}
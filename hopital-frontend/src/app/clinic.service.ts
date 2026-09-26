import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// INTERFACES & MODÈLES DE DONNÉES
// ==========================================

export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  telephone?: string;
  date_naissance?: string;
  genre?: 'M' | 'F';
}

export interface Admission {
  id?: number;
  patient: {
    id: number;  
    nom: string;  
    prenom: string;  
    telephone?: string;  
    date_naissance?: string;  
    genre?: string;
  };
  date_admission?: string;
  diagnostic: string;
  statut: string;
}

export interface Constante {
  id?: number;
  admission: number;
  temperature: number;
  tension: string;
  glycemie?: number | null;
  degre_urgence: 'ROUGE' | 'JAUNE' | 'VERT' | 'GRIS';
}

export interface Medicament {
  id?: number;
  nom: string;
  description?: string;
}

export interface Consultation {
  id?: number;
  admission: number;
  examen_clinique: string;
  diagnostic: string;
  medicaments?: number[];
  remarques?: string;
}

export interface Ordonnance {
  id?: number;
  consultation: number;
  date_creation?: string;
  instructions_generales?: string | null;
}

export interface Prescription {
  id?: number;
  ordonnance: number;
  medicament: number;
  medicament_nom?: string;
  dosage: string;
  frequence: string;
  duree: string;
  instructions?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8080/api';

  // =========================
  // PATIENTS
  // =========================

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/patients/`);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}/`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients/`, patient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}/`, patient);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patients/${id}/`);
  }

  // =========================
  // ADMISSIONS
  // =========================

  getAdmissions(): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/admissions/`);
  }

  createAdmission(patientId: number): Observable<Admission> {
    const data = {  
      patient: patientId,  
      diagnostic: '',  
      statut: 'EN_ATTENTE'  
    };  
    return this.http.post<Admission>(`${this.apiUrl}/admissions/`, data);
  }

  updateStatutAdmission(id: number, statut: string): Observable<Admission> {
    return this.http.patch<Admission>(`${this.apiUrl}/admissions/${id}/`, { statut });
  }

  // =========================
  // MEDICAMENTS
  // =========================

  getMedicaments(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(`${this.apiUrl}/medicaments/`);
  }

  // =========================
  // CONSTANTES VITALES
  // =========================

  getConstantes(): Observable<Constante[]> {
    return this.http.get<Constante[]>(`${this.apiUrl}/constantes/`);
  }

  createConstante(constante: Partial<Constante>): Observable<Constante> {
    return this.http.post<Constante>(`${this.apiUrl}/constantes/`, constante);
  }

  addVitalSigns(admissionId: number, constante: any): Observable<Constante> {
    const data = {  
      admission: admissionId,  
      temperature: Number(constante.temperature),  
      tension: constante.tension,  
      glycemie: constante.glycemie === '' || constante.glycemie === null ? null : Number(constante.glycemie),  
      degre_urgence: constante.degre_urgence || 'VERT'  
    };  
    return this.http.post<Constante>(`${this.apiUrl}/constantes/`, data);
  }

  // =========================
  // CONSULTATIONS
  // =========================

  getConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.apiUrl}/consultations/`);
  }

  addConsultation(admissionId: number, consultation: any): Observable<Consultation> {
    const data = {  
      admission: admissionId,  
      examen_clinique: consultation.examen_clinique,  
      diagnostic: consultation.diagnostic,  
      medicaments: consultation.medicaments || [],  
      remarques: consultation.remarques || ''  
    };  
    return this.http.post<Consultation>(`${this.apiUrl}/consultations/`, data);
  }

  // =========================
  // ORDONNANCES
  // =========================

  getOrdonnances(): Observable<Ordonnance[]> {
    return this.http.get<Ordonnance[]>(`${this.apiUrl}/ordonnances/`);
  }

  getOrdonnance(id: number): Observable<Ordonnance> {
    return this.http.get<Ordonnance>(`${this.apiUrl}/ordonnances/${id}/`);
  }

  createOrdonnance(consultationId: number, instructions: string): Observable<Ordonnance> {
    const data = {
      consultation: consultationId,
      instructions_generales: instructions
    };
    return this.http.post<Ordonnance>(`${this.apiUrl}/ordonnances/`, data);
  }

  // =========================
  // PRESCRIPTIONS
  // =========================

  getPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/prescriptions/`);
  }

  addPrescription(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/prescriptions/`, prescription);
  }
}
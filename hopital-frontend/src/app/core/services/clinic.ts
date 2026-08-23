import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  date_naissance?: string;
  genre?: 'M' | 'F';
}

export interface Admission {
  id?: number;
  patient: number;
  motif: string;
  statut?: string;
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
  medicaments?: string[];
  remarques?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ClinicService {

     private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api'; // Ajustez l'URL de votre backend Django

  getConsultations(): Observable<Consultation[]> {
  return this.http.get<Consultation[]>(`${this.apiUrl}/consultations/`);
}
  // Donnees de test stockees directement en mémoire
  private mockPatients: Patient[] = [
    { id: 1, nom: 'El Amrani', prenom: 'Amine', telephone: '0612345678', date_naissance: '1995-04-12', genre: 'M' },
    { id: 2, nom: 'Benali', prenom: 'Sarah', telephone: '0687654321', date_naissance: '1998-09-25', genre: 'F' }
  ];

  private mockAdmissions: Admission[] = [
    { id: 101, patient: 1, motif: 'Fièvre forte', statut: 'EN_ATTENTE' }
  ];

  private mockConstantes: Constante[] = [];
  private mockConsultations: Consultation[] = [];

  // Simulateurs d'appels API
  getPatients(): Observable<Patient[]> {
    return of([...this.mockPatients]).pipe(delay(100));
  }

  createPatient(patient: Patient): Observable<Patient> {
    const newPatient = { ...patient, id: Date.now() };
    this.mockPatients.push(newPatient);
    return of(newPatient).pipe(delay(100));
  }

  deletePatient(id: number): Observable<void> {
    this.mockPatients = this.mockPatients.filter(p => p.id !== id);
    return of(undefined).pipe(delay(100));
  }

  getAdmissions(): Observable<Admission[]> {
    return of([...this.mockAdmissions]).pipe(delay(100));
  }

  getConstantes(): Observable<Constante[]> {
    return of([...this.mockConstantes]).pipe(delay(100));
  }

  addConstantes(constante: Constante): Observable<Constante> {
    const newConst = { ...constante, id: Date.now() };
    this.mockConstantes.push(newConst);
    return of(newConst).pipe(delay(100));
  }

  addConsultation(consultation: Consultation): Observable<Consultation> {
    const newConsult = { ...consultation, id: Date.now() };
    this.mockConsultations.push(newConsult);
    return of(newConsult).pipe(delay(100));
  }

  updateStatutAdmission(id: number, statut: string): Observable<Admission> {
    const admission = this.mockAdmissions.find(a => a.id === id);
    if (admission) {
      admission.statut = statut;
    }
    return of(admission!).pipe(delay(100));
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicService } from './../clinic.service'; // تأكدي أن مسار الـ Service صحيح لديكِ
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
  
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  patients: any[] = [];
  
  newAppointment: any = {
    patient: '',
    date_heure: '',
    statut: 'En attente'
  };

  constructor(private clinicService: ClinicService, private router: Router) {}

  ngOnInit(): void {
    this.chargerAppointments();
    this.chargerPatients();
  }

  // جلب قائمة المواعيد من Django
  chargerAppointments(): void {
    this.clinicService.getAppointments().subscribe({
      next: (data: any) => {
        this.appointments = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous', err);
      }
    });
  }

  // جلب قائمة المرضى لربطهم بالقائمة المنسدلة
  chargerPatients(): void {
    this.clinicService.getPatients().subscribe({
      next: (data: any) => {
        this.patients = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des patients', err);
      }
    });
  }

  // إضافة موعد جديد وإرساله للـ Backend
  createAppointment(): void {
    if (!this.newAppointment.patient || !this.newAppointment.date_heure) {
      alert('Veuillez remplir les champs obligatoires (Patient et Date/Heure)');
      return;
    }

    this.clinicService.createAppointment(this.newAppointment).subscribe({
      next: () => {
        this.chargerAppointments();
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur lors de la création du rendez-vous', err);
        alert('Erreur: ' + JSON.stringify(err.error));
      }
    });
  }

  // حذف موعد
  deleteAppointment(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.clinicService.deleteAppointment(id).subscribe({
        next: () => {
          this.chargerAppointments();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
        }
      });
    }
  }

  resetForm(): void {
    this.newAppointment = {
      patient: '',
      date_heure: '',
      statut: 'En attente'
    };
  }
}
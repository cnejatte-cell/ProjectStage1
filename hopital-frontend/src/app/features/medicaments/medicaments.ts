import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Medicament {
  id: number;
  name: string;
  dosage: string;
  form: string;
  status: string;
}

@Component({
  selector: 'app-medicaments',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './medicaments.html',
  styleUrl: './medicaments.scss'
})
export class MedicamentsComponent {

  search = '';

  showForm = false;

  medicaments: Medicament[] = [];

  newMedicament = {
    name: '',
    dosage: '',
    form: ''
  };


  get filteredMedicaments() {

    return this.medicaments.filter(m =>
      m.name
        .toLowerCase()
        .includes(this.search.toLowerCase())
    );

  }


  openForm() {

    this.showForm = true;

  }


  closeForm() {

    this.showForm = false;

  }


  addMedicament() {

    if (!this.newMedicament.name) {
      return;
    }

    this.medicaments.push({

      id: Date.now(),

      name: this.newMedicament.name,

      dosage: this.newMedicament.dosage,

      form: this.newMedicament.form,

      status: 'Actif'

    });

    this.newMedicament = {
      name: '',
      dosage: '',
      form: ''
    };

    this.showForm = false;

  }


  deleteMedicament(id: number) {

    this.medicaments =
      this.medicaments.filter(m => m.id !== id);

  }

}
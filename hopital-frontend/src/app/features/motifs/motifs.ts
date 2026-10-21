import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Motif {
  id: number;
  name: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-motifs',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './motifs.html',
  styleUrl: './motifs.scss'
})
export class MotifsComponent {

  search = '';

  showForm = false;

  motifs: Motif[] = [];

  newMotif = {
    name: '',
    description: ''
  };


  get filteredMotifs() {

    return this.motifs.filter(m =>
      m.name
        .toLowerCase()
        .includes(this.search.toLowerCase())
    );

  }


  addMotif() {

    if (!this.newMotif.name) {
      return;
    }

    this.motifs.push({

      id: Date.now(),

      name: this.newMotif.name,

      description: this.newMotif.description,

      status: 'Actif'

    });

    this.newMotif = {
      name: '',
      description: ''
    };

    this.showForm = false;

  }


  deleteMotif(id: number) {

    this.motifs =
      this.motifs.filter(m => m.id !== id);

  }

}
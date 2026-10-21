
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent {

  clinicName = 'Clinica';

  email = '';

  phone = '';

  address = '';

  save() {

    alert('Paramètres enregistrés');

  }

}
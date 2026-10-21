import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { MedicalRecordComponent } from './medical-record';

describe('MedicalRecordComponent', () => {
  let component: MedicalRecordComponent;
  let fixture: ComponentFixture<MedicalRecordComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu'aucune requête HTTP non gérée ne subsiste
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges(); // Déclenche ngOnInit

    // Annule/Répond aux requêtes HTTP initiales si le composant en émet au démarrage
    httpMock.match(() => true).forEach(req => req.flush([]));

    expect(component).toBeTruthy();
  });
});
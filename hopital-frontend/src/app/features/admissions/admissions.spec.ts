import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionsComponent } from './admissions';

describe('Admissions', () => {
  let component: AdmissionsComponent;
  let fixture: ComponentFixture<AdmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

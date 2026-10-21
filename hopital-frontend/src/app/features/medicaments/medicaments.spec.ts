import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Medicaments } from './medicaments';

describe('Medicaments', () => {
  let component: Medicaments;
  let fixture: ComponentFixture<Medicaments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Medicaments],
    }).compileComponents();

    fixture = TestBed.createComponent(Medicaments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

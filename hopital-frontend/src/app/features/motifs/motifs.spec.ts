import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Motifs } from './motifs';

describe('Motifs', () => {
  let component: Motifs;
  let fixture: ComponentFixture<Motifs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Motifs],
    }).compileComponents();

    fixture = TestBed.createComponent(Motifs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

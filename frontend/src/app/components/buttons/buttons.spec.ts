import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buttons } from './buttons';

describe('Buttons', () => {
  let component: Buttons;
  let fixture: ComponentFixture<Buttons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buttons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buttons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

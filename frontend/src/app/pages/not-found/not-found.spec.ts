import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFound } from './not-found';
import { Component } from '@angular/core';
import { ClientSidebar } from '../../sidebar/client-sidebar/client-sidebar';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  template: ''
})
class MockClientSidebar {}

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound]
    })
    .overrideComponent(NotFound, {
      remove: { imports: [ClientSidebar] },
      add: { imports: [MockClientSidebar] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

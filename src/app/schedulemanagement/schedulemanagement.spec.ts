import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Schedulemanagement } from './schedulemanagement';

describe('Schedulemanagement', () => {
  let component: Schedulemanagement;
  let fixture: ComponentFixture<Schedulemanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Schedulemanagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Schedulemanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

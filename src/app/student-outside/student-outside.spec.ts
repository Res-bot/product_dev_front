import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentOutside } from './student-outside';

describe('StudentOutside', () => {
  let component: StudentOutside;
  let fixture: ComponentFixture<StudentOutside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentOutside]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentOutside);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

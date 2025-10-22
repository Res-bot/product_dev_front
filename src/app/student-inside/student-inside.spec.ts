import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Studentinside } from './student-inside.component';


describe('StudentInside', () => {
  let component: Studentinside;
  let fixture: ComponentFixture<Studentinside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Studentinside]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Studentinside);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

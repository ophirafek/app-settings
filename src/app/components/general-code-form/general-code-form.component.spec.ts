import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralCodeFormComponent } from './general-code-form.component';

describe('GeneralCodeFormComponent', () => {
  let component: GeneralCodeFormComponent;
  let fixture: ComponentFixture<GeneralCodeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralCodeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralCodeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

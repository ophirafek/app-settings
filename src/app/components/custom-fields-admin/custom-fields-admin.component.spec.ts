import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFieldsAdminComponent } from './custom-fields-admin.component';

describe('CustomFieldsAdminComponent', () => {
  let component: CustomFieldsAdminComponent;
  let fixture: ComponentFixture<CustomFieldsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFieldsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFieldsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

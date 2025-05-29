import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomFieldService } from 'custom-field-lib';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-custom-fields-admin',
  templateUrl: './custom-fields-admin.component.html',
  styleUrls: ['./custom-fields-admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class CustomFieldsAdminComponent implements OnInit {
  @ViewChild('fieldDialog') fieldDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  // List display
  customFields: any[] = [];
  displayedColumns: string[] = ['active', 'name', 'type', 'group', 'required', 'actions'];
  selectedEntityType: string = 'lead';
  loading: boolean = false;

  // Form
  fieldForm: FormGroup;
  dialogRef: MatDialogRef<any> | null = null;
  isEditMode: boolean = false;
  editingFieldId: number | null = null;

  // Available field types
  fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Checkbox' },
    { value: 'select', label: 'Select' },
    { value: 'multi-select', label: 'Multi-Select' },
    { value: 'general-code', label: 'General Code' }
  ];

  constructor(
    private fb: FormBuilder,
    private customFieldService: CustomFieldService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    // Initialize form
    this.fieldForm = this.createFieldForm();
    customFieldService.apiUrl = `${environment.apiUrl}/api/customfields`
  }

  ngOnInit(): void {
    // Check for entity type in query params
    this.route.queryParams.subscribe(params => {
      if (params['entityType']) {
        this.selectedEntityType = params['entityType'];
      }
      this.loadCustomFields();
    });
  }

  loadCustomFields(): void {
    this.loading = true;
    this.customFieldService.getDefinitionsByEntityType(this.selectedEntityType)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (fields) => {
          this.customFields = fields || [];
        },
        error: (error) => {
          console.error('Error loading custom fields:', error);
          this.showMessage('Failed to load custom fields', 'error');
        }
      });
  }

  createFieldForm(): FormGroup {
    return this.fb.group({
      id: [0],
      entityType: [this.selectedEntityType],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      displayName: ['', Validators.required],
      description: [''],
      fieldType: ['text', Validators.required],
      isRequired: [false],
      isActive: [true],
      isVisible: [true],
      groupName: ['General'],
      sortOrder: [0],
      maxLength: [null],
      minValue: [null],
      maxValue: [null],
      defaultValue: [null],
      generalCodeType: [null],
      options: this.fb.array([])
    });
  }

  get optionsFormArray(): FormArray {
    return this.fieldForm.get('options') as FormArray;
  }

  addOption(): void {
    const newOption = this.fb.group({
      id: [0],
      value: ['', Validators.required],
      displayText: ['', Validators.required],
      sortOrder: [this.optionsFormArray.length]
    });
    
    this.optionsFormArray.push(newOption);
  }

  removeOption(index: number): void {
    this.optionsFormArray.removeAt(index);
  }

  openAddFieldDialog(): void {
    // Reset form for new field
    this.fieldForm = this.createFieldForm();
    this.fieldForm.patchValue({
      entityType: this.selectedEntityType
    });
    this.isEditMode = false;
    this.editingFieldId = null;
    
    // Calculate next sort order
    if (this.customFields.length > 0) {
      const maxSortOrder = Math.max(...this.customFields.map(f => f.sortOrder || 0));
      this.fieldForm.get('sortOrder')?.setValue(maxSortOrder + 10);
    }
    
    // Add initial option for select types
    this.addOption();
    
    // Open dialog
    this.dialogRef = this.dialog.open(this.fieldDialog, {
      width: '700px',
      disableClose: true
    });
  }

  editField(field: any): void {
    this.isEditMode = true;
    this.editingFieldId = field.id;
    
    // Reset form and populate with field data
    this.fieldForm = this.createFieldForm();
    this.fieldForm.patchValue({
      id: field.id,
      entityType: field.entityType,
      name: field.name,
      displayName: field.displayName,
      description: field.description || '',
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      isActive: field.isActive,
      isVisible: field.isVisible !== undefined ? field.isVisible : true,
      groupName: field.groupName || 'General',
      sortOrder: field.sortOrder || 0,
      maxLength: field.maxLength,
      minValue: field.minValue,
      maxValue: field.maxValue,
      defaultValue: field.defaultValue,
      generalCodeType: field.generalCodeType
    });

    // Populate options if they exist
    if (field.options && field.options.length > 0) {
      // Clear existing options
      while (this.optionsFormArray.length !== 0) {
        this.optionsFormArray.removeAt(0);
      }
      
      // Add field options
      field.options.forEach((option: any) => {
        const optionGroup = this.fb.group({
          id: [option.id || 0],
          value: [option.value, Validators.required],
          displayText: [option.displayText, Validators.required],
          sortOrder: [option.sortOrder || 0]
        });
        this.optionsFormArray.push(optionGroup);
      });
    } else if (this.needsOptions(field.fieldType)) {
      // Add one empty option for select types
      this.addOption();
    }
    
    // Open dialog
    this.dialogRef = this.dialog.open(this.fieldDialog, {
      width: '700px',
      disableClose: true
    });
  }

  saveField(): void {
    if (this.fieldForm.invalid) {
      this.markFormGroupTouched(this.fieldForm);
      return;
    }

    const formValue = this.fieldForm.value;
    
    // Prepare the definition object
    const definition = {
      ...formValue,
      entityType: this.selectedEntityType
    };

    // Clean up options if not needed
    if (!this.needsOptions(definition.fieldType)) {
      definition.options = [];
    }

    this.customFieldService.saveDefinition(definition)
      .subscribe({
        next: (savedDefinition) => {
          // Save options if this is a select type field
          if (this.needsOptions(definition.fieldType) && definition.options?.length > 0) {
            this.customFieldService.saveOptions(savedDefinition.id, definition.options)
              .subscribe({
                next: () => {
                  this.handleSaveSuccess();
                },
                error: (error) => {
                  console.error('Error saving options:', error);
                  this.showMessage('Field saved but failed to save options', 'error');
                  this.handleSaveSuccess();
                }
              });
          } else {
            this.handleSaveSuccess();
          }
        },
        error: (error) => {
          console.error('Error saving field:', error);
          this.showMessage('Failed to save field', 'error');
        }
      });
  }

  private handleSaveSuccess(): void {
    this.dialogRef?.close();
    this.loadCustomFields();
    const message = this.isEditMode ? 'Field updated successfully' : 'Field added successfully';
    this.showMessage(message, 'success');
  }

  toggleFieldActive(field: any): void {
    const updatedField = {
      ...field,
      isActive: !field.isActive
    };

    this.customFieldService.saveDefinition(updatedField)
      .subscribe({
        next: () => {
          this.loadCustomFields();
          const status = updatedField.isActive ? 'activated' : 'deactivated';
          this.showMessage(`Field ${status} successfully`, 'success');
        },
        error: (error) => {
          console.error('Error updating field status:', error);
          this.showMessage('Failed to update field status', 'error');
        }
      });
  }

  confirmDelete(field: any): void {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteField(field);
      }
    });
  }

  private deleteField(field: any): void {
    this.customFieldService.deleteDefinition(field.id)
      .subscribe({
        next: () => {
          this.loadCustomFields();
          this.showMessage('Field deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting field:', error);
          this.showMessage('Failed to delete field', 'error');
        }
      });
  }

  moveUp(field: any): void {
    const currentIndex = this.customFields.findIndex(f => f.id === field.id);
    if (currentIndex > 0) {
      this.swapFields(currentIndex, currentIndex - 1);
    }
  }

  moveDown(field: any): void {
    const currentIndex = this.customFields.findIndex(f => f.id === field.id);
    if (currentIndex < this.customFields.length - 1) {
      this.swapFields(currentIndex, currentIndex + 1);
    }
  }

  private swapFields(index1: number, index2: number): void {
    // Update sort orders
    const field1 = this.customFields[index1];
    const field2 = this.customFields[index2];
    
    const tempSortOrder = field1.sortOrder;
    field1.sortOrder = field2.sortOrder;
    field2.sortOrder = tempSortOrder;

    // Create array of field IDs in new order
    const fieldIds = this.customFields
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(f => f.id);

    this.customFieldService.updateDefinitionSortOrder(fieldIds)
      .subscribe({
        next: () => {
          this.loadCustomFields();
          this.showMessage('Field order updated successfully', 'success');
        },
        error: (error) => {
          console.error('Error updating field order:', error);
          this.showMessage('Failed to update field order', 'error');
        }
      });
  }

  isFirstField(field: any): boolean {
    return this.customFields.indexOf(field) === 0;
  }

  isLastField(field: any): boolean {
    return this.customFields.indexOf(field) === this.customFields.length - 1;
  }

  getFieldTypeClass(fieldType: string): string {
    const classMap: { [key: string]: string } = {
      'text': 'bg-blue-100 text-blue-800',
      'textarea': 'bg-blue-100 text-blue-800',
      'number': 'bg-green-100 text-green-800',
      'date': 'bg-purple-100 text-purple-800',
      'boolean': 'bg-yellow-100 text-yellow-800',
      'select': 'bg-indigo-100 text-indigo-800',
      'multi-select': 'bg-indigo-100 text-indigo-800',
      'general-code': 'bg-gray-100 text-gray-800'
    };
    return classMap[fieldType] || 'bg-gray-100 text-gray-800';
  }

  getFieldTypeLabel(fieldType: string): string {
    return this.customFieldService.getFieldTypeLabel(fieldType);
  }

  private needsOptions(fieldType: string): boolean {
    return fieldType === 'select' || fieldType === 'multi-select';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
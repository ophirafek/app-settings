import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { CustomFieldService } from '../../services/custom-field.service';
import { CustomFieldDefinition, CustomFieldType } from '../../models/custom-field-definition.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-custom-fields-admin',
  templateUrl: './custom-fields-admin.component.html',
  styleUrls: ['./custom-fields-admin.component.css']
})
export class CustomFieldsAdminComponent implements OnInit {
  @ViewChild('fieldDialog') fieldDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  // List display
  customFields: CustomFieldDefinition[] = [];
  displayedColumns: string[] = ['active', 'name', 'type', 'group', 'required', 'actions'];
  selectedEntityType: string = 'lead';
  loading: boolean = false;

  // Form
  fieldForm: FormGroup;
  dialogRef: MatDialogRef<any> | null = null;
  isEditMode: boolean = false;
  editingFieldId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private customFieldService: CustomFieldService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService,
    private route: ActivatedRoute
  ) {
    // Initialize form
    this.fieldForm = this.createFieldForm();
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
    this.customFieldService.getFieldDefinitions(this.selectedEntityType)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (fields) => {
          this.customFields = fields;
        },
        error: (error) => {
          console.error('Error loading custom fields:', error);
          this.showMessage('SETTINGS.LOAD_ERROR', 'error');
        }
      });
  }

  createFieldForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      displayName: ['', Validators.required],
      description: [''],
      fieldType: ['text', Validators.required],
      isRequired: [false],
      isActive: [true],
      groupName: ['General'],
      maxLength: [null],
      minValue: [null],
      maxValue: [null],
      defaultValue: [null],
      generalCodeType: [null],
      options: this.fb.array([]),
      sortOrder: [0]
    });
  }

  get optionsFormArray(): FormArray {
    return this.fieldForm.get('options') as FormArray;
  }

  addOption(): void {
    const newOption = this.fb.group({
      id: [0],
      value: ['', Validators.required],
      displayText: ['', Validators.required]
    });
    
    this.optionsFormArray.push(newOption);
  }

  removeOption(index: number): void {
    this.optionsFormArray.removeAt(index);
  }

  openAddFieldDialog(): void {
    // Reset form for new field
    this.fieldForm = this.createFieldForm();
    this.isEditMode = false;
    this.editingFieldId = null;
    
    // Calculate next sort order
    if (this.customFields.length > 0) {
      const maxSortOrder = Math.max(...this.customFields.map(f => f.sortOrder));
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

  editField(field: CustomFieldDefinition): void {
    this.isEditMode = true;
    this.editingFieldId = field.id;
    
    // Reset form and populate with field data
    this.fieldForm = this.createFieldForm
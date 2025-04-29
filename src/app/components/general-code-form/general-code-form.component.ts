import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GeneralCodeService } from '../../services/general-code.service';
import { GeneralCode, CodeType, LanguageCode } from '../../models/general-code.model';

@Component({
  selector: 'app-general-code-form',
  templateUrl: './general-code-form.component.html',
  styleUrls: ['./general-code-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ]
})
export class GeneralCodeFormComponent implements OnInit {
  generalCodeForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  isNewGeneralCode: boolean;
  
  // For dropdowns
  codeTypes: GeneralCode[] = [];
  languageCodes = Object.entries(LanguageCode).filter(([key]) => isNaN(Number(key)));
  
  // Loading states
  isLoadingCodeTypes = false;
  
  // For component access to enums
  CodeType = CodeType;
  LanguageCode = LanguageCode;

  constructor(
    private fb: FormBuilder,
    private generalCodeService: GeneralCodeService,
    private dialogRef: MatDialogRef<GeneralCodeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { generalCode: GeneralCode }
  ) {
    this.isNewGeneralCode = this.data.generalCode.id === 0;
    
    this.generalCodeForm = this.fb.group({
      id: [this.data.generalCode.id],
      codeType: [
        this.data.generalCode.codeType, 
        [Validators.required]
      ],
      codeNumber: [
        this.data.generalCode.codeNumber, 
        [Validators.required, Validators.min(0)]
      ],
      codeShortDescription: [
        this.data.generalCode.codeShortDescription, 
        [
          Validators.required, 
          Validators.minLength(1), 
          Validators.maxLength(100)
        ]
      ],
      codeLongDescription: [
        this.data.generalCode.codeLongDescription
      ],
      languageCode: [
        this.data.generalCode.languageCode,
        [Validators.required]
      ],
      isActive: [this.data.generalCode.isActive]
    });
  }

  ngOnInit(): void {
    // Load code types from general codes with code type 0
    this.loadCodeTypes();
  }

  /**
   * Load code types from general codes
   */
  loadCodeTypes(): void {
    this.isLoadingCodeTypes = true;
    
    // Get code types from general codes type 0
    this.generalCodeService.getGeneralCodesByType(0)
      .subscribe({
        next: (codes) => {
          // Add code type 0 with value 'Code Type' if it doesn't exist
          const codeTypeZeroExists = codes.some(code => code.codeNumber === 0);
          
          if (!codeTypeZeroExists) {
            // Add code type 0 to the beginning of the array
            codes.unshift({
              id: 0, // This will be ignored when saving a new code
              codeType: 0,
              codeNumber: 0,
              codeShortDescription: 'Code Type',
              codeLongDescription: 'Used for defining code types',
              languageCode: 1,
              isActive: true
            });
          }
          
          this.codeTypes = codes;
          this.isLoadingCodeTypes = false;
        },
        error: (error) => {
          console.error('Error loading code types:', error);
          this.isLoadingCodeTypes = false;
          
          // Initialize with code type 0
          this.codeTypes = [{
            id: 0,
            codeType: 0,
            codeNumber: 0,
            codeShortDescription: 'Code Type',
            codeLongDescription: 'Used for defining code types',
            languageCode: 1,
            isActive: true
          }];
          
          // Also populate code types from the enum as fallback
          const enumCodeTypes = Object.entries(CodeType)
            .filter(([key]) => isNaN(Number(key)))
            .map(([key, value], index) => ({
              id: index + 1,
              codeType: 0,
              codeNumber: value as number,
              codeShortDescription: key,
              codeLongDescription: key,
              languageCode: 1,
              isActive: true
            }));
            
          // Add enum code types to the array
          this.codeTypes = [...this.codeTypes, ...enumCodeTypes];
        }
      });
  }

  /**
   * Helper method to safely get CodeType enum value
   */
  getCodeTypeValue(key: string): number {
    return CodeType[key as keyof typeof CodeType];
  }

  /**
   * Helper method to safely get LanguageCode enum value
   */
  getLanguageCodeValue(key: string): number {
    return LanguageCode[key as keyof typeof LanguageCode];
  }

  /**
   * Submit form and save general code
   */
  onSubmit(): void {
    if (this.generalCodeForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.generalCodeForm.controls).forEach(key => {
        const control = this.generalCodeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.generalCodeService.saveGeneralCode(this.generalCodeForm.value)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          if (typeof error.message === 'string') {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
          console.error('Form submission error:', error);
        }
      });
  }

  /**
   * Cancel form and close dialog
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Get error message for a specific form control
   * @param controlName The name of the form control
   * @returns Error message or empty string
   */
  getErrorMessage(controlName: string): string {
    const control = this.generalCodeForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }

    if (control.errors['minlength']) {
      return `${this.getFieldDisplayName(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['maxlength']) {
      return `${this.getFieldDisplayName(controlName)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    }

    if (control.errors['min']) {
      return `${this.getFieldDisplayName(controlName)} must be at least ${control.errors['min'].min}`;
    }

    return 'Invalid value';
  }

  /**
   * Convert control name to display name
   */
  private getFieldDisplayName(controlName: string): string {
    switch (controlName) {
      case 'codeType':
        return 'Code type';
      case 'codeNumber':
        return 'Code number';
      case 'codeShortDescription':
        return 'Short description';
      case 'codeLongDescription':
        return 'Long description';
      case 'languageCode':
        return 'Language';
      default:
        return controlName;
    }
  }
}
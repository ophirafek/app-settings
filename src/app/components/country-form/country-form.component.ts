import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CountryService } from '../../services/country.service';
import { Country } from '../../models/country.model';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule,MatIconModule, MatButtonModule, MatSpinner,MatInputModule],
  selector: 'app-country-form',
  templateUrl: './country-form.component.html',
  styleUrls: ['./country-form.component.scss']
})
export class CountryFormComponent implements OnInit {
  countryForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  isNewCountry: boolean;

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private dialogRef: MatDialogRef<CountryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { country: Country }
  ) {
    this.isNewCountry = this.data.country.id === 0;
    
    this.countryForm = this.fb.group({
      id: [this.data.country.id],
      countryCode: [
        this.data.country.countryCode, 
        [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(2),
          Validators.pattern('[A-Za-z]{2}')
        ]
      ],
      countryName: [
        this.data.country.countryName, 
        [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(100)
        ]
      ],
      isActive: [this.data.country.isActive]
    });
  }

  ngOnInit(): void {
    // Any additional initialization logic
  }

  /**
   * Submit form and save country
   */
  onSubmit(): void {
    if (this.countryForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.countryForm.controls).forEach(key => {
        const control = this.countryForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Transform countryCode to uppercase
    const formValue = this.countryForm.value;
    formValue.countryCode = formValue.countryCode.toUpperCase();

    this.countryService.saveCountry(formValue)
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
    const control = this.countryForm.get(controlName);
    
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

    if (control.errors['pattern']) {
      return `${this.getFieldDisplayName(controlName)} must contain only letters`;
    }

    return 'Invalid value';
  }

  /**
   * Convert control name to display name
   */
  private getFieldDisplayName(controlName: string): string {
    switch (controlName) {
      case 'countryCode':
        return 'Country code';
      case 'countryName':
        return 'Country name';
      default:
        return controlName;
    }
  }
}
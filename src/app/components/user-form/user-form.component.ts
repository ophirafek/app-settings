import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { GeneralCodeService } from '../../services/general-code.service';
import { GeneralCode } from '../../models/general-code.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  isNewUser: boolean;
  languageCodes: GeneralCode[] = [];
  isLoadingLanguages = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private generalCodeService: GeneralCodeService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.isNewUser = this.data.user.id === 0;
    
    this.userForm = this.fb.group({
      id: [this.data.user.id],
      username: [
        this.data.user.username, 
        [
          Validators.required, 
          Validators.minLength(3), 
          Validators.maxLength(20)
        ]
      ],
      idNumber: [
        this.data.user.idNumber,
        [
          Validators.maxLength(20)
        ]
      ],
      passwordExpiryDate: [this.data.user.passwordExpiryDate],
      isBlocked: [this.data.user.isBlocked],
      loginAttempts: [
        this.data.user.loginAttempts,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      preferredLanguageCode: [this.data.user.preferredLanguageCode],
      isInactiveFlag: [this.data.user.isInactiveFlag],
      termsOfUseSignature: [
        this.data.user.termsOfUseSignature,
        [
          Validators.maxLength(255)
        ]
      ],
      termsOfUseSignatureDate: [this.data.user.termsOfUseSignatureDate],
      mobileNumber: [
        this.data.user.mobileNumber,
        [
          Validators.maxLength(20)
        ]
      ],
      activeFlag: [this.data.user.activeFlag]
    });
  }

  ngOnInit(): void {
    this.loadLanguageCodes();
  }

  /**
   * Load language codes from general codes
   */
  loadLanguageCodes(): void {
    this.isLoadingLanguages = true;
    
    // Get language codes from general codes type 61
    this.generalCodeService.getGeneralCodesByType(61)
      .subscribe({
        next: (codes) => {
          this.languageCodes = codes;
          this.isLoadingLanguages = false;
        },
        error: (error) => {
          console.error('Error loading language codes:', error);
          this.isLoadingLanguages = false;
          // Fallback to some default languages if the API call fails
          this.languageCodes = [
            { id: 1, codeType: 61, codeNumber: 1, codeShortDescription: 'English', codeLongDescription: 'English Language', languageCode: 1, isActive: true },
            { id: 2, codeType: 61, codeNumber: 2, codeShortDescription: 'Spanish', codeLongDescription: 'Spanish Language', languageCode: 1, isActive: true },
            { id: 3, codeType: 61, codeNumber: 3, codeShortDescription: 'French', codeLongDescription: 'French Language', languageCode: 1, isActive: true }
          ];
        }
      });
  }

  /**
   * Submit form and save user
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.userService.saveUser(this.userForm.value)
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
    const control = this.userForm.get(controlName);
    
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
      case 'username':
        return 'Username';
      case 'idNumber':
        return 'ID Number';
      case 'passwordExpiryDate':
        return 'Password expiry date';
      case 'loginAttempts':
        return 'Login attempts';
      case 'preferredLanguageCode':
        return 'Preferred language';
      case 'termsOfUseSignature':
        return 'Terms of use signature';
      case 'termsOfUseSignatureDate':
        return 'Terms of use signature date';
      case 'mobileNumber':
        return 'Mobile number';
      default:
        return controlName;
    }
  }
}
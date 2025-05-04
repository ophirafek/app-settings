import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { UserService } from '../../services/user.service';
import { Employee } from '../../models/employee.model';
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
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  isNewEmployee: boolean;
  
  // For user selection
  users: User[] = [];
  isLoadingUsers = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private userService: UserService,
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee }
  ) {
    this.isNewEmployee = this.data.employee.userId === 0;
    
    this.employeeForm = this.fb.group({
      userId: [
        this.data.employee.userId, 
        [
          Validators.required
        ]
      ],
      employeeId: [
        this.data.employee.employeeId, 
        [
          Validators.required, 
          Validators.maxLength(20)
        ]
      ],
      employeeName: [
        this.data.employee.employeeName,
        [
          Validators.required
        ]
      ],
      employeeNameEnglish: [this.data.employee.employeeNameEnglish],
      phoneNumber: [this.data.employee.phoneNumber],
      email: [
        this.data.employee.email,
        [
          Validators.email
        ]
      ],
      openingEffectiveDate: [this.data.employee.openingEffectiveDate],
      closingEffectiveDate: [this.data.employee.closingEffectiveDate],
      openingRegistrationDate: [this.data.employee.openingRegistrationDate],
      closingRegistrationDate: [this.data.employee.closingRegistrationDate],
      activeFlag: [this.data.employee.activeFlag]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load users for the dropdown
   */
  loadUsers(): void {
    this.isLoadingUsers = true;
    
    this.userService.getUsers()
      .subscribe({
        next: (users) => {
          // Filter out active users only, if needed
          this.users = users.filter(user => user.activeFlag);
          this.isLoadingUsers = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoadingUsers = false;
          this.errorMessage = 'Failed to load users. Please try again.';
        }
      });
  }

  /**
   * Submit form and save employee
   */
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.employeeForm.controls).forEach(key => {
        const control = this.employeeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.employeeService.saveEmployee(this.employeeForm.value)
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
   * Get user name by ID for display purposes
   */
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : `User ID: ${userId}`;
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
    const control = this.employeeForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }

    if (control.errors['maxlength']) {
      return `${this.getFieldDisplayName(controlName)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    }

    if (control.errors['email']) {
      return `Please enter a valid email address`;
    }

    return 'Invalid value';
  }

  /**
   * Convert control name to display name
   */
  private getFieldDisplayName(controlName: string): string {
    switch (controlName) {
      case 'userId':
        return 'User';
      case 'employeeId':
        return 'Employee ID';
      case 'employeeName':
        return 'Employee name';
      case 'employeeNameEnglish':
        return 'Employee name (English)';
      case 'phoneNumber':
        return 'Phone number';
      case 'email':
        return 'Email';
      case 'openingEffectiveDate':
        return 'Opening effective date';
      case 'closingEffectiveDate':
        return 'Closing effective date';
      case 'openingRegistrationDate':
        return 'Opening registration date';
      case 'closingRegistrationDate':
        return 'Closing registration date';
      default:
        return controlName;
    }
  }
}
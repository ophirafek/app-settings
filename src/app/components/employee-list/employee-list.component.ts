import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Employee } from '../../models/employee.model';
import { User } from '../../models/user.model';
import { EmployeeService } from '../../services/employee.service';
import { UserService } from '../../services/user.service';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeFormComponent,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  displayedColumns: string[] = ['userId', 'employeeId', 'employeeName', 'email', 'phone', 'status', 'actions'];
  isLoading = true;
  error: string | null = null;
  
  // For user information
  users: User[] = [];
  isLoadingUsers = false;
  
  // For filtering
  searchTerm = '';
  showInactive = false;

  constructor(
    private employeeService: EmployeeService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Initialize component and load data
   */
  ngOnInit(): void {
    // Load users first, then employees
    this.loadUsers().then(() => {
      this.loadEmployees();
    });
  }

  /**
   * Load users for reference
   */
  loadUsers(): Promise<void> {
    this.isLoadingUsers = true;
    
    return new Promise<void>((resolve) => {
      this.userService.getUsers()
        .subscribe({
          next: (users) => {
            this.users = users;
            this.isLoadingUsers = false;
            resolve();
          },
          error: (error) => {
            console.error('Error loading users:', error);
            this.isLoadingUsers = false;
            resolve(); // Still resolve to continue loading employees
          }
        });
    });
  }

  /**
   * Get username by user ID
   */
  getUsernameById(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : `User ID: ${userId}`;
  }

  /**
   * Load all employees from the API
   */
  loadEmployees(): void {
    this.isLoading = true;
    this.error = null;
    
    this.employeeService.getEmployees()
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.applyFilters(); // Apply filters to set filtered employees
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load employees. Please try again.';
          this.isLoading = false;
          console.error('Error loading employees:', error);
        }
      });
  }

  /**
   * Apply search and filters to employees list
   */
  applyFilters(): void {
    let filtered = [...this.employees];
    
    // Filter by search term
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.employeeId.toLowerCase().includes(term) ||
        employee.employeeName.toLowerCase().includes(term) ||
        (employee.employeeNameEnglish && employee.employeeNameEnglish.toLowerCase().includes(term)) ||
        (employee.email && employee.email.toLowerCase().includes(term)) ||
        this.getUsernameById(employee.userId).toLowerCase().includes(term)
      );
    }
    
    // Filter by active status
    if (!this.showInactive) {
      filtered = filtered.filter(employee => employee.activeFlag);
    }
    
    this.filteredEmployees = filtered;
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.showInactive = false;
    this.applyFilters();
  }

  /**
   * Format date for display
   * @param date Date to format
   * @returns Formatted date string or empty string if null
   */
  formatDate(date: Date | null): string {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString();
  }

  /**
   * Open dialog to add a new employee
   */
  openAddDialog(): void {
    // Check if we have users available for selection
    if (this.users.length === 0) {
      this.showSnackBar('No user accounts available. Please create a user first.', true);
      return;
    }

    const defaultEmployee: Employee = {
      userId: 0,
      employeeId: '',
      employeeName: '',
      employeeNameEnglish: null,
      phoneNumber: null,
      email: null,
      openingEffectiveDate: new Date(),
      closingEffectiveDate: null,
      openingRegistrationDate: new Date(),
      closingRegistrationDate: null,
      activeFlag: true
    };

    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '600px',
      data: { employee: defaultEmployee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
        this.showSnackBar('Employee added successfully');
      }
    });
  }

  /**
   * Open dialog to edit an existing employee
   * @param employee The employee to edit
   */
  openEditDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '600px',
      data: { employee: { ...employee } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
        this.showSnackBar('Employee updated successfully');
      }
    });
  }

  /**
   * Delete an employee after confirmation
   * @param employee The employee to delete
   */
  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete employee ${employee.employeeName} (${employee.employeeId})?`)) {
      this.employeeService.deleteEmployee(employee.userId)
        .subscribe({
          next: () => {
            this.loadEmployees();
            this.showSnackBar('Employee deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.showSnackBar('Failed to delete employee', true);
          }
        });
    }
  }

  /**
   * Toggle an employee's active status
   * @param employee The employee to update
   */
  toggleActiveStatus(employee: Employee): void {
    const newStatus = !employee.activeFlag;
    
    this.employeeService.updateActiveStatus(employee.userId, newStatus)
      .subscribe({
        next: () => {
          this.loadEmployees();
          const status = newStatus ? 'activated' : 'deactivated';
          this.showSnackBar(`Employee ${status} successfully`);
        },
        error: (error) => {
          console.error('Error updating employee status:', error);
          this.showSnackBar('Failed to update employee status', true);
        }
      });
  }

  /**
   * Display a snack bar notification
   * @param message The message to display
   * @param isError Whether it's an error message
   */
  private showSnackBar(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
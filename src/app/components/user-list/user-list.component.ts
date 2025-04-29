import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserFormComponent } from '../user-form/user-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    UserFormComponent,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDividerModule,
    MatMenuModule
  ],
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'username', 'idNumber', 'status', 'mobileNumber', 'actions'];
  isLoading = true;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Initialize component and load users
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all users from the API
   */
  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userService.getUsers()
      .subscribe({
        next: (users) => {
          this.users = users;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load users. Please try again.';
          this.isLoading = false;
          console.error('Error loading users:', error);
        }
      });
  }

  /**
   * Open dialog to add a new user
   */
  openAddDialog(): void {
    const defaultUser: User = {
      id: 0,
      username: '',
      idNumber: '',
      passwordExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default expiry 3 months in future
      isBlocked: false,
      loginAttempts: 0,
      preferredLanguageCode: null,
      isInactiveFlag: false,
      termsOfUseSignature: null,
      termsOfUseSignatureDate: null,
      mobileNumber: null,
      activeFlag: true
    };

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { user: defaultUser }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.showSnackBar('User added successfully');
      }
    });
  }

  /**
   * Open dialog to edit an existing user
   * @param user The user to edit
   */
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.showSnackBar('User updated successfully');
      }
    });
  }

  /**
   * Delete a user after confirmation
   * @param user The user to delete
   */
  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.userService.deleteUser(user.id)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.showSnackBar('User deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.showSnackBar('Failed to delete user', true);
          }
        });
    }
  }

  /**
   * Toggle a user's block status
   * @param user The user to update
   */
  toggleBlockStatus(user: User): void {
    const newBlockStatus = !user.isBlocked;
    
    this.userService.updateBlockStatus(user.id, newBlockStatus)
      .subscribe({
        next: () => {
          this.loadUsers();
          const status = newBlockStatus ? 'blocked' : 'unblocked';
          this.showSnackBar(`User ${status} successfully`);
        },
        error: (error) => {
          console.error('Error updating user block status:', error);
          this.showSnackBar('Failed to update user block status', true);
        }
      });
  }

  /**
   * Reset a user's login attempts
   * @param user The user to update
   */
  resetLoginAttempts(user: User): void {
    this.userService.resetLoginAttempts(user.id)
      .subscribe({
        next: () => {
          this.loadUsers();
          this.showSnackBar('Login attempts reset successfully');
        },
        error: (error) => {
          console.error('Error resetting login attempts:', error);
          this.showSnackBar('Failed to reset login attempts', true);
        }
      });
  }

  /**
   * Toggle a user's active status
   * @param user The user to update
   */
  toggleActiveStatus(user: User): void {
    const updatedUser: User = {
      ...user,
      activeFlag: !user.activeFlag
    };

    this.userService.saveUser(updatedUser)
      .subscribe({
        next: () => {
          this.loadUsers();
          const status = updatedUser.activeFlag ? 'activated' : 'deactivated';
          this.showSnackBar(`User ${status} successfully`);
        },
        error: (error) => {
          console.error('Error updating user active status:', error);
          this.showSnackBar('Failed to update user active status', true);
        }
      });
  }

  /**
   * Get user status text
   * @param user The user
   * @returns Status text
   */
  getUserStatus(user: User): string {
    if (user.isBlocked) {
      return 'Blocked';
    } else if (!user.activeFlag) {
      return 'Inactive';
    } else if (user.isInactiveFlag) {
      return 'Marked Inactive';
    } else {
      return 'Active';
    }
  }

  /**
   * Get user status class for styling
   * @param user The user
   * @returns CSS class
   */
  getUserStatusClass(user: User): string {
    if (user.isBlocked) {
      return 'bg-red-100 text-red-800';
    } else if (!user.activeFlag) {
      return 'bg-gray-100 text-gray-800';
    } else if (user.isInactiveFlag) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
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
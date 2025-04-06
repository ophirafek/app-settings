import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GeneralCode, CodeType, LanguageCode } from '../../models/general-code.model';
import { GeneralCodeService } from '../../services/general-code.service';
import { GeneralCodeFormComponent } from '../general-code-form/general-code-form.component';

@Component({
  selector: 'app-general-code-list',
  templateUrl: './general-code-list.component.html',
  styleUrls: ['./general-code-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule
  ]
})
export class GeneralCodeListComponent implements OnInit {
  generalCodes: GeneralCode[] = [];
  displayedColumns: string[] = ['id', 'codeType', 'codeNumber', 'codeShortDescription', 'languageCode', 'isActive', 'actions'];
  isLoading = true;
  error: string | null = null;
  
  // For filtering
  codeTypes = Object.entries(CodeType).filter(([key]) => isNaN(Number(key))); // Filter out numeric keys
  languageCodes = Object.entries(LanguageCode).filter(([key]) => isNaN(Number(key)));
  selectedCodeType: number | null = null;
  selectedLanguageCode: number | null = null;
  
  // For component access to enums
  CodeType = CodeType;
  LanguageCode = LanguageCode;

  constructor(
    private generalCodeService: GeneralCodeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Initialize component and load general codes
   */
  ngOnInit(): void {
    this.loadGeneralCodes();
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
   * Load all general codes from the API
   */
  loadGeneralCodes(): void {
    this.isLoading = true;
    this.error = null;
    
    // Determine which API endpoint to call based on filters
    let observable;
    
    if (this.selectedCodeType !== null && this.selectedLanguageCode !== null) {
      observable = this.generalCodeService.getGeneralCodesByTypeAndLanguage(
        this.selectedCodeType, 
        this.selectedLanguageCode
      );
    } else if (this.selectedCodeType !== null) {
      observable = this.generalCodeService.getGeneralCodesByType(this.selectedCodeType);
    } else if (this.selectedLanguageCode !== null) {
      observable = this.generalCodeService.getGeneralCodesByLanguage(this.selectedLanguageCode);
    } else {
      observable = this.generalCodeService.getAllGeneralCodes();
    }
    
    observable.subscribe({
      next: (generalCodes) => {
        this.generalCodes = generalCodes;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load general codes. Please try again.';
        this.isLoading = false;
        console.error('Error loading general codes:', error);
      }
    });
  }

  /**
   * Apply filters and reload data
   */
  applyFilters(): void {
    this.loadGeneralCodes();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedCodeType = null;
    this.selectedLanguageCode = null;
    this.loadGeneralCodes();
  }

  /**
   * Get the text description for a code type
   */
  getCodeTypeText(codeType: number): string {
    return CodeType[codeType] || `Type ${codeType}`;
  }

  /**
   * Get the text description for a language code
   */
  getLanguageCodeText(languageCode: number): string {
    return LanguageCode[languageCode] || `Language ${languageCode}`;
  }

  /**
   * Open dialog to add a new general code
   */
  openAddDialog(): void {
    const dialogRef = this.dialog.open(GeneralCodeFormComponent, {
      width: '500px',
      data: { 
        generalCode: { 
          id: 0, 
          codeType: this.selectedCodeType || 1, 
          codeNumber: 0, 
          codeShortDescription: '', 
          codeLongDescription: '', 
          languageCode: this.selectedLanguageCode || 1, 
          isActive: true 
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGeneralCodes();
        this.showSnackBar('General code added successfully');
      }
    });
  }

  /**
   * Open dialog to edit an existing general code
   * @param generalCode The general code to edit
   */
  openEditDialog(generalCode: GeneralCode): void {
    const dialogRef = this.dialog.open(GeneralCodeFormComponent, {
      width: '500px',
      data: { generalCode: { ...generalCode } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGeneralCodes();
        this.showSnackBar('General code updated successfully');
      }
    });
  }

  /**
   * Delete a general code after confirmation
   * @param generalCode The general code to delete
   */
  deleteGeneralCode(generalCode: GeneralCode): void {
    const codeTypeText = this.getCodeTypeText(generalCode.codeType);
    
    if (confirm(`Are you sure you want to delete ${codeTypeText} code ${generalCode.codeNumber} (${generalCode.codeShortDescription})?`)) {
      this.generalCodeService.deleteGeneralCode(generalCode.id)
        .subscribe({
          next: () => {
            this.loadGeneralCodes();
            this.showSnackBar('General code deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting general code:', error);
            this.showSnackBar('Failed to delete general code', true);
          }
        });
    }
  }

  /**
   * Toggle a general code's active status
   * @param generalCode The general code to update
   */
  toggleStatus(generalCode: GeneralCode): void {
    const updatedGeneralCode: GeneralCode = {
      ...generalCode,
      isActive: !generalCode.isActive
    };

    this.generalCodeService.saveGeneralCode(updatedGeneralCode)
      .subscribe({
        next: () => {
          this.loadGeneralCodes();
          const status = updatedGeneralCode.isActive ? 'activated' : 'deactivated';
          this.showSnackBar(`General code ${status} successfully`);
        },
        error: (error) => {
          console.error('Error updating general code status:', error);
          this.showSnackBar('Failed to update general code status', true);
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
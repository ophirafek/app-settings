import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Country } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { CountryFormComponent } from '../country-form/country-form.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderRowDef, MatTable, MatTableModule } from '@angular/material/table';
import { MatSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, CountryFormComponent, MatTableModule,MatIconModule,MatDialogModule,MatSpinner,MatTooltipModule,MatButtonModule],
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {
  countries: Country[] = [];
  displayedColumns: string[] = ['id', 'countryCode', 'countryName', 'isActive', 'actions'];
  isLoading = true;
  error: string | null = null;

  constructor(
    private countryService: CountryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Initialize component and load countries
   */
  ngOnInit(): void {
    this.loadCountries();
  }

  /**
   * Load all countries from the API
   */
  loadCountries(): void {
    this.isLoading = true;
    this.error = null;
    
    this.countryService.getCountries()
      .subscribe({
        next: (countries : any) => {
          this.countries = countries;
          this.isLoading = false;
        },
        error: (error : any) => {
          this.error = 'Failed to load countries. Please try again.';
          this.isLoading = false;
          console.error('Error loading countries:', error);
        }
      });
  }

  /**
   * Open dialog to add a new country
   */
  openAddDialog(): void {
    const dialogRef = this.dialog.open(CountryFormComponent, {
      width: '400px',
      data: { country: { id: 0, countryCode: '', countryName: '', isActive: true } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCountries();
        this.showSnackBar('Country added successfully');
      }
    });
  }

  /**
   * Open dialog to edit an existing country
   * @param country The country to edit
   */
  openEditDialog(country: Country): void {
    const dialogRef = this.dialog.open(CountryFormComponent, {
      width: '400px',
      data: { country: { ...country } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCountries();
        this.showSnackBar('Country updated successfully');
      }
    });
  }

  /**
   * Delete a country after confirmation
   * @param country The country to delete
   */
  deleteCountry(country: Country): void {
    if (confirm(`Are you sure you want to delete ${country.countryName}?`)) {
      this.countryService.deleteCountry(country.id)
        .subscribe({
          next: () => {
            this.loadCountries();
            this.showSnackBar('Country deleted successfully');
          },
          error: (error : any) => {
            console.error('Error deleting country:', error);
            this.showSnackBar('Failed to delete country', true);
          }
        });
    }
  }

  /**
   * Toggle a country's active status
   * @param country The country to update
   */
  toggleStatus(country: Country): void {
    const updatedCountry: Country = {
      ...country,
      isActive: !country.isActive
    };

    this.countryService.saveCountry(updatedCountry)
      .subscribe({
        next: () => {
          this.loadCountries();
          const status = updatedCountry.isActive ? 'activated' : 'deactivated';
          this.showSnackBar(`Country ${status} successfully`);
        },
        error: (error) => {
          console.error('Error updating country status:', error);
          this.showSnackBar('Failed to update country status', true);
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
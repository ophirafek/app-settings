import { Routes } from '@angular/router';
import { CountryListComponent } from './components/country-list/country-list.component';
import { GeneralCodeListComponent } from './components/general-code-list/general-code-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'countries', pathMatch: 'full' },
  { path: 'countries', component: CountryListComponent },
  { path: 'general-codes', component: GeneralCodeListComponent },
  { path: 'users', component: UserListComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: '**', redirectTo: 'countries' }
];
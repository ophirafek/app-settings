import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.userApiUrl}/api/employees`;

  constructor(private http: HttpClient) { }

  /**
   * Gets all employees
   */
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets an employee by user ID
   * @param userId The user ID
   */
  getEmployee(userId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets an employee by employee ID
   * @param employeeId The employee ID
   */
  getEmployeeByEmployeeId(employeeId: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/byemployeeid/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Saves an employee (creates new if userId=0, updates if userId>0)
   * @param employee The employee to save
   */
  saveEmployee(employee: Employee): Observable<Employee> {
   
      return this.http.post<Employee>(this.apiUrl, employee)
        .pipe(catchError(this.handleError));
   
  }

  /**
   * Deletes an employee
   * @param userId The user ID of the employee to delete
   */
  deleteEmployee(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Checks if an employee ID already exists
   * @param employeeId The employee ID to check
   */
  employeeIdExists(employeeId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates an employee's active status
   * @param userId The user ID
   * @param activeFlag The new active status
   */
  updateActiveStatus(userId: number, activeFlag: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${userId}/status/${activeFlag}`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
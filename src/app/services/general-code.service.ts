import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GeneralCode } from '../models/general-code.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralCodeService {
  private apiUrl = `${environment.apiUrl}/api/generalcodes`;

  constructor(private http: HttpClient) { }

  /**
   * Gets all general codes
   */
  getAllGeneralCodes(): Observable<GeneralCode[]> {
    return this.http.get<GeneralCode[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets general codes by type
   * @param codeType The code type to filter by
   */
  getGeneralCodesByType(codeType: number): Observable<GeneralCode[]> {
    return this.http.get<GeneralCode[]>(`${this.apiUrl}/type/${codeType}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets general codes by language
   * @param languageCode The language code to filter by
   */
  getGeneralCodesByLanguage(languageCode: number): Observable<GeneralCode[]> {
    return this.http.get<GeneralCode[]>(`${this.apiUrl}/language/${languageCode}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets general codes by type and language
   * @param codeType The code type to filter by
   * @param languageCode The language code to filter by
   */
  getGeneralCodesByTypeAndLanguage(codeType: number, languageCode: number): Observable<GeneralCode[]> {
    return this.http.get<GeneralCode[]>(`${this.apiUrl}/type/${codeType}/language/${languageCode}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets a specific general code by ID
   * @param id The general code ID
   */
  getGeneralCodeById(id: number): Observable<GeneralCode> {
    return this.http.get<GeneralCode>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets a specific general code by type, number, and language
   * @param codeType The code type
   * @param codeNumber The code number
   * @param languageCode The language code
   */
  getGeneralCodeByTypeNumberLanguage(codeType: number, codeNumber: number, languageCode: number): Observable<GeneralCode> {
    return this.http.get<GeneralCode>(
      `${this.apiUrl}/type/${codeType}/number/${codeNumber}/language/${languageCode}`
    ).pipe(catchError(this.handleError));
  }

  /**
   * Saves a general code (creates new if id=0, updates if id>0)
   * @param generalCode The general code to save
   */
  saveGeneralCode(generalCode: GeneralCode): Observable<GeneralCode> {
    return this.http.post<GeneralCode>(this.apiUrl, generalCode)
      .pipe(catchError(this.handleError));
  }

  /**
   * Deletes a general code
   * @param id The ID of the general code to delete
   */
  deleteGeneralCode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
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

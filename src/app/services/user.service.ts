import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.userApiUrl}/api/users`;

  constructor(private http: HttpClient) { }

  /**
   * Gets all users
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets a user by its id
   * @param id The user id
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets a user by username
   * @param username The username to search for
   */
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/byusername/${username}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Saves a user (creates new if id=0, updates if id>0)
   * @param user The user to save
   */
  saveUser(user: User): Observable<User> {
    if (user.id === 0) {
      return this.http.post<User>(this.apiUrl, user)
        .pipe(catchError(this.handleError));
    } else {
      return this.http.put<User>(`${this.apiUrl}/${user.id}`, user)
        .pipe(catchError(this.handleError));
    }
  }

  /**
   * Deletes a user
   * @param id The id of the user to delete
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Checks if a username already exists
   * @param username The username to check
   */
  usernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${username}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates a user's block status
   * @param id The user id
   * @param isBlocked The new block status
   */
  updateBlockStatus(id: number, isBlocked: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/block/${isBlocked}`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Resets a user's login attempts counter
   * @param id The user id
   */
  resetLoginAttempts(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/resetloginattempts`, {})
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
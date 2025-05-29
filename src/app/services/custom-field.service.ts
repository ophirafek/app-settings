import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldService {
  private apiUrl = `${environment.apiUrl}/api/customfields`;

  constructor(private http: HttpClient) { }

  // Group operations
  getAllGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groups`)
      .pipe(catchError(this.handleError<any[]>('getAllGroups', [])));
  }

  getGroupsByEntityType(entityType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groups/entity/${entityType}`)
      .pipe(catchError(this.handleError<any[]>(`getGroupsByEntityType entityType=${entityType}`, [])));
  }

  getGroupById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/groups/${id}`)
      .pipe(catchError(this.handleError<any>(`getGroupById id=${id}`)));
  }

  saveGroup(group: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/groups`, group)
      .pipe(catchError(this.handleError<any>('saveGroup')));
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/groups/${id}`)
      .pipe(catchError(this.handleError<void>(`deleteGroup id=${id}`)));
  }

  updateGroupSortOrder(groupIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/groups/sort-order`, groupIds)
      .pipe(catchError(this.handleError<void>('updateGroupSortOrder')));
  }

  checkGroupNameExists(entityType: string, name: string, excludeId?: number): Observable<boolean> {
    let url = `${this.apiUrl}/groups/check-name/${entityType}/${name}`;
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    return this.http.get<boolean>(url)
      .pipe(catchError(this.handleError<boolean>('checkGroupNameExists', false)));
  }

  // Definition operations
  getAllDefinitions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/definitions`)
      .pipe(catchError(this.handleError<any[]>('getAllDefinitions', [])));
  }

  getDefinitionsByEntityType(entityType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/definitions/entity/${entityType}`)
      .pipe(catchError(this.handleError<any[]>(`getDefinitionsByEntityType entityType=${entityType}`, [])));
  }

  getDefinitionsByEntityTypeGrouped(entityType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/definitions/entity/${entityType}/grouped`)
      .pipe(catchError(this.handleError<any[]>(`getDefinitionsByEntityTypeGrouped entityType=${entityType}`, [])));
  }

  getDefinitionsByGroupId(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/definitions/group/${groupId}`)
      .pipe(catchError(this.handleError<any[]>(`getDefinitionsByGroupId groupId=${groupId}`, [])));
  }

  getDefinitionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/definitions/${id}`)
      .pipe(catchError(this.handleError<any>(`getDefinitionById id=${id}`)));
  }

  saveDefinition(definition: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/definitions`, definition)
      .pipe(catchError(this.handleError<any>('saveDefinition')));
  }

  deleteDefinition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/definitions/${id}`)
      .pipe(catchError(this.handleError<void>(`deleteDefinition id=${id}`)));
  }

  updateDefinitionSortOrder(fieldIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/definitions/sort-order`, fieldIds)
      .pipe(catchError(this.handleError<void>('updateDefinitionSortOrder')));
  }

  checkFieldNameExists(entityType: string, name: string, excludeId?: number): Observable<boolean> {
    let url = `${this.apiUrl}/definitions/check-name/${entityType}/${name}`;
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    return this.http.get<boolean>(url)
      .pipe(catchError(this.handleError<boolean>('checkFieldNameExists', false)));
  }

  // Option operations
  getOptionsByField(fieldDefinitionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/options/field/${fieldDefinitionId}`)
      .pipe(catchError(this.handleError<any[]>(`getOptionsByField fieldDefinitionId=${fieldDefinitionId}`, [])));
  }

  saveOptions(fieldDefinitionId: number, options: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/options/field/${fieldDefinitionId}`, options)
      .pipe(catchError(this.handleError<any[]>('saveOptions', [])));
  }

  updateOptionSortOrder(optionIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/options/sort-order`, optionIds)
      .pipe(catchError(this.handleError<void>('updateOptionSortOrder')));
  }

  // Value operations
  getValuesByEntity(entityType: string, entityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/values/entity/${entityType}/${entityId}`)
      .pipe(catchError(this.handleError<any[]>(`getValuesByEntity entityType=${entityType}, entityId=${entityId}`, [])));
  }

  getFieldsWithValuesByEntity(entityType: string, entityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/entity/${entityType}/${entityId}`)
      .pipe(catchError(this.handleError<any[]>(`getFieldsWithValuesByEntity entityType=${entityType}, entityId=${entityId}`, [])));
  }

  getFieldsWithValuesByEntityGrouped(entityType: string, entityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/entity/${entityType}/${entityId}/grouped`)
      .pipe(catchError(this.handleError<any[]>(`getFieldsWithValuesByEntityGrouped entityType=${entityType}, entityId=${entityId}`, [])));
  }

  saveValues(values: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/values`, values)
      .pipe(catchError(this.handleError<any[]>('saveValues', [])));
  }

  // Helper methods
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }

  // Utility methods for common operations
  getFieldTypes(): string[] {
    return [
      'text',
      'textarea',
      'number',
      'date',
      'boolean',
      'select',
      'multi-select',
      'general-code'
    ];
  }

  getFieldTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'text': 'Text',
      'textarea': 'Text Area',
      'number': 'Number',
      'date': 'Date',
      'boolean': 'Checkbox',
      'select': 'Select',
      'multi-select': 'Multi-Select',
      'general-code': 'General Code'
    };
    
    return labels[type] || type;
  }

  getDefaultValueForType(type: string): any {
    switch (type) {
      case 'text':
      case 'textarea':
        return '';
      case 'number':
        return null;
      case 'date':
        return null;
      case 'boolean':
        return false;
      case 'select':
        return null;
      case 'multi-select':
        return [];
      case 'general-code':
        return null;
      default:
        return null;
    }
  }

  createEmptyGroup(entityType: string): any {
    return {
      id: 0,
      entityType: entityType,
      name: '',
      displayName: '',
      description: '',
      sortOrder: 0,
      isActive: true,
      fields: []
    };
  }

  createEmptyDefinition(entityType: string, groupId?: number): any {
    return {
      id: 0,
      entityType: entityType,
      name: '',
      displayName: '',
      description: '',
      fieldType: 'text',
      isRequired: false,
      isActive: true,
      sortOrder: 0,
      defaultValue: null,
      minValue: null,
      maxValue: null,
      maxLength: null,
      regex: null,
      options: [],
      generalCodeType: null,
      groupId: groupId || null,
      groupName: 'General',
      isVisible: true
    };
  }

  createEmptyOption(fieldDefinitionId: number): any {
    return {
      id: 0,
      fieldDefinitionId: fieldDefinitionId,
      value: '',
      displayText: '',
      sortOrder: 0,
      isActive: true
    };
  }

  createEmptyValue(entityType: string, entityId: number, fieldDefinitionId: number, fieldType: string): any {
    const value = {
      id: 0,
      entityId: entityId,
      entityType: entityType,
      fieldDefinitionId: fieldDefinitionId,
      textValue: '',
      numberValue: null,
      dateValue: null,
      booleanValue: false,
      selectedOptionIds: []
    };

    // Initialize the appropriate value property based on field type
    switch (fieldType) {
      case 'text':
      case 'textarea':
        value.textValue = '';
        break;
      case 'number':
      case 'select':
      case 'general-code':
        value.numberValue = null;
        break;
      case 'date':
        value.dateValue = null;
        break;
      case 'boolean':
        value.booleanValue = false;
        break;
      case 'multi-select':
        value.selectedOptionIds = [];
        break;
    }

    return value;
  }
}
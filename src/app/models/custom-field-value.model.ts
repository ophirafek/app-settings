export interface CustomFieldValue {
    id?: number;
    entityId: number; // ID of the lead, company, etc.
    entityType: string; // 'lead', 'company', 'contact', etc.
    fieldDefinitionId: number;
    textValue?: string;
    numberValue?: number;
    dateValue?: Date;
    booleanValue?: boolean;
    selectedOptionIds?: number[]; // For MULTI_SELECT type
    generalCodeValue?: number; // For GENERAL_CODE type
  }
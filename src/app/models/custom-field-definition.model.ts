export enum CustomFieldType {
    TEXT = 'text',
    NUMBER = 'number',
    DATE = 'date',
    BOOLEAN = 'boolean',
    SELECT = 'select',
    MULTI_SELECT = 'multi-select',
    GENERAL_CODE = 'general-code',
    TEXTAREA = 'textarea'
  }
  
  export interface CustomFieldOption {
    id: number;
    value: string;
    displayText: string;
  }
  
  export interface CustomFieldDefinition {
    id: number;
    entityType: string; // 'lead', 'company', 'contact', etc.
    name: string;
    displayName: string;
    description?: string;
    fieldType: CustomFieldType;
    isRequired: boolean;
    isActive: boolean;
    sortOrder: number;
    defaultValue?: any;
    minValue?: number;
    maxValue?: number;
    maxLength?: number;
    regex?: string;
    options?: CustomFieldOption[]; // For SELECT and MULTI_SELECT types
    generalCodeType?: number; // For GENERAL_CODE type
    groupName?: string; // For organizing fields into sections
    isVisible: boolean;
    createdDate: Date;
    modifiedDate: Date;
    createdBy: number;
    modifiedBy: number;
  }
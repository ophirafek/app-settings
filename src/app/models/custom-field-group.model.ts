import { CustomFieldDefinition } from "./custom-field-definition.model";

export interface CustomFieldGroup {
    name: string;
    displayName: string;
    description?: string;
    sortOrder: number;
    fields: CustomFieldDefinition[];
  }
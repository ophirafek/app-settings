import { CustomFieldDefinition } from "./custom-field-definition.model";
import { CustomFieldValue } from "./custom-field-value.model";

export interface CombinedCustomField {
    definition: CustomFieldDefinition;
    value: CustomFieldValue | null;
  }
/**
 * Represents a general code entity in the application
 * If Id = 0, it represents a new general code to be created
 */
export interface GeneralCode {
  id: number;
  codeType: number;
  codeNumber: number;
  codeShortDescription: string;
  codeLongDescription: string;
  languageCode: number;
  isActive: boolean;
}

/**
 * Code type definitions
 */
export enum CodeType {
  Error = 1,
  Status = 2,
  // Add more code types as needed
}

/**
 * Language code definitions
 */
export enum LanguageCode {
  English = 1,
  Spanish = 2,
  // Add more languages as needed
}

/**
 * Represents a country entity in the application
 * If Id = 0, it represents a new country to be created
 */
export interface Country {
  id: number;
  countryCode: string;
  countryName: string;
  isActive: boolean;
}

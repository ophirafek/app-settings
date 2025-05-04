/**
 * Represents an employee entity in the application
 * If UserID = 0, it represents a new employee to be created
 */
export interface Employee {
    userId: number;
    employeeId: string;
    employeeName: string;
    employeeNameEnglish: string | null;
    phoneNumber: string | null;
    email: string | null;
    openingEffectiveDate: Date | null;
    closingEffectiveDate: Date | null;
    openingRegistrationDate: Date | null;
    closingRegistrationDate: Date | null;
    activeFlag: boolean;
  }
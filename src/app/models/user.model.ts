
/**
 * Represents a user entity in the application
 * If Id = 0, it represents a new user to be created
 */
export interface User {
    id: number;
    username: string;
    idNumber: string;
    passwordExpiryDate: Date | null;
    isBlocked: boolean;
    loginAttempts: number;
    preferredLanguageCode: number | null;
    isInactiveFlag: boolean;
    termsOfUseSignature: string | null;
    termsOfUseSignatureDate: Date | null;
    mobileNumber: string | null;
    activeFlag: boolean;
  }
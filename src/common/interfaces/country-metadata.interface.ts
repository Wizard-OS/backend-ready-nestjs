export interface CountryMetadata {
  countryCode: string;
  countryName: string;
  currencyCodes: string[];
  defaultCurrency: string;
  callingCodes: string[];
  defaultCallingCode: string;
  flagEmoji: string | null;
  timezones: string[];
}

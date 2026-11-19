/** Display name (as stored on Employee.country) → ISO 3166-1 alpha-2. */
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  Qatar: 'QA',
  Bahrain: 'BH',
  Yemen: 'YE',
  Mexico: 'MX',
  'United States': 'US',
  Canada: 'CA',
  Russia: 'RU',
  China: 'CN',
  Japan: 'JP',
  India: 'IN',
  'Sri Lanka': 'LK',
  Pakistan: 'PK',
  Bangladesh: 'BD',
  Afghanistan: 'AF',
  Nigeria: 'NG',
  Kenya: 'KE',
  'South Africa': 'ZA',
  Egypt: 'EG',
  Portugal: 'PT',
  Spain: 'ES',
  France: 'FR',
  Italy: 'IT',
  Norway: 'NO',
  'United Kingdom': 'GB',
  Germany: 'DE',
  Singapore: 'SG',
  Australia: 'AU',
}

export function isoCodeForCountry(country: string): string | undefined {
  return COUNTRY_NAME_TO_ISO[country]
}

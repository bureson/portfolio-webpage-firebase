// Note: ISO 3166-1 alpha-2 codes of UN member and observer states grouped by
// continent (UN geoscheme: Russia in Europe, Turkey and Cyprus in Asia),
// dependent territories are not listed — Europe 44, Asia 48, Africa 54,
// Americas 35, Oceania 14
const definition = {
  europe: [
    'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'BY', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR',
    'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO',
    'RS', 'RU', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA'
  ],
  asia: [
    'AE', 'AF', 'AM', 'AZ', 'BD', 'BH', 'BN', 'BT', 'CN', 'CY', 'GE', 'ID', 'IL', 'IN', 'IQ', 'IR', 'JO', 'JP',
    'KG', 'KH', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK', 'MM', 'MN', 'MV', 'MY', 'NP', 'OM', 'PH', 'PK', 'PS',
    'QA', 'SA', 'SG', 'SY', 'TH', 'TJ', 'TL', 'TM', 'TR', 'UZ', 'VN', 'YE'
  ],
  africa: [
    'AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'CV', 'DJ', 'DZ', 'EG', 'ER', 'ET', 'GA', 'GH',
    'GM', 'GN', 'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML', 'MR', 'MU', 'MW', 'MZ', 'NA', 'NE',
    'NG', 'RW', 'SC', 'SD', 'SL', 'SN', 'SO', 'SS', 'ST', 'SZ', 'TD', 'TG', 'TN', 'TZ', 'UG', 'ZA', 'ZM', 'ZW'
  ],
  americas: [
    'AG', 'AR', 'BB', 'BO', 'BR', 'BS', 'BZ', 'CA', 'CL', 'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'GD', 'GT', 'GY',
    'HN', 'HT', 'JM', 'KN', 'LC', 'MX', 'NI', 'PA', 'PE', 'PY', 'SR', 'SV', 'TT', 'US', 'UY', 'VC', 'VE'
  ],
  oceania: [
    'AU', 'FJ', 'FM', 'KI', 'MH', 'NR', 'NZ', 'PG', 'PW', 'SB', 'TO', 'TV', 'VU', 'WS'
  ],
  antarctica: ['AQ']
};

export const continentOf = (iso) => {
  const code = (iso || '').toUpperCase();
  return Object.keys(definition).find(continent => definition[continent].includes(code)) || null;
};

export const continentSize = (continent) => {
  return (definition[continent] || []).length;
};

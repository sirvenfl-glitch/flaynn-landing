export interface Country {
  name: string;
  iso: string;
  flag: string;
}

function getFlag(iso: string): string {
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
}

const RAW: [string, string][] = [
  ['Afghanistan', 'AF'], ['Afrique du Sud', 'ZA'], ['Albanie', 'AL'], ['Algérie', 'DZ'],
  ['Allemagne', 'DE'], ['Andorre', 'AD'], ['Angola', 'AO'], ['Antigua-et-Barbuda', 'AG'],
  ['Arabie saoudite', 'SA'], ['Argentine', 'AR'], ['Arménie', 'AM'], ['Australie', 'AU'],
  ['Autriche', 'AT'], ['Azerbaïdjan', 'AZ'], ['Bahamas', 'BS'], ['Bahreïn', 'BH'],
  ['Bangladesh', 'BD'], ['Barbade', 'BB'], ['Belgique', 'BE'], ['Belize', 'BZ'],
  ['Bénin', 'BJ'], ['Bhoutan', 'BT'], ['Biélorussie', 'BY'], ['Birmanie', 'MM'],
  ['Bolivie', 'BO'], ['Bosnie-Herzégovine', 'BA'], ['Botswana', 'BW'], ['Brésil', 'BR'],
  ['Brunei', 'BN'], ['Bulgarie', 'BG'], ['Burkina Faso', 'BF'], ['Burundi', 'BI'],
  ['Cambodge', 'KH'], ['Cameroun', 'CM'], ['Canada', 'CA'], ['Cap-Vert', 'CV'],
  ['Chili', 'CL'], ['Chine', 'CN'], ['Chypre', 'CY'], ['Colombie', 'CO'],
  ['Comores', 'KM'], ['Congo', 'CG'], ['Corée du Nord', 'KP'], ['Corée du Sud', 'KR'],
  ['Costa Rica', 'CR'], ['Côte d\'Ivoire', 'CI'], ['Croatie', 'HR'], ['Cuba', 'CU'],
  ['Danemark', 'DK'], ['Djibouti', 'DJ'], ['Dominique', 'DM'], ['Égypte', 'EG'],
  ['Émirats arabes unis', 'AE'], ['Équateur', 'EC'], ['Érythrée', 'ER'], ['Espagne', 'ES'],
  ['Estonie', 'EE'], ['Eswatini', 'SZ'], ['États-Unis', 'US'], ['Éthiopie', 'ET'],
  ['Fidji', 'FJ'], ['Finlande', 'FI'], ['France', 'FR'], ['Gabon', 'GA'],
  ['Gambie', 'GM'], ['Géorgie', 'GE'], ['Ghana', 'GH'], ['Grèce', 'GR'],
  ['Grenade', 'GD'], ['Guatemala', 'GT'], ['Guinée', 'GN'], ['Guinée-Bissau', 'GW'],
  ['Guinée équatoriale', 'GQ'], ['Guyana', 'GY'], ['Haïti', 'HT'], ['Honduras', 'HN'],
  ['Hongrie', 'HU'], ['Inde', 'IN'], ['Indonésie', 'ID'], ['Irak', 'IQ'],
  ['Iran', 'IR'], ['Irlande', 'IE'], ['Islande', 'IS'], ['Israël', 'IL'],
  ['Italie', 'IT'], ['Jamaïque', 'JM'], ['Japon', 'JP'], ['Jordanie', 'JO'],
  ['Kazakhstan', 'KZ'], ['Kenya', 'KE'], ['Kirghizistan', 'KG'], ['Kiribati', 'KI'],
  ['Kosovo', 'XK'], ['Koweït', 'KW'], ['Laos', 'LA'], ['Lesotho', 'LS'],
  ['Lettonie', 'LV'], ['Liban', 'LB'], ['Liberia', 'LR'], ['Libye', 'LY'],
  ['Liechtenstein', 'LI'], ['Lituanie', 'LT'], ['Luxembourg', 'LU'], ['Macédoine du Nord', 'MK'],
  ['Madagascar', 'MG'], ['Malaisie', 'MY'], ['Malawi', 'MW'], ['Maldives', 'MV'],
  ['Mali', 'ML'], ['Malte', 'MT'], ['Maroc', 'MA'], ['Marshall', 'MH'],
  ['Maurice', 'MU'], ['Mauritanie', 'MR'], ['Mexique', 'MX'], ['Micronésie', 'FM'],
  ['Moldavie', 'MD'], ['Monaco', 'MC'], ['Mongolie', 'MN'], ['Monténégro', 'ME'],
  ['Mozambique', 'MZ'], ['Namibie', 'NA'], ['Nauru', 'NR'], ['Népal', 'NP'],
  ['Nicaragua', 'NI'], ['Niger', 'NE'], ['Nigéria', 'NG'], ['Norvège', 'NO'],
  ['Nouvelle-Zélande', 'NZ'], ['Oman', 'OM'], ['Ouganda', 'UG'], ['Ouzbékistan', 'UZ'],
  ['Pakistan', 'PK'], ['Palaos', 'PW'], ['Palestine', 'PS'], ['Panama', 'PA'],
  ['Papouasie-Nouvelle-Guinée', 'PG'], ['Paraguay', 'PY'], ['Pays-Bas', 'NL'], ['Pérou', 'PE'],
  ['Philippines', 'PH'], ['Pologne', 'PL'], ['Portugal', 'PT'], ['Qatar', 'QA'],
  ['République centrafricaine', 'CF'], ['République démocratique du Congo', 'CD'],
  ['République dominicaine', 'DO'], ['République tchèque', 'CZ'],
  ['Roumanie', 'RO'], ['Royaume-Uni', 'GB'], ['Russie', 'RU'], ['Rwanda', 'RW'],
  ['Saint-Kitts-et-Nevis', 'KN'], ['Saint-Vincent-et-les-Grenadines', 'VC'],
  ['Sainte-Lucie', 'LC'], ['Salvador', 'SV'], ['Samoa', 'WS'],
  ['São Tomé-et-Príncipe', 'ST'], ['Sénégal', 'SN'], ['Serbie', 'RS'],
  ['Seychelles', 'SC'], ['Sierra Leone', 'SL'], ['Singapour', 'SG'],
  ['Slovaquie', 'SK'], ['Slovénie', 'SI'], ['Somalie', 'SO'], ['Soudan', 'SD'],
  ['Soudan du Sud', 'SS'], ['Sri Lanka', 'LK'], ['Suède', 'SE'], ['Suisse', 'CH'],
  ['Suriname', 'SR'], ['Syrie', 'SY'], ['Tadjikistan', 'TJ'], ['Tanzanie', 'TZ'],
  ['Tchad', 'TD'], ['Thaïlande', 'TH'], ['Timor oriental', 'TL'], ['Togo', 'TG'],
  ['Tonga', 'TO'], ['Trinité-et-Tobago', 'TT'], ['Tunisie', 'TN'], ['Turkménistan', 'TM'],
  ['Turquie', 'TR'], ['Tuvalu', 'TV'], ['Ukraine', 'UA'], ['Uruguay', 'UY'],
  ['Vanuatu', 'VU'], ['Vatican', 'VA'], ['Venezuela', 'VE'], ['Viêt Nam', 'VN'],
  ['Yémen', 'YE'], ['Zambie', 'ZM'], ['Zimbabwe', 'ZW'],
];

export const COUNTRIES: Country[] = RAW.map(([name, iso]) => ({ name, iso, flag: getFlag(iso) }));

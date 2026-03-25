// Curated top cities by country (ISO code → city list)
// Used as instant fallback before/instead of API call
const CITIES: Record<string, string[]> = {
  FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Grenoble', 'Rouen', 'Toulon', 'Aix-en-Provence'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San José', 'Austin', 'Jacksonville', 'San Francisco', 'Seattle', 'Boston', 'Denver', 'Miami', 'Atlanta', 'Minneapolis', 'Portland'],
  GB: ['London', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Edinburgh', 'Liverpool', 'Manchester', 'Bristol', 'Cardiff', 'Belfast', 'Leicester', 'Nottingham', 'Cambridge', 'Oxford'],
  DE: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg'],
  ES: ['Madrid', 'Barcelone', 'Valencia', 'Séville', 'Saragosse', 'Malaga', 'Murcie', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón'],
  IT: ['Rome', 'Milan', 'Naples', 'Turin', 'Palerme', 'Gênes', 'Bologne', 'Florence', 'Bari', 'Catane', 'Venise', 'Vérone', 'Messine', 'Padoue', 'Trieste'],
  PT: ['Lisbonne', 'Porto', 'Braga', 'Coimbra', 'Funchal', 'Setúbal', 'Aveiro', 'Faro', 'Évora', 'Viseu'],
  NL: ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningue', 'Almere', 'Breda', 'Nimègue'],
  BE: ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Louvain', 'Mons', 'Hasselt'],
  CH: ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Winterthour', 'Lucerne', 'Saint-Gall', 'Lugano', 'Bienne'],
  SE: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Sollentuna', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping'],
  NO: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Sarpsborg'],
  DK: ['Copenhague', 'Aarhus', 'Odense', 'Aalborg', 'Frederiksberg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle'],
  FI: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Kouvola'],
  PL: ['Varsovie', 'Cracovie', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice'],
  CZ: ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice'],
  AT: ['Vienne', 'Graz', 'Linz', 'Salzbourg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn'],
  CA: ['Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Québec', 'Hamilton', 'Brampton', 'Surrey', 'Kitchener', 'Halifax', 'London', 'Victoria'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Hobart', 'Darwin'],
  NZ: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Napier', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua'],
  JP: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai'],
  CN: ['Pékin', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Chongqing', 'Tianjin', 'Wuhan', 'Dongguan', 'Xi\'an', 'Hangzhou', 'Nanjing'],
  KR: ['Séoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang'],
  IN: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur'],
  SG: ['Singapour'],
  AE: ['Dubaï', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras al-Khaimah'],
  IL: ['Tel Aviv', 'Jérusalem', 'Haïfa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beer-Sheva', 'Bnei Brak', 'Holon'],
  NG: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Enugu'],
  ZA: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Kimberley', 'Polokwane'],
  EG: ['Le Caire', 'Alexandrie', 'Gizeh', 'Suez', 'Louxor', 'Assouan', 'Port-Saïd', 'Mansoura', 'Tanta', 'Ismaïlia'],
  MA: ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan'],
  TN: ['Tunis', 'Sfax', 'Sousse', 'Ettadhamen', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir'],
  DZ: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra'],
  SN: ['Dakar', 'Thiès', 'Touba', 'Kaolack', 'M\'Bour', 'Saint-Louis', 'Ziguinchor', 'Rufisque', 'Diourbel', 'Tambacounda'],
  CI: ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'Korhogo', 'San-Pédro', 'Man', 'Gagnoa', 'Divo', 'Abengourou'],
  CM: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Bafoussam', 'Maroua', 'Ngaoundéré', 'Kumba', 'Bertoua', 'Édéa'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia'],
  MX: ['Mexico', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Ciudad Juárez', 'León', 'Zapopan', 'Ecatepec', 'Mérida', 'Cancún', 'Chihuahua'],
  AR: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Tucumán', 'Mar del Plata', 'La Plata', 'Salta', 'Santa Fe', 'San Juan'],
  CO: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'],
  CL: ['Santiago', 'Valparaíso', 'Concepción', 'Antofagasta', 'Viña del Mar', 'Temuco', 'Rancagua', 'Talca', 'Iquique', 'Arica'],
  RU: ['Moscou', 'Saint-Pétersbourg', 'Novossibirsk', 'Ekaterinbourg', 'Nijni Novgorod', 'Kazan', 'Samara', 'Omsk', 'Tcheliabinsk', 'Rostov-sur-le-Don'],
  UA: ['Kiev', 'Kharkiv', 'Odessa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaïv', 'Marioupol'],
  TR: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Diyarbakır'],
  SA: ['Riyad', 'Djeddah', 'La Mecque', 'Médine', 'Dammam', 'Taïf', 'Tabuk', 'Buraydah', 'Khobar', 'Abha'],
  PK: ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Peshawar', 'Multan', 'Hyderabad', 'Islamabad', 'Quetta'],
  BD: ['Dacca', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Comilla', 'Mymensingh', 'Barisal', 'Rangpur', 'Narayanganj'],
  ID: ['Jakarta', 'Surabaya', 'Bandung', 'Bekasi', 'Medan', 'Tangerang', 'Semarang', 'Depok', 'Palembang', 'Makassar'],
  MY: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kota Kinabalu', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Malacca', 'Kuching'],
  TH: ['Bangkok', 'Nonthaburi', 'Pak Kret', 'Hat Yai', 'Chiang Mai', 'Udon Thani', 'Khon Kaen', 'Nakhon Ratchasima', 'Pattaya', 'Surat Thani'],
  VN: ['Hô Chi Minh-Ville', 'Hanoï', 'Haiphong', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Da Nang', 'Buon Ma Thuot', 'Qui Nhon'],
  PH: ['Manille', 'Quezon City', 'Caloocan', 'Davao', 'Cebu', 'Zamboanga', 'Taguig', 'Antipolo', 'Pasig', 'Cagayan de Oro'],
};

export function getCitiesForCountry(iso: string): string[] {
  return CITIES[iso] ?? [];
}

export function hasCuratedCities(iso: string): boolean {
  return iso in CITIES;
}

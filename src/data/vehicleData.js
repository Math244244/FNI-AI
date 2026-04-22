// ════════════════════════════════════════════════════════════════
//  Données véhicules — Marché canadien complet
//  Automobiles (2014+), Loisirs (2013+), VR (2013+)
// ════════════════════════════════════════════════════════════════

const CURRENT_YEAR = new Date().getFullYear();

// ── Plages d'années ─────────────────────────────────────────────
export const AUTO_YEARS = Array.from(
  { length: CURRENT_YEAR - 2014 + 2 },
  (_, i) => CURRENT_YEAR + 1 - i,
);

export const REC_YEARS = Array.from(
  { length: CURRENT_YEAR - 2013 + 2 },
  (_, i) => CURRENT_YEAR + 1 - i,
);

// ── Catégories principales ──────────────────────────────────────
export const CATEGORIES = [
  { id: 'automobile', label: 'Automobile', icon: '🚗' },
  { id: 'loisirs',    label: 'Loisirs',    icon: '🏍️' },
  { id: 'vr',         label: 'VR',         icon: '🚐' },
];

export const LOISIR_TYPES = [
  { id: 'moto',        label: 'Moto',          icon: '🏍️' },
  { id: 'vtt',         label: 'VTT / Quad',    icon: '🏔️' },
  { id: 'motoneige',   label: 'Motoneige',     icon: '❄️' },
  { id: 'cote_a_cote', label: 'Côte-à-côte',   icon: '🚙' },
  { id: 'moto_marine', label: 'Moto marine',   icon: '🌊' },
  { id: 'bateau',      label: 'Bateau',        icon: '⛵' },
];

export const VR_TYPES = [
  { id: 'roulotte', label: 'Roulotte',  icon: '🏕️' },
  { id: 'motorise', label: 'Motorisé',  icon: '🚐' },
];

// ── Couleurs de démonstration ───────────────────────────────────
export const VEHICLE_COLORS = [
  'Blanc', 'Noir', 'Gris', 'Argent', 'Rouge', 'Bleu',
  'Vert', 'Brun', 'Beige', 'Bordeaux', 'Or', 'Orange', 'Jaune', 'Mauve',
];

// ════════════════════════════════════════════════════════════════
//  AUTOMOBILE — Marques disponibles au Canada (2014–présent)
//  Les modèles sont récupérés via l'API NHTSA vPIC
// ════════════════════════════════════════════════════════════════
export const AUTO_MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis', 'GMC',
  'Honda', 'Hyundai',
  'Infiniti',
  'Jaguar', 'Jeep',
  'Kia',
  'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Lucid',
  'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
  'Nissan',
  'Polestar', 'Porsche',
  'Ram', 'Rivian', 'Rolls-Royce',
  'Scion', 'Smart', 'Subaru',
  'Tesla', 'Toyota',
  'VinFast', 'Volkswagen', 'Volvo',
];

// ════════════════════════════════════════════════════════════════
//  LOISIRS — Données statiques (marques + modèles)
// ════════════════════════════════════════════════════════════════

const MOTO = {
  makes: [
    'Aprilia', 'BMW', 'Can-Am', 'CFMoto', 'Ducati',
    'Energica', 'Harley-Davidson', 'Honda', 'Husqvarna', 'Indian',
    'Kawasaki', 'KTM', 'Moto Guzzi', 'MV Agusta',
    'Royal Enfield', 'Suzuki', 'Triumph', 'Yamaha', 'Zero',
  ],
  models: {
    'Aprilia': [
      'RS 660', 'RSV4', 'RSV4 Factory', 'Tuareg 660', 'Tuono 660', 'Tuono V4',
      'SR GT 200', 'SX 125', 'SXR 160',
    ],
    'BMW': [
      'C 400 GT', 'C 400 X', 'CE 04',
      'F 750 GS', 'F 850 GS', 'F 850 GS Adventure', 'F 900 R', 'F 900 XR',
      'G 310 GS', 'G 310 R',
      'K 1600 B', 'K 1600 Grand America', 'K 1600 GT', 'K 1600 GTL',
      'M 1000 R', 'M 1000 RR', 'M 1000 XR',
      'R 1250 GS', 'R 1250 GS Adventure', 'R 1250 R', 'R 1250 RS', 'R 1250 RT',
      'R 1300 GS', 'R 1300 GS Adventure',
      'R 18', 'R 18 B', 'R 18 Classic', 'R 18 Roctane', 'R 18 Transcontinental',
      'R nineT', 'R nineT Pure', 'R nineT Scrambler', 'R nineT Urban G/S',
      'S 1000 R', 'S 1000 RR', 'S 1000 XR',
    ],
    'Can-Am': [
      'Ryker 600', 'Ryker 900', 'Ryker Rally',
      'Spyder F3', 'Spyder F3-S', 'Spyder F3-T', 'Spyder F3 Limited',
      'Spyder RT', 'Spyder RT Limited', 'Spyder RT Sea-to-Sky',
    ],
    'CFMoto': [
      '300NK', '300SS', '450NK', '450SS', '700CL-X', '700CL-X Adventure',
      '700CL-X Heritage', '700CL-X Sport', '800NK',
    ],
    'Ducati': [
      'DesertX', 'DesertX Discovery', 'DesertX Rally',
      'Diavel V4', 'Diavel 1260',
      'Hypermotard 698 Mono', 'Hypermotard 950',
      'Monster', 'Monster SP', 'Monster Plus',
      'Multistrada V2', 'Multistrada V4', 'Multistrada V4 Rally', 'Multistrada V4 S',
      'Panigale V2', 'Panigale V4', 'Panigale V4 R', 'Panigale V4 S', 'Panigale V4 SP2',
      'Scrambler Full Throttle', 'Scrambler Icon', 'Scrambler Nightshift', 'Scrambler Urban Motard',
      'Streetfighter V2', 'Streetfighter V4', 'Streetfighter V4 S',
      'XDiavel', 'XDiavel S',
    ],
    'Energica': ['Ego', 'Eva Ribelle', 'Experia'],
    'Harley-Davidson': [
      'Breakout', 'CVO Road Glide', 'CVO Street Glide',
      'Electra Glide', 'Fat Bob', 'Fat Boy',
      'Heritage Classic',
      'Iron 883', 'Iron 1200',
      'LiveWire', 'Low Rider', 'Low Rider S', 'Low Rider ST',
      'Nightster', 'Nightster Special',
      'Night Rod Special',
      'Pan America 1250', 'Pan America 1250 Special',
      'Road Glide', 'Road Glide Limited', 'Road Glide Special',
      'Road King', 'Road King Special',
      'Softail Slim', 'Softail Standard',
      'Sport Glide',
      'Sportster S',
      'Street 500', 'Street 750',
      'Street Bob', 'Street Glide', 'Street Glide Special',
      'Tri Glide Ultra',
      'Ultra Limited',
    ],
    'Honda': [
      'Africa Twin', 'Africa Twin Adventure Sports',
      'CB300R', 'CB500F', 'CB500X', 'CB650R', 'CB1000R',
      'CBR300R', 'CBR500R', 'CBR600RR', 'CBR650R', 'CBR1000RR',
      'CRF110F', 'CRF125F', 'CRF150R', 'CRF250F', 'CRF250R', 'CRF250RX',
      'CRF300L', 'CRF300 Rally', 'CRF450R', 'CRF450RL', 'CRF450RX', 'CRF450X',
      'Gold Wing', 'Gold Wing Tour',
      'Grom', 'Monkey',
      'NC750X', 'NX500',
      'Rebel 300', 'Rebel 500', 'Rebel 1100',
      'Super Cub C125', 'Trail 125',
      'XL750 Transalp', 'XR650L',
    ],
    'Husqvarna': [
      'FE 350', 'FE 501', 'FC 250', 'FC 350', 'FC 450',
      'Norden 901', 'Norden 901 Expedition',
      'Svartpilen 401', 'Svartpilen 801',
      'TC 125', 'TC 250', 'TE 150', 'TE 250', 'TE 300',
      'Vitpilen 401', 'Vitpilen 801',
    ],
    'Indian': [
      'Challenger', 'Challenger Dark Horse', 'Challenger Limited',
      'Chief', 'Chief Bobber', 'Chief Dark Horse',
      'Chieftain', 'Chieftain Dark Horse', 'Chieftain Limited',
      'FTR', 'FTR Rally', 'FTR S', 'FTR Sport',
      'Pursuit', 'Pursuit Dark Horse', 'Pursuit Limited',
      'Roadmaster', 'Roadmaster Dark Horse', 'Roadmaster Limited',
      'Scout', 'Scout Bobber', 'Scout Rogue', 'Scout Sport',
      'Springfield', 'Springfield Dark Horse',
      'Super Chief', 'Super Chief Limited',
    ],
    'Kawasaki': [
      'Concours 14', 'Eliminator',
      'KLR 650', 'KLX 110R', 'KLX 230R', 'KLX 230S', 'KLX 300', 'KLX 300SM',
      'KX 65', 'KX 85', 'KX 112', 'KX 250', 'KX 250X', 'KX 450', 'KX 450X',
      'Ninja 400', 'Ninja 500', 'Ninja 650', 'Ninja 1000 SX',
      'Ninja ZX-4R', 'Ninja ZX-4RR', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Ninja ZX-10RR',
      'Ninja ZX-14R', 'Ninja H2', 'Ninja H2 SX',
      'Versys 650', 'Versys 1000', 'Versys-X 300',
      'Vulcan 900 Classic', 'Vulcan 900 Custom', 'Vulcan S',
      'W800',
      'Z400', 'Z500', 'Z650', 'Z650RS', 'Z900', 'Z900RS', 'Z H2',
    ],
    'KTM': [
      '125 Duke', '200 Duke', '250 Adventure', '250 Duke',
      '390 Adventure', '390 Duke',
      '690 Enduro R', '690 SMC R',
      '790 Adventure', '790 Duke',
      '890 Adventure', '890 Adventure R', '890 Duke', '890 Duke R',
      '990 Duke',
      '1290 Super Adventure R', '1290 Super Adventure S',
      '1290 Super Duke GT', '1290 Super Duke R',
      '150 EXC', '250 EXC-F', '300 EXC', '350 EXC-F', '450 EXC-F', '500 EXC-F',
      '250 SX', '250 SX-F', '350 SX-F', '450 SX-F',
      'RC 390', 'RC 8C',
    ],
    'Moto Guzzi': [
      'California', 'Griso', 'Stelvio', 'V100 Mandello', 'V7', 'V85 TT', 'V9 Bobber', 'V9 Roamer',
    ],
    'MV Agusta': [
      'Brutale 800', 'Brutale 1000', 'Dragster', 'F3 800', 'Lucky Explorer',
      'Superveloce', 'Superveloce S', 'Turismo Veloce',
    ],
    'Royal Enfield': [
      'Bullet 350', 'Classic 350', 'Continental GT 650', 'Guerrilla 450',
      'Himalayan', 'Himalayan 450', 'Hunter 350', 'INT650',
      'Meteor 350', 'Scram 411', 'Super Meteor 650',
    ],
    'Suzuki': [
      'Burgman 200', 'Burgman 400',
      'DR-Z400S', 'DR-Z400SM', 'DR650S',
      'GSX-R600', 'GSX-R750', 'GSX-R1000', 'GSX-R1000R',
      'GSX-S750', 'GSX-S1000', 'GSX-S1000F', 'GSX-S1000GT',
      'GSX-8R', 'GSX-8S',
      'Hayabusa',
      'Katana',
      'RM-Z250', 'RM-Z450',
      'SV650', 'SV650X',
      'V-Strom 250', 'V-Strom 650', 'V-Strom 800', 'V-Strom 800DE', 'V-Strom 1050', 'V-Strom 1050DE',
    ],
    'Triumph': [
      'Bonneville Bobber', 'Bonneville Speedmaster', 'Bonneville T100', 'Bonneville T120',
      'Daytona 660',
      'Rocket 3 GT', 'Rocket 3 R', 'Rocket 3 Storm',
      'Scrambler 400 X', 'Scrambler 900',
      'Speed 400', 'Speed Triple 1200 RR', 'Speed Triple 1200 RS',
      'Speed Twin 900', 'Speed Twin 1200',
      'Street Triple 765 R', 'Street Triple 765 RS',
      'Thruxton RS',
      'Tiger 660 Sport', 'Tiger 850 Sport', 'Tiger 900', 'Tiger 900 Rally', 'Tiger 1200',
      'Trident 660',
    ],
    'Yamaha': [
      'Bolt', 'Bolt R-Spec',
      'FJR1300',
      'MT-03', 'MT-07', 'MT-09', 'MT-09 SP', 'MT-10', 'MT-10 SP',
      'Niken', 'Niken GT',
      'R1', 'R3', 'R6', 'R7', 'R9',
      'Star Venture',
      'Ténéré 700', 'Ténéré 700 Extrême', 'Ténéré 700 Raid',
      'TMAX', 'XMAX',
      'Tracer 9', 'Tracer 9 GT',
      'V Star 250', 'V Star 650',
      'WR250F', 'WR450F',
      'XSR700', 'XSR900', 'XSR900 GP',
      'YZ65', 'YZ85', 'YZ125', 'YZ250', 'YZ250F', 'YZ250FX', 'YZ450F', 'YZ450FX',
      'ZUMA 125',
    ],
    'Zero': ['DS', 'DSR', 'DSR/X', 'FX', 'FXE', 'S', 'SR', 'SR/F', 'SR/S'],
  },
};

const VTT = {
  makes: [
    'Arctic Cat', 'Can-Am', 'CFMoto', 'Honda', 'Kawasaki',
    'Polaris', 'Suzuki', 'Yamaha',
  ],
  models: {
    'Arctic Cat': [
      'Alterra 90', 'Alterra 300', 'Alterra 450', 'Alterra 600',
      'Alterra 700', 'Alterra TRV 700',
    ],
    'Can-Am': [
      'DS 70', 'DS 90', 'DS 90 X', 'DS 250',
      'Outlander 450', 'Outlander 500', 'Outlander 570', 'Outlander 650',
      'Outlander 850', 'Outlander 1000', 'Outlander 1000R',
      'Outlander MAX 450', 'Outlander MAX 570', 'Outlander MAX 650',
      'Outlander MAX 850', 'Outlander MAX 1000', 'Outlander MAX 1000R',
      'Renegade 570', 'Renegade 650', 'Renegade 850', 'Renegade 1000',
      'Renegade 1000R', 'Renegade X MR 1000R',
    ],
    'CFMoto': [
      'CForce 110', 'CForce 400', 'CForce 500', 'CForce 600',
      'CForce 800', 'CForce 800 XC', 'CForce 1000',
    ],
    'Honda': [
      'FourTrax Foreman 4x4', 'FourTrax Foreman Rubicon',
      'FourTrax Rancher', 'FourTrax Rancher 4x4',
      'FourTrax Recon', 'FourTrax Rincon',
      'TRX90X', 'TRX250X',
    ],
    'Kawasaki': [
      'Brute Force 300', 'Brute Force 750 4x4i',
      'KFX 50', 'KFX 90',
    ],
    'Polaris': [
      'Outlaw 70', 'Outlaw 110',
      'Phoenix 200',
      'Scrambler XP 1000',
      'Sportsman 110', 'Sportsman 450', 'Sportsman 570',
      'Sportsman 850', 'Sportsman XP 1000',
      'Sportsman Touring 570', 'Sportsman Touring 850',
      'Sportsman Touring XP 1000',
    ],
    'Suzuki': [
      'KingQuad 400ASi', 'KingQuad 400FSi',
      'KingQuad 500AXi', 'KingQuad 750AXi',
      'QuadSport Z50', 'QuadSport Z90', 'QuadSport Z400',
    ],
    'Yamaha': [
      'Grizzly 90', 'Grizzly 700',
      'Kodiak 450', 'Kodiak 700',
      'Raptor 90', 'Raptor 700', 'Raptor 700R',
      'YFZ50', 'YFZ450R',
    ],
  },
};

const MOTONEIGE = {
  makes: ['Arctic Cat', 'Polaris', 'Ski-Doo', 'Yamaha'],
  models: {
    'Arctic Cat': [
      'Bearcat Z1 XT', 'Bearcat 570',
      'Blast ZR', 'Blast ZR 4000', 'Blast M 4000',
      'M 8000', 'M 8000 Hardcore', 'M 8000 Mountain Cat',
      'Norseman X 8000',
      'Riot 6000', 'Riot 8000', 'Riot 9000', 'Riot X 8000',
      'ZR 200', 'ZR 600', 'ZR 6000', 'ZR 8000', 'ZR 9000',
      'ZR 9000 Thundercat',
    ],
    'Polaris': [
      'Indy 550', 'Indy 600', 'Indy 650',
      'Indy VR1', 'Indy XC',
      'Khaos 850', 'Khaos Boost',
      'Matryx', 'Matryx RMK',
      'PRO-RMK', 'PRO-RMK Boost',
      'RMK 650', 'RMK 850',
      'Rush', 'Rush PRO-S',
      'Switchback', 'Switchback Assault',
      'Titan 800',
      'Voyageur 550', 'Voyageur 600', 'Voyageur 155',
    ],
    'Ski-Doo': [
      'Backcountry', 'Backcountry X', 'Backcountry X-RS',
      'Expedition LE', 'Expedition SE', 'Expedition Sport', 'Expedition Xtreme',
      'Freeride',
      'Grand Touring', 'Grand Touring Limited', 'Grand Touring Sport',
      'MXZ Blizzard', 'MXZ Sport', 'MXZ TNT', 'MXZ X', 'MXZ X-RS',
      'Renegade Adrenaline', 'Renegade Enduro', 'Renegade Sport',
      'Renegade X', 'Renegade X-RS',
      'Skandic Sport', 'Skandic WT',
      'Summit Edge', 'Summit SP', 'Summit X', 'Summit X Expert',
      'Tundra LT', 'Tundra Sport', 'Tundra Xtreme',
    ],
    'Yamaha': [
      'Mountain Max', 'Mountain Max LE',
      'Sidewinder B-TX', 'Sidewinder L-TX', 'Sidewinder M-TX',
      'Sidewinder S-TX', 'Sidewinder SRX', 'Sidewinder X-TX',
      'SRViper L-TX',
      'SXVenom', 'SXVenom Mountain',
      'Transporter 600', 'Transporter 800',
      'VK 540', 'VK Professional',
      'RS Venture TF',
    ],
  },
};

const COTE_A_COTE = {
  makes: [
    'Arctic Cat', 'Can-Am', 'CFMoto', 'Honda',
    'John Deere', 'Kawasaki', 'Polaris', 'Yamaha',
  ],
  models: {
    'Arctic Cat': [
      'Havoc', 'Havoc X',
      'Prowler 500', 'Prowler 700', 'Prowler Pro',
      'Stampede 4X', 'Stampede XTR',
      'Wildcat XX', 'Wildcat XX SE',
    ],
    'Can-Am': [
      'Commander 700', 'Commander 1000', 'Commander 1000R', 'Commander MAX',
      'Defender 700', 'Defender 1000', 'Defender MAX',
      'Defender PRO', 'Defender Limited',
      'Maverick Sport', 'Maverick Sport MAX',
      'Maverick Trail', 'Maverick Trail DPS',
      'Maverick X3', 'Maverick X3 DS', 'Maverick X3 MAX',
      'Maverick X3 R', 'Maverick X3 X RS',
      'Traxter 700', 'Traxter MAX',
    ],
    'CFMoto': [
      'UForce 600', 'UForce 800', 'UForce 1000',
      'ZForce 500', 'ZForce 800', 'ZForce 950', 'ZForce 950 Sport',
    ],
    'Honda': [
      'Pioneer 500', 'Pioneer 520',
      'Pioneer 700', 'Pioneer 700 Deluxe',
      'Pioneer 1000', 'Pioneer 1000 Deluxe', 'Pioneer 1000 Limited',
      'Talon 1000R', 'Talon 1000X', 'Talon 1000X-4',
    ],
    'John Deere': [
      'Gator HPX 615E', 'Gator HPX 815E',
      'Gator RSX 860E', 'Gator RSX 860M',
      'Gator TX', 'Gator TX 4x2',
      'Gator XUV 560', 'Gator XUV 590E', 'Gator XUV 590M',
      'Gator XUV 825M', 'Gator XUV 835M', 'Gator XUV 865M',
      'Gator XUV 835R', 'Gator XUV 865R',
    ],
    'Kawasaki': [
      'KRX 1000', 'KRX 1000 SE', 'KRX4 1000',
      'Mule 4010', 'Mule 4010 Trans', 'Mule PRO-DX', 'Mule PRO-FX',
      'Mule PRO-FXT', 'Mule PRO-MX', 'Mule SX',
      'Teryx', 'Teryx4', 'Teryx S',
    ],
    'Polaris': [
      'General 1000', 'General XP 1000', 'General 4 1000',
      'Ranger 150', 'Ranger 500', 'Ranger 570', 'Ranger 1000',
      'Ranger Crew 570', 'Ranger Crew 1000', 'Ranger Crew XP 1000',
      'Ranger SP 570', 'Ranger XP 1000', 'Ranger XP Kinetic',
      'RZR 200', 'RZR Trail', 'RZR Trail S', 'RZR Trail Ultimate',
      'RZR XP 1000', 'RZR XP 4 1000',
      'RZR Pro R', 'RZR Pro XP', 'RZR Pro XP 4', 'RZR Pro XP Ultimate',
      'RZR Turbo R', 'RZR Turbo R 4',
      'Xpedition', 'Xpedition XP', 'Xpedition ADV',
    ],
    'Yamaha': [
      'Viking', 'Viking VI',
      'Wolverine 850', 'Wolverine X2 850', 'Wolverine X4 850',
      'Wolverine RMAX2 1000', 'Wolverine RMAX4 1000',
      'YXZ1000R', 'YXZ1000R SE', 'YXZ1000R SS',
    ],
  },
};

const MOTO_MARINE = {
  makes: ['Kawasaki', 'Sea-Doo', 'Yamaha'],
  models: {
    'Kawasaki': [
      'Jet Ski STX 160', 'Jet Ski STX 160LX', 'Jet Ski STX 160X',
      'Jet Ski SX-R 160',
      'Jet Ski Ultra 160', 'Jet Ski Ultra 160LX',
      'Jet Ski Ultra 310LX', 'Jet Ski Ultra 310R', 'Jet Ski Ultra 310X',
    ],
    'Sea-Doo': [
      'Explorer Pro 170',
      'Fish Pro Scout 130', 'Fish Pro Sport 170', 'Fish Pro Trophy 170',
      'GTI 130', 'GTI SE 130', 'GTI SE 170',
      'GTR 230',
      'GTX 170', 'GTX 230', 'GTX Limited 300',
      'RXP-X 300', 'RXP-X Apex 300',
      'RXT 230', 'RXT-X 300',
      'Spark 2up 90', 'Spark 3up 90', 'Spark Trixx',
      'Switch Compact', 'Switch Sport', 'Switch Cruise',
      'Wake 170', 'Wake Pro 230',
    ],
    'Yamaha': [
      'EX', 'EX Deluxe', 'EX Limited', 'EX Sport',
      'FX Cruiser HO', 'FX Cruiser SVHO', 'FX HO', 'FX Limited SVHO', 'FX SVHO',
      'GP1800R HO', 'GP1800R SVHO',
      'SuperJet',
      'VX', 'VX Cruiser', 'VX Cruiser HO', 'VX Deluxe', 'VX Limited HO',
    ],
  },
};

const BATEAU = {
  makes: [
    'Alumacraft', 'Bayliner', 'Bennington', 'Boston Whaler',
    'Campion', 'Chaparral', 'Cobia', 'Crestliner', 'Crownline',
    'Four Winns',
    'Glastron', 'Grady-White',
    'Harris', 'Hewescraft',
    'Legend Boats', 'Lowe Boats', 'Lund',
    'Manitou', 'MasterCraft', 'Malibu Boats', 'Misty Harbor', 'Monterey',
    'Nautique',
    'Princecraft',
    'Ranger Boats', 'Robalo',
    'Sea Ray', 'Smoker Craft', 'Starcraft', 'Stingray', 'Sun Tracker', 'Supra', 'Sylvan',
    'Tahoe', 'Tracker', 'Triton',
    'Yamaha Boats',
  ],
  models: {},
};

// ════════════════════════════════════════════════════════════════
//  VR — Données statiques (marques + modèles)
// ════════════════════════════════════════════════════════════════

const ROULOTTE = {
  makes: [
    'Airstream', 'Coachmen', 'CrossRoads', 'Dutchmen',
    'Forest River', 'Grand Design', 'Gulf Stream', 'Heartland',
    'Jayco', 'Keystone', 'KZ', 'Palomino',
    'Winnebago',
  ],
  models: {
    'Airstream': [
      'Basecamp', 'Bambi', 'Caravel', 'Classic', 'Flying Cloud',
      'Globetrotter', 'International', 'Pottery Barn', 'Sport', 'Trade Wind',
    ],
    'Coachmen': [
      'Apex', 'Apex Nano', 'Brookstone', 'Catalina Legacy',
      'Catalina Summit', 'Catalina Trail Blazer', 'Chaparral',
      'Chaparral Lite', 'Freedom Express', 'Spirit',
    ],
    'CrossRoads': [
      'Cruiser', 'Hampton', 'Sunset Trail', 'Volante', 'Zinger',
    ],
    'Dutchmen': [
      'Aerolite', 'Aspen Trail', 'Astoria', 'Atlas',
      'Coleman', 'Coleman Lantern', 'Coleman Rubicon',
      'Kodiak Ultra-Lite', 'Voltage',
    ],
    'Forest River': [
      'Cardinal', 'Cedar Creek', 'Cherokee', 'Cherokee Grey Wolf',
      'EVO', 'Flagstaff', 'Flagstaff E-Pro',
      'Impression', 'No Boundaries', 'Ozark',
      'R-Pod', 'Rockwood', 'Rockwood Geo Pro',
      'Salem', 'Salem Cruise Lite', 'Salem FSX',
      'Sandpiper', 'Sierra', 'Surveyor',
      'Vibe', 'Wildwood', 'Wildwood Heritage Glen',
      'Wildwood X-Lite', 'XLR Boost', 'XLR Nitro',
    ],
    'Grand Design': [
      'Imagine', 'Imagine AIM', 'Imagine XLS',
      'Momentum', 'Momentum G-Class',
      'Reflection',
      'Solitude', 'Solitude S-Class',
      'Transcend', 'Transcend Xplor',
    ],
    'Gulf Stream': [
      'Ameri-Lite', 'Conquest', 'Envision', 'Geo',
      'Innsbruck', 'StreamLite', 'Vintage Cruiser', 'Vista Cruiser',
    ],
    'Heartland': [
      'Bighorn', 'Bighorn Traveler',
      'Cyclone', 'ElkRidge', 'Fuel',
      'Landmark', 'Mallard',
      'Milestone', 'North Trail', 'Pioneer',
      'Prowler', 'Terry Classic',
      'Trail Runner', 'Wilderness',
    ],
    'Jayco': [
      'Eagle', 'Eagle HT',
      'Hummingbird',
      'Jay Feather', 'Jay Feather Micro',
      'Jay Flight', 'Jay Flight Bungalow', 'Jay Flight SLX',
      'North Point', 'Octane',
      'Pinnacle', 'Seismic',
      'White Hawk',
    ],
    'Keystone': [
      'Alpine', 'Arcadia', 'Bullet',
      'Carbon', 'Cougar', 'Cougar Half-Ton',
      'Fuzion', 'Hideout',
      'Laredo', 'Montana', 'Montana High Country',
      'Outback', 'Passport', 'Passport SL',
      'Premier', 'Raptor',
      'Springdale', 'Sprinter', 'Sprinter Limited',
    ],
    'KZ': [
      'Connect', 'Durango', 'Durango Gold', 'Durango Half-Ton',
      'Escape', 'Escape Mini', 'Sportmen', 'Sportsmen Classic',
      'Sportsmen LE', 'Sportsmen SE', 'Venom',
    ],
    'Palomino': [
      'Columbus', 'Puma', 'Puma Unleashed', 'Puma XLE',
      'Real-Lite', 'River Ranch', 'SolAire',
    ],
    'Winnebago': [
      'Hike', 'Micro Minnie', 'Micro Minnie FLX',
      'Minnie', 'Minnie Plus', 'Minnie Winnie (towable)',
      'Spyder', 'Voyage',
    ],
  },
};

const MOTORISE = {
  makes: [
    'Coachmen', 'Entegra Coach', 'Forest River',
    'Jayco', 'Leisure Travel Vans', 'Newmar',
    'Pleasure-Way', 'Thor', 'Tiffin', 'Winnebago',
  ],
  models: {
    'Coachmen': [
      'Beyond', 'Cross Trail', 'Freelander', 'Galleria',
      'Leprechaun', 'Mirada', 'Nova', 'Pursuit', 'Sportscoach',
    ],
    'Entegra Coach': [
      'Accolade', 'Anthem', 'Aspire', 'Cornerstone',
      'Emblem', 'Launch', 'Odyssey', 'Qwest', 'Reatta', 'Vision',
    ],
    'Forest River': [
      'Berkshire', 'Charleston', 'Forester', 'Forester TS',
      'Georgetown', 'Solera', 'Sunseeker', 'Sunseeker TS',
    ],
    'Jayco': [
      'Alante', 'Embark', 'Greyhawk', 'Melbourne',
      'Precept', 'Redhawk', 'Redhawk SE', 'Seneca',
    ],
    'Leisure Travel Vans': [
      'Serenity', 'Unity', 'Wonder', 'Xplore',
    ],
    'Newmar': [
      'Bay Star', 'Bay Star Sport', 'Canyon Star',
      'Dutch Star', 'Essex', 'King Aire',
      'Kountry Star', 'London Aire', 'Mountain Aire',
      'New Aire', 'Supreme Aire', 'Ventana',
    ],
    'Pleasure-Way': [
      'Ascent', 'Lexor', 'Ontour', 'Plateau',
      'Rekon', 'Tofino',
    ],
    'Thor': [
      'A.C.E.', 'Aria', 'Axis', 'Chateau', 'Compass',
      'Delano', 'Four Winds', 'Gemini', 'Hurricane',
      'Magnitude', 'Miramar', 'Outlaw', 'Palazzo',
      'Quantum', 'Rize', 'Sanctuary', 'Sequence',
      'Tellaro', 'Tiburon', 'Tranquility', 'Tuscany',
      'Twist', 'Vegas', 'Venetian',
    ],
    'Tiffin': [
      'Allegro', 'Allegro Bay', 'Allegro Breeze', 'Allegro Bus',
      'Allegro RED', 'Open Road', 'Open Road Allegro',
      'Phaeton', 'Wayfarer', 'Zephyr',
    ],
    'Winnebago': [
      'Adventurer', 'Boldt', 'Ekko',
      'Forza', 'Horizon', 'Intent', 'Journey',
      'Navion', 'Porto', 'Revel',
      'Solis', 'Solis Pocket', 'Sunstar', 'Travato',
      'View', 'Vita',
    ],
  },
};

// ── Index des données par catégorie ─────────────────────────────
const REC_DATA = {
  moto: MOTO,
  vtt: VTT,
  motoneige: MOTONEIGE,
  cote_a_cote: COTE_A_COTE,
  moto_marine: MOTO_MARINE,
  bateau: BATEAU,
};

const VR_DATA = {
  roulotte: ROULOTTE,
  motorise: MOTORISE,
};

// ════════════════════════════════════════════════════════════════
//  API — Fonctions d'accès aux données
// ════════════════════════════════════════════════════════════════

export function getYears(category) {
  return category === 'automobile' ? AUTO_YEARS : REC_YEARS;
}

export function getMakes(category, subType) {
  if (category === 'automobile') return AUTO_MAKES;
  if (category === 'loisirs' && subType) return REC_DATA[subType]?.makes || [];
  if (category === 'vr' && subType) return VR_DATA[subType]?.makes || [];
  return [];
}

export function getStaticModels(category, subType, make) {
  let data;
  if (category === 'loisirs' && subType) data = REC_DATA[subType];
  else if (category === 'vr' && subType) data = VR_DATA[subType];
  else return [];
  return data?.models?.[make] || [];
}

const modelCache = {};

export async function fetchModelsFromAPI(make, year) {
  const key = `${make}_${year}`;
  if (modelCache[key]) return modelCache[key];
  try {
    const r = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`,
    );
    const d = await r.json();
    const list = [...new Set(d.Results?.map(r => r.Model_Name).filter(Boolean) || [])].sort();
    modelCache[key] = list;
    return list;
  } catch {
    return [];
  }
}

export async function getModels(category, subType, make, year) {
  if (category === 'automobile') {
    return fetchModelsFromAPI(make, year);
  }
  if (category === 'loisirs' && subType === 'moto') {
    const api = await fetchModelsFromAPI(make, year);
    if (api.length > 0) return api;
  }
  return getStaticModels(category, subType, make);
}

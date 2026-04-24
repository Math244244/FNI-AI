// ════════════════════════════════════════════════════════════
//  AVANTAGE PLUS — Catalogue produits F&I (v3 Prestige)
//  Chapitres : mecanique | routier | valeur | assurance | gap
//  Icones : mapping vers lucide-react (voir utils/productIcons.js)
// ════════════════════════════════════════════════════════════

const H = {
  // Mécanique
  engine:        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80',
  turbo:         'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&q=80',
  transmission:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  electronics:   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  suspension:    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',

  // Risques routiers
  tire_flat:     'https://images.unsplash.com/photo-1591940742878-13aba4b7a34e?w=400&q=80',
  rim:           'https://images.unsplash.com/photo-1611059826143-b1ea86e56f77?w=400&q=80',
  windshield:    'https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=400&q=80',
  mirror:        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80',

  // Valeur de revente
  rust:          'https://images.unsplash.com/photo-1558618047-3c8c78e9a40b?w=400&q=80',
  interior:      'https://images.unsplash.com/photo-1617469767051-ba98a60ee8a3?w=400&q=80',
  undercarriage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
  seal:          'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&q=80',

  // Assurance / Finance
  family:        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
  hospital:      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
  invoice:       'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
  disability:    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
  stats:         'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',

  // GAP
  crash:         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  flood:         'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80',
  calculator:    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
};

export const CHAPTERS = {
  mecanique: { id: 'mecanique', label: 'Mécanique',  order: 1, numeral: 'I' },
  routier:   { id: 'routier',   label: 'Extérieur',  order: 2, numeral: 'II' },
  valeur:    { id: 'valeur',    label: 'Valeur',     order: 3, numeral: 'III' },
  assurance: { id: 'assurance', label: 'Assurance',  order: 4, numeral: 'IV' },
  gap:       { id: 'gap',       label: 'Financier',  order: 5, numeral: 'V' },
};

export const PRODUCTS = [
  {
    id: 'garantie',
    title: 'Protection Mécanique Étendue',
    chapter: 'mecanique',
    iconName: 'Shield',
    icon: '🛡️',
    emoji_hook: '', emoji_risk: '', emoji_solution: '',
    dotIconMap: { 'Moteur': 'Cog', 'Transmission': 'Settings', 'Électronique': 'Cpu', 'Turbo': 'Wind', 'Suspension': 'Spline' },
    monthly_price: 42,
    presenter_note: 'Attirer l\'attention sur l\'écart entre la garantie fabricant (3 ans) et la durée de détention moyenne (6-8 ans).',
    hook: {
      headline: 'Votre choix intelligent mérite une protection éclairée.',
      text: 'Les pannes mécaniques imprévues peuvent surgir à tout moment. Avec la garantie Avantage Plus, vous roulez l\'esprit tranquille, protégé par plus de 30 ans d\'expertise.',
    },
    risk: {
      headline: 'La réalité sans protection :',
      points: [
        'Coût moyen d\'une réparation moteur : 3 000 $ à 8 000 $',
        'Le fabricant limite sa couverture après quelques années',
        'Une panne suffit à effacer des mois d\'économies',
      ],
    },
    solution: {
      headline: 'Ce que vous obtenez :',
      points: [
        'Moteur, transmission, systèmes essentiels couverts',
        'Réseau de garages partenaires partout au Canada',
        'Aucun déboursé au moment de la panne',
      ],
    },
    facts: {
      headline: 'Faits & statistiques',
      image: H.stats,
      statValue: '~190',
      statLabel: 'défauts relevés pour 100 véhicules (industrie, étude qualité initiale 2023)',
      body: 'Les études de qualité (ex. IQS J.D. Power) montrent des centaines de défauts par centaine de véhicules neufs : les réparations hors garantie restent d’actualité tout au long de la vie du véhicule.',
      footnote: 'Contexte : études de qualité initiale publiées par des cabinets reconnus (J.D. Power, etc.) — chiffres indicatifs, année modèle & segment variables.',
    },
    vehicle_dots: [
      { top: '50%', left: '30%', label: 'Moteur',              icon: 'Cog',      description: 'Panne moteur — réparation la plus coûteuse sur un véhicule.',          cost: '3 500 $ – 8 000 $', image: H.engine,      color: '#2B6CDB' },
      { top: '60%', left: '50%', label: 'Transmission',        icon: 'Settings', description: 'Remplacement d\'une boîte automatique, pièce et main-d\'œuvre incluses.', cost: '2 800 $ – 6 500 $', image: H.transmission, color: '#2B6CDB' },
      { top: '38%', left: '70%', label: 'Électronique',        icon: 'Cpu',      description: 'Modules de contrôle électroniques modernes — très coûteux à remplacer.', cost: '800 $ – 2 500 $',  image: H.electronics, color: '#2B6CDB' },
      { top: '42%', left: '20%', label: 'Turbo / Compresseur', icon: 'Wind',     description: 'Panne de turbo fréquente sur les véhicules récents à moteur 4 cyl.',    cost: '1 500 $ – 4 000 $', image: H.turbo,       color: '#2B6CDB' },
      { top: '72%', left: '40%', label: 'Suspension',          icon: 'Spline',   description: 'Remplacement des amortisseurs et bras de suspension.',                  cost: '600 $ – 2 200 $',  image: H.suspension,  color: '#2B6CDB' },
    ],
  },

  {
    id: 'hasard',
    title: 'Risques Routiers',
    chapter: 'routier',
    iconName: 'CircleDot',
    icon: '🛞',
    emoji_hook: '', emoji_risk: '', emoji_solution: '',
    monthly_price: 18,
    presenter_note: 'Rappeler les conditions hivernales canadiennes et la fréquence des nids-de-poule.',
    hook: {
      headline: 'Chaque trajet peut cacher un nid-de-poule.',
      text: 'Pneus crevés, jantes déformées, vitres brisées. Ces situations arrivent aux meilleurs conducteurs. Vous êtes couvert en quelques minutes.',
    },
    risk: {
      headline: 'La réalité sans protection :',
      points: [
        'Un pneu de qualité remplacé peut coûter 300 $ à 600 $',
        'Une jante en alliage endommagée dépasse souvent 800 $',
        'Les assurances auto standard ne couvrent pas ces dommages',
      ],
    },
    solution: {
      headline: 'Ce que vous obtenez :',
      points: [
        'Pneus et jantes couverts contre tous les dommages routiers',
        'Remplacement ou réparation inclus',
        'Validité sur toutes les routes du Canada et des États-Unis',
      ],
    },
    facts: {
      headline: 'Faits & statistiques',
      image: H.tire_flat,
      statValue: '2 000-6 000 $',
      statLabel: 'fourchette fréquente pour pneus performance ou jantes (remplacement / parité, ordre de grandeur marché canadien)',
      body: 'Gravillons, nids-de-poule et bords de trottoir : les bris de pneus, jantes et vitrage figurent parmi les motifs de remplacement les plus visibles en concession après le printemps.',
      footnote: 'Indicatif : montants réels selon produit, démontage, alignement, taxes. Pas une garantie d’estimation.',
    },
    vehicle_dots: [
      { top: '76%', left: '18%', label: 'Pneu avant gauche',   icon: 'CircleDot',      description: 'Crevaison ou talonnage sur gravillons ou nid-de-poule.',              cost: '250 $ – 450 $',    image: H.tire_flat,  color: '#2B6CDB' },
      { top: '76%', left: '80%', label: 'Pneu arrière droit',  icon: 'CircleDot',      description: 'Pneu à taille basse — remplacement impossible sans garantie.',        cost: '300 $ – 600 $',    image: H.tire_flat,  color: '#2B6CDB' },
      { top: '70%', left: '22%', label: 'Jante en alliage',    icon: 'Circle',         description: 'Impact de trottoir ou nid-de-poule : jante déformée ou fissurée.',    cost: '400 $ – 1 200 $',  image: H.rim,        color: '#2B6CDB' },
      { top: '28%', left: '50%', label: 'Pare-brise',          icon: 'Square',         description: 'Impact de caillou ou bris de vitre — non couvert en auto standard.',  cost: '300 $ – 900 $',    image: H.windshield, color: '#2B6CDB' },
      { top: '50%', left: '8%',  label: 'Rétroviseur',         icon: 'Aperture',       description: 'Bris de rétroviseur ou caméra de recul intégrée.',                    cost: '200 $ – 800 $',    image: H.mirror,     color: '#2B6CDB' },
    ],
  },

  {
    id: 'protection',
    title: 'Protection Valeur de Revente',
    chapter: 'valeur',
    iconName: 'TrendingUp',
    icon: '💰',
    emoji_hook: '', emoji_risk: '', emoji_solution: '',
    monthly_price: 25,
    presenter_note: 'Souligner l\'impact sur la valeur de reprise au moment du changement suivant.',
    hook: {
      headline: 'Votre véhicule, c\'est un investissement.',
      text: 'La valeur de votre voiture dépend directement de son état. Protégez sa carrosserie et son intérieur pour maximiser votre valeur de reprise.',
    },
    risk: {
      headline: 'La réalité sans protection :',
      points: [
        'La corrosion réduit la valeur de revente de 20 à 40%',
        'Les taches permanentes sur les tissus sont irrécupérables',
        'Une carrosserie oxydée crée une mauvaise première impression',
      ],
    },
    solution: {
      headline: 'Ce que vous obtenez :',
      points: [
        'Traitement antirouille sur châssis et carrosserie',
        'Protection des tissus et cuirs contre les taches',
        'Imperméabilisation complète intérieure et extérieure',
      ],
    },
    facts: {
      headline: 'Faits & statistiques',
      image: H.rust,
      statValue: '10-15 %/an',
      statLabel: 'dépréciation moyenne — un véhicule bien entretenu se vend plus vite (guides de reprise, Marché de l’occasion Canada)',
      body: 'L’apparence (carrosserie, intérieur, corrosion) pèse lourdement sur l’offre de reprise : protéger l’enveloppe, c’est préserver le pouvoir d’achat de votre prochaine transaction.',
      footnote: 'Ordre de grandeur issu de publications du marché (Black Book, guide des commerçants) — sujet à l’échantillon, à l’état et à la demande.',
    },
    vehicle_dots: [
      { top: '52%', left: '50%', label: 'Carrosserie',         icon: 'Palette',      description: 'Rouille sur la carrosserie — dépréciation visible à la revente.',       cost: '-25 à -40% valeur',          image: H.rust,          color: '#2B6CDB' },
      { top: '32%', left: '50%', label: 'Toit',                icon: 'Home',         description: 'Corrosion du toit — négligée car peu visible jusqu\'à la revente.',     cost: '800 $ – 3 000 $ réparation', image: H.rust,          color: '#2B6CDB' },
      { top: '48%', left: '35%', label: 'Intérieur',           icon: 'Armchair',     description: 'Taches permanentes sur tissu ou cuir dès la 1ère année.',               cost: '400 $ – 1 200 $ détail',     image: H.interior,      color: '#2B6CDB' },
      { top: '82%', left: '50%', label: 'Châssis',             icon: 'Cog',          description: 'Rouille sur le châssis — problème structurel = refus de financement.',  cost: '600 $ – 2 500 $ traitement', image: H.undercarriage, color: '#2B6CDB' },
      { top: '48%', left: '15%', label: 'Joints / Étanchéité', icon: 'Droplet',      description: 'Infiltration d\'eau — moisissures, électronique abîmée, odeurs.',       cost: '300 $ – 1 500 $ réparation', image: H.seal,          color: '#2B6CDB' },
    ],
  },

  {
    id: 'assurance_vie',
    title: 'Assurance Vie',
    chapter: 'assurance',
    iconName: 'Heart',
    icon: '❤️',
    emoji_hook: '', emoji_risk: '', emoji_solution: '',
    monthly_price: 14,
    presenter_note: 'Approcher avec empathie — protéger la famille, pas vendre une assurance.',
    hook: {
      headline: 'Protégez votre famille, pas seulement votre véhicule.',
      text: 'En cas de décès, votre balance de prêt est soldée. Vos proches ne porteront pas le poids de cette responsabilité financière.',
    },
    risk: {
      headline: 'La réalité sans protection :',
      points: [
        'La balance de prêt auto peut dépasser 30 000 $',
        'Les héritiers héritent aussi des dettes',
        'La succession peut être compliquée par le véhicule en garantie',
      ],
    },
    solution: {
      headline: 'Ce que vous obtenez :',
      points: [
        'Solde du prêt remboursé intégralement au décès',
        'Protection immédiate dès la signature',
        'Prime mensuelle fixe intégrée au financement',
      ],
    },
    facts: {
      headline: 'Faits & statistiques',
      image: H.family,
      statValue: '~33 k$',
      statLabel: 'financement moyen d’un véhicule neuf au Canada (ordre de grandeur 2022-2023, Statistique Canada, inventaire foyers & crédit)',
      body: 'Un décès soudain laisse parfois une dette de véhicule : l’assurance-vie liée au prêt vise à solder le solde afin d’alléger le fardeau pour la famille.',
      footnote: 'Moyennes nationales, arrondies — vérifier auprès de votre prêteur et votre police.',
    },
    vehicle_dots: [
      { top: '38%', left: '50%', label: 'Protection familiale', icon: 'Heart',      description: 'Le solde de votre prêt est remboursé à votre décès — votre famille garde le véhicule.', cost: 'Prêt moyen : 28 000 $',   image: H.family,   color: '#2B6CDB' },
      { top: '55%', left: '28%', label: 'Couverture immédiate', icon: 'ClipboardCheck', description: 'Dès la signature du contrat, la protection est active — aucun délai de carence.',   cost: 'À partir de 12 $/mois', image: H.invoice,  color: '#2B6CDB' },
      { top: '55%', left: '72%', label: 'Cas d\'application',   icon: 'Activity',   description: 'Accident de la route, maladie subite : le prêt est soldé dans les 30 jours.',          cost: 'Remboursement : 100%',  image: H.hospital, color: '#2B6CDB' },
    ],
  },

  {
    id: 'assurance_invalidite',
    title: 'Assurance Invalidité',
    chapter: 'assurance',
    iconName: 'HeartPulse',
    icon: '🏥',
    emoji_hook: '', emoji_risk: '', emoji_solution: '',
    monthly_price: 16,
    presenter_note: 'Présenter la statistique « 1 Canadien sur 3 » en début, pour ancrage émotionnel.',
    hook: {
      headline: 'Ce n\'est pas la mort qu\'on redoute, c\'est de ne plus pouvoir travailler.',
      text: 'Si la maladie ou un accident vous immobilise, vos paiements continuent pour vous, automatiquement. Votre vie quotidienne n\'est pas interrompue.',
    },
    risk: {
      headline: 'La réalité sans protection :',
      points: [
        '1 Canadien sur 3 sera invalide pour plus de 90 jours au cours de sa vie',
        'L\'assurance emploi ne couvre pas toutes les situations',
        'Une seule absence prolongée peut mener à la saisie du véhicule',
      ],
    },
    solution: {
      headline: 'Ce que vous obtenez :',
      points: [
        'Paiements du prêt pris en charge durant votre invalidité',
        'Couverture déclenchée dès le 1er jour selon le régime choisi',
        'Complète votre régime d\'assurance groupe si vous en avez un',
      ],
    },
    facts: {
      headline: 'Faits & statistiques',
      image: H.stats,
      statValue: '1 / 3',
      statLabel: 'Canadiens : invalidité de plus de 90 jours au cours de la vie (donnée couramment citée par l’industrie des assurances de personnes, ARTA / ACB)',
      body: 'Une mauvaise chute, une chirurgie ou un arrêt prolongé : sans revenu de travail, les paiements de prêt continuent. L’assurance invalidité vise justement cette faille du budget.',
      footnote: 'Contexte pédagogique (présentation) : vérifier sur la police les délais, exclusions et définitions d’invalidité.',
    },
    vehicle_dots: [
      { top: '38%', left: '50%', label: '1 sur 3 Canadiens',    icon: 'BarChart3',    description: 'Statistique réelle : 1 Canadien sur 3 vivra une invalidité de plus de 90 jours.', cost: 'Perte de revenus : 3-24 mois',   image: H.stats,      color: '#2B6CDB' },
      { top: '55%', left: '28%', label: 'Vos paiements couverts', icon: 'CreditCard', description: 'Chaque versement mensuel de votre prêt auto est pris en charge — même à long terme.',cost: 'Jusqu\'à 24 mois de couverture', image: H.invoice,    color: '#2B6CDB' },
      { top: '55%', left: '68%', label: 'Activation rapide',    icon: 'Timer',        description: 'Couverture déclenchée dès le premier jour d\'invalidité médicalement constatée.',    cost: 'Délai : 0 à 7 jours',           image: H.disability, color: '#2B6CDB' },
    ],
  },

  {
    id: 'assurance_perte',
    title: 'Assurance Perte Totale (GAP)',
    chapter: 'gap',
    iconName: 'Lock',
    icon: '🔒',
    emoji_hook: '', emoji_risk: '', emoji_solution: '',
    monthly_price: 22,
    presenter_note: 'Utiliser l\'exemple concret 22 000 $ vs 28 000 $ pour matérialiser le déficit.',
    hook: {
      headline: 'En cas d\'accident total, votre assureur ne couvre pas tout.',
      text: 'La valeur réelle d\'un véhicule décline plus vite que le solde de votre prêt. Sans GAP, vous payez la différence de votre poche.',
    },
    risk: {
      headline: 'La réalité sans protection :',
      points: [
        'Voiture valant 22 000 $, solde de prêt à 28 000 $ → vous devez 6 000 $',
        'L\'assurance auto rembourse seulement la valeur marchande',
        'Vous êtes sans voiture ET avec une dette résiduelle',
      ],
    },
    solution: {
      headline: 'Ce que vous obtenez :',
      points: [
        'L\'écart entre la valeur assurée et la balance de prêt est comblé',
        'Protection active dès la 1ère journée sur route',
        'Couvre vol total, perte totale par accident ou catastrophe naturelle',
      ],
    },
    facts: {
      headline: 'Faits & statistiques',
      image: H.calculator,
      statValue: '20-40 %',
      statLabel: 'déclin de valeur typique d’un véhicule neuf dès la 1ʳᵉ année (amortissement accéléré vs. solde de prêt — littérature finance & GAP, Canada)',
      body: 'En perte totale, l’assureur règle souvent la valeur de remplacement (moins franchise), alors que le prêt retombe sur le coût d’acquisition. Le GAP vise l’espace entre les deux.',
      footnote: 'Exemples pédagogiques seulement : montant exact selon police, taux, terme, mise de fonds.',
    },
    vehicle_dots: [
      { top: '38%', left: '50%', label: 'Perte totale',         icon: 'Zap',         description: 'Collision frontale : véhicule irréparable. Assureur paie la valeur marchande, pas le solde.', cost: 'Écart moyen : 4 000 $ – 9 000 $',   image: H.crash,      color: '#2B6CDB' },
      { top: '55%', left: '18%', label: 'Vol total',            icon: 'AlertCircle', description: 'Véhicule volé et non retrouvé : assurance rembourse la valeur, pas le prêt restant.',          cost: 'Déficit potentiel : 5 000 $ – 12 000 $', image: H.crash,   color: '#2B6CDB' },
      { top: '55%', left: '80%', label: 'Catastrophe naturelle',icon: 'CloudRain',   description: 'Inondation, grêle sévère, arbre tombé — perte totale couverte par le GAP.',                cost: 'Remboursement intégral garanti',     image: H.flood,      color: '#2B6CDB' },
      { top: '70%', left: '50%', label: 'Le déficit GAP',       icon: 'Scale',       description: 'Sans GAP : vous devez continuer à payer un véhicule que vous n\'avez plus.',                   cost: 'Exemple réel : 6 000 $ de votre poche', image: H.calculator, color: '#2B6CDB' },
    ],
  },
];

// Catégories véhicules (catalogue)
export const VEHICLE_CATEGORIES = {
  automobile: {
    label: 'Automobile',
    iconName: 'Car',
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
    subs: null,
  },
  loisirs: {
    label: 'Loisirs',
    iconName: 'Bike',
    icon: '🏍️',
    image: 'https://images.unsplash.com/photo-1568772585407-9f4f3e2e0a20?w=600&q=80',
    subs: [
      { id: 'moto',        label: 'Moto',        iconName: 'Bike',      icon: '🏍️', image: 'https://images.unsplash.com/photo-1568772585407-9f4f3e2e0a20?w=400&q=80' },
      { id: 'vtt',         label: 'VTT',         iconName: 'Mountain',  icon: '🚵', image: 'https://images.unsplash.com/photo-1544191696-15bed79b0640?w=400&q=80' },
      { id: 'motoneige',   label: 'Motoneige',   iconName: 'Snowflake', icon: '❄️',  image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80' },
      { id: 'cote_a_cote', label: 'Côte-à-côte', iconName: 'Truck',     icon: '🚙', image: 'https://images.unsplash.com/photo-1558618047-3c8c78e9a40b?w=400&q=80' },
      { id: 'moto_marine', label: 'Moto Marine', iconName: 'Waves',     icon: '🚤', image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=400&q=80' },
      { id: 'bateau',      label: 'Bateau',      iconName: 'Ship',      icon: '⛵', image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=400&q=80' },
    ],
  },
  vr: {
    label: 'VR',
    iconName: 'Caravan',
    icon: '🚐',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80',
    subs: [
      { id: 'roulotte', label: 'Roulotte', iconName: 'Caravan', icon: '🚌', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&q=80' },
      { id: 'motorise', label: 'Motorisé', iconName: 'Bus',     icon: '🚐', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
    ],
  },
};

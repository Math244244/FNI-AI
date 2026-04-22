// ════════════════════════════════════════════════════════════
//  FNI&AI — Data centrale : Slides de présentation + Hotspots
//  Images cohérentes et représentatives de chaque composant
// ════════════════════════════════════════════════════════════

const H = {
  // Mécanique — authentiques
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

  // GAP / Accident
  crash:         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  flood:         'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80',
  calculator:    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
};

export const PRODUCTS = [
  {
    id: 'garantie',
    title: 'Protection Mécanique Étendue',
    icon: '🛡️',
    emoji_hook: '✨',
    emoji_risk: '⚠️',
    emoji_solution: '✅',
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
    vehicle_dots: [
      { top: '50%', left: '30%', label: '⚙️ Moteur',            description: 'Panne moteur — réparation la plus coûteuse sur un véhicule.',          cost: '3 500 $ – 8 000 $', image: H.engine,       color: '#3B82F6' },
      { top: '60%', left: '50%', label: '🔧 Transmission',       description: 'Remplacement d\'une boîte automatique, pièce et main-d\'œuvre incluses.', cost: '2 800 $ – 6 500 $', image: H.transmission,  color: '#3B82F6' },
      { top: '38%', left: '70%', label: '💻 Électronique',       description: 'Modules de contrôle électroniques modernes — très coûteux à remplacer.',  cost: '800 $ – 2 500 $',  image: H.electronics,  color: '#3B82F6' },
      { top: '42%', left: '20%', label: '🌀 Turbo / Compresseur',description: 'Panne de turbo fréquente sur les véhicules récents à moteur 4 cyl.',     cost: '1 500 $ – 4 000 $', image: H.turbo,        color: '#3B82F6' },
      { top: '72%', left: '40%', label: '🔩 Suspension',          description: 'Remplacement des amortisseurs et bras de suspension.',                    cost: '600 $ – 2 200 $',  image: H.suspension,   color: '#3B82F6' },
    ],
  },

  {
    id: 'hasard',
    title: 'Risques Routiers',
    icon: '🛞',
    emoji_hook: '🚗',
    emoji_risk: '⚠️',
    emoji_solution: '✅',
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
    vehicle_dots: [
      { top: '76%', left: '18%', label: '🛞 Pneu avant gauche', description: 'Crevaison ou talonnage sur gravillons ou nid-de-poule.',              cost: '250 $ – 450 $',    image: H.tire_flat,  color: '#3B82F6' },
      { top: '76%', left: '80%', label: '🛞 Pneu arrière droit', description: 'Pneu à taille basse — remplacement impossible sans garantie.',        cost: '300 $ – 600 $',    image: H.tire_flat,  color: '#3B82F6' },
      { top: '70%', left: '22%', label: '⭕ Jante en alliage',   description: 'Impact de trottoir ou nid-de-poule : jante déformée ou fissurée.',    cost: '400 $ – 1 200 $',  image: H.rim,        color: '#3B82F6' },
      { top: '28%', left: '50%', label: '🔲 Pare-brise',         description: 'Impact de caillou ou bris de vitre — non couvert en auto standard.',  cost: '300 $ – 900 $',    image: H.windshield, color: '#3B82F6' },
      { top: '50%', left: '8%',  label: '🪞 Rétroviseur',        description: 'Bris de rétroviseur ou caméra de recul intégrée.',                   cost: '200 $ – 800 $',    image: H.mirror,     color: '#3B82F6' },
    ],
  },

  {
    id: 'protection',
    title: 'Protection Valeur de Revente',
    icon: '💰',
    emoji_hook: '📈',
    emoji_risk: '⚠️',
    emoji_solution: '✅',
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
    vehicle_dots: [
      { top: '52%', left: '50%', label: '🎨 Carrosserie',       description: 'Rouille sur la carrosserie — dépréciation visible à la revente.',       cost: '-25 à -40% valeur',          image: H.rust,          color: '#3B82F6' },
      { top: '32%', left: '50%', label: '🏠 Toit',              description: 'Corrosion du toit — négligée car peu visible jusqu\'à la revente.',       cost: '800 $ – 3 000 $ réparation', image: H.rust,          color: '#3B82F6' },
      { top: '48%', left: '35%', label: '🪑 Intérieur',         description: 'Taches permanentes sur tissu ou cuir dès la 1ère année.',                 cost: '400 $ – 1 200 $ détail',     image: H.interior,      color: '#3B82F6' },
      { top: '82%', left: '50%', label: '⚙️ Châssis',           description: 'Rouille sur le châssis — problème structurel = refus de financement.',    cost: '600 $ – 2 500 $ traitement', image: H.undercarriage, color: '#3B82F6' },
      { top: '48%', left: '15%', label: '💧 Joints / Étanchéité',description: 'Infiltration d\'eau — moisissures, électronique abîmée, odeurs.',        cost: '300 $ – 1 500 $ réparation', image: H.seal,          color: '#3B82F6' },
    ],
  },

  {
    id: 'assurance_vie',
    title: 'Assurance Vie',
    icon: '❤️',
    emoji_hook: '🤝',
    emoji_risk: '⚠️',
    emoji_solution: '✅',
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
    vehicle_dots: [
      { top: '38%', left: '50%', label: '❤️ Protection familiale', description: 'Le solde de votre prêt est remboursé à votre décès — votre famille garde le véhicule.', cost: 'Prêt moyen : 28 000 $',   image: H.family,   color: '#3B82F6' },
      { top: '55%', left: '28%', label: '📋 Couverture immédiate', description: 'Dès la signature du contrat, la protection est active — aucun délai de carence.',       cost: 'À partir de 12 $/mois', image: H.invoice,  color: '#3B82F6' },
      { top: '55%', left: '72%', label: '🏥 Cas d\'application',  description: 'Accident de la route, maladie subite : le prêt est soldé dans les 30 jours.',             cost: 'Remboursement : 100%',  image: H.hospital, color: '#3B82F6' },
    ],
  },

  {
    id: 'assurance_invalidite',
    title: 'Assurance Invalidité',
    icon: '🏥',
    emoji_hook: '💪',
    emoji_risk: '⚠️',
    emoji_solution: '✅',
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
    vehicle_dots: [
      { top: '38%', left: '50%', label: '📊 1 sur 3 Canadiens',   description: 'Statistique réelle : 1 Canadien sur 3 vivra une invalidité de plus de 90 jours.', cost: 'Perte de revenus : 3-24 mois',   image: H.stats,      color: '#3B82F6' },
      { top: '55%', left: '28%', label: '📋 Vos paiements couverts',description: 'Chaque versement mensuel de votre prêt auto est pris en charge — même à long terme.',  cost: 'Jusqu\'à 24 mois de couverture', image: H.invoice,    color: '#3B82F6' },
      { top: '55%', left: '68%', label: '🏥 Activation rapide',    description: 'Couverture déclenchée dès le premier jour d\'invalidité médicalement constatée.',          cost: 'Délai : 0 à 7 jours',           image: H.disability, color: '#3B82F6' },
    ],
  },

  {
    id: 'assurance_perte',
    title: 'Assurance Perte Totale (GAP)',
    icon: '🔒',
    emoji_hook: '⚖️',
    emoji_risk: '⚠️',
    emoji_solution: '✅',
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
    vehicle_dots: [
      { top: '38%', left: '50%', label: '💥 Perte totale',       description: 'Collision frontale : véhicule irréparable. Assureur paie la valeur marchande, pas le solde.', cost: 'Écart moyen : 4 000 $ – 9 000 $',   image: H.crash,      color: '#3B82F6' },
      { top: '55%', left: '18%', label: '🚨 Vol total',          description: 'Véhicule volé et non retrouvé : assurance rembourse la valeur, pas le prêt restant.',          cost: 'Déficit potentiel : 5 000 $ – 12 000 $', image: H.crash,   color: '#3B82F6' },
      { top: '55%', left: '80%', label: '🌊 Catastrophe naturelle',description: 'Inondation, grêle sévère, arbre tombé — perte totale couverte par le GAP.',                cost: 'Remboursement intégral garanti',     image: H.flood,      color: '#3B82F6' },
      { top: '70%', left: '50%', label: '⚖️ Le déficit GAP',     description: 'Sans GAP : vous devez continuer à payer un véhicule que vous n\'avez plus.',                   cost: 'Exemple réel : 6 000 $ de votre poche', image: H.calculator, color: '#3B82F6' },
    ],
  },
];

// ── Vehicle category hierarchy ─────────────────────────────────────────────
export const VEHICLE_CATEGORIES = {
  automobile: {
    label: 'Automobile', icon: '🚗',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
    subs: null,
  },
  loisirs: {
    label: 'Loisirs', icon: '🏍️',
    image: 'https://images.unsplash.com/photo-1568772585407-9f4f3e2e0a20?w=600&q=80',
    subs: [
      { id: 'moto',       label: 'Moto',        icon: '🏍️', image: 'https://images.unsplash.com/photo-1568772585407-9f4f3e2e0a20?w=400&q=80' },
      { id: 'vtt',        label: 'VTT',          icon: '🚵', image: 'https://images.unsplash.com/photo-1544191696-15bed79b0640?w=400&q=80' },
      { id: 'motoneige',  label: 'Motoneige',    icon: '❄️', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80' },
      { id: 'cote_a_cote',label: 'Côte-à-côte', icon: '🚙', image: 'https://images.unsplash.com/photo-1558618047-3c8c78e9a40b?w=400&q=80' },
      { id: 'moto_marine',label: 'Moto Marine',  icon: '🚤', image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=400&q=80' },
      { id: 'bateau',     label: 'Bateau',       icon: '⛵', image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=400&q=80' },
    ],
  },
  vr: {
    label: 'VR', icon: '🚐',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80',
    subs: [
      { id: 'roulotte', label: 'Roulotte', icon: '🚌', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&q=80' },
      { id: 'motorise', label: 'Motorisé', icon: '🚐', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
    ],
  },
};

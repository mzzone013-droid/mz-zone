export const SPECIALTIES_DATA = {
  instrumentation: {
    title_ar: 'الأدواتية والقياس',
    title_en: 'Instrumentation',
    title_fr: 'Instrumentation',
    sub: 'Industrial measurement and control',
    icon: '🎛️',
    color: '#06B6D4',
    colorGlow: 'rgba(6, 182, 212, 0.15)',
    subcats: [
      { id: 'pressure', name_ar: 'قياس الضغط', name_en: 'Pressure', icon: '⏲️', desc_ar: 'أنظمة قياس وتحكم في الضغط الصناعي' },
      { id: 'flow', name_ar: 'قياس التدفق', name_en: 'Flow', icon: '🌊', desc_ar: 'أجهزة قياس تدفق السوائل والغازات' },
      { id: 'level', name_ar: 'قياس المستوى', name_en: 'Level', icon: '📏', desc_ar: 'مجسات قياس مستوى الخزانات' },
      { id: 'temp', name_ar: 'قياس الحرارة', name_en: 'Temperature', icon: '🌡️', desc_ar: 'مجسات ومحولات درجة الحرارة' },
      { id: 'valves', name_ar: 'صمامات التحكم', name_en: 'Control Valves', icon: '🚰', desc_ar: 'صمامات آلية للتحكم في العمليات' },
      { id: 'analysis', name_ar: 'أجهزة التحليل', name_en: 'Gas Analyzers', icon: '🔬', desc_ar: 'تحليل الغازات والسوائل الصناعية' },
    ],
  },
  electrical: {
    title_ar: 'الكهرباء الصناعية',
    title_en: 'Industrial Electricity',
    title_fr: 'Électricité Industrielle',
    sub: 'Power distribution and protection',
    icon: '⚡',
    color: '#F59E0B',
    colorGlow: 'rgba(245, 158, 11, 0.15)',
    subcats: [
      { id: 'protection', name_ar: 'أجهزة الحماية', name_en: 'Protection', icon: '🛡️', desc_ar: 'قواطع حرارية ومغناطيسية' },
      { id: 'control', name_ar: 'التحكم والتشغيل', name_en: 'Control', icon: '🕹️', desc_ar: 'كونتاكتورات ومرحلات' },
      { id: 'motors', name_ar: 'المحركات', name_en: 'Motors', icon: '🔄', desc_ar: 'محركات كهربائية أحادية وثلاثية الأطوار' },
      { id: 'distribution', name_ar: 'توزيع الطاقة', name_en: 'Distribution', icon: '🔌', desc_ar: 'لوحات وكابلات التوزيع' },
      { id: 'transformers', name_ar: 'المحولات', name_en: 'Transformers', icon: '🔋', desc_ar: 'محولات طاقة كهربائية' },
      { id: 'lighting', name_ar: 'الإنارة الصناعية', name_en: 'Industrial Lighting', icon: '💡', desc_ar: 'كشافات وأنظمة إنارة للمصانع' },
    ],
  },
  automation: {
    title_ar: 'الأتمتة والتحكم المبرمج',
    title_en: 'Automation',
    title_fr: 'Automatisme',
    sub: 'PLC, HMI and SCADA systems',
    icon: '🤖',
    color: '#8B5CF6',
    colorGlow: 'rgba(139, 92, 246, 0.15)',
    subcats: [
      { id: 'plc', name_ar: 'PLC', name_en: 'PLC', icon: '💻', desc_ar: 'أجهزة التحكم المنطقي المبرمج' },
      { id: 'hmi', name_ar: 'HMI', name_en: 'HMI', icon: '🖥️', desc_ar: 'شاشات التفاعل بين الإنسان والآلة' },
      { id: 'vfd', name_ar: 'مغيرات السرعة', name_en: 'VFD', icon: '⚙️', desc_ar: 'مغيرات السرعة للمحركات' },
      { id: 'scada', name_ar: 'SCADA', name_en: 'SCADA', icon: '📊', desc_ar: 'أنظمة المراقبة والتحكم عن بعد' },
      { id: 'sensors', name_ar: 'المجسات الذكية', name_en: 'Smart Sensors', icon: '📡', desc_ar: 'مجسات تقاربية وضوئية ذكية' },
    ],
  },
  mechanics: {
    icon: '⚙️',
    title_ar: 'الميكانيك الصناعي',
    title_en: 'Mechanics',
    title_fr: 'Mécanique',
    color: '#10B981',
    colorGlow: 'rgba(16, 185, 129, 0.15)',
    sub: 'Industrial transmission and pumps',
    subcats: [
      { id: 'transmission', name_ar: 'أنظمة النقل', name_en: 'Transmission', icon: '⛓️', desc_ar: 'تروس، بكرات، أحزمة نقل، سلاسل' },
      { id: 'pompes', name_ar: 'المضخات والضواغط', name_en: 'Pumps & Compressors', icon: '🔧', desc_ar: 'مضخات طرد مركزي، ضواغط هواء' },
      { id: 'lubrification', name_ar: 'التزييت والتشحيم', name_en: 'Lubrication', icon: '🛢️', desc_ar: 'زيوت ومشحمات صناعية' },
      { id: 'etancheite', name_ar: 'الإحكام والسد', name_en: 'Sealing', icon: '🔩', desc_ar: 'حلقات O-ring وأختام ميكانيكية' },
      { id: 'bearings', name_ar: 'المحامل (Roulements)', name_en: 'Bearings', icon: '⭕', desc_ar: 'محامل كروية وأسطوانية' },
    ]
  },
  hydraulics: {
    icon: '💧',
    title_ar: 'الهيدروليك والبنوماتيك',
    title_en: 'Hydraulics & Pneumatics',
    title_fr: 'Hydraulique & Pneumatique',
    color: '#3B82F6',
    colorGlow: 'rgba(59, 130, 246, 0.15)',
    sub: 'Fluid power and cylinders',
    subcats: [
      { id: 'cylindres', name_ar: 'الأسطوانات', name_en: 'Cylinders', icon: '⚡', desc_ar: 'أسطوانات هيدروليكية وهوائية' },
      { id: 'distrib2', name_ar: 'التوزيع والصمامات', name_en: 'Valves', icon: '🔀', desc_ar: 'صمامات التوزيع والكتل الهيدروليكية' },
      { id: 'tuyaux', name_ar: 'الخراطيم والوصلات', name_en: 'Hoses & Fittings', icon: '🪣', desc_ar: 'خراطيم ضغط عالي ووصلات' },
      { id: 'filters', name_ar: 'أنظمة الفلترة', name_en: 'Filtration', icon: '🌪️', desc_ar: 'فلاتر زيت هيدروليك وفلاتر هواء' },
    ]
  },
  hse: {
    icon: '🦺',
    title_ar: 'السلامة والصيانة العامة',
    title_en: 'Safety',
    title_fr: 'Sécurité & Maintenance',
    color: '#F43F5E',
    colorGlow: 'rgba(244, 63, 94, 0.15)',
    sub: 'PPE and safety equipment',
    subcats: [
      { id: 'epi', name_ar: 'معدات الوقاية الشخصية', name_en: 'PPE', icon: '🦺', desc_ar: 'خوذات، قفازات، أحذية سلامة' },
      { id: 'detection', name_ar: 'أجهزة الكشف والتنبيه', name_en: 'Detection', icon: '🚨', desc_ar: 'كاشفات الغاز، الدخان، أنظمة الإنذار' },
      { id: 'outillage', name_ar: 'العدد والآلات اليدوية', name_en: 'Tools', icon: '🔨', desc_ar: 'عدة يدوية، أدوات قياس ومعايرة' },
      { id: 'fire', name_ar: 'إطفاء الحريق', name_en: 'Fire Fighting', icon: '🧯', desc_ar: 'مطفئات وأنظمة مكافحة الحريق' },
    ],
  },
} as const;

export const SPECIALTIES = SPECIALTIES_DATA;
export type SpecialtyKey = keyof typeof SPECIALTIES_DATA;

export const PRODUCTS_DATA = {}; // Empty mock data to keep things clean

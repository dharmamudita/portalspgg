export const ALL_SCHOOLS = {
  SD: [
    'SDN 1 Kedaton, Bandar Lampung', 'SDN 2 Kedaton, Bandar Lampung', 'SDN 1 Rajabasa, Bandar Lampung', 
    'SDN 2 Rajabasa, Bandar Lampung', 'SDN 1 Tanjung Karang, Bandar Lampung', 'SDN 2 Way Halim, Bandar Lampung',
    'SD IT Permata Bunda, Bandar Lampung', 'SD Al Kautsar, Bandar Lampung', 'SD Global Madani, Bandar Lampung',
    'SD Xaverius 1, Bandar Lampung', 'SD BPK Penabur, Bandar Lampung', 'SD IT Fitrah Insani, Bandar Lampung',
    'SD Muhammadiyah 1, Bandar Lampung', 'SD Pelita Bangsa, Bandar Lampung'
  ],
  SMP: [
    'SMPN 1 Bandar Lampung', 'SMPN 2 Bandar Lampung', 'SMPN 4 Bandar Lampung', 'SMPN 9 Bandar Lampung',
    'SMPN 21 Bandar Lampung', 'SMPN 25 Bandar Lampung', 'SMP Al Kautsar Bandar Lampung',
    'SMP Xaverius 1 Bandar Lampung', 'SMP Global Madani Bandar Lampung', 'SMP IT Fitrah Insani Bandar Lampung',
    'SMP BPK Penabur Bandar Lampung', 'SMP Muhammadiyah 3 Bandar Lampung'
  ],
  SMA: [
    'SMAN 1 Bandar Lampung', 'SMAN 2 Bandar Lampung', 'SMAN 3 Bandar Lampung', 'SMAN 5 Bandar Lampung',
    'SMAN 9 Bandar Lampung', 'SMA Al Kautsar Bandar Lampung', 'SMA YP Unila Bandar Lampung',
    'SMA Xaverius Pahoman Bandar Lampung', 'SMA Global Madani Bandar Lampung', 'SMA IT Ar Raihan Bandar Lampung',
    'SMA Perintis 1 Bandar Lampung', 'SMA Muhammadiyah 2 Bandar Lampung'
  ],
  SMK: [
    'SMKN 1 Bandar Lampung', 'SMKN 2 Bandar Lampung', 'SMKN 3 Bandar Lampung', 'SMKN 4 Bandar Lampung',
    'SMKN 5 Bandar Lampung', 'SMK SMTI Bandar Lampung', 'SMK 2 Mei Bandar Lampung', 'SMK Pelita Bandar Lampung',
    'SMK BPK Penabur Bandar Lampung', 'SMK Yadika Bandar Lampung', 'SMK Arjuna Bandar Lampung'
  ]
};

export const getMockSchools = (tingkat) => {
  if (!tingkat) return [];
  const tk = tingkat.toUpperCase();
  return ALL_SCHOOLS[tk] || [];
};

export const getAllSchoolsFlatList = () => {
  return [
    ...ALL_SCHOOLS.SD,
    ...ALL_SCHOOLS.SMP,
    ...ALL_SCHOOLS.SMA,
    ...ALL_SCHOOLS.SMK
  ];
};

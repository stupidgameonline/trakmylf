export const workingProtocolItems = [
  { id: 'no_fap', label: '🚫 No Fap' },
  { id: 'no_sugar', label: '🍬 No Sugar' },
  { id: 'no_phone', label: '📵 No Phone at Home' },
  { id: 'headspace', label: '🧘 Headspace (Meditation)' },
  { id: 'completed_tasks', label: '✅ Completed All Tasks' },
  { id: 'worked_out', label: '💪 Worked Out' }
];

export const nomadProtocolItems = [
  { id: 'no_fap', label: '🚫 No Fap' },
  { id: 'no_sugar', label: '🍬 No Sugar' },
  { id: 'headspace', label: '🧘 Headspace (Meditation)' },
  { id: 'completed_tasks', label: '✅ Completed All Tasks' },
  { id: 'worked_out', label: '💪 Worked Out' }
];

export const sundayProtocolItems = [
  { id: 'no_fap', label: '🚫 No Fap' },
  { id: 'no_sugar', label: '🍬 No Sugar' }
];

export const getProtocolItems = (zone, dayType) => {
  if (dayType === 'SUNDAY') return sundayProtocolItems;
  return zone === 'WORKING' ? workingProtocolItems : nomadProtocolItems;
};

export const getAutoProtocolItems = (zone, dayType) => {
  if (dayType === 'SUNDAY') {
    return ['no_phone', 'headspace', 'completed_tasks', 'worked_out'];
  }

  if (zone === 'NOMAD') {
    return ['no_phone'];
  }

  return [];
};

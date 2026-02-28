import { getCurrentZone, getDayType } from '../utils/date';

const workingTimetable = [
  { id: 'w1', time: '05:30', title: 'Wake up, drink 1L warm water, freshen up', category: 'sleep' },
  { id: 'w2', time: '06:00-07:00', title: 'Yoga (morning)', category: 'fitness' },
  { id: 'w3', time: '07:30-09:00', title: 'Gym', category: 'fitness' },
  { id: 'w4', time: '09:00-10:30', title: 'Bath, skincare, travel to office', category: 'travel' },
  {
    id: 'w5',
    time: '10:30',
    title:
      'Breakfast: High-protein meal + 2 fruits + 1 banana + multivitamin + shilajit + Vitamin C + B12 + Vitamin D 2000IU',
    category: 'food'
  },
  { id: 'w6', time: '10:45', title: '15-min roof walk', category: 'fitness' },
  { id: 'w7', time: '11:00', title: 'Filter coffee + Headspace meditation (10-15 min)', category: 'food' },
  { id: 'w8', time: '11:30-14:30', title: 'Deep work sprint (3 hours, no interruptions, build & solve)', category: 'work' },
  { id: 'w9', time: '14:30-15:30', title: 'Lunch (tiffin) + post-lunch roof walk (me time)', category: 'food' },
  { id: 'w10', time: '15:30-16:00', title: 'Read book with coffee', category: 'work' },
  { id: 'w11', time: '16:00-16:10', title: 'Short meditation', category: 'work' },
  { id: 'w12', time: '16:10-16:30', title: 'Team meeting', category: 'work' },
  { id: 'w13', time: '16:30-17:30', title: 'Work with team', category: 'work' },
  { id: 'w14', time: '17:30-18:00', title: 'Pack up, close all devices', category: 'work' },
  { id: 'w15', time: '18:00-19:15', title: 'Yoga (evening batch, 18:15 start)', category: 'fitness' },
  { id: 'w16', time: '20:00', title: 'Home, cook dinner (easy, same daily)', category: 'food' },
  { id: 'w17', time: '21:00', title: 'Post-dinner walk', category: 'fitness' },
  { id: 'w18', time: '22:00', title: 'Chamomile tea', category: 'food' },
  { id: 'w19', time: '22:30-23:00', title: 'Shutdown & sleep (audio story on speaker)', category: 'sleep' }
];

const nomadTimetable = [
  { id: 'n1', time: '06:00', title: 'Wake up, water', category: 'sleep' },
  { id: 'n2', time: '06:30-07:30', title: 'Yoga', category: 'fitness' },
  { id: 'n3', time: '07:30-08:30', title: 'HIIT / bodyweight', category: 'fitness' },
  { id: 'n4', time: '09:00', title: 'High-protein healthy breakfast', category: 'food' },
  { id: 'n5', time: '09:30-11:00', title: 'Exploration walk', category: 'fitness' },
  { id: 'n6', time: '11:00-12:30', title: 'Deep work sprint', category: 'work' },
  { id: 'n7', time: '12:30-20:00', title: 'Travel, exploration, healthy meals', category: 'travel' },
  { id: 'n8', time: '20:00-21:00', title: 'Light healthy dinner', category: 'food' },
  { id: 'n9', time: '21:00-22:00', title: 'Post-dinner walk', category: 'fitness' },
  { id: 'n10', time: '22:30-23:00', title: 'Shutdown & sleep', category: 'sleep' }
];

const sundayTimetable = [
  { id: 's1', time: 'Anytime', title: 'Wake up when rested', category: 'sleep' },
  {
    id: 's2',
    time: 'Morning',
    title: 'Morning movement: light yoga or walk (optional)',
    category: 'fitness',
    optional: true
  },
  {
    id: 's3',
    time: 'Day Block',
    title: 'Go out and explore OR stay home and fully recharge',
    category: 'travel'
  },
  { id: 's4', time: 'Evening', title: 'Light dinner, early sleep', category: 'food' }
];

const buildWednesdayTimetable = (zone) => {
  const commonBlocks = [
    {
      id: `wed-${zone.toLowerCase()}-1`,
      time: '11:00-13:00',
      title: 'Research all new AI tools launched in the last 7 days (ProductHunt, X/Twitter, newsletters, YouTube)',
      category: 'work'
    },
    { id: `wed-${zone.toLowerCase()}-2`, time: '13:00-15:00', title: 'Test the most promising tools found', category: 'work' },
    { id: `wed-${zone.toLowerCase()}-3`, time: '15:00-16:00', title: 'Lunch + walk (me time)', category: 'food' },
    { id: `wed-${zone.toLowerCase()}-4`, time: '16:00-17:30', title: 'Watch an informative / educational podcast', category: 'work' }
  ];

  if (zone === 'WORKING') {
    return [
      { id: 'wed-w1', time: '05:30', title: 'Wake up, drink 1L warm water, freshen up', category: 'sleep' },
      { id: 'wed-w2', time: '06:00-07:00', title: 'Yoga (morning)', category: 'fitness' },
      { id: 'wed-w3', time: '07:30-09:00', title: 'Gym', category: 'fitness' },
      {
        id: 'wed-w4',
        time: '10:30',
        title:
          'Breakfast: High-protein meal + 2 fruits + 1 banana + multivitamin + shilajit + Vitamin C + B12 + Vitamin D 2000IU',
        category: 'food'
      },
      ...commonBlocks,
      { id: 'wed-w5', time: '18:00-19:15', title: 'Yoga (evening batch)', category: 'fitness' },
      { id: 'wed-w6', time: '20:00', title: 'Home, cook dinner', category: 'food' },
      { id: 'wed-w7', time: '21:00', title: 'Post-dinner walk', category: 'fitness' },
      { id: 'wed-w8', time: '22:30-23:00', title: 'Shutdown & sleep', category: 'sleep' }
    ];
  }

  return [
    { id: 'wed-n1', time: '06:00', title: 'Wake up, water', category: 'sleep' },
    { id: 'wed-n2', time: '06:30-07:30', title: 'Yoga', category: 'fitness' },
    { id: 'wed-n3', time: '07:30-08:30', title: 'HIIT / bodyweight', category: 'fitness' },
    { id: 'wed-n4', time: '09:00', title: 'High-protein healthy breakfast', category: 'food' },
    ...commonBlocks,
    { id: 'wed-n5', time: '20:00-21:00', title: 'Light healthy dinner', category: 'food' },
    { id: 'wed-n6', time: '21:00-22:00', title: 'Post-dinner walk', category: 'fitness' },
    { id: 'wed-n7', time: '22:30-23:00', title: 'Shutdown & sleep', category: 'sleep' }
  ];
};

export const breakfastSuggestion = {
  title: 'Daily Breakfast (Working Zone)',
  items: [
    '4 scrambled eggs with spinach OR Greek yogurt (200g) with oats',
    '2 seasonal fruits (banana counts as one)',
    '1 banana',
    'Supplements: 1 multivitamin, 1 shilajit tablet, 1 Vitamin C, 1 B12, 1 Vitamin D 2000IU',
    '1 glass of water with supplements'
  ]
};

export const getBaseTimetableForDate = (date) => {
  const dayType = getDayType(date);
  const zone = getCurrentZone(date);

  if (dayType === 'SUNDAY') return sundayTimetable;
  if (dayType === 'WEDNESDAY') return buildWednesdayTimetable(zone);
  return zone === 'WORKING' ? workingTimetable : nomadTimetable;
};

export const getTodayTimetable = (zone, dayType) => {
  if (dayType === 'SUNDAY') return sundayTimetable;
  if (dayType === 'WEDNESDAY') return buildWednesdayTimetable(zone);
  return zone === 'WORKING' ? workingTimetable : nomadTimetable;
};

const parseStartHour = (timeLabel = '') => {
  const maybeTime = String(timeLabel).split('-')[0].trim();
  const [hour] = maybeTime.split(':');
  const parsed = Number(hour);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getWorkoutItems = (tasks, dayType) => {
  const fitnessItems = tasks.filter((task) => task.category === 'fitness');
  if (dayType !== 'WEDNESDAY') return fitnessItems;

  return fitnessItems.filter((task) => {
    const startHour = parseStartHour(task.time);
    if (startHour === null) return false;
    return startHour < 11;
  });
};
export const getDietItems = (tasks) => tasks.filter((task) => task.category === 'food');

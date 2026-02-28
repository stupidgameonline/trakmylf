import { quotes } from '../data/quotes';
import { getDateKey } from './date';

export const getDailyQuoteIndex = (date = new Date()) => {
  const dateKey = getDateKey(date);
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % quotes.length;
  }
  return Math.abs(hash % quotes.length);
};

export const getDailyQuote = (date = new Date()) => quotes[getDailyQuoteIndex(date)];

export const getNextQuote = (index) => quotes[(index + 1) % quotes.length];

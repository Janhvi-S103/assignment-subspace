

export type UserPreferences = {
  categories: NewsPreference[];
  darkMode: boolean;
};

export interface NewsPreference {
  id: string;
  category: string;
  isEnabled: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  date: string;
  isRead: boolean;
  isSaved: boolean;
  category: string; // Added category field
}
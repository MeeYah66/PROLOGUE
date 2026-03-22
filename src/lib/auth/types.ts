export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  genrePreferences?: string[];
  dailyWordGoal?: number;
  createdAt: string;
}

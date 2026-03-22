export type BookStatus = "draft" | "ongoing" | "completed";
export type ChapterStatus = "draft" | "revised" | "final";
export type CoverStyle = "minimal" | "classic" | "bold" | "ethereal";
export type CoverAlignment = "left" | "center" | "right";

export interface CoverConfig {
  imageUrl?: string;
  style: CoverStyle;
  titleColor: string;
  authorColor: string;
  alignment: CoverAlignment;
  backgroundColor: string;
  overlayOpacity: number;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  summary?: string;
  status: ChapterStatus;
  headerImage?: string;
  wordCount: number;
  povCharacter?: string;
  sceneLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterNote {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
  age?: string;
  appearance?: string;
}

export interface WorldNote {
  id: string;
  title: string;
  content: string;
  category: "location" | "magic" | "lore" | "politics" | "other";
}

export interface StoryArc {
  id: string;
  title: string;
  description: string;
  color: string;
  chapterIds: string[];
}

export interface BookNotes {
  arc: string;
  timeline: string;
  characters: CharacterNote[];
  world: WorldNote[];
  arcs: StoryArc[];
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  genre: string;
  blurb: string;
  authorName: string;
  status: BookStatus;
  cover: CoverConfig;
  chapters: Chapter[];
  notes: BookNotes;
  targetWordCount: number;
  lastEditedChapterId?: string;
  createdAt: string;
  updatedAt: string;
}

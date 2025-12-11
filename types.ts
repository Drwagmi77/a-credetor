export interface PromptItem {
  id: string;
  title: string;
  template: string; // The prompt text with {subject} placeholder
  isPremium: boolean;
  imageUrl: string;
  category: string;
  aspectRatio: 'portrait' | 'square' | 'landscape';
  customThumbnail?: string; // New field to store the generated image URL
  characterId?: string; // Optional: Links this prompt card to a specific character definition
}

export interface Category {
  id: string;
  name: string;
}

export interface Character {
  id: string;
  name: string;
  description: string; // The physical description (e.g. "A 20yo woman with pink hair...")
  avatarUrl: string; // A preview image of the character
  isCustom?: boolean;
  isPremium?: boolean; // New field: true if requires VIP
}
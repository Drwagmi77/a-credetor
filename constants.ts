import { PromptItem, Category, Character } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'ai_personas', name: 'AI Personas' }, // New Category
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'nature', name: 'Nature' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'scifi', name: 'Sci-Fi' },
  { id: '3d', name: '3D Render' },
  { id: 'anime', name: 'Anime' },
  { id: 'architecture', name: 'Architecture' },
];

export const PREMADE_CHARACTERS: Character[] = [
  // --- FREE TIER (First 3) ---
  {
    id: 'char_1',
    name: 'Elara',
    description: 'a stunning 22 year old scandinavian woman, platinum blonde messy bun hair, piercing blue eyes, freckles, minimal makeup, model facial structure, wearing casual chic outfit',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20stunning%2022yo%20scandinavian%20woman%20platinum%20blonde?width=200&height=200&nologo=true&seed=101',
    isPremium: false
  },
  {
    id: 'char_3',
    name: 'Zara',
    description: 'a beautiful 24 year old afro-latina woman, curly voluminous hair, golden skin tone, warm smile, stylish urban fashion, golden hour lighting',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20beautiful%2024yo%20afro-latina%20woman%20curly%20hair?width=200&height=200&nologo=true&seed=103',
    isPremium: false
  },
   {
    id: 'char_8',
    name: 'Leo',
    description: 'a charming 26 year old french man, curly brown hair, blue eyes, wearing a beige trench coat, artistic vibe, soft lighting',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20charming%2026yo%20french%20man%20curly%20hair?width=200&height=200&nologo=true&seed=108',
    isPremium: false
  },

  // --- VIP TIER (Locked) ---
  {
    id: 'char_jax',
    name: 'Jax',
    description: 'a muscular 28 year old man, full sleeve tattoos on both arms, wearing a tight black tank top, undercut hairstyle, rugged beard, intense look, fitness model aesthetic',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20muscular%20man%20tattoos%20black%20tank%20top%20beard?width=200&height=200&nologo=true&seed=901',
    isPremium: true
  },
  {
    id: 'char_minho',
    name: 'Min-ho',
    description: 'a stylish 23 year old korean man, k-pop idol aesthetic, flawless skin, trendy parted hair, silver earrings, wearing high-end fashion streetwear, neon city background vibe',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20handsome%20korean%20man%20kpop%20style%20neon?width=200&height=200&nologo=true&seed=902',
    isPremium: true
  },
  {
    id: 'char_viktor',
    name: 'Viktor',
    description: 'a sophisticated 35 year old man, salt and pepper hair and beard, wearing a tailored italian suit, confident smirk, luxury lifestyle, blue eyes',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20sophisticated%20man%20suit%20beard%20luxury?width=200&height=200&nologo=true&seed=903',
    isPremium: true
  },
  {
    id: 'char_7',
    name: 'Nova',
    description: 'a futuristic cyborg woman, half human face half metallic, glowing neon blue eyes, synthetic skin, cyberpunk aesthetic',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20futuristic%20cyborg%20woman%20neon?width=200&height=200&nologo=true&seed=107',
    isPremium: true
  },
  {
    id: 'char_5',
    name: 'Luna',
    description: 'an edgy 20 year old e-girl, dyed purple hair with bangs, winged eyeliner, choker necklace, pale skin, alternative fashion style',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20edgy%2020yo%20e-girl%20purple%20hair?width=200&height=200&nologo=true&seed=105',
    isPremium: true
  },
  {
    id: 'char_2',
    name: 'Kenji',
    description: 'a handsome 25 year old japanese man, sharp jawline, messy dark hair, streetwear fashion, calm expression, cinematic lighting',
    avatarUrl: 'https://image.pollinations.ai/prompt/portrait%20of%20handsome%2025yo%20japanese%20man%20streetwear?width=200&height=200&nologo=true&seed=102',
    isPremium: true
  },
];

// --- Curated Data for High-Quality Generation ---

interface ThemeConfig {
  subjects: string[];
  actions: string[];
  environments: string[];
  styles: string[];
  lighting: string[];
}

// UPDATED: Using trending, pop-culture, and iconic subjects to create "Wow" factor.
const THEMES: Record<string, ThemeConfig> = {
  cyberpunk: {
    subjects: ["Elon Musk", "Keanu Reeves", "Iron Man", "Alita Battle Angel", "Daft Punk", "The Terminator", "Black Widow", "Deadpool"],
    actions: ["hacking a neural network", "riding a futuristic light cycle", "holding a glowing katana", "wearing augmented reality glasses", "fixing a robotic arm"],
    environments: ["in a rainy neon Tokyo street", "inside a high-tech server room", "on top of a mega-corporation tower", "in a holographic underground club", "flying through a digital highway"],
    styles: ["Cyberpunk 2077 Style", "Blade Runner Aesthetic", "Synthwave Neon", "Futuristic Realism", "High-Tech Chrome"],
    lighting: ["neon pink and blue side lighting", "volumetric fog with lasers", "holographic projection glow", "wet street reflections"]
  },
  nature: {
    subjects: ["Baby Yoda (Grogu)", "Avatar Na'vi Character", "Godzilla", "Totoro", "The Lion King", "Pikachu", "Groot"],
    actions: ["meditating in peace", "roaring at the sky", "sleeping on a giant leaf", "controlling the elements", "glowing with bioluminescence"],
    environments: ["in the Pandora glowing forest", "under a massive waterfall", "on a floating mountain", "in a mystical ancient grove", "surrounded by fireflies"],
    styles: ["National Geographic Cinematic", "Unreal Engine 5 Nature", "Hyperrealistic 8k", "Macro Fantasy Photography", "Ethereal Dreamscape"],
    lighting: ["golden hour sun rays", "bioluminescent night glow", "dramatic storm lighting", "god rays through trees"]
  },
  portrait: {
    subjects: ["Taylor Swift", "Joker", "Oppenheimer", "Barbie", "Albert Einstein", "Frida Kahlo", "Marilyn Monroe", "Walter White", "Wednesday Addams"],
    actions: ["staring intensely at camera", "laughing manically", "adjusting glasses", "wearing haute couture", "holding a vintage camera"],
    environments: ["with a cinematic blurred city background", "in a dramatic studio setting", "surrounded by math formulas", "on a red carpet", "in a dark moody room"],
    styles: ["Cinematic Portrait", "Vogue Editorial", "Dramatic Noir", "Double Exposure", "Oil Painting Style"],
    lighting: ["Rembrandt lighting", "dramatic rim light", "studio softbox", "cinematic teal and orange", "moody shadows"]
  },
  abstract: {
    subjects: ["Bitcoin Logo", "Artificial Intelligence Brain", "The Matrix Code", "DNA Helix of a Superhero", "Time Travel Portal", "Quantum Computer"],
    actions: ["exploding into data", "melting into liquid gold", "fracturing into crystals", "glowing with energy", "spinning infinitely"],
    environments: ["in a zero-gravity void", "inside a microchip", "floating in the multiverse", "on a digital canvas"],
    styles: ["Abstract Expressionism", "3D Fractal Art", "Fluid Simulation", "Glassmorphism", "Psychedelic Pop Art"],
    lighting: ["vibrant neon gradients", "internal glowing core", "stark contrasting shadows", "ethereal light beams"]
  },
  fantasy: {
    subjects: ["Daenerys Targaryen", "Geralt of Rivia (The Witcher)", "Gandalf", "Link (Zelda)", "Maleficent", "Thor", "Wonder Woman", "Kratos"],
    actions: ["summoning a dragon", "casting a fireball", "wielding a magical sword", "sitting on a throne", "opening a portal"],
    environments: ["at the gates of Hogwarts", "in a crystal cave", "on a volcanic mountain", "in an enchanted elven forest", "under a red moon"],
    styles: ["Dark Fantasy RPG", "Epic High Fantasy Painting", "Magic The Gathering Art", "Elden Ring Style", "Cinematic Concept Art"],
    lighting: ["magical spell glow", "torch light in darkness", "mystical moonlight", "fiery ambient light"]
  },
  scifi: {
    subjects: ["Darth Vader", "The Mandalorian", "Master Chief (Halo)", "Buzz Lightyear", "Wall-E", "Optimus Prime", "Thanos"],
    actions: ["wielding a lightsaber", "flying with a jetpack", "scanning an alien artifact", "commanding a starship", "looking at a supernova"],
    environments: ["on the surface of Mars", "inside the Death Star", "drifting near a black hole", "in a cyberpunk spaceship cockpit", "on a Dyson Sphere"],
    styles: ["Star Wars Cinematic", "Interstellar Movie Style", "NASA Concept Art", "Retro Futurism", "Mass Effect Aesthetic"],
    lighting: ["cold LED blue lights", "lens flares", "dramatic red alert lighting", "starlight reflections"]
  },
  "3d": {
    subjects: ["Super Mario", "Minion", "Lego Batman", "Among Us Character", "SpongeBob", "Fall Guys Character", "Cute Astronaut"],
    actions: ["jumping for joy", "eating a burger", "running fast", "floating in zero g", "dancing"],
    environments: ["in a colorful plastic world", "on a isometric floating island", "inside a toy box", "on a candy planet"],
    styles: ["Pixar Animation Style", "Claymation", "Low Poly Isometric", "Funko Pop Style", "Blender 3D Cute"],
    lighting: ["bright studio lighting", "soft ambient occlusion", "warm cheerful sun", "glossy reflections"]
  },
  anime: {
    subjects: ["Naruto Uzumaki", "Goku", "Sailor Moon", "Gojo Satoru", "Luffy (One Piece)", "Totoro", "Pikachu", "Hatsune Miku"],
    actions: ["powering up energy", "eating ramen", "casting a jutsu", "transforming", "standing in the rain"],
    environments: ["in a cherry blossom school yard", "in Neo-Tokyo", "on a pirate ship", "in a martial arts dojo", "under a starry anime sky"],
    styles: ["Studio Ghibli Style", "Makoto Shinkai Detailed", "90s Retro Anime", "Ufotable High Quality", "Manga Lineart"],
    lighting: ["dramatic sun rays", "sunset glow", "magical aura effect", "vibrant anime colors"]
  },
  architecture: {
    subjects: ["Hogwarts Castle", "Stark Tower (Avengers)", "Barbie Dreamhouse", "Hobbit Hole", "Futuristic Apple Store", "Cyberpunk Skyscraper"],
    actions: ["glowing at night", "floating in the sky", "covered in vines", "under construction by robots"],
    environments: ["on a cliff edge", "in the middle of the ocean", "in a futuristic utopia", "in a snowy landscape"],
    styles: ["Zaha Hadid Futuristic", "Gothic Revival", "Minimalist Concrete", "Steampunk Architecture", "Sustainable Green Design"],
    lighting: ["interior warm glow", "architectural exterior lights", "blue hour dusk", "golden sunrise"]
  }
};

const CATEGORY_IDS = Object.keys(THEMES);

// Function to convert Characters to PromptItems for the Gallery
const generateCharacterPrompts = (): PromptItem[] => {
  return PREMADE_CHARACTERS.map((char) => ({
    id: `card_${char.id}`,
    title: char.name,
    // The template here is crucial: It embeds the character description.
    // {subject} will be replaced by user input (action/style)
    template: `${char.description}, {subject}, 8k, highly detailed, photorealistic, masterpiece`,
    isPremium: char.isPremium || false,
    imageUrl: char.avatarUrl,
    category: 'ai_personas',
    aspectRatio: 'portrait',
    characterId: char.id
  }));
};

const generatePrompts = (count: number): PromptItem[] => {
  const prompts: PromptItem[] = [];

  // 1. Add AI Personas first (or mix them, but keeping them separate via category filter)
  const characterPrompts = generateCharacterPrompts();
  prompts.push(...characterPrompts);

  // 2. Add Standard Styles
  for (let i = 0; i < count; i++) {
    const catId = CATEGORY_IDS[i % CATEGORY_IDS.length];
    const theme = THEMES[catId];

    const subject = theme.subjects[Math.floor(Math.random() * theme.subjects.length)];
    const action = theme.actions[Math.floor(Math.random() * theme.actions.length)];
    const env = theme.environments[Math.floor(Math.random() * theme.environments.length)];
    const style = theme.styles[Math.floor(Math.random() * theme.styles.length)];
    const light = theme.lighting[Math.floor(Math.random() * theme.lighting.length)];
    
    const ar: 'portrait' | 'square' | 'landscape' = 
      catId === 'portrait' ? 'portrait' : 
      catId === 'architecture' || catId === 'nature' ? 'landscape' : 
      (Math.random() > 0.5 ? 'square' : 'portrait');

    // Title construction: e.g. "Cyberpunk Elon Musk"
    const stylePrefix = style.split(' ')[0]; 
    const title = `${stylePrefix} ${subject}`; 
    
    // Template construction
    const template = `${style} of {subject} ${action} ${env}, ${light}, highly detailed, 8k masterpiece, trending on artstation`;

    // Make about 30% of items premium to demonstrate the feature
    const isPremium = i % 3 === 0;

    // Optimized for thumbnails
    // We use a simplified prompt for the placeholder URL to ensure Pollinations understands it easily
    const simplePrompt = `${style} ${subject} ${action}`;
    const encodedPrompt = encodeURIComponent(simplePrompt);
    
    // Smaller dimensions for thumbnails to load faster
    const width = 300;
    const height = ar === 'portrait' ? 450 : ar === 'landscape' ? 170 : 300;
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${i + 5000}`;

    prompts.push({
      id: (i + 1).toString(),
      title: title,
      template: template, 
      isPremium: isPremium,
      imageUrl: imageUrl,
      category: catId,
      aspectRatio: ar
    });
  }

  return prompts;
};

export const PROMPTS: PromptItem[] = generatePrompts(500);
import { PromptItem, Category, Character } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'saved', name: '📂 Saved / Restored' }, // NEW CATEGORY FOR RESTORED ITEMS
  { id: 'ai_personas', name: 'AI Personas' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'nature', name: 'Nature' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'scifi', name: 'Sci-Fi' },
  { id: 'horror', name: 'Horror' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'logo', name: 'Logo Design' },
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

const THEMES: Record<string, ThemeConfig> = {
  cyberpunk: {
    subjects: ["Elon Musk", "Keanu Reeves", "Iron Man", "Alita Battle Angel", "Daft Punk", "The Terminator", "Black Widow", "Deadpool", "Cyborg Samurai", "Neon Hacker", "Android Geisha", "Street Medic"],
    actions: ["hacking a neural network", "riding a futuristic light cycle", "holding a glowing katana", "wearing augmented reality glasses", "fixing a robotic arm", "interfacing with a data terminal", "escaping a drone swarm", "smoking a digital cigarette"],
    environments: ["in a rainy neon Tokyo street", "inside a high-tech server room", "on top of a mega-corporation tower", "in a holographic underground club", "flying through a digital highway", "in a grimy noodle bar", "at a cybernetics clinic"],
    styles: ["Cyberpunk 2077 Style", "Blade Runner Aesthetic", "Synthwave Neon", "Futuristic Realism", "High-Tech Chrome", "Glitch Art", "Dark Synth"],
    lighting: ["neon pink and blue side lighting", "volumetric fog with lasers", "holographic projection glow", "wet street reflections", "harsh fluorescent flicker"]
  },
  nature: {
    subjects: ["Baby Yoda (Grogu)", "Avatar Na'vi Character", "Godzilla", "Totoro", "The Lion King", "Pikachu", "Groot", "Majestic Stag", "Snow Leopard", "Giant Turtle", "Phoenix"],
    actions: ["meditating in peace", "roaring at the sky", "sleeping on a giant leaf", "controlling the elements", "glowing with bioluminescence", "emerging from water", "soaring through clouds"],
    environments: ["in the Pandora glowing forest", "under a massive waterfall", "on a floating mountain", "in a mystical ancient grove", "surrounded by fireflies", "in a crystal cavern", "on a volcanic crater"],
    styles: ["National Geographic Cinematic", "Unreal Engine 5 Nature", "Hyperrealistic 8k", "Macro Fantasy Photography", "Ethereal Dreamscape", "Bioluminescent Art"],
    lighting: ["golden hour sun rays", "bioluminescent night glow", "dramatic storm lighting", "god rays through trees", "soft morning mist"]
  },
  portrait: {
    subjects: ["Taylor Swift", "Joker", "Oppenheimer", "Barbie", "Albert Einstein", "Frida Kahlo", "Marilyn Monroe", "Walter White", "Wednesday Addams", "Audrey Hepburn", "David Bowie", "Morgan Freeman"],
    actions: ["staring intensely at camera", "laughing manically", "adjusting glasses", "wearing haute couture", "holding a vintage camera", "smoking a pipe", "applying lipstick"],
    environments: ["with a cinematic blurred city background", "in a dramatic studio setting", "surrounded by math formulas", "on a red carpet", "in a dark moody room", "in a library", "against a graffiti wall"],
    styles: ["Cinematic Portrait", "Vogue Editorial", "Dramatic Noir", "Double Exposure", "Oil Painting Style", "Studio Headshot", "Rembrandt Style"],
    lighting: ["Rembrandt lighting", "dramatic rim light", "studio softbox", "cinematic teal and orange", "moody shadows", "butterfly lighting"]
  },
  abstract: {
    subjects: ["Bitcoin Logo", "Artificial Intelligence Brain", "The Matrix Code", "DNA Helix of a Superhero", "Time Travel Portal", "Quantum Computer", "Sound Waves", "Neural Network"],
    actions: ["exploding into data", "melting into liquid gold", "fracturing into crystals", "glowing with energy", "spinning infinitely", "morphing shapes"],
    environments: ["in a zero-gravity void", "inside a microchip", "floating in the multiverse", "on a digital canvas", "in a white void"],
    styles: ["Abstract Expressionism", "3D Fractal Art", "Fluid Simulation", "Glassmorphism", "Psychedelic Pop Art", "Bauhaus Geometry", "Liquid Metal"],
    lighting: ["vibrant neon gradients", "internal glowing core", "stark contrasting shadows", "ethereal light beams", "iridescent reflection"]
  },
  fantasy: {
    subjects: ["Daenerys Targaryen", "Geralt of Rivia", "Gandalf", "Link (Zelda)", "Maleficent", "Thor", "Wonder Woman", "Kratos", "Dragon Rider", "Elven Archer", "Necromancer"],
    actions: ["summoning a dragon", "casting a fireball", "wielding a magical sword", "sitting on a throne", "opening a portal", "reading an ancient scroll", "taming a griffin"],
    environments: ["at the gates of Hogwarts", "in a crystal cave", "on a volcanic mountain", "in an enchanted elven forest", "under a red moon", "in a floating castle"],
    styles: ["Dark Fantasy RPG", "Epic High Fantasy Painting", "Magic The Gathering Art", "Elden Ring Style", "Cinematic Concept Art", "D&D Character Art"],
    lighting: ["magical spell glow", "torch light in darkness", "mystical moonlight", "fiery ambient light", "ethereal aura"]
  },
  scifi: {
    subjects: ["Darth Vader", "The Mandalorian", "Master Chief", "Buzz Lightyear", "Wall-E", "Optimus Prime", "Thanos", "Space Marine", "Alien Xenomorph"],
    actions: ["wielding a lightsaber", "flying with a jetpack", "scanning an alien artifact", "commanding a starship", "looking at a supernova", "fighting zero-g"],
    environments: ["on the surface of Mars", "inside the Death Star", "drifting near a black hole", "in a cyberpunk spaceship cockpit", "on a Dyson Sphere", "in a cryo-chamber"],
    styles: ["Star Wars Cinematic", "Interstellar Movie Style", "NASA Concept Art", "Retro Futurism", "Mass Effect Aesthetic", "H.R. Giger Biomechanical"],
    lighting: ["cold LED blue lights", "lens flares", "dramatic red alert lighting", "starlight reflections", "holographic blue"]
  },
  horror: {
    subjects: ["Pennywise", "Cthulhu", "Zombie Nurse", "Haunted Doll", "Vampire Lord", "Ghostly Bride", "Swamp Monster", "Slenderman", "Demogorgon"],
    actions: ["emerging from the shadows", "screaming silently", "holding a cursed artifact", "floating in mid-air", "staring with hollow eyes", "crawling on the ceiling"],
    environments: ["in an abandoned asylum", "in a foggy graveyard", "in a dark basement", "in a cursed forest", "in a misty swamp", "in a decrepit hallway"],
    styles: ["H.P. Lovecraft Style", "Dark Surrealism", "Found Footage Aesthetic", "Gothic Horror", "Creepypasta Art", "Tim Burton Style"],
    lighting: ["dim candlelight", "eerie green glow", "harsh flashlight beam", "moonlight through fog", "red emergency light"]
  },
  fashion: {
    subjects: ["Supermodel", "Avant-Garde Mannequin", "Streetwear Icon", "Haute Couture Model", "Runway Star", "Bohemian Girl"],
    actions: ["walking the runway", "posing dramatically", "wearing a dress made of flowers", "wearing a futuristic plastic coat", "adjusting sunglasses", "twirling"],
    environments: ["at Paris Fashion Week", "in a minimalist white studio", "on a busy New York street", "in a luxury boutique", "against a floral wall", "in a desert shoot"],
    styles: ["Vogue Editorial", "High Fashion Photography", "Street Style", "Minimalist Chic", "Bohemian", "Y2K Aesthetic"],
    lighting: ["soft studio lighting", "ring light", "natural golden hour", "dramatic spotlight", "high key white"]
  },
  automotive: {
    subjects: ["Lamborghini Countach", "1969 Ford Mustang", "Tesla Cybertruck", "Porsche 911", "Formula 1 Car", "Vintage Vespa", "Nissan GTR"],
    actions: ["drifting around a corner", "speeding on a highway", "parked in a showroom", "driving in the rain", "covered in mud", "doing a burnout"],
    environments: ["on a race track", "on a coastal highway", "in a neon garage", "on a desert road", "in a futuristic tunnel", "on a mountain pass"],
    styles: ["Top Gear Cinematography", "Gran Turismo 7 Style", "Vintage Car Ad", "Hyperrealistic Render", "Speed Blur", "Synthwave Drive"],
    lighting: ["sunset reflections", "neon tunnel lights", "studio softbox", "lens flare", "wet road reflection"]
  },
  logo: {
    subjects: ["Fox", "Eagle", "Coffee Cup", "Mountain", "Rocket", "Brain", "Tree", "Letter A", "Lion Head", "Flame"],
    actions: ["minimalist shape", "geometric lines", "gradient fill", "negative space", "outline style"],
    environments: ["on a white background", "on a business card mockup", "on a black background", "on a textured paper"],
    styles: ["Vector Art", "Minimalist Logo", "Flat Design", "Mascot Logo", "Abstract Emblem", "Tech Startup Style", "Monogram"],
    lighting: ["flat lighting", "soft shadow", "no shadow", "long shadow"]
  },
  "3d": {
    subjects: ["Super Mario", "Minion", "Lego Batman", "Among Us Character", "SpongeBob", "Fall Guys Character", "Cute Astronaut", "Pixar Dog"],
    actions: ["jumping for joy", "eating a burger", "running fast", "floating in zero g", "dancing", "waving hello"],
    environments: ["in a colorful plastic world", "on a isometric floating island", "inside a toy box", "on a candy planet", "in a ball pit"],
    styles: ["Pixar Animation Style", "Claymation", "Low Poly Isometric", "Funko Pop Style", "Blender 3D Cute", "Plasticine"],
    lighting: ["bright studio lighting", "soft ambient occlusion", "warm cheerful sun", "glossy reflections"]
  },
  anime: {
    subjects: ["Naruto Uzumaki", "Goku", "Sailor Moon", "Gojo Satoru", "Luffy", "Totoro", "Pikachu", "Hatsune Miku", "Evangelion Unit 01"],
    actions: ["powering up energy", "eating ramen", "casting a jutsu", "transforming", "standing in the rain", "wielding a katana"],
    environments: ["in a cherry blossom school yard", "in Neo-Tokyo", "on a pirate ship", "in a martial arts dojo", "under a starry anime sky", "in a destroyed city"],
    styles: ["Studio Ghibli Style", "Makoto Shinkai Detailed", "90s Retro Anime", "Ufotable High Quality", "Manga Lineart", "Cyberpunk Anime"],
    lighting: ["dramatic sun rays", "sunset glow", "magical aura effect", "vibrant anime colors", "lens flare"]
  },
  architecture: {
    subjects: ["Hogwarts Castle", "Stark Tower", "Barbie Dreamhouse", "Hobbit Hole", "Futuristic Apple Store", "Cyberpunk Skyscraper", "Glass Cabin", "Ancient Temple"],
    actions: ["glowing at night", "floating in the sky", "covered in vines", "under construction by robots", "reflecting in a lake"],
    environments: ["on a cliff edge", "in the middle of the ocean", "in a futuristic utopia", "in a snowy landscape", "in a dense jungle"],
    styles: ["Zaha Hadid Futuristic", "Gothic Revival", "Minimalist Concrete", "Steampunk Architecture", "Sustainable Green Design", "Brutalism"],
    lighting: ["interior warm glow", "architectural exterior lights", "blue hour dusk", "golden sunrise", "foggy morning"]
  }
};

const CATEGORY_IDS = Object.keys(THEMES);

// SEEDED RANDOM GENERATOR
// This ensures that "Card 1" is ALWAYS the same prompt across refreshes.
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Function to convert Characters to PromptItems for the Gallery
const generateCharacterPrompts = (): PromptItem[] => {
  return PREMADE_CHARACTERS.map((char) => ({
    id: `card_${char.id}`,
    title: char.name,
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

  // 1. Add AI Personas
  const characterPrompts = generateCharacterPrompts();
  prompts.push(...characterPrompts);

  // Initialize Seeder
  const random = mulberry32(123456789); // FIXED SEED

  // 2. Add Standard Styles
  for (let i = 0; i < count; i++) {
    const catId = CATEGORY_IDS[i % CATEGORY_IDS.length];
    const theme = THEMES[catId];

    // Use seeded random instead of Math.random
    const subject = theme.subjects[Math.floor(random() * theme.subjects.length)];
    const action = theme.actions[Math.floor(random() * theme.actions.length)];
    const env = theme.environments[Math.floor(random() * theme.environments.length)];
    const style = theme.styles[Math.floor(random() * theme.styles.length)];
    const light = theme.lighting[Math.floor(random() * theme.lighting.length)];
    
    let ar: 'portrait' | 'square' | 'landscape' = 'square';
    if (['portrait', 'fashion', 'anime', 'horror'].includes(catId)) ar = 'portrait';
    else if (['architecture', 'nature', 'automotive', 'scifi', 'cyberpunk'].includes(catId)) ar = 'landscape';
    else if (random() > 0.5) ar = 'portrait';

    const stylePrefix = style.split(' ')[0]; 
    const title = `${stylePrefix} ${subject}`; 
    
    const template = `${style} of {subject} ${action} ${env}, ${light}, highly detailed, 8k masterpiece, trending on artstation`;

    const isPremium = i % 3 === 0;

    const width = 300;
    const height = ar === 'portrait' ? 450 : ar === 'landscape' ? 170 : 300;
    
    // Picsum seed based on ID
    const imageUrl = `https://picsum.photos/seed/${i + 5000}/${width}/${height}`;

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

export const PROMPTS: PromptItem[] = generatePrompts(1200);
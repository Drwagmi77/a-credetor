import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PromptCard from './components/PromptCard';
import DetailModal from './components/DetailModal';
import PremiumModal from './components/PremiumModal';
import { CATEGORIES, PROMPTS } from './constants';
import { PromptItem } from './types';
import { useLanguage } from './LanguageContext';
import { saveImageToDB, getAllImagesFromDB, clearAllImagesFromDB } from './db';
import { GoogleGenAI } from "@google/genai";
import { Image as ImageIcon, Users, Palette, Star } from 'lucide-react';

// Declare JSZip since it's loaded via CDN in index.html
declare const JSZip: any;

const App: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Initialize state with default prompts first. 
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>(PROMPTS);
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  
  // Payment / VIP State
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  
  // Auto Generation State
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const isAutoGeneratingRef = useRef(false);
  const [currentProcessingItem, setCurrentProcessingItem] = useState<{id: string, title: string} | null>(null);
  const [autoGenStatus, setAutoGenStatus] = useState<string>(""); 
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load saved images from IndexedDB and Check Premium Status on mount
  useEffect(() => {
    const initApp = async () => {
      // 1. Load Images
      try {
        const savedMap = await getAllImagesFromDB();
        if (savedMap && Object.keys(savedMap).length > 0) {
          setAllPrompts(prevPrompts => 
            prevPrompts.map(p => ({
              ...p,
              customThumbnail: savedMap[p.id] || undefined
            }))
          );
        }
      } catch (e) {
        console.error("Failed to load images from DB", e);
      }

      // 2. Check Premium Status (Local Storage)
      const storedPremium = localStorage.getItem('isPremiumUser');
      if (storedPremium === 'true') {
        setIsPremiumUser(true);
      }

      // 3. Check URL for Stripe Success Redirect (Integration Hook)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true') {
        setIsPremiumUser(true);
        localStorage.setItem('isPremiumUser', 'true');
        window.history.replaceState({}, document.title, window.location.pathname);
        alert(t('payment_success_msg') || "Payment Successful! You are now a VIP member.");
      }
    };

    initApp();
  }, [t]);

  // Filter prompts based on category
  const filteredPrompts = useMemo(() => {
    let filtered = allPrompts;
    if (activeCategory !== 'all') {
      filtered = allPrompts.filter(p => p.category === activeCategory);
    }
    return filtered;
  }, [activeCategory, allPrompts]);

  const visiblePrompts = useMemo(() => {
    return filteredPrompts.slice(0, visibleCount);
  }, [filteredPrompts, visibleCount]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount(prev => Math.min(prev + 12, filteredPrompts.length));
      }
    }, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    }
  }, [filteredPrompts]);

  const handleCardClick = (item: PromptItem) => {
    setSelectedItem(item);
    if (item.isPremium && !isPremiumUser) {
      setIsPremiumOpen(true);
    } else {
      setIsDetailOpen(true);
    }
  };

  const closeModals = () => {
    setIsDetailOpen(false);
    setIsPremiumOpen(false);
    setTimeout(() => setSelectedItem(null), 200); 
  };

  const handleUpgradeSuccess = () => {
    setIsPremiumUser(true);
    localStorage.setItem('isPremiumUser', 'true');
    setIsPremiumOpen(false);
    setTimeout(() => {
      setIsDetailOpen(true);
    }, 300);
  };
  
  const handleTogglePremium = () => {
    const newState = !isPremiumUser;
    setIsPremiumUser(newState);
    if (newState) {
       localStorage.setItem('isPremiumUser', 'true');
    } else {
       localStorage.removeItem('isPremiumUser');
    }
  };

  // Helper to make the API call to reduce duplication
  const callGenAI = async (modelName: string, prompt: string, aspectRatio: string): Promise<string | null> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio } },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
         return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  };

  const generateImageForItem = async (item: PromptItem): Promise<string | null> => {
     const subject = item.title.split(' ').slice(1).join(' ') || item.title;
     const filledTemplate = item.template.replace('{subject}', subject);
     const cleanPrompt = filledTemplate.replace(/--ar\s+\d+:\d+/g, '').trim();

     let targetAspectRatio = "1:1";
     if (item.aspectRatio === 'portrait') targetAspectRatio = "3:4";
     if (item.aspectRatio === 'landscape') targetAspectRatio = "16:9";

     try {
        // First try the High Quality "Pro" model
        return await callGenAI('gemini-3-pro-image-preview', cleanPrompt, targetAspectRatio);
     } catch (err: any) {
        // Check for Permission Denied (403) or Not Found (404)
        // This usually means the API key is valid but doesn't have access to the Pro/Preview model
        const errCode = err?.error?.code || err?.status;
        const errMsg = (err?.message || "").toLowerCase();
        
        if (errCode === 403 || errCode === 404 || errMsg.includes('permission') || errMsg.includes('not found')) {
            console.warn("Pro model failed (403/404), falling back to Flash model.");
            // Fallback to standard Flash model
            try {
              return await callGenAI('gemini-2.5-flash-image', cleanPrompt, targetAspectRatio);
            } catch (fallbackErr) {
              // If Flash also fails (e.g. Quota/429), throw that up
              throw fallbackErr;
            }
        }
        
        // If it was a Quota error (429) or other error on the first try, throw it up to the loop to handle backoff
        throw err;
     }
  };

  // Helper function to wait with countdown updates
  const waitWithCountdown = async (ms: number, messagePrefix: string) => {
    let remaining = ms;
    const step = 1000;
    while (remaining > 0) {
        if (!isAutoGeneratingRef.current) return; // Exit if stopped
        
        // Format time nicely
        const seconds = Math.ceil(remaining / 1000);
        let timeString = `${seconds}s`;
        if (seconds > 60) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeString = `${mins}m ${secs}s`;
        }
        
        setAutoGenStatus(`${messagePrefix} (${timeString})`);
        await new Promise(r => setTimeout(r, step));
        remaining -= step;
    }
  };

  const toggleAutoGenerate = async () => {
    // 1. STOP Logic
    if (isAutoGenerating) {
      isAutoGeneratingRef.current = false;
      setIsAutoGenerating(false);
      setCurrentProcessingItem(null);
      setAutoGenStatus("");
      return;
    }

    // 2. START Logic
    setIsAutoGenerating(true);
    isAutoGeneratingRef.current = true;
    setAutoGenStatus("Starting...");

    const itemsToProcess = [...allPrompts]; 
    let processedCount = 0;

    // EXTREME CONSERVATIVE MODE
    // 60 seconds (1 minute) between success
    const SUCCESS_DELAY = 60 * 1000; 
    // 300 seconds (5 minutes) wait on Quota Error
    const ERROR_DELAY = 5 * 60 * 1000; 

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];

      // Check stop signal
      if (!isAutoGeneratingRef.current) break;

      // Check if already generated
      if (item.customThumbnail) continue;

      // Update UI
      setCurrentProcessingItem({ id: item.id, title: item.title });
      setAutoGenStatus("Generating...");

      try {
        const generatedUrl = await generateImageForItem(item);
        
        if (generatedUrl) {
           setAllPrompts(prev => prev.map(p => 
            p.id === item.id ? { ...p, customThumbnail: generatedUrl } : p
          ));
          await saveImageToDB(item.id, generatedUrl);
          processedCount++;
          // Success! Wait 1 minute.
          await waitWithCountdown(SUCCESS_DELAY, "✅ Cooldown");
        } else {
            // No URL returned (weird state), wait a bit and retry same item
            await waitWithCountdown(10000, "⚠️ Retrying");
            i--;
            continue;
        }

      } catch (e: any) {
        // Robust Error Checking
        let isRateLimit = false;
        const strError = JSON.stringify(e); 
        const errorMessage = (e.message || strError || "").toLowerCase();

        // Check for specific keywords including the one user reported
        if (
            e?.error?.code === 429 || 
            e?.error?.status === 'RESOURCE_EXHAUSTED' ||
            errorMessage.includes('quota') || 
            errorMessage.includes('limit') || 
            errorMessage.includes('exhausted') ||
            errorMessage.includes('429')
        ) {
            isRateLimit = true;
        }

        if (isRateLimit) {
            console.warn(`Rate limit reached for item ${item.id}. Deep sleep.`);
            // Wait 5 minutes
            await waitWithCountdown(ERROR_DELAY, "⛔ QUOTA HIT - Sleeping");
            // RETRY: Decrement i so we try this item again
            i--; 
            continue;
        } else {
            // Generic Error (Network, Server, Safety)
            console.error("Auto-gen error for item " + item.id, e);
            const displayMsg = e?.message || "Error";
            
            // Wait 30 seconds before retrying or moving on
            await waitWithCountdown(30000, `❌ Error: ${displayMsg.slice(0, 10)}...`);
            
            // RETRY: Even on generic errors, retry this item (in case it was just a blip)
            i--; 
            continue;
        }
      }

      if (!isAutoGeneratingRef.current) break;
    }

    if (isAutoGeneratingRef.current) {
        if (processedCount === 0) {
            alert("Gallery check complete! All items checked.");
        }
    }

    setIsAutoGenerating(false);
    isAutoGeneratingRef.current = false;
    setCurrentProcessingItem(null);
    setAutoGenStatus("");
  };

  const handleClearGallery = async () => {
    if (window.confirm("Are you sure you want to delete all generated images from your local gallery? This cannot be undone.")) {
       try {
         await clearAllImagesFromDB();
         setAllPrompts(prev => prev.map(p => ({ ...p, customThumbnail: undefined })));
         alert("Gallery cleared!");
       } catch (e) {
         console.error("Failed to clear DB", e);
         alert("Failed to clear gallery.");
       }
    }
  };


  const handleImageGenerated = async (generatedImageUrl: string) => {
    if (selectedItem) {
      setAllPrompts(prevPrompts => {
        const newPrompts = prevPrompts.map(p => 
          p.id === selectedItem.id 
            ? { ...p, customThumbnail: generatedImageUrl } 
            : p
        );
        return newPrompts;
      });

      setSelectedItem(prev => prev ? { ...prev, customThumbnail: generatedImageUrl } : null);

      try {
        await saveImageToDB(selectedItem.id, generatedImageUrl);
      } catch (e) {
        console.error("Failed to save to DB", e);
      }
    }
  };

  const generatedCount = useMemo(() => {
    return allPrompts.filter(p => p.customThumbnail).length;
  }, [allPrompts]);

  const handleDownloadZip = async () => {
    if (typeof JSZip === 'undefined') {
      alert("JSZip library not loaded. Please refresh the page.");
      return;
    }

    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder("images");
      const savedMap = await getAllImagesFromDB();

      if (!savedMap || Object.keys(savedMap).length === 0) {
        alert("No images generated yet!");
        return;
      }

      Object.entries(savedMap).forEach(([id, base64Data]) => {
        const base64Content = (base64Data as string).split(',')[1];
        if (base64Content) {
           imagesFolder.file(`${id}.png`, base64Content, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "prompt_market_gallery.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      console.error("Error creating ZIP:", e);
      alert("Failed to create ZIP file.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-black">
      <Navbar 
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={(id) => {
            setActiveCategory(id);
            setVisibleCount(12); // Reset scroll on category change
            window.scrollTo(0, 0);
        }}
        generatedCount={generatedCount}
        totalCount={allPrompts.length}
        onDownloadZip={handleDownloadZip}
        isPremium={isPremiumUser}
        onTogglePremium={handleTogglePremium}
        isAutoGenerating={isAutoGenerating}
        onAutoGenerate={toggleAutoGenerate}
        onClearGallery={handleClearGallery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {t('hero_title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{t('hero_title_span')}</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              {t('hero_desc')}
            </p>
          </div>
          
          {isPremiumUser && (
            <div className="bg-vip/10 border border-vip/50 px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-right duration-700">
               <span className="text-2xl">👑</span>
               <div>
                  <p className="text-vip font-bold text-sm uppercase tracking-wider">VIP Member</p>
                  <p className="text-xs text-vip/80">All Styles Unlocked</p>
               </div>
            </div>
          )}
        </div>
        
        {/* Auto-Gen Progress Indicator */}
        {isAutoGenerating && (
          <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in sticky top-20 z-30 backdrop-blur-md shadow-lg shadow-primary/5">
             <div className="flex items-center gap-4">
                <div className="relative">
                   <div className={`w-6 h-6 border-2 border-t-transparent rounded-full ${autoGenStatus.includes('QUOTA') || autoGenStatus.includes('Error') ? 'border-red-500 animate-pulse' : 'border-primary animate-spin'}`}></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <p className={`font-bold text-sm ${autoGenStatus.includes('QUOTA') ? 'text-red-400' : 'text-primary'}`}>
                        {autoGenStatus.includes('QUOTA') ? 'SLOW MODE (Quota Hit)' : 'Bot Active'}
                     </p>
                     <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">
                       {generatedCount} / {allPrompts.length}
                     </span>
                  </div>
                  {currentProcessingItem ? (
                    <div className="flex flex-col">
                        <p className="text-xs text-white/80 mt-0.5 truncate max-w-[200px] sm:max-w-md">
                           Target: <span className="font-medium text-white">{currentProcessingItem.title}</span>
                        </p>
                        <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wide">
                            STATUS: {autoGenStatus}
                        </p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/50 mt-0.5">Initializing next task...</p>
                  )}
                </div>
             </div>
             <button 
                onClick={toggleAutoGenerate}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs px-4 py-2 rounded-lg font-bold transition-colors border border-red-500/20"
             >
                STOP
             </button>
          </div>
        )}

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {visiblePrompts.map((item) => (
            <PromptCard 
              key={item.id} 
              item={item} 
              onClick={handleCardClick} 
            />
          ))}
        </div>
        
        {visibleCount < filteredPrompts.length && (
           <div ref={loadMoreRef} className="h-20 flex items-center justify-center w-full mt-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        {filteredPrompts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('no_styles')}</p>
            <button 
              onClick={() => setActiveCategory('all')}
              className="mt-4 text-primary hover:underline"
            >
              {t('view_all')}
            </button>
          </div>
        )}
      </main>

      <DetailModal 
        item={selectedItem} 
        isOpen={isDetailOpen} 
        onClose={closeModals} 
        onImageGenerated={handleImageGenerated}
        isPremiumUser={isPremiumUser}
        onOpenPremium={() => setIsPremiumOpen(true)}
      />
      
      <PremiumModal 
        item={selectedItem} 
        isOpen={isPremiumOpen} 
        onClose={closeModals}
        onUpgrade={handleUpgradeSuccess}
      />

      {/* Social Proof / Stats Section */}
      <div className="border-t border-white/10 bg-black/40 py-16 mt-20 relative overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
               
               {/* Images Created */}
               <div className="flex flex-col items-center group cursor-default">
                  <div className="bg-primary/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform border border-primary/20">
                      <ImageIcon size={32} className="text-primary" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">+15,420</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{t('stat_images')}</span>
               </div>
               
               {/* Happy Users */}
               <div className="flex flex-col items-center group cursor-default">
                  <div className="bg-blue-500/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform border border-blue-500/20">
                      <Users size={32} className="text-blue-400" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">+8,500</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{t('stat_users')}</span>
               </div>
               
               {/* Unique Styles */}
               <div className="flex flex-col items-center group cursor-default">
                   <div className="bg-purple-500/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform border border-purple-500/20">
                      <Palette size={32} className="text-purple-400" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">+500</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{t('stat_styles')}</span>
               </div>
               
               {/* Rating */}
               <div className="flex flex-col items-center group cursor-default">
                   <div className="bg-yellow-500/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform border border-yellow-500/20">
                      <Star size={32} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">4.9/5</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{t('stat_rating')}</span>
               </div>

            </div>
         </div>
      </div>

      <footer className="border-t border-white/5 py-8 bg-black">
         <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
            <p>&copy; 2024 PromptMarket. {t('footer_rights')}</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { Lock, Sparkles, ImageOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface PromptCardProps {
  item: PromptItem;
  onClick: (item: PromptItem) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ item, onClick }) => {
  const { t } = useLanguage();
  const [imgSrc, setImgSrc] = useState(item.customThumbnail || item.imageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If a custom thumbnail is generated, prioritize it. 
    // Otherwise use the item.imageUrl
    setImgSrc(item.customThumbnail || item.imageUrl);
    setHasError(false);
  }, [item.imageUrl, item.customThumbnail]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback: Use Picsum with a consistent seed based on ID to avoid "broken" look
      // This ensures if Pollinations times out, the UI still looks good.
      setImgSrc(`https://picsum.photos/seed/${item.id}/300/400`);
    }
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className={`group relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl bg-surface hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 ${item.customThumbnail ? 'ring-2 ring-primary shadow-lg shadow-primary/10' : ''}`}
    >
      {/* Image Container */}
      <div className="relative w-full overflow-hidden min-h-[150px] bg-white/5">
        <img 
          src={imgSrc} 
          alt={item.title}
          onError={handleError}
          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradient (Always visible at bottom, stronger on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 right-3 z-10">
          {item.isPremium ? (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-vip/50 text-vip px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
              <Lock size={12} className="text-vip" />
              <span>{t('card_vip')}</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1 backdrop-blur-md border px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${item.customThumbnail ? 'bg-primary/90 text-black border-primary' : 'bg-black/60 border-primary/50 text-primary'}`}>
              <Sparkles size={12} className={item.customThumbnail ? "text-black" : "text-primary"} />
              <span>{item.customThumbnail ? 'Created' : t('card_free')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{item.title}</h3>
        <p className={`text-xs line-clamp-1 transition-opacity ${item.customThumbnail ? 'text-primary font-medium opacity-100' : 'text-gray-300 opacity-80 group-hover:opacity-100'}`}>
          {item.customThumbnail ? 'Tap to view your creation' : (item.isPremium ? t('tap_unlock') : t('tap_create'))}
        </p>
      </div>
    </div>
  );
};

export default PromptCard;
import React from 'react';
import { Palette, Globe, Download, Crown, Trash2, Play, Square, RefreshCcw, LifeBuoy } from 'lucide-react';
import { Category } from '../types';
import { useLanguage } from '../LanguageContext';
import { Language } from '../translations';

interface NavbarProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  generatedCount: number;
  totalCount: number;
  onDownloadZip: () => void;
  isPremium: boolean;
  onTogglePremium: () => void;
  onClearGallery?: () => void;
  isAutoGenerating?: boolean;
  onToggleAutoGenerate?: () => void;
  onSyncGallery?: () => void;
  onOpenRescue?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  categories, 
  activeCategory, 
  onSelectCategory,
  generatedCount,
  totalCount,
  onDownloadZip,
  isPremium,
  onTogglePremium,
  onClearGallery,
  isAutoGenerating,
  onToggleAutoGenerate,
  onSyncGallery,
  onOpenRescue
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const getCategoryName = (cat: Category) => {
    if (cat.id === 'all') return t('nav_all');
    if (cat.id === 'saved' && generatedCount > 0) return `${t('cat_saved') || "📂 Saved"} (${generatedCount})`;
    return t(`cat_${cat.id}`) || cat.name;
  };

  const getCategoryStyle = (cat: Category) => {
      if (cat.id === 'saved' && generatedCount > 0) {
          if (activeCategory === 'saved') return 'bg-primary text-black ring-2 ring-primary ring-offset-2 ring-offset-black';
          return 'text-primary border border-primary/30 hover:bg-primary/20';
      }
      if (activeCategory === cat.id) return 'bg-white text-black';
      return 'text-gray-400 hover:text-white hover:bg-white/10';
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="bg-gradient-to-tr from-primary to-blue-500 p-2 rounded-lg">
              <Palette size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden lg:block">
              {t('app_name')}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 overflow-x-auto no-scrollbar mx-2 flex-1 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${getCategoryStyle(cat)}`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">

             {/* EMERGENCY RESCUE BUTTON (NAVBAR) */}
             {onOpenRescue && (
                <button
                    onClick={onOpenRescue}
                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-red-500/30 animate-pulse"
                    title="Find Missing Images"
                >
                    <LifeBuoy size={14} />
                    <span className="hidden sm:inline">Rescue</span>
                </button>
             )}

             {onToggleAutoGenerate && (
                <button
                    onClick={onToggleAutoGenerate}
                    className={`p-2 rounded-full transition-all border flex items-center gap-2 px-3 ${
                        isAutoGenerating 
                        ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                        : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                    }`}
                >
                    {isAutoGenerating ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    <span className="text-xs font-bold hidden sm:block">{isAutoGenerating ? 'STOP' : 'AUTO'}</span>
                </button>
             )}

             {onClearGallery && generatedCount > 0 && (
                <button onClick={onClearGallery} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                    <Trash2 size={20} />
                </button>
             )}

            {onSyncGallery && (
                <button onClick={onSyncGallery} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCcw size={20} />
                </button>
            )}

            {generatedCount > 0 && (
              <button onClick={onDownloadZip} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                <Download size={16} />
                <span className="hidden sm:inline">{t('btn_save')} ({generatedCount})</span>
              </button>
            )}
            
            <div className="relative group">
              <button className="p-2 text-gray-400 group-hover:text-white transition-colors">
                 <Globe size={20} />
              </button>
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="absolute right-0 top-full mt-2 bg-surface border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity w-32 shadow-xl"
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>
          </div>
        </div>
        <div className="md:hidden overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 flex space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${getCategoryStyle(cat)}`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
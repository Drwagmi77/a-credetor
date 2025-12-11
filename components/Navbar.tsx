import React from 'react';
import { Palette, Search, Globe, Download, CheckCircle, Crown, Play, Square, Loader2, Trash2 } from 'lucide-react';
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
  isAutoGenerating: boolean;
  onAutoGenerate: () => void;
  onClearGallery?: () => void;
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
  isAutoGenerating,
  onAutoGenerate,
  onClearGallery
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const getCategoryName = (cat: Category) => {
    if (cat.id === 'all') return t('nav_all');
    return t(`cat_${cat.id}`) || cat.name;
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="bg-gradient-to-tr from-primary to-blue-500 p-2 rounded-lg">
              <Palette size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden lg:block">
              {t('app_name')}
            </span>
          </div>

          {/* Desktop Categories */}
          <div className="hidden md:flex items-center space-x-1 overflow-x-auto no-scrollbar mx-2 flex-1 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">

             {/* Auto-Generate Button (Developer Tool) */}
             <button
               onClick={onAutoGenerate}
               className={`p-2 rounded-full transition-all border flex items-center gap-2 ${isAutoGenerating ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-gray-500 hover:text-green-400 hover:border-green-400'}`}
               title={isAutoGenerating ? "Stop Generation" : "Auto-Generate All Images"}
             >
               {isAutoGenerating ? (
                 <Square size={18} fill="currentColor" />
               ) : (
                 <Play size={18} fill="currentColor" />
               )}
             </button>
             
             {/* Developer / VIP Toggle Button */}
             <button
               onClick={onTogglePremium}
               className={`p-2 rounded-full transition-all border ${isPremium ? 'bg-vip/20 border-vip text-vip shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
               title={isPremium ? "Developer Mode: VIP Active" : "Developer Mode: Switch to VIP"}
             >
               <Crown size={18} fill={isPremium ? "currentColor" : "none"} />
             </button>
             
             {/* Trash / Clear Button (Dev Only really) */}
             {onClearGallery && generatedCount > 0 && (
                <button
                onClick={onClearGallery}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-400 transition-colors"
                title="Clear Generated Gallery"
                >
                    <Trash2 size={18} />
                </button>
             )}

             {/* Progress & Download - Only show if images are generated */}
             {generatedCount > 0 && (
               <div className="flex items-center gap-2 mr-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-primary">
                    <CheckCircle size={14} />
                    <span>{generatedCount}/{totalCount}</span>
                  </div>
                  <div className="w-px h-4 bg-white/20 mx-1"></div>
                  <button 
                    onClick={onDownloadZip}
                    className="text-gray-300 hover:text-white transition-colors"
                    title="Download All Generated Images"
                  >
                    <Download size={16} />
                  </button>
               </div>
             )}

             {/* Language Selector */}
             <div className="relative group flex items-center">
               <Globe size={16} className="text-gray-400 absolute left-2 pointer-events-none" />
               <select 
                 value={language}
                 onChange={handleLanguageChange}
                 className="bg-surface border border-white/10 text-white text-xs pl-7 pr-2 py-1.5 rounded-full focus:outline-none focus:border-primary appearance-none cursor-pointer hover:bg-white/5 transition-colors w-[60px] sm:w-auto"
               >
                 <option value="en">EN</option>
                 <option value="tr">TR</option>
                 <option value="es">ES</option>
                 <option value="de">DE</option>
                 <option value="zh">ZH</option>
                 <option value="hi">HI</option>
               </select>
             </div>
             
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-surface cursor-pointer hidden sm:block"></div>
          </div>
        </div>
      </div>
      
      {/* Mobile Categories */}
      <div className="md:hidden border-t border-white/5 overflow-x-auto no-scrollbar py-2 px-4 flex gap-2">
        {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              {getCategoryName(cat)}
            </button>
          ))}
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { PREMADE_CHARACTERS } from '../constants';
import { getCharactersFromDB, saveCharacterToDB, deleteCharacterFromDB } from '../db';
import { Plus, User, Trash2, Check, Sparkles, Lock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface CharacterSelectorProps {
  selectedCharacterId: string | null;
  onSelect: (character: Character | null) => void;
  isPremiumUser?: boolean;
  onOpenPremium?: () => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedCharacterId, onSelect, isPremiumUser = false, onOpenPremium }) => {
  const { t } = useLanguage();
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Character Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const allCharacters = [...customCharacters, ...PREMADE_CHARACTERS];

  useEffect(() => {
    const loadCustom = async () => {
      try {
        const chars = await getCharactersFromDB();
        setCustomCharacters(chars);
      } catch (e) {
        console.error("Failed to load characters", e);
      }
    };
    loadCustom();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newDesc.trim()) return;
    
    const newChar: Character = {
      id: `custom_${Date.now()}`,
      name: newName,
      description: newDesc,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random&color=fff`,
      isCustom: true
    };

    try {
      await saveCharacterToDB(newChar);
      setCustomCharacters(prev => [newChar, ...prev]);
      onSelect(newChar);
      setIsCreating(false);
      setNewName('');
      setNewDesc('');
    } catch (e) {
      alert("Failed to save character");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this character?")) {
      await deleteCharacterFromDB(id);
      setCustomCharacters(prev => prev.filter(c => c.id !== id));
      if (selectedCharacterId === id) onSelect(null);
    }
  };

  const handleCharacterClick = (char: Character) => {
    const isLocked = char.isPremium && !isPremiumUser;

    if (isLocked) {
      if (onOpenPremium) onOpenPremium();
      return;
    }
    
    if (selectedCharacterId === char.id) {
        onSelect(null);
    } else {
        onSelect(char);
    }
  };

  return (
    <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        {/* Special Title with Gold Gradient */}
        <label className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-vip via-white to-vip animate-in fade-in">
           <Sparkles size={16} className="text-vip" />
           {t('lbl_select_character') || "AI Persona Studio"}
        </label>
        
        {selectedCharacterId && (
            <button 
                onClick={() => onSelect(null)} 
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
            >
                {t('btn_reset') || "Deselect"}
            </button>
        )}
      </div>

      {/* Character List Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
        
        {/* Create Button */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 group">
            <button 
                onClick={() => setIsCreating(true)}
                className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all text-white/50 hover:text-primary bg-black/20 group-hover:scale-105"
            >
                <Plus size={24} />
            </button>
            <span className="text-xs text-gray-400 font-medium group-hover:text-primary transition-colors">{t('btn_new') || "New"}</span>
        </div>

        {/* Character Avatars */}
        {allCharacters.map((char) => {
            const isSelected = selectedCharacterId === char.id;
            const isLocked = char.isPremium && !isPremiumUser;
            
            return (
                <div 
                    key={char.id} 
                    className="flex-shrink-0 flex flex-col items-center gap-2 relative group cursor-pointer"
                    onClick={() => handleCharacterClick(char)}
                >
                    <div className={`relative w-16 h-16 rounded-full transition-all duration-300 ${isSelected ? 'scale-110 shadow-[0_0_15px_rgba(29,185,84,0.6)] ring-2 ring-primary' : 'opacity-90 hover:opacity-100 hover:scale-105'} ${isLocked ? 'grayscale opacity-70' : ''}`}>
                        <img 
                            src={char.avatarUrl} 
                            alt={char.name} 
                            className={`w-full h-full rounded-full object-cover border-2 ${isSelected ? 'border-primary' : 'border-white/10 group-hover:border-white/40'}`}
                        />
                        
                        {/* Lock Overlay - Enhanced Visibility */}
                        {isLocked && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-[1px] border border-vip/30">
                                <Lock size={20} className="text-vip drop-shadow-md" />
                            </div>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                            <div className="absolute bottom-0 right-0 bg-primary text-black rounded-full p-1 border-2 border-black shadow-lg">
                                <Check size={10} strokeWidth={4} />
                            </div>
                        )}
                    </div>
                    
                    <span className={`text-xs font-medium truncate max-w-[70px] transition-colors ${isSelected ? 'text-primary' : 'text-gray-400 group-hover:text-white'} ${isLocked ? 'text-gray-600' : ''}`}>
                        {char.name}
                    </span>
                    
                    {char.isCustom && (
                        <button 
                            onClick={(e) => handleDelete(e, char.id)}
                            className="absolute -top-1 -right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                        >
                            <Trash2 size={10} />
                        </button>
                    )}
                </div>
            );
        })}
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-xl animate-in slide-in-from-top-2">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-vip" />
                {t('title_create_persona') || "Create Custom Persona"}
            </h4>
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Name</label>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Cyber Samurai"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Physical Description</label>
                    <textarea 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="e.g. A 25yo woman with neon blue hair, bionic arm, wearing a leather jacket..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none h-20 focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Describe the face, hair, body, and outfit base.</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => setIsCreating(false)}
                        className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={!newName || !newDesc}
                        className="text-xs bg-primary hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                    >
                        Save Persona
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;
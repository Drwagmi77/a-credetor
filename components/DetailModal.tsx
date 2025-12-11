import React, { useState, useEffect, useRef } from 'react';
import { PromptItem, Character } from '../types';
import { X, Wand2, Download, RefreshCw, AlertCircle, ImagePlus, Trash2, Sparkles, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../LanguageContext';

interface DetailModalProps {
  item: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated?: (imageUrl: string) => void;
  isPremiumUser?: boolean;
  onOpenPremium?: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, isOpen, onClose, onImageGenerated, isPremiumUser = false, onOpenPremium }) => {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if this item is a specific "Character Card"
  const isPersonaMode = item?.category === 'ai_personas' || !!item?.characterId;

  useEffect(() => {
    if (isOpen && item) {
      // Reset State on Open
      if (isPersonaMode) {
          // In Persona Mode, we want the input empty so user types an action
          setSubject('');
      } else {
          // In Style Mode, default to the title sans prefix usually
          const defaultSubject = item.title.split(' ').slice(1).join(' ');
          setSubject(defaultSubject);
      }
      
      setReferenceImage(null);
      setGeneratedImage(null);
      setError(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, item, isPersonaMode]);

  if (!isOpen || !item) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      setError(t('error_api'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    const callGenAI = async (modelName: string, prompt: string, aspectRatio: string, parts: any[]) => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: parts },
        config: { imageConfig: { aspectRatio: aspectRatio } },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
      return null;
    };

    try {
      // Construct prompt
      // For Personas: template contains character desc + {subject} (which is action)
      // For Styles: template contains style + {subject} (which is subject)
      const finalPrompt = item.template.replace('{subject}', subject || (isPersonaMode ? 'standing confidently' : 'something amazing'));

      // Remove --ar flags if present in template as we handle aspect ratio via config
      const cleanPrompt = finalPrompt.replace(/--ar\s+\d+:\d+/g, '').trim();

      let targetAspectRatio = "1:1";
      if (item.aspectRatio === 'portrait') targetAspectRatio = "3:4";
      if (item.aspectRatio === 'landscape') targetAspectRatio = "16:9";

      const parts: any[] = [];
      
      // Add reference image if it exists (Image-to-Image)
      if (referenceImage) {
        const base64Data = referenceImage.split(',')[1];
        const mimeType = referenceImage.split(';')[0].split(':')[1];
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }

      // Add text prompt
      parts.push({ text: cleanPrompt });

      let imageUrl: string | null = null;

      try {
        // Try Pro Model first
        imageUrl = await callGenAI('gemini-3-pro-image-preview', cleanPrompt, targetAspectRatio, parts);
      } catch (err: any) {
        const errCode = err?.error?.code || err?.status;
        const errMsg = (err?.message || "").toLowerCase();
        
        if (errCode === 403 || errCode === 404 || errMsg.includes('permission') || errMsg.includes('not found')) {
            console.warn("Pro model failed, falling back to Flash");
            // Fallback to Flash
            imageUrl = await callGenAI('gemini-2.5-flash-image', cleanPrompt, targetAspectRatio, parts);
        } else {
            throw err;
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        if (onImageGenerated) {
            onImageGenerated(imageUrl);
        }
      } else {
        setError(t('error_gen'));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || t('error_gen'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-${subject.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Simple icon wrapper for the hint text
  const HintIcon = ({ size }: { size: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Side: Image Preview */}
        <div className="w-full md:w-1/2 bg-black/50 relative min-h-[300px] md:min-h-full flex items-center justify-center p-4">
          {generatedImage ? (
             <img 
               src={generatedImage} 
               alt="Generated Result" 
               className="w-full h-auto max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
             />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
               <img 
                src={item.customThumbnail || item.imageUrl} 
                alt="Style Preview" 
                className={`w-full h-full object-cover absolute inset-0 opacity-40 blur-sm transition-opacity duration-500 ${isGenerating ? 'animate-pulse' : ''}`}
               />
               <div className="z-10 text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 m-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-primary font-medium animate-pulse">{t('preview_loading')}</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">{t('preview_title')}</h3>
                      <p className="text-sm text-gray-300 mb-1">{t('preview_desc_1')}</p>
                      <p className="text-sm text-gray-300">{t('preview_desc_2')}</p>
                    </>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Right Side: Controls */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
           <div className="mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">{isPersonaMode ? t('cat_ai_personas') : item.category}</span>
              <h2 className="text-3xl font-bold text-white leading-tight mb-4">{item.title}</h2>
              <p className="text-gray-400 leading-relaxed text-sm">
                {isPersonaMode ? t('modal_persona_desc') : t('modal_detail_desc')}
              </p>
           </div>

           <div className="flex-grow space-y-6">
              
              {/* Text Prompt Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                  {isPersonaMode && <User size={16} className="text-vip" />}
                  {isPersonaMode 
                    ? t('modal_input_label_persona') || `What is ${item.title} doing?`
                    : t('modal_input_label')}
                </label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isPersonaMode ? (t('modal_input_placeholder_persona') || "e.g. drinking coffee") : t('modal_input_placeholder')}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                   <HintIcon size={12} />
                   {isPersonaMode 
                     ? t('modal_input_help_persona') || "Consistent character look will be maintained."
                     : t('modal_input_help')}
                </p>
              </div>
              
              {/* Reference Image Upload Section - ONLY for styles, NOT for Personas (to keep persona logic pure) */}
              {!isPersonaMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                      {t('modal_ref_image_label')}
                    </label>
                    
                    {!referenceImage ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-16 border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-colors bg-white/5 hover:bg-white/10 group"
                      >
                         <div className="p-1.5 bg-white/5 rounded-full group-hover:bg-primary/20 transition-colors">
                           <ImagePlus size={16} className="text-gray-400 group-hover:text-primary" />
                         </div>
                         <span className="text-xs text-gray-400 group-hover:text-white">{t('modal_ref_image_placeholder')}</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-20 rounded-xl overflow-hidden group border border-white/10">
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                             onClick={clearReferenceImage}
                             className="bg-red-500/80 hover:bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-medium backdrop-blur-sm"
                           >
                             <Trash2 size={10} />
                             {t('modal_ref_remove')}
                           </button>
                        </div>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                   <AlertCircle size={18} />
                   <span>{error}</span>
                </div>
              )}
           </div>

           <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
             {generatedImage ? (
                <div className="flex gap-3">
                   <button 
                    onClick={handleSave}
                    className="flex-1 bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={20} />
                    {t('btn_save')}
                  </button>
                  <button 
                    onClick={() => setGeneratedImage(null)}
                    className="flex-none bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
             ) : (
               <button 
                onClick={handleGenerate}
                disabled={isGenerating || !subject.trim()}
                className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isGenerating || !subject.trim()
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-green-500 text-black shadow-lg shadow-primary/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    {t('btn_generating')}
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    {t('btn_create')}
                  </>
                )}
              </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
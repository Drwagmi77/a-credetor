import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PromptCard from './components/PromptCard';
import DetailModal from './components/DetailModal';
import PremiumModal from './components/PremiumModal';
import { CATEGORIES, PROMPTS } from './constants';
import { PromptItem } from './types';
import { useLanguage } from './LanguageContext';
import { saveImageToDB, getAllImagesFromDB, clearAllImagesFromDB, inspectAllStorage, forceImportItem, getRawItemContent, manualImport, StorageItem } from './db';
import { Image as ImageIcon, Users, Palette, Star, Loader2, X, Download, AlertCircle, CheckCircle2, LifeBuoy, Database, RefreshCw, Trash2, HardDrive, ArrowRight, Search, FileQuestion, FileJson, Server, FileText, DownloadCloud, ClipboardPaste } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

declare const JSZip: any;

const App: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>(PROMPTS);
  const [savedPrompts, setSavedPrompts] = useState<PromptItem[]>([]);
  const [dbCount, setDbCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isRescueOpen, setIsRescueOpen] = useState(false);
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const isAutoGeneratingRef = useRef(false);
  const [autoGenStatus, setAutoGenStatus] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual'>('scanner');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleForceRestore = async (silent = false) => {
      if (!silent) { setIsRestoring(true); setRestoreStatus("Yenileniyor..."); }
      try {
          const savedMap = await getAllImagesFromDB();
          const savedIDs = Object.keys(savedMap);
          setDbCount(savedIDs.length);
          const directItems: PromptItem[] = savedIDs.map(id => {
             const original = PROMPTS.find(p => p.id === id || p.id.includes(id) || id.includes(p.id));
             return {
                 id: id,
                 title: original ? original.title : `Kurtarılan ${id.substring(0, 5)}`,
                 template: original ? original.template : "Recovery",
                 category: 'saved',
                 imageUrl: savedMap[id],
                 customThumbnail: savedMap[id],
                 isPremium: false,
                 aspectRatio: original ? original.aspectRatio : 'square'
             };
          });
          setSavedPrompts(directItems);
          setAllPrompts(prev => prev.map(p => {
              let foundImage = savedMap[p.id]; 
              if (!foundImage && p.id.startsWith('card_')) foundImage = savedMap[p.id.replace('card_', '')];
              if (!foundImage) foundImage = savedMap[`card_${p.id}`];
              if (foundImage) return { ...p, customThumbnail: foundImage };
              return p;
          }));
          if (!silent) {
             setRestoreStatus(savedIDs.length === 0 ? "Bulunamadı." : `${savedIDs.length} Resim Hazır!`);
             setTimeout(() => setRestoreStatus(null), 3000);
             setIsRestoring(false);
          }
      } catch (e) { console.error(e); if (!silent) setIsRestoring(false); }
  };

  const runDeepScan = async () => {
      setIsScanning(true);
      setStorageItems([]);
      try {
          const findings = await inspectAllStorage();
          setStorageItems(findings);
      } catch (e) { console.error("Deep scan failed", e); } 
      finally { setIsScanning(false); }
  };

  const openRescueModal = () => { setIsRescueOpen(true); runDeepScan(); setActiveTab('scanner'); };

  const handleForceImport = async (item: StorageItem) => {
      if (item.key.includes('(Empty)')) return;
      if (!confirm(`Force import from '${item.key}'?`)) return;
      setIsMigrating(true);
      try {
          const success = await forceImportItem(item);
          if (success) {
              alert("Import successful! Check the 'Saved' gallery.");
              await handleForceRestore();
          } else {
              alert("Import executed, but no valid images were detected in this item.");
          }
      } catch (e) { alert("Error importing."); }
      finally { setIsMigrating(false); }
  };

  const handleDownloadRaw = async (item: StorageItem) => {
      const content = await getRawItemContent(item);
      if (!content) { alert("Empty or unreadable."); return; }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RESTORE_${item.key.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };
  
  const handleManualImport = async () => {
      if (!manualInput.trim()) return;
      setIsMigrating(true);
      const res = await manualImport(manualInput);
      setIsMigrating(false);
      if (res.success && res.count > 0) {
          alert(`Successfully restored ${res.count} images!`);
          setManualInput("");
          await handleForceRestore();
      } else {
          alert("Could not find any valid image data in the pasted text.");
      }
  };

  useEffect(() => {
    const initApp = async () => {
      await handleForceRestore(true);
      if (localStorage.getItem('isPremiumUser') === 'true') setIsPremiumUser(true);
    };
    initApp();
  }, []);

  const currentList = useMemo(() => {
      if (activeCategory === 'saved') return savedPrompts;
      if (activeCategory === 'all') return allPrompts;
      return allPrompts.filter(p => p.category === activeCategory);
  }, [activeCategory, allPrompts, savedPrompts]);

  const visiblePrompts = useMemo(() => currentList.slice(0, visibleCount), [currentList, visibleCount]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount(prev => Math.min(prev + 12, currentList.length));
    }, { root: null, rootMargin: '200px', threshold: 0.1 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => { if (loadMoreRef.current) observer.unobserve(loadMoreRef.current); }
  }, [currentList]);

  const handleCardClick = (item: PromptItem) => {
    setSelectedItem(item);
    if (item.isPremium && !isPremiumUser && !item.customThumbnail) setIsPremiumOpen(true);
    else setIsDetailOpen(true);
  };

  const closeModals = () => { setIsDetailOpen(false); setIsPremiumOpen(false); setTimeout(() => setSelectedItem(null), 200); };
  const handleUpgradeSuccess = () => { setIsPremiumUser(true); localStorage.setItem('isPremiumUser', 'true'); setIsPremiumOpen(false); };
  const handleTogglePremium = () => {
    const newState = !isPremiumUser;
    setIsPremiumUser(newState);
    newState ? localStorage.setItem('isPremiumUser', 'true') : localStorage.removeItem('isPremiumUser');
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const generateSingleImage = async (item: PromptItem): Promise<string | null> => {
    if (!process.env.API_KEY) return null;
    try {
        let promptToSend = item.template.replace('{subject}', item.title.replace(item.category, ''));
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', contents: { parts: [{ text: promptToSend }] }
        });
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    } catch (e) { console.error(e); }
    return null;
  };

  const toggleAutoGenerate = async () => {
    if (isAutoGenerating) { isAutoGeneratingRef.current = false; setIsAutoGenerating(false); return; }
    if (!process.env.API_KEY) { alert("API Key missing!"); return; }
    isAutoGeneratingRef.current = true;
    setIsAutoGenerating(true);
    setAutoGenStatus("Starting...");
    const existingImages = await getAllImagesFromDB();
    for (const p of allPrompts) {
        if (!isAutoGeneratingRef.current) break;
        if (existingImages[p.id]) continue;
        setAutoGenStatus(`Gen: ${p.title}...`);
        const base64 = await generateSingleImage(p);
        if (base64) {
            await saveImageToDB(p.id, base64);
            existingImages[p.id] = base64;
            setAllPrompts(prev => prev.map(item => item.id === p.id ? { ...item, customThumbnail: base64 } : item));
            handleForceRestore(true);
            for (let i = 10; i > 0; i--) { if (!isAutoGeneratingRef.current) break; setAutoGenStatus(`Wait ${i}s...`); await wait(1000); }
        } else { await wait(5000); }
    }
    setIsAutoGenerating(false);
  };

  const handleClearGallery = async () => {
    if (prompt("Type 'DELETE' to confirm.") === 'DELETE') {
       await clearAllImagesFromDB();
       setSavedPrompts([]);
       setDbCount(0);
       setAllPrompts(prev => prev.map(p => ({ ...p, customThumbnail: undefined })));
       alert("Deleted.");
       setActiveCategory('all');
    }
  };

  const handleImageGenerated = async (generatedImageUrl: string) => {
    if (selectedItem) {
      await saveImageToDB(selectedItem.id, generatedImageUrl);
      setAllPrompts(prev => prev.map(p => p.id === selectedItem.id ? { ...p, customThumbnail: generatedImageUrl } : p));
      handleForceRestore(true);
      setSelectedItem(prev => prev ? { ...prev, customThumbnail: generatedImageUrl } : null);
    }
  };

  const handleDownloadZip = async () => {
    if (typeof JSZip === 'undefined') { alert("JSZip missing"); return; }
    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder("images");
      const savedMap = await getAllImagesFromDB();
      if (!savedMap || Object.keys(savedMap).length === 0) { alert("No images!"); return; }
      Object.entries(savedMap).forEach(([id, base64Data]) => {
        const base64Content = (base64Data as string).split(',')[1];
        if (base64Content) imagesFolder.file(`${id}.png`, base64Content, { base64: true });
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "gallery.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) { console.error(e); alert("Zip failed"); }
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans">
      <Navbar 
        categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={(id) => { setActiveCategory(id); setVisibleCount(12); window.scrollTo(0, 0); }}
        generatedCount={dbCount} totalCount={allPrompts.length} onDownloadZip={handleDownloadZip}
        isPremium={isPremiumUser} onTogglePremium={handleTogglePremium} onClearGallery={handleClearGallery}
        isAutoGenerating={isAutoGenerating} onToggleAutoGenerate={toggleAutoGenerate} onSyncGallery={() => handleForceRestore(false)} onOpenRescue={openRescueModal} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restoreStatus && (
           <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl flex items-center gap-4 shadow-2xl animate-in slide-in-from-top-4 border ${restoreStatus.includes('Bulunamadı') ? 'bg-red-500/90 border-red-400' : 'bg-green-500/90 border-green-400'} text-white`}>
               <div className="bg-white/20 p-2 rounded-full"><CheckCircle2 size={24} /></div>
               <span className="font-bold">{restoreStatus}</span>
           </div>
        )}

        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {activeCategory === 'saved' ? "Kayıtlı" : t('hero_title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{activeCategory === 'saved' ? "Galeri" : t('hero_title_span')}</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">{activeCategory === 'saved' ? `Cihaz hafızasında ${dbCount} resim bulundu.` : t('hero_desc')}</p>
          </div>
          <div className="flex gap-2">
               <button onClick={() => handleForceRestore(false)} disabled={isRestoring} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                {isRestoring ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />} {isRestoring ? "Taranıyor..." : "Yenile"}
              </button>
          </div>
        </div>
        
        {isAutoGenerating && (
            <div className="sticky top-20 z-30 mb-6 mx-auto max-w-2xl bg-surface/90 backdrop-blur-md border border-primary/50 rounded-xl p-4 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-4"><Loader2 className="animate-spin text-primary" size={24} /><span className="font-bold text-sm">{autoGenStatus}</span></div>
                <button onClick={toggleAutoGenerate} className="text-red-500 font-bold text-xs border border-red-500 px-3 py-1 rounded">STOP</button>
            </div>
        )}

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {visiblePrompts.map((item) => <PromptCard key={item.id} item={item} onClick={handleCardClick} />)}
        </div>
        
        {visibleCount < currentList.length && (
           <div ref={loadMoreRef} className="h-20 flex items-center justify-center w-full mt-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        )}

        {currentList.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 mx-auto max-w-2xl">
            <LifeBuoy size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">Veri Bulunamadı</h3>
            <p className="text-gray-500 mb-6">Veriler gizlenmiş veya farklı bir formatta kaydedilmiş olabilir.</p>
            <button onClick={openRescueModal} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"><Search size={20} /> Derin Tarama (Rescue)</button>
          </div>
        )}
      </main>

      <DetailModal item={selectedItem} isOpen={isDetailOpen} onClose={closeModals} onImageGenerated={handleImageGenerated} isPremiumUser={isPremiumUser} />
      <PremiumModal item={selectedItem} isOpen={isPremiumOpen} onClose={closeModals} onUpgrade={handleUpgradeSuccess} />

      {isRescueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
             <div className="relative w-full max-w-5xl h-[85vh] bg-surface rounded-2xl flex flex-col p-6 border border-red-500/30 shadow-[0_0_100px_rgba(220,38,38,0.2)]">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                     <div>
                         <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2"><HardDrive className="animate-pulse" /> Ultimate Recovery Tool</h2>
                         <p className="text-sm text-gray-400 mt-1">Direct memory inspection & Manual restore</p>
                     </div>
                     <button onClick={() => setIsRescueOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
                </div>

                <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                    <button onClick={() => setActiveTab('scanner')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'scanner' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}>
                        <Search size={16} /> Scanner
                    </button>
                    <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'manual' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}>
                        <ClipboardPaste size={16} /> Manual Restore
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {activeTab === 'manual' ? (
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="font-bold text-lg mb-2">Paste Data Here</h3>
                                <p className="text-sm text-gray-400 mb-4">If you have a backup file (JSON or text) or a base64 string, paste it here to forcefully inject it into the gallery.</p>
                                <textarea 
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder='Paste {"id": "123", "data": "base64..."} here...'
                                    className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-green-400 focus:outline-none focus:border-primary"
                                />
                                <button 
                                    onClick={handleManualImport}
                                    disabled={!manualInput.trim() || isMigrating}
                                    className="mt-4 w-full bg-primary text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-500 transition-colors"
                                >
                                    {isMigrating ? <Loader2 className="animate-spin" /> : <Server size={18} />}
                                    Process & Restore
                                </button>
                            </div>
                        </div>
                    ) : (
                        isScanning ? (
                            <div className="h-full flex items-center justify-center flex-col gap-4 text-gray-500 py-20">
                                <Loader2 size={64} className="animate-spin text-red-500" />
                                <p className="text-xl font-mono animate-pulse">Deep Scanning Memory...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-lg block">System Scan Results</span>
                                        <span className="text-xs text-gray-400">Content Preview shows the first 100 characters of the value.</span>
                                    </div>
                                    <button onClick={runDeepScan} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"><RefreshCw size={20} /></button>
                                </div>

                                <div className="grid gap-2">
                                    {storageItems.length === 0 && (
                                        <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-4">
                                            <AlertCircle size={48} className="text-gray-700" />
                                            <p>No storage keys found.</p>
                                        </div>
                                    )}
                                    
                                    {storageItems.map((item, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border flex flex-col gap-3 ${item.rawSize > 1000 ? 'bg-black border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-80'}`}>
                                            <div className="flex items-start gap-3 w-full">
                                                <div className={`flex-shrink-0 p-2 rounded mt-1 ${item.source === 'LocalStorage' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                    {item.source === 'LocalStorage' ? <FileText size={18} /> : <Database size={18} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-sm text-white font-bold truncate select-all">{item.key}</span>
                                                        <span className="text-[10px] bg-white/10 px-1 rounded text-gray-400">{item.source}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-mono bg-black/50 p-2 rounded border border-white/5 break-all select-all">
                                                        <span className="text-gray-500 select-none">CONTENT: </span>
                                                        {item.preview}
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Size: <span className={item.rawSize > 100000 ? 'text-yellow-400 font-bold' : ''}>{item.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 w-full">
                                                <button 
                                                    onClick={() => handleForceImport(item)}
                                                    className="flex-1 bg-white/10 hover:bg-green-600 hover:text-white text-gray-300 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Server size={14} /> IMPORT
                                                </button>
                                                <button 
                                                    onClick={() => handleDownloadRaw(item)}
                                                    className="flex-1 bg-blue-500/20 hover:bg-blue-600 hover:text-white text-blue-300 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <DownloadCloud size={14} /> RAW TXT
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
             </div>
        </div>
      )}
    </div>
  );
};
export default App;
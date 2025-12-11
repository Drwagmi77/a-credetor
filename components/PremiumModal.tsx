import React, { useState } from 'react';
import { PromptItem } from '../types';
import { X, Lock, Star, Zap, ShieldCheck, Check, Sparkles, CreditCard } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface PremiumModalProps {
  item: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

type PlanType = 'monthly' | 'yearly' | 'lifetime';

const PremiumModal: React.FC<PremiumModalProps> = ({ item, isOpen, onClose, onUpgrade }) => {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  if (!isOpen || !item) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    
    // SIMULATION OF PAYMENT PROCESS
    // In a real app, you would redirect to specific Stripe links based on selectedPlan:
    // const links = {
    //    monthly: 'https://buy.stripe.com/monthly_id',
    //    yearly: 'https://buy.stripe.com/yearly_id',
    //    lifetime: 'https://buy.stripe.com/lifetime_id'
    // };
    // window.location.href = links[selectedPlan];
    
    setTimeout(() => {
      setIsProcessing(false);
      if (onUpgrade) onUpgrade();
    }, 2000); // Fake 2 second processing time
  };

  const getButtonText = () => {
    if (selectedPlan === 'yearly') return t('btn_start_trial');
    if (selectedPlan === 'monthly') return t('btn_subscribe');
    return t('btn_buy_once');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden border border-vip/20 my-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Hero Section */}
        <div className="relative h-40 w-full">
           <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover blur-[2px] brightness-50"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
             <div className="bg-vip/20 p-2.5 rounded-full mb-2 backdrop-blur-md border border-vip/50">
                <Lock size={24} className="text-vip" />
             </div>
             <h3 className="text-lg font-bold text-white text-center">{item.title}</h3>
             <span className="text-vip font-medium text-[10px] mt-1 uppercase tracking-widest">{t('premium_subtitle')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">{t('premium_title')}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
                {t('premium_desc')}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
             <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-lg border border-white/5">
                <Star size={18} className="text-vip mb-1" />
                <span className="text-xs text-gray-300">{t('feat_styles')}</span>
             </div>
             <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-lg border border-white/5">
                <Zap size={18} className="text-vip mb-1" />
                <span className="text-xs text-gray-300">{t('feat_speed')}</span>
             </div>
             <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-lg border border-white/5">
                <ShieldCheck size={18} className="text-vip mb-1" />
                <span className="text-xs text-gray-300">{t('feat_license')}</span>
             </div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3 mb-6">
            
            {/* Yearly Plan (Best Value) */}
            <div 
                onClick={() => setSelectedPlan('yearly')}
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between group ${selectedPlan === 'yearly' ? 'border-vip bg-vip/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
            >
                {selectedPlan === 'yearly' && (
                    <div className="absolute -top-3 left-4 bg-vip text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {t('badge_best')}
                    </div>
                )}
                 {selectedPlan === 'yearly' && (
                    <div className="absolute -top-3 right-4 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {t('badge_trial')}
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPlan === 'yearly' ? 'border-vip bg-vip text-black' : 'border-gray-500'}`}>
                        {selectedPlan === 'yearly' && <Check size={12} strokeWidth={4} />}
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${selectedPlan === 'yearly' ? 'text-white' : 'text-gray-300'}`}>{t('plan_yearly')}</p>
                        <p className="text-xs text-vip font-medium">{t('text_save')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{t('price_yearly')}</p>
                    <p className="text-[10px] text-gray-400">/year</p>
                </div>
            </div>

             {/* Monthly Plan */}
             <div 
                onClick={() => setSelectedPlan('monthly')}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between ${selectedPlan === 'monthly' ? 'border-vip bg-vip/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPlan === 'monthly' ? 'border-vip bg-vip text-black' : 'border-gray-500'}`}>
                        {selectedPlan === 'monthly' && <Check size={12} strokeWidth={4} />}
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${selectedPlan === 'monthly' ? 'text-white' : 'text-gray-300'}`}>{t('plan_monthly')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{t('price_monthly')}</p>
                    <p className="text-[10px] text-gray-400">/month</p>
                </div>
            </div>

            {/* Lifetime Plan */}
             <div 
                onClick={() => setSelectedPlan('lifetime')}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between ${selectedPlan === 'lifetime' ? 'border-vip bg-vip/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPlan === 'lifetime' ? 'border-vip bg-vip text-black' : 'border-gray-500'}`}>
                        {selectedPlan === 'lifetime' && <Check size={12} strokeWidth={4} />}
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${selectedPlan === 'lifetime' ? 'text-white' : 'text-gray-300'}`}>{t('plan_lifetime')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{t('price_lifetime')}</p>
                    <p className="text-[10px] text-gray-400">once</p>
                </div>
            </div>

          </div>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full bg-vip hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl text-lg transition-all shadow-lg shadow-vip/20 flex items-center justify-center gap-2 transform active:scale-95 ${isProcessing ? 'opacity-80 cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <>
                 <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                 Processing...
              </>
            ) : (
              <>
                {selectedPlan === 'lifetime' ? <Sparkles size={20} /> : <CreditCard size={20} />}
                {getButtonText()}
              </>
            )}
          </button>
          
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="mt-4 w-full text-center text-xs text-gray-500 hover:text-white transition-colors"
          >
            {t('btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
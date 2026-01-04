import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LoadingState, AppState, ResearchData } from './types';
import { fetchGKResearch, fetchMoreData } from './services/geminiService';

// --- Components ---

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-600 text-white border-emerald-700',
    error: 'bg-rose-600 text-white border-rose-700',
    info: 'bg-slate-800 text-white border-slate-900'
  };

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  return (
    <div className={`fixed top-6 right-6 z-[200] px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in ${colors[type]} border min-w-[320px] max-w-sm`}>
      <i className={`fa-solid ${icons[type]} text-lg`}></i>
      <span className="font-medium text-sm leading-snug flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

const WhatsAppSupport = () => (
  <a
    href="https://wa.me/+918980105390"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 left-6 w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg shadow-emerald-900/20 transition-all duration-300 z-[60] hover:scale-110 flex items-center justify-center hover:bg-[#20bd5a] group"
    title="WhatsApp Support"
  >
    <i className="fa-brands fa-whatsapp text-2xl"></i>
    <span className="absolute left-14 bg-slate-800 text-white px-3 py-1.5 rounded-md shadow-xl text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      Need Help?
    </span>
  </a>
);

const SubscriptionPage: React.FC<{ 
  onUnlock: (plan: 'free' | 'premium') => void; 
  isUpgrade?: boolean;
  onClose?: () => void;
}> = ({ onUnlock, isUpgrade = false, onClose }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<{ duration: string; price: string; isFree: boolean } | null>(null);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = passkey.trim();
    if (key === 'RABARI2214') {
      onUnlock('premium');
    } else if (key === 'FREE2026') {
      onUnlock('free');
    } else {
      setError('Invalid Passkey. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const plans = [
    {
      duration: 'Free Plan',
      price: 'Free',
      features: ['Basic Study Mode', 'Topic Selection', 'Limited Access'],
      isFree: true,
      color: 'slate',
      icon: 'fa-user'
    },
    {
      duration: '1 Month',
      price: '₹99',
      features: ['Full Premium Access', 'Pro Research Mode', 'Unlimited Tests'],
      isFree: false,
      color: 'blue',
      icon: 'fa-star'
    },
    {
      duration: '6 Months',
      price: '₹499',
      features: ['Save 15%', 'All Premium Features', 'Priority Support'],
      recommended: true,
      isFree: false,
      color: 'amber',
      icon: 'fa-crown'
    },
    {
      duration: '1 Year',
      price: '₹999',
      features: ['Best Value', 'VIP Access', 'Exam Strategy Call'],
      isFree: false,
      color: 'emerald',
      icon: 'fa-gem'
    }
  ];

  // Helper to generate UPI links
  const getPaymentLinks = (priceStr: string) => {
    const amount = priceStr.replace('₹', '');
    const upiId = 'Q819244657@ybl';
    const name = 'Gujarat GK Hub';
    const params = `pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
    
    return {
      gpay: `tez://upi/pay?${params}`,
      phonepe: `phonepe://pay?${params}`,
      paytm: `paytmmp://pay?${params}`,
      generic: `upi://pay?${params}`
    };
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative ${isUpgrade ? 'fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl animate-fadeIn' : ''}`}>
      {isUpgrade && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors z-50 border border-slate-200"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      )}
      
      {!isUpgrade && <WhatsAppSupport />}
      
      {/* Payment Modal */}
      {selectedPlan && !selectedPlan.isFree && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-subtle-pop border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setSelectedPlan(null)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            <div className="text-center space-y-6 pt-2">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Complete Payment</h3>
                <p className="text-slate-500 text-sm mt-1">Plan: {selectedPlan.duration} • <span className="font-bold text-slate-900">{selectedPlan.price}</span></p>
              </div>
              
              <div className="flex justify-center">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=Q819244657@ybl%26am=${selectedPlan.price.replace('₹', '')}%26pn=Gujarat%20GK%20Hub%26cu=INR`} 
                    alt="Payment QR Code" 
                    className="w-40 h-40 mix-blend-multiply" 
                  />
                </div>
              </div>

              {/* Quick Pay Buttons */}
              <div className="grid grid-cols-3 gap-3 px-1">
                 {(() => {
                   const links = getPaymentLinks(selectedPlan.price);
                   return (
                     <>
                      <a href={links.gpay} className="flex flex-col items-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm p-2.5">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png" alt="Google Pay" className="w-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">GPay</span>
                      </a>
                      
                      <a href={links.phonepe} className="flex flex-col items-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-0.5">
                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png" alt="PhonePe" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">PhonePe</span>
                      </a>

                      <a href={links.paytm} className="flex flex-col items-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm p-1">
                             <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png" alt="Paytm" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">Paytm</span>
                      </a>
                     </>
                   );
                 })()}
              </div>

              <div className="space-y-3">
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">UPI ID</p>
                   <div className="bg-slate-100 py-2.5 px-4 rounded-lg font-mono text-slate-800 font-bold select-all border border-slate-200 flex items-center justify-between group cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => navigator.clipboard.writeText('Q819244657@ybl')}>
                     <span>Q819244657@ybl</span>
                     <i className="fa-regular fa-copy text-slate-400 group-hover:text-blue-600"></i>
                   </div>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 font-medium leading-relaxed">
                <i className="fa-solid fa-circle-info mr-1"></i>
                After payment, request your Passkey from Admin and enter it below.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full space-y-10 animate-fadeIn py-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl shadow-lg shadow-blue-900/20 mb-2">
             <i className={`fa-solid ${isUpgrade ? 'fa-crown' : 'fa-shield-halved'} text-3xl text-white`}></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            {isUpgrade ? 'Upgrade Your Prep' : 'Gujarat Police GK Hub'}
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            {isUpgrade 
              ? 'Get the edge with Deep Research, Unlimited Tests, and AI-powered insights.'
              : 'The smartest way to prepare for Constable & PSI 2026.'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 lg:px-0">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative bg-white rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-300 ${plan.recommended ? 'border-2 border-amber-400 ring-4 ring-amber-50 z-10 scale-[1.02]' : 'border border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                  Recommended
                </div>
              )}
              
              <div className="mb-4">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${plan.isFree ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                    <i className={`fa-solid ${plan.icon}`}></i>
                 </div>
                 <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider">{plan.duration}</h3>
                 <div className="mt-1 flex items-baseline gap-1">
                   <span className="text-3xl font-black text-slate-800">{plan.price}</span>
                   {!plan.isFree && <span className="text-sm text-slate-400 font-medium">/total</span>}
                 </div>
              </div>

              <div className="h-px bg-slate-100 w-full mb-4"></div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                    <i className={`fa-solid fa-check mt-0.5 text-${plan.isFree ? 'slate-400' : 'emerald-500'}`}></i>
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>

              {plan.isFree ? (
                 <button 
                    onClick={() => onUnlock('free')}
                    className="w-full py-2.5 rounded-lg font-bold text-sm transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  >
                    Activate Free Plan
                  </button>
              ) : (
                <button 
                  onClick={() => setSelectedPlan(plan as any)}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all text-white shadow-lg shadow-blue-900/10 ${plan.recommended ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-slate-900 hover:bg-black'}`}
                >
                  Choose {plan.duration}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Passkey Section */}
        <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                 <i className="fa-solid fa-key text-sm"></i>
               </div>
               <h4 className="text-base font-bold text-slate-800">Have a Passkey?</h4>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter key (e.g. FREE2026)"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-800 uppercase placeholder:normal-case placeholder:text-slate-400 text-sm"
              />
              <button 
                type="submit"
                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Unlock
              </button>
            </div>
            {error && <p className="text-rose-500 text-xs font-bold animate-pulse">{error}</p>}
            <p className="text-xs text-slate-400">
              For Free Plan use: <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">FREE2026</span>
            </p>
          </form>
        </div>

        <div className="text-center text-[10px] text-slate-400 font-medium pb-4 uppercase tracking-widest">
          Secure Platform • 2026 Exam Ready
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="animate-fadeIn w-full max-w-7xl mx-auto space-y-6">
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3 animate-shimmer"></div>
      <div className="space-y-4">
        <div className="h-4 bg-slate-50 rounded animate-shimmer w-full"></div>
        <div className="h-4 bg-slate-50 rounded animate-shimmer w-11/12"></div>
        <div className="h-4 bg-slate-50 rounded animate-shimmer w-4/5"></div>
        <div className="h-4 bg-slate-50 rounded animate-shimmer w-full"></div>
      </div>
    </div>
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex gap-4">
           <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0 animate-shimmer"></div>
           <div className="flex-1 space-y-3">
             <div className="h-5 bg-slate-100 rounded w-3/4 animate-shimmer"></div>
             <div className="h-4 bg-slate-50 rounded w-1/2 animate-shimmer"></div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20 transition-all duration-300 z-50 hover:bg-black hover:scale-110 flex items-center justify-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
    >
      <i className="fa-solid fa-arrow-up"></i>
    </button>
  );
};

const App: React.FC = () => {
  // Auth State
  const [userPlan, setUserPlan] = useState<'none' | 'free' | 'premium'>(() => {
    return (localStorage.getItem('gk_hub_user_plan') as 'none' | 'free' | 'premium') || 'none';
  });
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Progress Tracking State
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem('gk_hub_completed_topics');
    return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<AppState>({
    loading: LoadingState.IDLE,
    data: null,
    error: null,
    currentTopic: '',
    mode: 'study-flash' // Default to fast study as it's the only one free
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [copyStatus, setCopyStatus] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Reading Progress State
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  
  // Accordion State
  const [openSyllabusCategory, setOpenSyllabusCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load History from Local Storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('gkHubSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save Progress
  useEffect(() => {
    localStorage.setItem('gk_hub_completed_topics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleUnlock = (plan: 'free' | 'premium') => {
    localStorage.setItem('gk_hub_user_plan', plan);
    setUserPlan(plan);
    setShowUpgradeModal(false);
    
    if (plan === 'premium') {
      showToast('Premium Plan Unlocked!', 'success');
      const confetti = (window as any).confetti;
      if (confetti) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#fbbf24', '#10b981']
        });
      }
    } else {
      showToast('Free Plan Activated', 'info');
      // Ensure we are in a valid mode for free plan
      setState(prev => ({...prev, mode: 'study-flash'}));
    }
  };

  const checkFeatureAccess = (feature: 'pro' | 'test' | 'syllabus') => {
    if (userPlan === 'premium') return true;
    setShowUpgradeModal(true);
    return false;
  };

  const handleModeChange = (newMode: 'test' | 'study-flash' | 'study-pro') => {
    if (userPlan === 'free') {
      if (newMode === 'study-pro') {
         checkFeatureAccess('pro');
         return;
      }
      if (newMode === 'test') {
        checkFeatureAccess('test');
        return;
      }
    }
    setState(prev => ({ ...prev, mode: newMode }));
  };

  const addToHistory = (topic: string) => {
    if (!topic.trim()) return;
    setSearchHistory(prev => {
      const newHistory = [topic, ...prev.filter(t => t !== topic)].slice(0, 8);
      localStorage.setItem('gkHubSearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('gkHubSearchHistory');
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.innerText || tmp.textContent || "";
    return text.replace(/\n/g, '. ');
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Voice search not supported in this browser.", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'gu-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setState(prev => ({ ...prev, currentTopic: transcript }));
      handleSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      showToast("Could not hear you. Please try again.", "error");
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const fullSyllabus = [
    {
      title: "1. વિશ્વ અને ભારત – પરિચય",
      icon: "fa-earth-americas",
      color: "sky",
      subtopics: [
        "વિશ્વનું સામાન્ય પરિચય",
        "વિશ્વના ખંડો",
        "વિશ્વના મહાસાગરો",
        "વિશ્વના મહત્વપૂર્ણ દેશો",
        "ભારતનો પરિચય"
      ]
    },
    {
      title: "2. ઇતિહાસ (History)",
      icon: "fa-landmark",
      color: "amber",
      subtopics: [
        "2.1 ભારતનો ઇતિહાસ",
        "પ્રાગૈતિહાસિક કાળ",
        "સિંધુ ઘાટીની સંસ્કૃતિ",
        "વૈદિક કાળ",
        "મૌર્ય યુગ",
        "ગુપ્ત યુગ",
        "હર્ષવર્ધન",
        "દિલ્લી સલ્તનત",
        "મુઘલ યુગ",
        "આધુનિક ભારત",
        "1857 ની ક્રાંતિ",
        "ભારતીય સ્વાતંત્ર્ય આંદોલન",
        "મહાત્મા ગાંધી",
        "2.2 ગુજરાતનો ઇતિહાસ",
        "પ્રાચીન ગુજરાત",
        "સોલંકી યુગ",
        "ગુજરાત સલ્તનત",
        "મરાઠા શાસન",
        "બ્રિટિશ કાળ",
        "સ્વાતંત્ર્ય આંદોલનમાં ગુજરાત",
        "દાંડી યાત્રા"
      ]
    },
    {
      title: "3. ભૂગોળ (Geography)",
      icon: "fa-map-location-dot",
      color: "emerald",
      subtopics: [
        "3.1 વિશ્વનું ભૂગોળ",
        "ખંડો અને મહાસાગરો",
        "પર્વતમાળા",
        "નદીઓ",
        "રણ અને મેદાનો",
        "હવામાન પ્રદેશો",
        "વિશ્વના સમય ઝોન",
        "3.2 ભારતનું ભૂગોળ",
        "ભારતની ભૌતિક રચના",
        "હિમાલય",
        "ભારતીય નદીઓ",
        "ભારતીય હવામાન",
        "માટીના પ્રકાર",
        "કૃષિ",
        "ઉદ્યોગ",
        "પરિવહન",
        "3.3 ગુજરાતનું ભૂગોળ",
        "ભૌતિક રચના",
        "નદીઓ",
        "હવામાન",
        "કૃષિ",
        "ઉદ્યોગ",
        "બંદરો",
        "ઊર્જા સ્ત્રોત",
        "પરિવહન (ગુજરાત)",
        "અભયારણ્ય અને નેશનલ પાર્ક"
      ]
    },
    {
      title: "4. ભારતીય સંવિધાન (Indian Constitution)",
      icon: "fa-scale-balanced",
      color: "blue",
      subtopics: [
        "1. ભારતીય સંવિધાન – પરિચય",
        "2. ભારતીય સંવિધાનનો ઇતિહાસ",
        "3. સંવિધાન સભા (Constituent Assembly)",
        "4. પ્રસ્તાવના (Preamble)",
        "5. સંઘીય વ્યવસ્થા (Federal System)",
        "6. નાગરિકતા (Citizenship)",
        "7. મૂળ અધિકારો (Fundamental Rights)",
        "8. રાજ્યના માર્ગદર્શક સિદ્ધાંતો (DPSP)",
        "9. મૂળ ફરજો (Fundamental Duties)",
        "10. સંઘની કાર્યપાલિકા (President, PM)",
        "11. સંઘની વિધાનમંડળ (Parliament)",
        "12. સંઘની ન્યાયપાલિકા (Supreme Court)",
        "13. રાજ્ય સરકાર (State Govt)",
        "14. ઉચ્ચ ન્યાયાલય (High Court)",
        "15. સ્થાનિક સ્વરાજ્ય (Panchayati Raj)",
        "16. બંધારણીય સંસ્થાઓ (EC, UPSC, CAG)",
        "17. આપાતકાલીન જોગવાઈઓ (Emergency)",
        "18. સંવિધાનમાં સુધારા (Amendments)",
        "19. વિશેષ જોગવાઈઓ (SC/ST/Minorities)",
        "20. અનુસૂચિઓ (Schedules)"
      ]
    },
    {
      title: "5. અર્થવ્યવસ્થા (Economy)",
      icon: "fa-indian-rupee-sign",
      color: "indigo",
      subtopics: [
        "ભારતીય અર્થવ્યવસ્થાનો પરિચય",
        "કૃષિ ક્ષેત્ર",
        "ઉદ્યોગ ક્ષેત્ર",
        "સેવા ક્ષેત્ર",
        "રાષ્ટ્રીય આવક",
        "બજેટ",
        "કર પ્રણાલી",
        "બેંકિંગ અને RBI",
        "મોંઘવારી",
        "ગરીબી",
        "બેરોજગારી",
        "સરકારી યોજનાઓ",
        "ગુજરાતની આર્થિક યોજનાઓ"
      ]
    },
    {
      title: "6. સામાન્ય વિજ્ઞાન (General Science)",
      icon: "fa-flask",
      color: "cyan",
      subtopics: [
        "6.1 ભૌતિક વિજ્ઞાન: ગતિ, ઊર્જા, પ્રકાશ, વિદ્યુત, ધ્વનિ",
        "6.2 રસાયણ વિજ્ઞાન: તત્વો, સંયોજનો, આયર્ન-ક્ષાર, ધાતુ-અધાતુ",
        "6.3 જીવ વિજ્ઞાન: માનવ શરીર, રોગો, પોષણ, વનસ્પતિ",
        "દૈનિક જીવનમાં વિજ્ઞાન",
        "One Liner Science Facts"
      ]
    },
    {
      title: "7. પર્યાવરણ અને ઇકોલોજી",
      icon: "fa-leaf",
      color: "green",
      subtopics: [
        "પર્યાવરણ અને પરિસ્થિતિ તંત્ર",
        "જલવાયુ પરિવર્તન",
        "પ્રદૂષણ",
        "વન સંરક્ષણ",
        "વન્યજીવન",
        "પર્યાવરણ કાયદા"
      ]
    },
    {
      title: "8. કમ્પ્યુટર અને ટેકનોલોજી",
      icon: "fa-computer",
      color: "slate",
      subtopics: [
        "કમ્પ્યુટર પરિચય",
        "હાર્ડવેર અને સોફ્ટવેર",
        "ઇન્ટરનેટ અને ઇ-ગવર્નન્સ",
        "AI અને નવી ટેકનોલોજી",
        "સાયબર સુરક્ષા"
      ]
    },
    {
      title: "9. રમતગમત (Sports)",
      icon: "fa-medal",
      color: "orange",
      subtopics: [
        "રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય રમતગમત",
        "કપ અને ટ્રોફી",
        "ખેલાડીઓ",
        "રમતગમત પુરસ્કારો"
      ]
    },
    {
      title: "10. પુરસ્કાર અને સન્માન",
      icon: "fa-award",
      color: "yellow",
      subtopics: [
        "ભારત રત્ન",
        "પદ્મ પુરસ્કાર",
        "રાષ્ટ્રીય પુરસ્કારો",
        "આંતરરાષ્ટ્રીય પુરસ્કારો"
      ]
    },
    {
      title: "11. વર્તમાન પ્રવાહ (Current Affairs 2026)",
      icon: "fa-newspaper",
      color: "rose",
      subtopics: [
        "1. રાષ્ટ્રીય વર્તમાન પ્રવાહ (National CA)",
        "2. રાજ્ય વર્તમાન પ્રવાહ – ગુજરાત (Gujarat CA)",
        "3. આંતરરાષ્ટ્રીય વર્તમાન પ્રવાહ (International CA)",
        "4. અર્થવ્યવસ્થા અને નાણાકીય સમાચાર",
        "5. વિજ્ઞાન અને ટેકનોલોજી",
        "6. પર્યાવરણ અને જલવાયુ",
        "7. રમતગમત વર્તમાન પ્રવાહ",
        "8. પુરસ્કાર અને સન્માન",
        "9. નિમણૂકો અને રાજીનામા",
        "10. અવસાન (Obituary)",
        "11. મહત્વપૂર્ણ દિવસો અને થીમ",
        "12. સંસ્થાઓ અને મુખ્યાલય",
        "13. અહેવાલ, ઇન્ડેક્સ અને રેન્કિંગ",
        "14. સંક્ષેપ શબ્દો (Abbreviations)",
        "15. વિવિધ વર્તમાન વિષયો (Books, Places, Culture)"
      ]
    },
    {
      title: "12. વિવિધ સામાન્ય જ્ઞાન (Misc GK)",
      icon: "fa-clipboard-list",
      color: "teal",
      subtopics: [
        "મહત્વપૂર્ણ પુસ્તક અને લેખક",
        "મહત્વપૂર્ણ સ્થળો",
        "સંક્ષેપ શબ્દો (Abbreviations)",
        "ઉપનામ",
        "મહત્વપૂર્ણ સૂત્રો",
        "રાષ્ટ્રીય ચિહ્નો",
        "મહત્વપૂર્ણ દિવસો (Important Days)",
        "સંસ્થાઓ અને મુખ્યાલય (Organizations)"
      ]
    },
    {
      title: "13. કાયદા અને પોલીસ કામગીરી (Law & Police Dept)",
      icon: "fa-gavel",
      color: "red",
      subtopics: [
        "પોલીસ વિભાગની રચના અને પદાનુક્રમ",
        "પોલીસની ફરજો અને સત્તાઓ",
        "IPC (ભારતીય દંડ સંહિતા)",
        "CrPC (ફોજદારી કાર્યરીતિ અધિનિયમ)",
        "Evidence Act (પુરાવા અધિનિયમ)",
        "માનવ અધિકારો અને પોલીસ",
        "પોલીસ વર્તન અને શિસ્ત",
        "ટ્રાફિક કાયદા",
        "સાયબર ક્રાઈમ કાયદા",
        "મહિલા અને બાળ સુરક્ષા કાયદા"
      ]
    },
    {
      title: "14. તર્કશક્તિ (Reasoning - Niraj Bharvad)",
      icon: "fa-brain",
      color: "violet",
      subtopics: [
        "13. તર્કશક્તિ પરિચય",
        "14. ઉપમા (Analogy)",
        "15. શ્રેણી (Series)",
        "16. વર્ગીકરણ (Classification)",
        "17. કોડિંગ–ડિકોડિંગ",
        "18. દિશા જ્ઞાન (Direction Sense)",
        "19. લોહી સંબંધ (Blood Relation)",
        "20. બેઠકોની વ્યવસ્થા (Seating Arrangement)",
        "21. સિલોગિઝમ (Syllogism)",
        "22. નિવેદન અને અનુમાન (Statement & Assumption)",
        "23. ક્રમ અને સ્થાન (Order & Ranking)",
        "24. પઝલ (Puzzle)",
        "25. આકૃતિ આધારિત તર્ક (Non-Verbal Reasoning)"
      ]
    },
    {
      title: "15. ગણિત (Mathematics - Niraj Bharvad)",
      icon: "fa-calculator",
      color: "fuchsia",
      subtopics: [
        "1. સંખ્યા પદ્ધતિ (Number System)",
        "2. સરવાળો, બાદબાકી, ગુણાકાર, ભાગાકાર",
        "3. ટકા (Percentage)",
        "4. અનુપાત અને પ્રમાણ (Ratio & Proportion)",
        "5. નફો અને નુકસાન (Profit & Loss)",
        "6. વ્યાજ (Interest)",
        "7. સરેરાશ (Average)",
        "8. સમય અને કામ (Time & Work)",
        "9. સમય અને ઝડપ (Time & Speed)",
        "10. ક્ષેત્રફળ અને પરિમિતિ (Mensuration)",
        "11. માપ અને એકમો (Units & Measurements)",
        "12. આંકડાશાસ્ત્ર (Data Interpretation)"
      ]
    },
    {
      title: "16. ગુજરાત સાંસ્કૃતિક વારસો (Gujarat Culture)",
      icon: "fa-om",
      color: "pink",
      subtopics: [
        "ગુજરાતની સંસ્કૃતિ - પરિચય",
        "લોકનૃત્ય અને નાટ્યકળા",
        "લોકસાહિત્ય અને ભવાઈ",
        "ગુજરાતના મેળા અને ઉત્સવો",
        "ગુજરાતના સંતો અને મહાનુભાવો",
        "ગુજરાતી ભાષા અને બોલીઓ",
        "સ્થાપત્ય અને શિલ્પકળા"
      ]
    },
    {
      title: "17. PSI મેઇન્સ (Descriptive Writing)",
      icon: "fa-pen-to-square",
      color: "lime",
      subtopics: [
        "ગુજરાતી નિબંધ લેખન",
        "વર્ણનાત્મક લેખન પદ્ધતિ",
        "ભાષા શુદ્ધિ અને વ્યાકરણ",
        "રિપોર્ટ રાઇટિંગ",
        "પત્ર લેખન"
      ]
    },
    {
      title: "18. અગાઉના પ્રશ્નપત્રો (PYQ Analysis)",
      icon: "fa-file-circle-question",
      color: "gray",
      subtopics: [
        "PSI પ્રિલિમ્સ પેપર વિશ્લેષણ",
        "Constable પેપર વિશ્લેષણ",
        "Cut-off Analysis",
        "વારંવાર પૂછાતા પ્રશ્નો (Repeated Topics)"
      ]
    }
  ];

  const syllabusTopics = [
    { title: 'ગુજરાતનો ઈતિહાસ', icon: 'fa-landmark', query: 'ગુજરાતનો ઈતિહાસ અને સંસ્કૃતિ' },
    { title: 'ગુજરાતની ભૂગોળ', icon: 'fa-map-location-dot', query: 'ગુજરાતની ભૌગોલિક સ્થિતિ અને વિશેષતાઓ' },
    { title: 'ભારતનું બંધારણ', icon: 'fa-scale-balanced', query: 'ભારતનું બંધારણ અને આમુખ' },
    { title: 'કાયદો (IPC/CRPC)', icon: 'fa-gavel', query: 'IPC, CRPC અને Evidence Act કાયદાની કલમો' },
    { title: 'સામાન્ય વિજ્ઞાન', icon: 'fa-flask', query: 'સામાન્ય વિજ્ઞાન અને ટેકનોલોજી' },
    { title: 'રીઝનિંગ', icon: 'fa-brain', query: 'તાર્કિક કસોટી અને બુદ્ધિક્ષમતા (Reasoning)' },
    { title: 'ગણિત (Maths)', icon: 'fa-calculator', query: 'સામાન્ય ગણિત અને અંકગણિત' },
    { title: 'કમ્પ્યુટર', icon: 'fa-computer', query: 'કમ્પ્યુટર એક પરિચય અને ઉપયોગો' },
    { title: 'વર્તમાન પ્રવાહો', icon: 'fa-newspaper', query: 'તાજેતરના વર્તમાન પ્રવાહો (Current Affairs)' },
    { title: 'ગુજરાતી સાહિત્ય', icon: 'fa-pen-nib', query: 'ગુજરાતી સાહિત્યકાર અને કૃતિઓ' },
    { title: 'રમત ગમત', icon: 'fa-medal', query: 'રમત ગમત અને પુરસ્કારો' },
    { title: 'મનોવિજ્ઞાન', icon: 'fa-user-gear', query: 'સામાન્ય મનોવિજ્ઞાન (Psychology)' },
    { title: 'સમાજશાસ્ત્ર', icon: 'fa-users', query: 'સમાજશાસ્ત્ર પરિચય' },
    { title: 'પંચાયતી રાજ', icon: 'fa-building-columns', query: 'પંચાયતી રાજ વ્યવસ્થા' },
    { title: 'પર્યાવરણ', icon: 'fa-leaf', query: 'પર્યાવરણ અને પ્રદૂષણ' },
    { title: 'સાંસ્કૃતિક વારસો', icon: 'fa-om', query: 'ગુજરાતનો સાંસ્કૃતિક વારસો' },
  ];

  const importantChapters = [
    { title: 'IPC મહત્વની કલમો', desc: 'Law IMP', icon: 'fa-scale-balanced', query: 'IPC ની સૌથી મહત્વની કલમો અને સજા' },
    { title: 'ગુજરાતના જિલ્લા', desc: 'Geography', icon: 'fa-map', query: 'ગુજરાતના તમામ જિલ્લા અને વિશેષતાઓ' },
    { title: 'સોલંકી વંશ', desc: 'History', icon: 'fa-crown', query: 'સોલંકી વંશ - ગુજરાતનો સુવર્ણ યુગ' },
    { title: 'મહાગુજરાત આંદોલન', desc: 'History', icon: 'fa-people-group', query: 'મહાગુજરાત આંદોલન અને ઇન્દુલાલ યાજ્ઞિક' },
    { title: 'કમ્પ્યુટર શોર્ટકટ કી', desc: 'Computer', icon: 'fa-keyboard', query: 'કમ્પ્યુટર શોર્ટકટ કી અને ફૂલ ફોર્મ' },
    { title: 'ભારતના રાષ્ટ્રપતિ', desc: 'Constitution', icon: 'fa-user-tie', query: 'ભારતના રાષ્ટ્રપતિ - કલમો અને સત્તા' },
    { title: 'સાહિત્ય અકાદમી', desc: 'Literature', icon: 'fa-book', query: 'ગુજરાતી સાહિત્ય અકાદમી અને પુરસ્કારો' },
    { title: 'રોગ અને વિટામિન', desc: 'Science', icon: 'fa-dna', query: 'વિજ્ઞાન - રોગો, વિટામિન અને શોધ' },
  ];

  const stats = useMemo(() => {
    if (!state.data) return { correct: 0, total: 0, answered: 0 };
    const answeredCount = Object.keys(selectedAnswers).length;
    let correctCount = 0;
    state.data.mcqs.forEach((mcq, idx) => {
      const correctAns = mcq.correctAnswer || "";
      const isMatch = selectedAnswers[idx] === correctAns;
      const optionIndex = ['A', 'B', 'C', 'D'].indexOf(correctAns.trim().toUpperCase());
      const isIndexMatch = optionIndex !== -1 && mcq.options[optionIndex] === selectedAnswers[idx];
      if (isMatch || isIndexMatch) correctCount++;
    });
    return { correct: correctCount, total: state.data.mcqs.length, answered: answeredCount };
  }, [selectedAnswers, state.data]);

  const handleSearch = async (topicOverride?: string) => {
    const topicToSearch = topicOverride || state.currentTopic;
    if (!topicToSearch.trim()) return;

    setState(prev => ({ ...prev, loading: LoadingState.RESEARCHING, error: null, data: null, currentTopic: topicToSearch }));
    setSelectedAnswers({});
    setShowExplanations({});
    addToHistory(topicToSearch);
    
    // Mark as completed
    if (!completedTopics.includes(topicToSearch)) {
      setCompletedTopics(prev => [...prev, topicToSearch]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await fetchGKResearch(topicToSearch, state.mode);
      setState(prev => ({ ...prev, loading: LoadingState.COMPLETED, data: result }));
      // Small delay to ensure DOM is ready before scrolling
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: LoadingState.ERROR, error: err.message }));
      showToast(err.message, 'error');
    }
  };

  const handleLoadMore = useCallback(async () => {
    if (!state.data || isLoadingMore) return;
    setIsLoadingMore(true);
    const previousCount = state.data.mcqs.length;

    try {
      let context: string[] = [];
      if (state.mode.startsWith('study') && state.data.studyNotes) {
         const tempDiv = document.createElement('div');
         tempDiv.innerHTML = state.data.studyNotes;
         const text = tempDiv.innerText || "";
         context = [text];
      } else if (state.data.mcqs) {
         context = state.data.mcqs.map(q => q.question);
      }

      const moreData = await fetchMoreData(state.currentTopic, state.mode, context);
      
      setState(prev => {
        if (!prev.data) return prev;
        let newStudyNotes = prev.data.studyNotes || "";
        let newMcqs = prev.data.mcqs || [];

        if (state.mode.startsWith('study') && moreData.studyNotes) {
          newStudyNotes += `
            <div class="relative py-12 flex items-center justify-center select-none">
               <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200 border-dashed"></div></div>
               <div class="relative bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 rounded-full border border-slate-200 py-1.5 shadow-sm">
                 <i class="fa-solid fa-arrow-down text-blue-500"></i> Continued
               </div>
            </div>
            ${moreData.studyNotes}
          `;
        }
        if (state.mode === 'test' && moreData.mcqs) {
           const existingSet = new Set(newMcqs.map(m => m.question.trim()));
           const uniqueIncoming = moreData.mcqs.filter(m => !existingSet.has(m.question.trim()));
           newMcqs = [...newMcqs, ...uniqueIncoming];
        }
        return { ...prev, data: { ...prev.data, studyNotes: newStudyNotes, mcqs: newMcqs } };
      });

      if (state.mode === 'test' && moreData.mcqs && moreData.mcqs.length > 0) {
        setTimeout(() => {
          const firstNewQuestionId = `q-${previousCount}`;
          const el = document.getElementById(firstNewQuestionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } catch (e: any) {
      if (state.mode === 'test') {
        showToast("Error loading more data.", 'error');
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [state.data, state.currentTopic, state.mode, isLoadingMore]);

  // Update Reading Progress & Auto Load at 20%
  useEffect(() => {
    const updateProgress = () => {
      if (state.data?.type.startsWith('study')) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop > 0 ? (scrollTop / docHeight) * 100 : 0;
        const currentProgress = Math.min(100, Math.max(0, scrollPercent));
        
        setReadingProgress(currentProgress);

        // Auto load if passed 20% and not already loading
        if (currentProgress > 20 && !isLoadingMore) {
           handleLoadMore();
        }
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, [state.data, isLoadingMore, handleLoadMore]);

  // Infinite Scroll Effect for Study Mode (Keep as fallback)
  useEffect(() => {
    if (!state.mode.startsWith('study') || !state.data) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '800px' } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [state.mode, state.data, isLoadingMore, handleLoadMore]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-content');
    if (!element) return;
    
    const filename = `${state.currentTopic.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Study_Material'}_Notes.pdf`;

    const opt = {
      margin:       10,
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const html2pdf = (window as any).html2pdf;
    if(html2pdf) {
        const btn = document.getElementById('pdf-btn-icon');
        if(btn) btn.className = "fa-solid fa-circle-notch fa-spin text-lg";
        
        html2pdf().set(opt).from(element).save().then(() => {
            if(btn) btn.className = "fa-solid fa-file-arrow-down text-lg";
            showToast("PDF Downloaded Successfully", 'success');
        }).catch((err: any) => {
            console.error(err);
            if(btn) btn.className = "fa-solid fa-triangle-exclamation text-lg";
             showToast("PDF Generation Failed.", 'error');
        });
    } else {
        showToast("PDF generator not ready.", 'error');
    }
  };

  const handleAnswerSelect = (index: number, option: string) => {
    if (showExplanations[index]) return;
    setSelectedAnswers(prev => ({ ...prev, [index]: option }));
    setShowExplanations(prev => ({ ...prev, [index]: true }));
  };

  const copyToClipboard = () => {
    if (!state.data) return;
    let text = "";
    if (state.data.type.startsWith('study') && state.data.studyNotes) {
        text = `Subject: ${state.currentTopic}\n\n${stripHtml(state.data.studyNotes)}`;
    } else {
        text = `Subject: ${state.currentTopic}\n\nSummary:\n${state.data.summary}\n\nQuestions:\n${state.data.mcqs.map((m, i) => `${i+1}. ${m.question}\nAnswer: ${m.correctAnswer}\nExplanation: ${m.explanation}\n`).join('\n')}`;
    }
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    showToast("Content Copied", 'success');
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const resetSearch = () => {
    setState(prev => ({ ...prev, loading: LoadingState.IDLE, data: null, currentTopic: '' }));
  };

  if (userPlan === 'none') {
    return <SubscriptionPage onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Upgrade Modal Overlay */}
      {showUpgradeModal && (
        <SubscriptionPage 
          onUnlock={handleUnlock} 
          isUpgrade={true} 
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Watermark */}
      <div className="fixed top-0 left-0 z-[100] pointer-events-none opacity-50">
        <div className="bg-white/80 backdrop-blur-[2px] px-2 py-0.5 rounded-br-lg border-r border-b border-slate-200">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
            Platform by Sahil Desai
          </span>
        </div>
      </div>

      <BackToTop />
      <WhatsAppSupport />
      
      {/* Navigation Bar - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetSearch}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-slate-900 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
               <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                Gujarat Police <span className="text-blue-700">2026</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">GK Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Plan Badge */}
             <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${userPlan === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               <i className={`fa-solid ${userPlan === 'premium' ? 'fa-crown' : 'fa-user'} text-[10px]`}></i> 
               {userPlan === 'premium' ? 'Premium' : 'Free Plan'}
             </div>
             
             {userPlan === 'free' && (
               <button 
                 onClick={() => setShowUpgradeModal(true)}
                 className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-black transition-all shadow-md shadow-slate-900/10 hover:shadow-lg"
               >
                 Upgrade
               </button>
             )}

            {state.data && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                 {/* Mobile Sidebar Toggle */}
                 <button 
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                   className="lg:hidden w-9 h-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors"
                 >
                   <i className="fa-solid fa-bars"></i>
                 </button>

                 <button 
                  onClick={resetSearch}
                  className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors"
                  title="New Search"
                >
                  <i className="fa-solid fa-house"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Reading Progress Bar (Sticky under Nav) */}
      {state.data && state.data.type.startsWith('study') && (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
           <div className="h-1 bg-slate-100 w-full">
              <div 
                className="h-full bg-blue-600 transition-all duration-200 ease-out"
                style={{ width: `${readingProgress}%` }}
              ></div>
           </div>
           <div className="container mx-auto px-4 h-10 flex items-center justify-between text-xs font-medium text-slate-500">
              <div className="truncate pr-4 flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${state.data.type === 'study-pro' ? 'bg-purple-500' : 'bg-amber-500'}`}></span>
                 {state.currentTopic}
              </div>
              <div className="whitespace-nowrap tabular-nums">{Math.round(readingProgress)}% Read</div>
           </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        
        {/* IDLE STATE: Hero & Search */}
        {state.loading === LoadingState.IDLE && (
          <div className="max-w-5xl mx-auto space-y-16 animate-fadeIn pb-12">
            
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-8 pb-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/40 via-purple-100/40 to-amber-100/40 rounded-full blur-[120px] -z-10"></div>
              
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Master Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700">Preparation</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                Select a mode to generate AI-powered study materials, deep research notes, or real-time mock tests.
              </p>
            </div>

            {/* Mode Toggle Cards */}
            <div className="grid md:grid-cols-3 gap-5 px-2">
              
              {/* Fast Study */}
              <button
                onClick={() => handleModeChange('study-flash')}
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 group hover:-translate-y-1 relative overflow-hidden ${state.mode === 'study-flash' ? 'bg-white border-amber-400 shadow-xl shadow-amber-100 ring-4 ring-amber-50/50' : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-lg'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1 transition-colors ${state.mode === 'study-flash' ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600'}`}>
                   <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-800">Fast Study</div>
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1.5">~10 Seconds</div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Quick summaries & key facts.</p>
                </div>
              </button>

              {/* Pro Research */}
              <button
                onClick={() => handleModeChange('study-pro')}
                className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 group hover:-translate-y-1 overflow-hidden ${state.mode === 'study-pro' ? 'bg-white border-purple-500 shadow-xl shadow-purple-100 ring-4 ring-purple-50/50' : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-lg'}`}
              >
                {userPlan === 'free' && (
                  <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 text-xs">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1 transition-colors ${state.mode === 'study-pro' ? 'bg-purple-100 text-purple-700' : 'bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
                   <i className="fa-solid fa-microscope"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-800">Pro Research</div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1.5">~60+ Seconds</div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Deep, detailed analysis.</p>
                </div>
              </button>
              
              {/* Test Mode */}
              <button
                onClick={() => handleModeChange('test')}
                className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 group hover:-translate-y-1 overflow-hidden ${state.mode === 'test' ? 'bg-white border-blue-500 shadow-xl shadow-blue-100 ring-4 ring-blue-50/50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
              >
                {userPlan === 'free' && (
                  <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 text-xs">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1 transition-colors ${state.mode === 'test' ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                   <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-800">Take Test</div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">~15 Seconds</div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Generate 30 live MCQs.</p>
                </div>
              </button>
            </div>

            {/* Main Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="relative bg-white shadow-xl shadow-slate-200/50 rounded-2xl z-20 transition-shadow group-hover:shadow-2xl group-hover:shadow-slate-200">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-magnifying-glass text-lg"></i>
                </div>
                <input
                  type="text"
                  value={state.currentTopic}
                  onChange={(e) => setState(prev => ({ ...prev, currentTopic: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    state.mode === 'test' ? "Type a topic for Mock Test..." :
                    state.mode === 'study-pro' ? "Type a topic for Deep Research..." :
                    "Type a topic to study..."
                  }
                  className="w-full pl-14 pr-32 py-5 rounded-2xl text-lg bg-transparent border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
                />
                <div className="absolute inset-y-2 right-2 flex items-center gap-1.5">
                   <button
                    onClick={startVoiceSearch}
                    className={`p-3 rounded-xl transition-all duration-200 ${isListening ? 'bg-rose-50 text-rose-500 animate-pulse' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                  >
                    <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
                  </button>
                  <button 
                    onClick={() => handleSearch()}
                    className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 text-sm"
                  >
                    Start
                  </button>
                </div>
              </div>
              
              {/* Search History Chips */}
              {searchHistory.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fadeIn">
                  {searchHistory.map((term, idx) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-clock-rotate-left text-[10px] opacity-50"></i>
                      {term}
                    </button>
                  ))}
                  <button onClick={clearHistory} className="text-slate-300 hover:text-rose-500 text-xs px-2 transition-colors" title="Clear History">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Access Grids */}
            <div className="max-w-5xl mx-auto space-y-12">

              {/* Quick Topics */}
              <div className="animate-slideUp" style={{animationDelay: '0.05s'}}>
                 <div className="flex items-center gap-4 mb-6">
                   <span className="h-px bg-slate-200 flex-1"></span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2">Popular Subjects</span>
                   <span className="h-px bg-slate-200 flex-1"></span>
                 </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {syllabusTopics.map((topic) => (
                    <button 
                      key={topic.title}
                      onClick={() => handleSearch(topic.query)}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                    >
                        <div className={`text-xl mb-2 transition-colors ${state.mode.startsWith('study') ? 'text-amber-500' : 'text-blue-500'}`}>
                          <i className={`fa-solid ${topic.icon}`}></i>
                        </div>
                        <div className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">{topic.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus Accordion */}
              <div className="animate-slideUp" style={{animationDelay: '0.1s'}}>
                 <div className="flex items-center gap-4 mb-6">
                   <span className="h-px bg-slate-200 flex-1"></span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 flex items-center gap-2">
                     Full Syllabus {userPlan === 'free' && <i className="fa-solid fa-lock text-[10px]"></i>}
                   </span>
                   <span className="h-px bg-slate-200 flex-1"></span>
                 </div>

                 <div className="grid gap-3">
                   {fullSyllabus.map((subject, idx) => {
                     const isOpen = openSyllabusCategory === subject.title;
                     return (
                       <div key={idx} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? `border-blue-200 shadow-sm ring-1 ring-blue-50` : 'border-slate-200 hover:border-slate-300'}`}>
                         <button
                           onClick={() => {
                             if (checkFeatureAccess('syllabus')) {
                               setOpenSyllabusCategory(isOpen ? null : subject.title);
                             }
                           }}
                           className="w-full p-4 flex items-center justify-between text-left group"
                         >
                           <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${isOpen ? `bg-blue-50 text-blue-600` : `bg-slate-100 text-slate-400 group-hover:text-slate-600`}`}>
                               <i className={`fa-solid ${subject.icon}`}></i>
                             </div>
                             <span className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                               {subject.title}
                             </span>
                           </div>
                           <div className="flex items-center gap-3">
                             {userPlan === 'free' && <i className="fa-solid fa-lock text-slate-300 text-xs"></i>}
                             <i className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}></i>
                           </div>
                         </button>
                         
                         <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                           <div className="p-2 pb-4 pl-[3.5rem] pr-4 grid gap-1">
                             {subject.subtopics.map((subtopic, sIdx) => {
                               const isCompleted = completedTopics.includes(subtopic);
                               return (
                                 <button
                                   key={sIdx}
                                   onClick={() => handleSearch(subtopic)}
                                   className="w-full text-left py-2 px-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium text-xs md:text-sm flex items-center justify-between group/item transition-colors border border-transparent hover:border-slate-100"
                                 >
                                   <div className="flex items-center gap-2.5">
                                     <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'} group-hover/item:bg-blue-400`}></div>
                                     {subtopic}
                                   </div>
                                   {isCompleted && <i className="fa-solid fa-check text-emerald-500 text-xs"></i>}
                                 </button>
                               );
                             })}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
            </div>

          </div>
        )}

        {/* LOADING STATE */}
        {state.loading === LoadingState.RESEARCHING && (
          <div className="max-w-4xl mx-auto pt-10">
            <div className="text-center mb-12">
              <div className="inline-block p-4 rounded-full bg-white shadow-lg mb-6 relative">
                 <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                 <i className={`fa-solid ${state.mode === 'test' ? 'fa-file-signature' : 'fa-brain'} text-2xl text-blue-600`}></i>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                {state.mode === 'test' ? 'Setting Exam Paper...' : 
                 state.mode === 'study-pro' ? 'Conducting Deep Research...' : 
                 'Analyzing Topic...'}
              </h2>
              <p className="text-slate-500 text-sm">
                {state.mode === 'test' ? 'Curating relevant questions from verified sources.' : 
                 state.mode === 'study-pro' ? 'Gathering detailed facts, dates, and analysis (~60s).' :
                 'Generating concise study notes (~10s).'}
              </p>
            </div>
            <SkeletonLoader />
          </div>
        )}

        {/* ERROR STATE */}
        {state.loading === LoadingState.ERROR && (
          <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-2xl shadow-lg border border-rose-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Generation Failed</h3>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">{state.error}</p>
            <button 
              onClick={resetSearch}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* COMPLETED STATE: Data Display */}
        {state.data && (
          <div className="flex flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto animate-slideUp relative" ref={resultsRef}>
            
            {/* Sidebar / Drawer */}
            <div className={`fixed inset-y-0 left-0 z-[60] w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none lg:bg-transparent lg:w-72 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              
              <div className="h-full flex flex-col p-5 lg:p-0">
                 {/* Mobile Header in Drawer */}
                 <div className="lg:hidden flex items-center justify-between mb-6">
                    <span className="font-bold text-slate-800">Menu</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                 </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:sticky lg:top-24 flex-1 lg:flex-none overflow-y-auto">
                  {state.data.type === 'test' ? (
                    <>
                      <div className="text-center mb-6 pb-6 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Score</div>
                        <div className="flex items-baseline justify-center gap-1">
                           <span className="text-4xl font-black text-slate-800">{stats.correct}</span>
                           <span className="text-lg text-slate-400 font-medium">/ {stats.total}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase">Question Map</span>
                          <span className="text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-500">{stats.answered} Attempted</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                          {state.data.mcqs.map((mcq, idx) => {
                            const isCorrect = selectedAnswers[idx] === mcq.correctAnswer;
                            const isAnswered = selectedAnswers[idx] !== undefined;
                            const correctAns = mcq.correctAnswer || "";
                            const optionIndex = ['A', 'B', 'C', 'D'].indexOf(correctAns.trim().toUpperCase());
                            const isIndexMatch = optionIndex !== -1 && mcq.options[optionIndex] === selectedAnswers[idx];
                            const isActuallyCorrect = isCorrect || isIndexMatch;

                            let bgClass = "bg-slate-50 text-slate-400 border border-slate-100";
                            if (isAnswered) {
                              bgClass = isActuallyCorrect ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" : "bg-rose-500 text-white border-rose-600 shadow-sm";
                            }
                            return (
                              <a 
                                key={idx} 
                                href={`#q-${idx}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  document.getElementById(`q-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  setIsSidebarOpen(false);
                                }}
                                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-105 ${bgClass}`}
                              >
                                {idx + 1}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                       <div className="text-center pb-4 border-b border-slate-100">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mx-auto mb-3 shadow-sm ${state.data.type === 'study-pro' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}>
                              <i className={`fa-solid ${state.data.type.startsWith('study') ? 'fa-book-open' : 'fa-bolt'}`}></i>
                          </div>
                          <h3 className="font-bold text-slate-800 text-base">
                            {state.data.type === 'study-pro' ? 'Research Mode' : 'Fast Study'}
                          </h3>
                       </div>
                       <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-800 leading-relaxed font-medium">
                         <i className="fa-solid fa-circle-info mr-1.5"></i>
                         AI Generated Content. Verify with standard books.
                       </div>
                    </div>
                  )}
                  
                  {state.data.sources && state.data.sources.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-100">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">References</h4>
                       <ul className="space-y-2">
                         {state.data.sources.map((source, idx) => (
                           <li key={idx}>
                             <a 
                               href={source.uri} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-slate-50 truncate border border-transparent hover:border-slate-200"
                             >
                               <i className="fa-solid fa-link text-[10px] text-slate-300"></i>
                               <span className="truncate">{source.title}</span>
                             </a>
                           </li>
                         ))}
                       </ul>
                     </div>
                  )}
                  
                  <button 
                    onClick={resetSearch}
                    className="w-full mt-6 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all shadow-md hover:shadow-lg"
                  >
                    New Search
                  </button>
                </div>
              </div>
            </div>
            
            {/* Backdrop for Mobile Sidebar */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 pb-20">
              
              {/* Content Paper/Card */}
              <div 
                id="printable-content"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                
                {/* Content Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${state.data.type === 'test' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {state.data.type === 'study-pro' ? 'Deep Research' : state.data.type === 'study-flash' ? 'Study Notes' : 'Mock Test'}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{state.currentTopic}</h2>
                  </div>
                  
                  <div className="flex items-center gap-2" data-html2canvas-ignore="true">
                    {state.data.type.startsWith('study') && (
                      <button 
                        onClick={handleDownloadPDF}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm"
                        title="Download PDF"
                      >
                        <i id="pdf-btn-icon" className="fa-solid fa-file-arrow-down"></i>
                      </button>
                    )}
                    <button 
                      onClick={copyToClipboard}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm"
                      title="Copy"
                    >
                      <i className={`fa-solid ${copyStatus ? 'fa-check' : 'fa-copy'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-10">
                  {state.data.type.startsWith('study') && state.data.studyNotes ? (
                     <div className="study-content prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
                        <div dangerouslySetInnerHTML={{ __html: state.data.studyNotes }} />
                     </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      {state.data.summary.split('\n').map((line, i) => (
                        <p key={i} className="text-slate-600 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MCQ Section */}
              {state.data.type === 'test' && state.data.mcqs.length > 0 && (
                <div className="mt-8 space-y-4">
                  {state.data.mcqs.map((mcq, idx) => (
                    <div 
                      key={idx} 
                      id={`q-${idx}`}
                      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 scroll-mt-32"
                    >
                      <div className="flex gap-4 mb-5">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm">
                          {idx + 1}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 pt-0.5">
                          {mcq.question}
                        </h3>
                      </div>

                      <div className="grid gap-2.5 pl-0 md:pl-12">
                        {mcq.options.map((option, oIdx) => {
                          const isSelected = selectedAnswers[idx] === option;
                          const hasAnswered = showExplanations[idx];
                          const correctAns = mcq.correctAnswer || "";
                          const optionIndex = ['A', 'B', 'C', 'D'].indexOf(correctAns.trim().toUpperCase());
                          const isIndexMatch = optionIndex !== -1 && mcq.options[optionIndex] === selectedAnswers[idx];
                          const isThisOptionCorrect = option === mcq.correctAnswer || isIndexMatch;

                          let btnClass = "w-full text-left p-3.5 rounded-lg border transition-all duration-200 flex items-center justify-between group relative ";
                          
                          if (hasAnswered) {
                            if (isThisOptionCorrect) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900";
                            else if (isSelected) btnClass += "bg-rose-50 border-rose-500 text-rose-900";
                            else btnClass += "bg-white border-slate-100 text-slate-400 opacity-60";
                          } else {
                            btnClass += "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={hasAnswered}
                              onClick={() => handleAnswerSelect(idx, option)}
                              className={btnClass}
                            >
                              <span className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${isSelected || (hasAnswered && isThisOptionCorrect) ? 'bg-white/50 text-inherit' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
                                  {['A', 'B', 'C', 'D'][oIdx]}
                                </span>
                                <span className="font-medium text-sm md:text-base">{option}</span>
                              </span>
                              {hasAnswered && isThisOptionCorrect && <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>}
                              {hasAnswered && isSelected && !isThisOptionCorrect && <i className="fa-solid fa-circle-xmark text-rose-500 text-lg"></i>}
                            </button>
                          );
                        })}
                      </div>

                      {showExplanations[idx] && (
                        <div className="mt-5 ml-0 md:ml-12 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-900 text-sm leading-relaxed animate-fadeIn flex gap-3">
                          <i className="fa-solid fa-circle-info mt-0.5 text-blue-500"></i>
                          <div>
                            <span className="font-bold block mb-1 uppercase tracking-wide text-[10px] text-blue-400">Explanation</span>
                            {mcq.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Action */}
              <div className="flex justify-center pt-10">
                {state.mode === 'test' ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 px-8 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-3 disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-circle-plus"></i>
                        Load More Questions
                      </>
                    )}
                  </button>
                ) : (
                  <div ref={observerTarget} className="py-8 w-full flex justify-center opacity-60">
                    {isLoadingMore && <i className="fa-solid fa-circle-notch fa-spin text-2xl text-blue-500"></i>}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
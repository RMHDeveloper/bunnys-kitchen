
import React, { useState } from 'react';
import { AppStatus } from './types';
import { fetchRecipe, fetchFamousSuggestion, generateRecipeImage } from './services/geminiService';
import { Icons, FAMOUS_DELICACIES } from './constants';
import RecipeDisplay from './components/RecipeDisplay';

const STATES = [
  { id: 'Tamil Nadu', label: 'Tamil Nadu', emoji: '🍱', desc: 'Temple Traditions', color: 'bg-orange-50', text: 'text-orange-900', border: 'hover:border-orange-200' },
  { id: 'Kerala', label: 'Kerala', emoji: '🌴', desc: 'Coastal soul', color: 'bg-emerald-50', text: 'text-emerald-900', border: 'hover:border-emerald-200' },
  { id: 'Karnataka', label: 'Karnataka', emoji: '🍛', desc: 'Sattvic heritage', color: 'bg-amber-50', text: 'text-amber-900', border: 'hover:border-amber-200' },
  { id: 'Andhra Pradesh', label: 'Andhra Pradesh', emoji: '🥘', desc: 'Spicy Heritage', color: 'bg-red-50', text: 'text-red-900', border: 'hover:border-red-200' },
  { id: 'Telangana', label: 'Telangana', emoji: '🌶️', desc: 'Deccan Flavors', color: 'bg-purple-50', text: 'text-purple-900', border: 'hover:border-purple-200' }
];

const LANGUAGES = [
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'കನ್ನಡ' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'English', label: 'English', native: 'English' }
];

const INITIAL_ALLERGIES = ['None', 'Peanuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Soy'];

const App: React.FC = () => {
  const [ingredient, setIngredient] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isCustomAllergy, setIsCustomAllergy] = useState(false);
  const [servings, setServings] = useState(2);
  const [language, setLanguage] = useState('English');
  const [selectedState, setSelectedState] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [recipeImageUrl, setRecipeImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);

  const startDiscovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient.trim()) return;
    setStatus(AppStatus.SELECTING_LANGUAGE);
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setStatus(AppStatus.SELECTING_STATE);
    updateSuggestion(ingredient);
  };

  const updateSuggestion = async (ing: string) => {
    setIsSuggestionLoading(true);
    setSuggestion(null);
    const lowerIng = ing.toLowerCase().trim();
    const localMatch = FAMOUS_DELICACIES.find(d => d.keywords.some(k => lowerIng.includes(k)));
    
    if (localMatch) {
      setSuggestion(localMatch);
      setIsSuggestionLoading(false);
    } else {
      try {
        const dynamicMatch = await fetchFamousSuggestion(ing);
        setSuggestion(dynamicMatch?.dish ? dynamicMatch : null);
      } finally {
        setIsSuggestionLoading(false);
      }
    }
  };

  const handleStateSelect = async (state: string, overrideIngredient?: string, mode: 'normal' | 'alternative' | 'diet' = 'normal') => {
    const finalIngredient = overrideIngredient || ingredient;
    if (overrideIngredient) setIngredient(overrideIngredient);
    setSelectedState(state);
    setStatus(AppStatus.LOADING);
    setError(null);
    if (mode === 'normal') setRecipeImageUrl(null);
    try {
      const isAlt = mode === 'alternative';
      const isDiet = mode === 'diet';
      const result = await fetchRecipe(finalIngredient, state, servings.toString(), language, allergies, isAlt, isDiet);
      setRecipe(result);
      setStatus(AppStatus.SUCCESS);
      const dishNameMatch = result.match(/## (.*?) \(/);
      generateRecipeImage(dishNameMatch ? dishNameMatch[1] : finalIngredient).then(img => setRecipeImageUrl(img));
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setIngredient('');
    setAllergies('');
    setIsCustomAllergy(false);
    setServings(2);
    setRecipe(null);
    setRecipeImageUrl(null);
    setError(null);
    setSuggestion(null);
    setStatus(AppStatus.IDLE);
  };

  const goBack = () => {
    if (status === AppStatus.SELECTING_LANGUAGE) setStatus(AppStatus.IDLE);
    else if (status === AppStatus.SELECTING_STATE) setStatus(AppStatus.SELECTING_LANGUAGE);
    else if (status === AppStatus.SUCCESS || status === AppStatus.ERROR || status === AppStatus.LOADING) setStatus(AppStatus.SELECTING_STATE);
  };

  const changeServings = (val: number) => {
    setServings(prev => Math.max(1, Math.min(20, prev + val)));
  };

  const handleAllergyChange = (val: string) => {
    if (val === 'ADD_NEW') {
      setIsCustomAllergy(true);
      setAllergies('');
    } else {
      setAllergies(val === 'None' ? '' : val);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7]">
      <header className="py-4 px-6 md:px-12 flex justify-between items-center bg-white border-b border-gray-100 shrink-0 z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Icons.Rabbit className="w-full h-full" />
          </div>
          <h1 className="text-xl font-extrabold text-[#1e3a2f] tracking-tight uppercase">Bunny's Kitchen</h1>
        </div>
        
        {status !== AppStatus.IDLE && (
          <button 
            onClick={goBack} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1e3a2f] text-white hover:bg-[#2d4a3e] transition-all font-extrabold text-[11px] uppercase tracking-widest shadow-lg shadow-[#1e3a2f]/10"
          >
            <Icons.Back />
            <span>Back</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col items-center min-h-0">
        {status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col justify-center w-full max-w-xl px-6 py-6 text-center fade-in space-y-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
                <Icons.Rabbit className="w-full h-full" />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight uppercase">
                <span className="text-gray-900">Bunny's</span>{' '}
                <span className="text-[#d4a373]">Kitchen</span>
              </h2>
            </div>

            <form onSubmit={startDiscovery} className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl shadow-gray-200/40 space-y-6 border border-gray-50">
              <div className="text-left space-y-2">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">What dish are you looking for today?</label>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => setIngredient(e.target.value)}
                  placeholder="e.g. Masala Dosa, Biryani..."
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1e3a2f] text-lg font-bold transition-all placeholder:font-medium"
                  required
                />
              </div>

              <div className="text-left space-y-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Any Allergies?</label>
                  {isCustomAllergy && (
                    <button type="button" onClick={() => { setIsCustomAllergy(false); setAllergies(''); }} className="text-[10px] font-extrabold text-[#1e3a2f] uppercase tracking-widest hover:underline">Back to list</button>
                  )}
                </div>
                {!isCustomAllergy ? (
                  <select
                    value={allergies || 'None'}
                    onChange={(e) => handleAllergyChange(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1e3a2f] text-lg font-bold appearance-none cursor-pointer"
                  >
                    {INITIAL_ALLERGIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="ADD_NEW">+ Add Custom...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type allergy..."
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1e3a2f] text-lg font-bold"
                  />
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-3xl flex items-center justify-between border border-gray-100">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Portion to serve</label>
                <div className="flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => changeServings(-1)} 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-[#1e3a2f] transition-colors"
                  >
                    <Icons.Minus />
                  </button>
                  <div className="px-4 min-w-[3rem] text-center">
                    <span className="text-lg font-black text-[#1e3a2f]">{servings}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => changeServings(1)} 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-[#1e3a2f] transition-colors"
                  >
                    <Icons.Plus />
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-[#1e3a2f] text-white rounded-3xl font-extrabold text-xs uppercase tracking-[0.3em] shadow-xl shadow-[#1e3a2f]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                <span>Start Discovery</span>
                <Icons.ArrowRight />
              </button>
            </form>
          </div>
        )}

        {status === AppStatus.SELECTING_LANGUAGE && (
          <div className="w-full max-w-2xl px-6 py-12 md:py-16 text-center fade-in space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight uppercase">Regional Palette</h2>
              <p className="text-gray-400 font-bold tracking-[0.4em] uppercase text-[10px]">Select response language</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LANGUAGES.map(lang => (
                <button key={lang.id} onClick={() => handleLanguageSelect(lang.id)} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#1e3a2f]/20 transition-all text-left group">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{lang.id}</div>
                  <div className="text-2xl font-black text-[#1e3a2f]">{lang.native}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === AppStatus.SELECTING_STATE && (
          <div className="w-full max-w-3xl px-6 py-12 md:py-16 fade-in space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight uppercase">Cook like a pro</h2>
              <p className="text-gray-400 font-bold tracking-[0.4em] uppercase text-[10px]">Choose a regional speciality</p>
            </div>

            <div className="min-h-[160px]">
              {isSuggestionLoading ? (
                <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center gap-4 animate-pulse">
                   <div className="w-10 h-10 border-4 border-[#1e3a2f] border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Finding the famous for you...</p>
                </div>
              ) : suggestion ? (
                <div className="bg-[#1e3a2f] p-8 rounded-[40px] shadow-xl border border-[#2d4a3e] flex flex-col md:flex-row gap-8 items-center fade-in">
                   <div className="flex-1 text-center md:text-left space-y-2">
                      <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Icons.Rabbit className="w-full h-full" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-[0.3em]">Signature Recommendation</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{suggestion.dish}</h3>
                      <p className="text-sm text-emerald-50 font-medium opacity-80">{suggestion.desc}</p>
                   </div>
                   <button onClick={() => handleStateSelect(suggestion.state, suggestion.dish)} className="px-8 py-5 bg-white text-[#1e3a2f] rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-colors">Explore This Dish</button>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {STATES.map(st => (
                <button key={st.id} onClick={() => handleStateSelect(st.id)} className={`p-8 rounded-[32px] border-2 border-transparent transition-all text-left ${st.color} ${st.border} group`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{st.emoji}</span>
                    <Icons.ChevronRight />
                  </div>
                  <div className={`text-xl font-black mb-1 ${st.text}`}>{st.label}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${st.text}`}>{st.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 fade-in">
             <div className="relative">
                <div className="w-24 h-24 border-8 border-gray-100 border-t-[#1e3a2f] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Icons.Rabbit className="w-full h-full" />
                  </div>
                </div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Gathering Spices...</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Consulting heritage archives</p>
             </div>
          </div>
        )}

        {status === AppStatus.SUCCESS && recipe && (
          <div className="w-full py-12 md:py-16 fade-in">
            <RecipeDisplay content={recipe} imageUrl={recipeImageUrl} />
            
            <div className="max-w-3xl mx-auto px-6 mt-16 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleStateSelect(selectedState, ingredient, 'alternative')}
                  className="flex items-center justify-center p-6 bg-[#1e3a2f] text-white rounded-3xl shadow-lg hover:bg-[#2d4a3e] transition-all transform hover:scale-[1.02]"
                >
                  <span className="text-sm font-black uppercase tracking-widest">Try another recipe</span>
                </button>

                <button 
                  onClick={() => handleStateSelect(selectedState, ingredient, 'diet')}
                  className="flex items-center justify-center p-6 bg-orange-500 text-white rounded-3xl shadow-lg hover:bg-orange-600 transition-all transform hover:scale-[1.02]"
                >
                  <span className="text-sm font-black uppercase tracking-widest">Healthy/Diet Version</span>
                </button>
              </div>

              <div className="flex flex-col items-center pt-8 border-t border-gray-100">
                <button onClick={reset} className="px-12 py-5 bg-white border-2 border-[#1e3a2f] text-[#1e3a2f] rounded-2xl font-extrabold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors">Start New Discovery</button>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 fade-in">
             <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Heritage Engine Stall</h3>
                <p className="text-sm text-gray-500 font-medium">{error || "The kitchen is temporarily closed."}</p>
             </div>
             <button onClick={reset} className="px-10 py-5 bg-[#1e3a2f] text-white rounded-2xl font-extrabold text-[11px] uppercase tracking-[0.2em]">Try Again</button>
          </div>
        )}
      </main>
      
      <footer className="py-6 px-6 text-center border-t border-gray-50 bg-white shrink-0">
        <p className="text-xs font-extrabold text-gray-400 tracking-tight">
          Developed by <a 
            href="https://rabbitmarketinghouse.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#1e3a2f] hover:text-[#d4a373] transition-colors"
          >
            Rabbit Marketing House 
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;

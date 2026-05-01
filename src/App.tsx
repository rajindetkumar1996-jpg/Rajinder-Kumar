import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, Home, MessageSquare, Hash, UserCircle, 
  ArrowRight, Copy, Check, Search, Clock, MessageCircle, 
  Lightbulb, Loader2, Camera, LogOut, Bell, Shield, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Robust copy function for embedded/webview environments
async function copyToClipboardRobust(text: string) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, trying fallback...", err);
  }
  
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback clipboard copy failed", err);
    return false;
  }
}

async function generateWithAI(prompt: string, fallback: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || fallback;
  } catch (err) {
    console.error("AI Generation failed", err);
    return fallback;
  }
}

// --- SHARED COMPONENTS ---

function Header({ setTab, userProfile }: { setTab: (t: string) => void, userProfile?: any }) {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-[#fafafa] sticky top-0 z-40">
      <button onClick={() => setTab('home')} className="flex items-center gap-2 outline-none cursor-pointer">
        <Sparkles className="w-5 h-5 text-pink-500" />
        <span className="text-xl font-bold text-slate-800 tracking-tight">InstaBoost</span>
      </button>
      <button onClick={() => setTab('settings')} className="outline-none cursor-pointer transition-transform hover:scale-105 rounded-full ring-2 ring-transparent focus:ring-pink-200">
        <img src={userProfile?.avatar || "https://i.pravatar.cc/150?img=68"} alt="Profile" className="w-9 h-9 rounded-full shadow-sm object-cover" />
      </button>
    </header>
  );
}

function BottomNav({ active, setTab }: { active: string, setTab: (t: string) => void }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'captions', icon: MessageSquare, label: 'Captions' },
    { id: 'hashtags', icon: Hash, label: 'Hashtags' },
    { id: 'bio', icon: UserCircle, label: 'Bio' },
  ];
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around items-center pt-3 pb-safe px-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] style={{ paddingBottom: 'env(safe-area-inset-bottom, 1.5rem)' }}">
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button 
            key={tab.id} 
            onClick={() => setTab(tab.id)} 
            className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${isActive ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`relative ${isActive ? 'bg-pink-50 text-pink-600' : ''} p-1.5 rounded-full`}>
               <tab.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PrimaryButton({ onClick, loading, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg shadow-pink-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (Icon && <Icon className="w-5 h-5" />)}
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-pink-500' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// --- VIEWS ---

function HomeView({ setTab }: { setTab: (t: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 pb-32">
      <div className="mt-4 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Level up your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">Creator</span> game.
        </h1>
        <p className="text-slate-500 mt-4 text-base leading-relaxed">
          The ultimate toolkit designed to boost your reach, engagement, and aesthetic on social media.
        </p>
      </div>

      <div className="space-y-4">
        {/* Caption Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-6 right-6 opacity-5">
             <MessageSquare className="w-24 h-24" />
           </div>
           <div className="bg-rose-500 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
             <MessageSquare className="w-5 h-5 text-white" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Caption Generator</h3>
           <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Stop staring at a blank screen. Generate viral-ready captions in seconds tailored to your niche.</p>
           <button onClick={() => setTab('captions')} className="bg-gradient-to-r from-orange-400 to-rose-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 cursor-pointer">
             Generate Now <ArrowRight className="w-4 h-4" />
           </button>
        </div>

        {/* Hashtag Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-6 right-6 opacity-5">
             <Hash className="w-24 h-24" />
           </div>
           <div className="bg-rose-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
             <Hash className="w-5 h-5 text-white" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Hashtag Generator</h3>
           <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Find the perfect mix of high-volume and niche hashtags to break through the algorithm.</p>
           <button onClick={() => setTab('hashtags')} className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 cursor-pointer">
             Find Tags <ArrowRight className="w-4 h-4" />
           </button>
        </div>

        {/* Bio Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-6 right-6 opacity-5">
             <UserCircle className="w-24 h-24" />
           </div>
           <div className="bg-rose-500 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
             <UserCircle className="w-5 h-5 text-white" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Bio Generator</h3>
           <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Craft a compelling bio that converts profile visitors into loyal followers instantly.</p>
           <button onClick={() => setTab('bio')} className="bg-gradient-to-r from-orange-400 to-rose-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 cursor-pointer">
             Create Bio <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="mt-8 bg-[#fdf5f6] rounded-3xl p-6 border border-rose-50">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">Quick Tips for<br/>Growth</h3>
          <span className="text-pink-600 font-medium text-sm text-right leading-tight cursor-pointer">View all<br/>insights</span>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-50">
             <div className="bg-yellow-50 p-2.5 rounded-xl h-fit">
               <Clock className="w-5 h-5 text-yellow-600" />
             </div>
             <div>
               <h4 className="font-semibold text-slate-800 mb-1 text-sm">Post at Peak Times</h4>
               <p className="text-slate-500 text-xs leading-relaxed">Your audience is most active between 6 PM and 9 PM EST. Schedule your posts accordingly.</p>
             </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-50">
             <div className="bg-purple-50 p-2.5 rounded-xl h-fit">
               <MessageCircle className="w-5 h-5 text-purple-600" />
             </div>
             <div>
               <h4 className="font-semibold text-slate-800 mb-1 text-sm">Engage in the First Hour</h4>
               <p className="text-slate-500 text-xs leading-relaxed">Reply to every comment in the first 60 minutes to signal the algorithm your content is valuable.</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CaptionsView() {
  const [desc, setDesc] = useState('');
  const [mood, setMood] = useState('Funny');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const moods = ['Funny', 'Professional', 'Minimalist', 'Aesthetic', 'Inspiring', 'Sassy'];

  const handleGenerate = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    setResults([]);
    
    const prompt = `Write 3 different Instagram captions for a photo described as: "${desc}". The mood/tone should be "${mood}". 
    IMPORTANT: Provide EXACTLY 3 variations. Do not include titles like "Variation 1:". Separate each variation EXACTLY with the string "|||".`;
    
    const fallback = `Feeling good today! ✨ ||| Can't get enough of this view 🤩 ||| Just living life 💫`;
    const res = await generateWithAI(prompt, fallback);
    
    setResults(res.split('|||').map(s => s.trim()).filter(s => s));
    setLoading(false);
  };

  const handleCopy = async (text: string, index: number) => {
    const success = await copyToClipboardRobust(text);
    if(success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-32">
       <div className="mt-4 mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Captions that <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">Convert.</span>
        </h1>
        <p className="text-slate-500 mt-3 text-[15px] leading-relaxed pr-4">
          Stop staring at a blinking cursor. Let AI craft the perfect hook for your next viral post.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
        <label className="block text-xs font-bold text-slate-400 tracking-wider mb-3">DESCRIBE YOUR PHOTO</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. A golden hour selfie at the beach in Malibu with my new sunglasses..."
          className="w-full h-28 bg-[#f8f9fa] rounded-2xl p-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-100 resize-none text-[15px]"
        />
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
        <label className="block text-xs font-bold text-slate-400 tracking-wider mb-4">SELECT MOOD</label>
        <div className="flex flex-wrap gap-2.5">
          {moods.map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mood === m ? 'bg-pink-50 text-pink-600 ring-1 ring-pink-200' : 'bg-[#f8f9fa] text-slate-600 hover:bg-slate-100'
              } cursor-pointer`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={handleGenerate} loading={loading} icon={Sparkles}>
        Generate Caption
      </PrimaryButton>

      {/* Tip Card */}
      {!loading && results.length === 0 && (
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4">
           <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
           <div>
             <h4 className="font-semibold text-slate-800 text-sm mb-1">Creative Spark</h4>
             <p className="text-slate-500 text-[13px] leading-relaxed">Did you know? Captions with a question at the end increase engagement by 40%.</p>
           </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-slate-800">Your Generated Options</h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">{results.length} Variations</span>
          </div>
          
          <div className="space-y-4">
            {results.map((res, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-l-pink-400 relative">
                <p className="text-slate-700 text-[15px] leading-relaxed mb-4 pr-2 whitespace-pre-wrap">{res}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-medium px-2 py-1 rounded">#mood</span>
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-medium px-2 py-1 rounded">#{mood.toLowerCase()}</span>
                  </div>
                  <button onClick={() => handleCopy(res, i)} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function HashtagsView() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('Medium');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const counts: Record<string, number> = { Low: 10, Medium: 20, High: 30 };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResults([]);
    
    const qty = counts[count];
    const prompt = `Provide exactly ${qty} highly effective and highly-searched Instagram hashtags for the topic: "${topic}". Output ONLY the hashtags separated by spaces. Format like: #tag1 #tag2`;
    const fallback = `#${topic.replace(/ /g, '')} #viral #trending #instagood #reels #explore`;
    
    const res = await generateWithAI(prompt, fallback);
    setResults(res.split(' ').filter(t => t.startsWith('#')));
    setLoading(false);
  };

  const handleCopyAll = async () => {
    if (results.length === 0) return;
    const success = await copyToClipboardRobust(results.join(' '));
    if(success) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-32">
      <div className="mt-4 mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Boost Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600">Visibility</span>
        </h1>
        <p className="text-slate-500 mt-3 text-[15px] leading-relaxed pr-4">
          Enter your topic or keywords to generate high-performing hashtags that drive engagement and reach new audiences.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
        <label className="block text-xs font-bold text-slate-400 tracking-wider mb-3">TOPIC OR KEYWORDS</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Minimalist Photography"
            className="w-full bg-[#f8f9fa] rounded-xl py-3.5 pl-11 pr-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-100 text-[15px]"
          />
        </div>

        <label className="block text-xs font-bold text-slate-400 tracking-wider mt-6 mb-3">HASHTAG COUNT</label>
        <div className="flex bg-[#f8f9fa] rounded-xl p-1">
          {Object.keys(counts).map(c => (
            <button
               key={c}
               onClick={() => setCount(c)}
               className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${count === c ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={handleGenerate} loading={loading} icon={Sparkles}>
        Generate Hashtags
      </PrimaryButton>

      {/* Tip Card */}
      {!loading && results.length === 0 && (
        <div className="mt-6 bg-purple-50/50 rounded-2xl p-5 border border-purple-100 flex gap-4">
           <Lightbulb className="w-5 h-5 text-purple-500 shrink-0" />
           <div>
             <h4 className="font-semibold text-purple-900 text-sm mb-1">Pro Tip</h4>
             <p className="text-purple-700/80 text-[13px] leading-relaxed">Mix 10 high-reach hashtags with 20 niche tags for the best discoverability results.</p>
           </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
               <Hash className="w-5 h-5 text-pink-500" />
               <h3 className="font-bold text-slate-800 text-lg">Suggested Results</h3>
             </div>
             <button onClick={handleCopyAll} className="flex items-center gap-1.5 text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer">
               {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
               {copiedAll ? 'Copied' : 'Copy All'}
             </button>
           </div>

           <div className="flex flex-wrap gap-2.5">
              {results.map((tag, i) => (
                <span key={i} className="bg-[#f8f9fa] border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[13.5px] font-medium">
                  {tag}
                </span>
              ))}
              <span className="border-2 border-dashed border-slate-200 text-slate-400 px-4 py-1.5 rounded-full text-[13.5px] font-medium flex items-center gap-1">
                 <Sparkles className="w-3.5 h-3.5" /> generate more...
              </span>
           </div>

           <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
             <span className="text-slate-500 font-medium">Total: {results.length} Hashtags</span>
             <span className="text-emerald-500 font-medium flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Performance Data
             </span>
           </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function BioView({ userProfile }: { userProfile?: any }) {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState('');
  const [results, setResults] = useState<{style: string, text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewBio, setPreviewBio] = useState('');

  const handleGenerate = async () => {
    if (!name || !keywords) return;
    setLoading(true);
    setResults([]);
    
    // Explicit format request for easier parsing
    const prompt = `Write 3 different Instagram bio variations for a brand/person named "${name}". 
    Keywords about them: ${keywords}. 
    Target audience: ${audience}. 
    Style 1 must be "PROFESSIONAL".
    Style 2 must be "CREATIVE".
    Style 3 must be "SHORT & PUNCHY".
    Include relevant emojis. Maximum 150 characters per bio. 
    FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
    PROFESSIONAL:
    [bio text 1]
    |||
    CREATIVE:
    [bio text 2]
    |||
    SHORT & PUNCHY:
    [bio text 3]`;
    
    const fallback = `PROFESSIONAL:\nHelping you achieve greatness.\n|||\nCREATIVE:\n✨ Making magic happen daily.\n|||\nSHORT & PUNCHY:\nBuilder | Creator | Dreamer`;
    
    const res = await generateWithAI(prompt, fallback);
    const parts = res.split('|||').map(s => s.trim()).filter(Boolean);
    
    const parsed = parts.map(part => {
      let style = 'GENERATED';
      let text = part;
      if(part.includes(':')) {
        const splitIndex = part.indexOf(':');
        style = part.substring(0, splitIndex).trim();
        text = part.substring(splitIndex + 1).trim();
      }
      return { style: style.replace(/\*/g, ''), text };
    });

    setResults(parsed);
    if(parsed.length > 0) setPreviewBio(parsed[0].text);
    setLoading(false);
  };

  const handleCopy = async (text: string) => {
    await copyToClipboardRobust(text);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-32">
      <div className="mt-4 mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Bio Generator
        </h1>
        <p className="text-slate-500 mt-2 text-[15px] leading-relaxed pr-4">
          Craft the perfect identity for your social presence using AI.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wider mb-2">
            <UserCircle className="w-3.5 h-3.5" /> Your Brand/Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera or Creative Lens Studio"
            className="w-full bg-[#f8f9fa] rounded-xl py-3 px-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-100 text-[14px]"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wider mb-2">
            <Hash className="w-3.5 h-3.5" /> Keywords about you
          </label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. Photography, Minimalist, Global Traveler..."
            className="w-full h-20 bg-[#f8f9fa] rounded-xl py-3 px-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-100 resize-none text-[14px]"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 tracking-wider mb-2">
            <Search className="w-3.5 h-3.5" /> Target Audience
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. Aspiring photographers, Design lovers"
            className="w-full bg-[#f8f9fa] rounded-xl py-3 px-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-100 text-[14px]"
          />
        </div>
        
        <div className="pt-2">
          <PrimaryButton onClick={handleGenerate} loading={loading} icon={Sparkles}>
            Generate Bio
          </PrimaryButton>
        </div>
      </div>

      {!loading && results.length === 0 && (
        <div className="mt-4 bg-orange-50/70 rounded-2xl p-5 border border-orange-100 flex gap-4">
           <Lightbulb className="w-5 h-5 text-orange-400 shrink-0" />
           <p className="text-orange-800 text-[13px] leading-relaxed pr-2">Pro Tip: Use specific keywords like 'award-winning' or '5 years experience' for better results.</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
         <div className="mt-8">
            {/* Mock Profile Preview */}
            <h3 className="font-bold text-slate-800 text-xl mb-4">Preview</h3>
            <div className="bg-white rounded-3xl p-5 border-4 border-slate-900 shadow-xl mb-8 relative">
               <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold text-slate-900">{name || userProfile?.handle || 'Your_Handle'}</h4>
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                 </div>
               </div>
               
               <div className="flex gap-6 items-center mb-4">
                 <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 relative">
                   <img src={userProfile?.avatar || "https://i.pravatar.cc/150?img=68"} alt="Avatar" className="w-full h-full rounded-full border-2 border-white object-cover" />
                 </div>
                 <div className="flex gap-4">
                   <div className="text-center"><div className="font-bold text-slate-900">1.2k</div><div className="text-[11px] text-slate-500">Posts</div></div>
                   <div className="text-center"><div className="font-bold text-slate-900">24k</div><div className="text-[11px] text-slate-500">Followers</div></div>
                   <div className="text-center"><div className="font-bold text-slate-900">850</div><div className="text-[11px] text-slate-500">Following</div></div>
                 </div>
               </div>

               <div>
                 <h5 className="font-bold text-slate-900 text-[14px]">{name || userProfile?.name || 'Brand Name'}</h5>
                 <p className="text-slate-800 text-[13.5px] leading-snug whitespace-pre-wrap mt-0.5">{previewBio}</p>
                 <p className="text-blue-700 font-medium text-[13.5px] mt-1">linktr.ee/yourstudio</p>
               </div>

               <div className="flex gap-2 mt-4">
                 <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 rounded-lg text-[13px] transition-colors">Edit Profile</button>
                 <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 rounded-lg text-[13px] transition-colors">Share Profile</button>
               </div>
            </div>

            <h3 className="font-bold text-slate-800 text-xl mb-4">Choose Your Style</h3>
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group">
                   <div className="flex justify-between items-start mb-3">
                     <span className="bg-orange-50 text-orange-600 font-bold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                       {res.style || `Style ${i+1}`}
                     </span>
                     <button onClick={() => handleCopy(res.text)} title="Copy Bio" className="text-slate-400 hover:text-pink-500 transition-colors cursor-pointer p-1">
                       <Copy className="w-4 h-4" />
                     </button>
                   </div>
                   <p className="text-slate-700 text-[14.5px] leading-relaxed whitespace-pre-wrap mb-4">{res.text}</p>
                   
                   <button 
                     onClick={() => setPreviewBio(res.text)}
                     className="text-pink-600 font-semibold text-[13px] flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                   >
                     Add to Bio Preview <ArrowRight className="w-3.5 h-3.5" />
                   </button>
                </div>
              ))}
            </div>
         </div>
      )}
    </motion.div>
  )
}

function SettingsView({ userProfile, setUserProfile }: { userProfile: any, setUserProfile: any }) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserProfile((prev: any) => ({ ...prev, avatar: url }));
    }
  };

  if (loggedOut) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-20 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex justify-center items-center mb-4">
          <LogOut className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Logged Out</h2>
        <p className="text-slate-500 mb-8">You have been successfully logged out.</p>
        <button onClick={() => setLoggedOut(false)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
          Log back in
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-32">
      <div className="mt-4 mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Settings
        </h1>
        <p className="text-slate-500 mt-2 text-[15px] leading-relaxed pr-4">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <img src={userProfile.avatar} alt="Profile" className="w-24 h-24 rounded-full shadow-sm border-4 border-white object-cover" />
          <label className="absolute bottom-1 right-1 bg-pink-500 text-white p-2 rounded-full shadow-md hover:bg-pink-600 transition-colors cursor-pointer">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{userProfile.name}</h2>
        <p className="text-[15px] text-slate-500 mb-2">@{userProfile.handle}</p>
        <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
          {userProfile.plan}
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
        {/* Personal Info */}
        <div className="border-b border-slate-100">
          <button onClick={() => toggleSection('personal')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                <UserCircle className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700 text-[15px]">Personal Information</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${activeSection === 'personal' ? 'rotate-90' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeSection === 'personal' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-t border-slate-50 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500">NAME</label>
                    <input 
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">HANDLE</label>
                    <input 
                      value={userProfile.handle}
                      onChange={(e) => setUserProfile({...userProfile, handle: e.target.value.replace('@','')})}
                      className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">EMAIL</label>
                    <input 
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="border-b border-slate-100">
          <button onClick={() => toggleSection('notifications')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700 text-[15px]">Notifications</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${activeSection === 'notifications' ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {activeSection === 'notifications' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-5 bg-slate-50/50 border-t border-slate-50 space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Push Notifications</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Alerts directly to your device</p>
                    </div>
                    <Toggle 
                      checked={userProfile.notifications.push}
                      onChange={(val) => setUserProfile({...userProfile, notifications: {...userProfile.notifications, push: val}})}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Email Updates</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Newsletters and product tips</p>
                    </div>
                    <Toggle 
                      checked={userProfile.notifications.email}
                      onChange={(val) => setUserProfile({...userProfile, notifications: {...userProfile.notifications, email: val}})}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security & Privacy */}
        <div>
          <button onClick={() => toggleSection('security')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer outline-none">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700 text-[15px]">Security & Privacy</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${activeSection === 'security' ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {activeSection === 'security' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-5 bg-slate-50/50 border-t border-slate-50 space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Private Account</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Only approved followers can see you</p>
                    </div>
                    <Toggle 
                      checked={userProfile.privacy.privateAccount}
                      onChange={(val) => setUserProfile({...userProfile, privacy: {...userProfile.privacy, privateAccount: val}})}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                     <button className="text-sm font-semibold text-blue-600 p-1 hover:text-blue-700 cursor-pointer">Change Password</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={() => setLoggedOut(true)} className="w-full bg-white border border-rose-100 text-rose-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-rose-50/50 transition-all flex justify-center items-center gap-2 cursor-pointer">
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </motion.div>
  );
}

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState({
    name: 'Sarah Jenkins',
    handle: 'sarahcreatives',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?img=68',
    plan: 'Pro Plan',
    notifications: {
      push: true,
      email: false,
    },
    privacy: {
      privateAccount: false,
    }
  });

  return (
    <div className="min-h-[100dvh] w-full bg-[#fafafa] font-sans overflow-x-hidden selection:bg-pink-500/30 selection:text-white">
      <Header setTab={setActiveTab} userProfile={userProfile} />
      
      <main className="w-full max-w-md mx-auto relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeView key="home" setTab={setActiveTab} />}
          {activeTab === 'captions' && <CaptionsView key="captions" />}
          {activeTab === 'hashtags' && <HashtagsView key="hashtags" />}
          {activeTab === 'bio' && <BioView key="bio" userProfile={userProfile} />}
          {activeTab === 'settings' && <SettingsView key="settings" userProfile={userProfile} setUserProfile={setUserProfile} />}
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} setTab={setActiveTab} />
    </div>
  );
}

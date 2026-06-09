import React, { useState, useEffect } from "react";
import { 
  Lock, Unlock, Search, Plus, Trash2, Key, RefreshCw, FileText, 
  CheckCircle, AlertCircle, Eye, EyeOff, Smartphone, Home, Power, 
  ArrowLeft, Shield, Sparkles, X, Edit3, Heart, Briefcase, BookOpen, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DiaryEntrySim {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string; // ISO String
}

export default function Simulator() {
  // --- LOCAL PERSISTENCE LAYER ---
  const [pin, setPin] = useState<string>(() => {
    return localStorage.getItem("sim_keychain_pin") || "";
  });
  
  const [entries, setEntries] = useState<DiaryEntrySim[]>(() => {
    const saved = localStorage.getItem("sim_swiftdata_entries");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    
    // Default high-fidelity seeded entries
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: "1",
        title: "Tangerine Sunset Reflection",
        content: "Had a peaceful walk around the neighborhood. The sky turned a gorgeous shade of fiery tangerine. Everything felt calm. Glad the SwiftData model structure auto-stamps exactly on the exact millisecond of saving.",
        category: "Personal",
        timestamp: today.toISOString()
      },
      {
        id: "2",
        title: "Secure iOS Keychain Architecture",
        content: "Drafted the security model today! Implementing LocalAuthentication for FaceID and raw SecItem wrappers for Keychain credentials provides real hardware-level security. Ready to test on active scenePhase triggers in the App router.",
        category: "Work",
        timestamp: yesterday.toISOString()
      },
      {
        id: "3",
        title: "Espresso & SwiftUI Layouts",
        content: "Spent 2 hours in the local cafe refactoring circular keypads on the LockScreenView. Dynamic padding works flawless with adaptive size grids. Excited to finish the editor flows tomorrow.",
        category: "Thoughts",
        timestamp: threeDaysAgo.toISOString()
      }
    ];
  });

  // --- COMPONENT STATE ---
  const [currentScreen, setCurrentScreen] = useState<"onboarding_pin" | "onboarding_confirm" | "locked" | "timeline" | "editor">("timeline");
  
  // PIN and passcode values
  const [typedPin, setTypedPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [lockScreenPin, setLockScreenPin] = useState<string>("");
  
  // Feedback states
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [simErrorMsg, setSimErrorMsg] = useState<string>("");
  const [successAnimation, setSuccessAnimation] = useState<boolean>(false);
  
  // Hard locks and physical simulators
  const [phoneOn, setPhoneOn] = useState<boolean>(true);
  const [appInBackground, setAppInBackground] = useState<boolean>(false);
  const [faceIDScanning, setFaceIDScanning] = useState<boolean>(false);
  const [faceIDSuccess, setFaceIDSuccess] = useState<boolean>(false);
  
  // Timeline features
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<DiaryEntrySim | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("Personal");
  const [isNewEntry, setIsNewEntry] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("sim_keychain_pin", pin);
  }, [pin]);

  useEffect(() => {
    localStorage.setItem("sim_swiftdata_entries", JSON.stringify(entries));
  }, [entries]);

  // Determine initial screen based on whether a PIN exists
  useEffect(() => {
    if (!pin) {
      setCurrentScreen("onboarding_pin");
    } else {
      setCurrentScreen("locked");
    }
  }, [pin]);

  // Handle active app backgrounding re-lock simulation
  const handleSimulateBackground = () => {
    setAppInBackground(true);
    // When moved to background, the app is instantly re-locked as mandated!
    if (pin) {
      setCurrentScreen("locked");
      setLockScreenPin("");
    }
  };

  const handleSimulateResume = () => {
    setAppInBackground(false);
  };

  const togglePower = () => {
    if (phoneOn) {
      // Locking screen also locks the app!
      setPhoneOn(false);
      if (pin) {
        setCurrentScreen("locked");
        setLockScreenPin("");
      }
    } else {
      setPhoneOn(true);
    }
  };

  // --- KEYPAD COMBINATORICS ---
  const handleNumberTap = (num: string) => {
    if (currentScreen === "onboarding_pin") {
      if (typedPin.length < 4) {
        const next = typedPin + num;
        setTypedPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            setCurrentScreen("onboarding_confirm");
          }, 300);
        }
      }
    } else if (currentScreen === "onboarding_confirm") {
      if (confirmPin.length < 4) {
        const next = confirmPin + num;
        setConfirmPin(next);
        if (next.length === 4) {
          // Verify
          setTimeout(() => {
            if (typedPin === next) {
              setPin(next);
              setSuccessAnimation(true);
              setTimeout(() => {
                setSuccessAnimation(false);
                setCurrentScreen("timeline");
                setTypedPin("");
                setConfirmPin("");
              }, 1200);
            } else {
              setShakeTrigger(true);
              setSimErrorMsg("Passcodes do not match!");
              setTimeout(() => {
                setShakeTrigger(false);
                setConfirmPin("");
                setTypedPin("");
                setCurrentScreen("onboarding_pin");
                setSimErrorMsg("");
              }, 1000);
            }
          }, 400);
        }
      }
    } else if (currentScreen === "locked") {
      if (lockScreenPin.length < 4) {
        const next = lockScreenPin + num;
        setLockScreenPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            if (next === pin) {
              setCurrentScreen("timeline");
              setLockScreenPin("");
            } else {
              setShakeTrigger(true);
              setTimeout(() => {
                setShakeTrigger(false);
                setLockScreenPin("");
              }, 600);
            }
          }, 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (currentScreen === "onboarding_pin") {
      setTypedPin(typedPin.slice(0, -1));
    } else if (currentScreen === "onboarding_confirm") {
      setConfirmPin(confirmPin.slice(0, -1));
    } else if (currentScreen === "locked") {
      setLockScreenPin(lockScreenPin.slice(0, -1));
    }
  };

  // --- FACE ID SIMULATOR WORKFLOW ---
  const handleFaceIDTrigger = () => {
    if (!pin) return;
    setFaceIDScanning(true);
    setFaceIDSuccess(false);

    // After 1 second, simulate secure biometric verification match
    setTimeout(() => {
      setFaceIDSuccess(true);
      setTimeout(() => {
        setFaceIDScanning(false);
        setFaceIDSuccess(false);
        setCurrentScreen("timeline");
      }, 800);
    }, 1200);
  };

  // --- TIMELINE FLOWS ---
  const handleOpenNewEntry = () => {
    setIsNewEntry(true);
    setEditTitle("");
    setEditContent("");
    setEditCategory("Personal");
    setCurrentScreen("editor");
  };

  const handleOpenEditEntry = (entry: DiaryEntrySim) => {
    setIsNewEntry(false);
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditCategory(entry.category);
    setCurrentScreen("editor");
  };

  const handleSaveEntry = () => {
    if (!editTitle.trim()) {
      alert("Title is required!");
      return;
    }

    if (isNewEntry) {
      const newEntry: DiaryEntrySim = {
        id: Date.now().toString(),
        title: editTitle,
        content: editContent,
        category: editCategory,
        timestamp: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
    } else if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? {
        ...e,
        title: editTitle,
        content: editContent,
        category: editCategory
      } : e));
    }

    setCurrentScreen("timeline");
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening edit view
    if (confirm("Delete this diary entry?")) {
      setEntries(entries.filter(ent => ent.id !== id));
    }
  };

  const handleResetSecurity = () => {
    if (confirm("Reset PIN and disable security simulation? This will clear credentials in Keychain storage.")) {
      setPin("");
      setTypedPin("");
      setConfirmPin("");
      setLockScreenPin("");
      setCurrentScreen("onboarding_pin");
    }
  };

  // Group entries by date calendar
  const groupedEntriesMap = entries
    .filter(entry => {
      const q = searchQuery.toLowerCase();
      return entry.title.toLowerCase().includes(q) || 
             entry.content.toLowerCase().includes(q) ||
             entry.category.toLowerCase().includes(q);
    })
    .reduce((groups: { [key: string]: DiaryEntrySim[] }, entry) => {
      const date = new Date(entry.timestamp);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateString = date.toLocaleDateString('en-US', options);
      
      // Relative header dates
      const todayString = new Date().toLocaleDateString('en-US', options);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toLocaleDateString('en-US', options);

      let key = dateString;
      if (dateString === todayString) {
        key = "Today - " + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (dateString === yesterdayString) {
        key = "Yesterday - " + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
      return groups;
    }, {});

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Work": return <Briefcase className="w-3..5 h-3.5 text-blue-500" />;
      case "Thoughts": return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case "Inspiration": return <Heart className="w-3.5 h-3.5 text-pink-500" />;
      default: return <BookOpen className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#D1D1D6] text-[#1C1C1E] select-none">
      {/* HEADER CONTROL BAR */}
      <div className="p-4 bg-[#F2F2F7] border-b border-[#D1D1D6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#007AFF]" />
          <span className="font-bold text-sm tracking-wide text-[#1C1C1E]">INTERACTIVE HARDWARE HARNESS</span>
        </div>
        <div className="flex items-center gap-2">
          {appInBackground ? (
            <button 
              onClick={handleSimulateResume} 
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100/50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> Resume App
            </button>
          ) : (
            <button 
              onClick={handleSimulateBackground} 
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/25 rounded-lg hover:bg-[#007AFF]/15 transition-all cursor-pointer"
            >
              <Home className="w-3 h-3" /> Drag To Background
            </button>
          )}
          
          <button 
            onClick={togglePower} 
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              phoneOn 
                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" 
                : "bg-white text-[#1C1C1E] border border-[#D1D1D6] hover:bg-[#F2F2F7]"
            }`}
          >
            <Power className="w-3 h-3" /> {phoneOn ? "Lock Device" : "Wake Screen"}
          </button>
        </div>
      </div>

      {/* DASHBOARD INFO BLOCK */}
      <div className="px-4 py-2.5 bg-[#007AFF]/5 text-[#007AFF] border-b border-[#D1D1D6] text-[11px] grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Keychain PIN State: <strong>{pin ? "SAVED (" + pin + ")" : "EMPTY"}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Security Phase: <strong>{currentScreen.toUpperCase()}</strong></span>
        </div>
      </div>

      {/* DEVICE WRAPPER BLOCK */}
      <div className="flex-1 flex items-center justify-center p-3 relative bg-[#F2F2F7] overflow-hidden">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#d1d1d6_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* PHYSICAL DEVICE FRAME (IPHONE 15 PRO SHADOWS / CHASSIS) */}
        <div className="relative w-[340px] h-[640px] rounded-[48px] bg-neutral-900 border-[10px] border-neutral-800 shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
          
          {/* Dynamic Island Screen Hole */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black z-50 flex items-center justify-center p-1">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto border border-white/5 opacity-85" />
          </div>

          {/* SCREEN POWERED STATE */}
          {!phoneOn ? (
            /* Total System Lock Off screen state */
            <div 
              onClick={togglePower}
              className="w-full h-full bg-black flex flex-col justify-center items-center cursor-pointer text-slate-500"
            >
              <Power className="w-8 h-8 text-[#8E8E93] animate-pulse mb-2" />
              <p className="text-xs text-slate-400">Device Screen Sleeping</p>
              <p className="text-[10px] text-slate-500 mt-1">Tap/Wake Power to interact</p>
            </div>
          ) : appInBackground ? (
            /* App Switcher Background state showing background simulation */
            <div className="w-full h-full bg-[#F2F2F7] flex flex-col justify-between p-4 pb-8 overflow-hidden">
              <div className="pt-8 text-center">
                <p className="text-xs text-[#007AFF] font-semibold uppercase tracking-wider">iOS App Switcher</p>
                <p className="text-lg font-bold text-[#1C1C1E] mt-1">Application Paused</p>
                <p className="text-xs text-[#8E8E93] px-6 mt-1.5">You dragged the Secure Diary to the background to test re-locking conditions.</p>
              </div>

              {/* CARD PREVIEW */}
              <div className="w-64 h-80 rounded-2xl bg-white border border-[#D1D1D6] mx-auto shadow-md overflow-hidden flex flex-col scale-90 opacity-80">
                <div className="h-8 bg-[#F2F2F7] p-2 flex items-center justify-between border-b border-[#E5E5EA]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-[#007AFF]" />
                    <span className="text-[9px] font-bold text-[#1C1C1E]">Secure Diary</span>
                  </div>
                  <Lock className="w-2.5 h-2.5 text-[#8E8E93]" />
                </div>
                <div className="flex-1 bg-white flex items-center justify-center p-4">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-[#007AFF] mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-[#1C1C1E]">Auto-Locked in BG</p>
                  </div>
                </div>
              </div>

              {/* ACTION TOGGLE BUTTON */}
              <button 
                onClick={handleSimulateResume}
                className="w-full py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                Tap Card to Resume
              </button>
            </div>
          ) : (
            /* ACTIVE APPLICATION CODE RUNNING */
            <div className="w-full h-full bg-[#F2F2F7] text-[#1C1C1E] flex flex-col relative">
              
              {/* STATUS BAR */}
              <div className="h-10 pt-4 px-6 flex items-center justify-between text-[11px] font-bold text-[#1C1C1E] z-40 select-none">
                <span>19:15</span>
                <div className="flex items-center gap-1 bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
                  <span className="text-[8px] text-[#007AFF] font-bold tracking-tight">🔒 Locked App</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold">LTE</span>
                  <div className="w-4.5 h-2.5 border border-[#1C1C1E]/60 rounded p-0.5 flex items-center bg-[#1C1C1E]/10">
                    <div className="w-full h-full bg-[#1C1C1E] rounded-xs" />
                  </div>
                </div>
              </div>

              {/* VIEW SWITCHER BOX */}
              <div className="flex-1 overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                  
                  {/* ONBOARDING: SET PIN */}
                  {currentScreen === "onboarding_pin" && (
                    <motion.div 
                      key="onboarding_pin"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-between p-6 pb-12 bg-white"
                    >
                      <div className="text-center pt-8">
                        <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-[#007AFF]" />
                        </div>
                        <h2 className="text-lg font-black text-[#1C1C1E] leading-tight">Create Passcode</h2>
                        <p className="text-[11px] text-[#8E8E93] px-3 mt-1.5">
                          Set a 4-digit PIN lock to secure your database storage in the device Keychain.
                        </p>
                      </div>

                      {/* Code Dots */}
                      <div className="flex justify-center gap-4 py-4">
                        {[0, 1, 2, 3].map((idx) => (
                          <div 
                            key={idx} 
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                              idx < typedPin.length 
                                ? "bg-[#007AFF] border-[#007AFF] scale-110" 
                                : "border-[#D1D1D6] bg-[#F2F2F7]"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Grid Keys */}
                      <SimKeypad 
                        onTap={handleNumberTap} 
                        onBack={handleBackspace} 
                        showBiometricBtn={false}
                        shake={shakeTrigger}
                      />
                    </motion.div>
                  )}

                  {/* ONBOARDING: CONFIRM PIN */}
                  {currentScreen === "onboarding_confirm" && (
                    <motion.div 
                      key="onboarding_confirm"
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      className="absolute inset-0 flex flex-col justify-between p-6 pb-12 bg-white"
                    >
                      <div className="text-center pt-8">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-black text-[#1C1C1E] leading-tight">Confirm Passcode</h2>
                        <p className="text-[11px] text-[#8E8E93] px-3 mt-1.5">
                          Re-type your secure PIN.
                        </p>
                        {simErrorMsg && <p className="text-xs text-rose-600 mt-2 font-semibold bg-rose-50 py-1 rounded-md">{simErrorMsg}</p>}
                      </div>

                      {/* Code Dots */}
                      <div className="flex justify-center gap-4 py-4">
                        {[0, 1, 2, 3].map((idx) => (
                          <div 
                            key={idx} 
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                              idx < confirmPin.length 
                                ? "bg-emerald-500 border-emerald-500 scale-110" 
                                : "border-[#D1D1D6] bg-transparent"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Grid Keys */}
                      <SimKeypad 
                        onTap={handleNumberTap} 
                        onBack={handleBackspace} 
                        showBiometricBtn={false}
                        shake={shakeTrigger}
                      />
                    </motion.div>
                  )}

                  {/* SUBSEQUENT LAUNCHES: BLURRED LOCKSCREEN (DECRYPTION GATEWAY) */}
                  {currentScreen === "locked" && (
                    <motion.div 
                      key="locked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="absolute inset-0 flex flex-col justify-between p-6 pb-12 bg-[#F2F2F7] z-20"
                    >
                      <div className="text-center pt-8">
                        <div className="w-14 h-14 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Lock className="w-6 h-6 text-[#007AFF]" />
                        </div>
                        <h2 className="text-base font-black text-[#1C1C1E] tracking-tight">Secure Diary Locked</h2>
                        <p className="text-[10px] text-[#8E8E93] mt-1">Unlock with biometrics or passcode</p>
                      </div>

                      {/* Dots */}
                      <div className="flex justify-center gap-4 py-2">
                        {[0, 1, 2, 3].map((idx) => (
                          <div 
                            key={idx} 
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                              idx < lockScreenPin.length 
                                ? "bg-[#007AFF] border-[#007AFF] scale-110 shadow-sm" 
                                : "border-[#D1D1D6] bg-white"
                            } ${shakeTrigger ? "border-rose-500 bg-rose-500 animate-bounce" : ""}`}
                          />
                        ))}
                      </div>

                      {/* Keyboard Grid */}
                      <SimKeypad 
                        onTap={handleNumberTap} 
                        onBack={handleBackspace} 
                        showBiometricBtn={true}
                        onBiometricClick={handleFaceIDTrigger}
                        shake={shakeTrigger}
                      />
                    </motion.div>
                  )}

                  {/* APP TIMELINE MAIN SECTION */}
                  {currentScreen === "timeline" && (
                    <motion.div 
                      key="timeline"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col bg-[#F2F2F7]"
                    >
                      {/* Navigation Header */}
                      <div className="px-4 py-2 bg-white/95 backdrop-blur-xs border-b border-[#E5E5EA] flex justify-between items-center z-10 sticky top-0">
                        <div className="flex items-center gap-1.5" onClick={handleResetSecurity} title="Reset Security">
                          <button className="px-2 py-1 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#3A3A3D] rounded-lg text-[9px] font-mono cursor-pointer flex items-center gap-1 border border-[#E5E5EA]">
                            <Key className="w-2.5 h-2.5 text-[#007AFF]" /> PIN: {pin}
                          </button>
                        </div>
                        <h1 className="text-sm font-black text-[#1C1C1E] tracking-tight">Timeline</h1>
                        <button 
                          onClick={handleOpenNewEntry}
                          className="p-1.5 bg-[#007AFF] hover:bg-[#007AFF]/90 hover:scale-105 active:scale-95 text-white rounded-full transition-all cursor-pointer flex items-center justify-center shadow-xs"
                          title="Write Diary"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Integrated iOS Search Box */}
                      <div className="px-3.5 py-2.5 bg-white border-b border-[#E5E5EA]">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93]" />
                          <input 
                            type="text" 
                            placeholder="Search notes, body, or tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F2F2F7] text-xs text-[#1C1C1E] pl-8 pr-8 py-1.5 rounded-lg border border-[#E5E5EA] focus:outline-none focus:ring-1 focus:ring-[#007AFF] transition-all font-sans placeholder-[#8E8E93]"
                          />
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* SCROLLABLE GROUPS TIMELINE */}
                      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 custom-device-scroll">
                        {Object.keys(groupedEntriesMap).length === 0 ? (
                           <div className="py-12 text-center flex flex-col justify-center items-center">
                            <FileText className="w-12 h-12 text-[#8E8E93] mb-2" />
                            <p className="text-xs font-bold text-[#1C1C1E]">No Entries Found</p>
                            <p className="text-[10px] text-[#8E8E93] px-6 mt-1">
                              {searchQuery.trim() ? "Try modifying search queries." : "Get started by recording your daily reflections in SwiftUI."}
                            </p>
                          </div>
                        ) : (
                          Object.keys(groupedEntriesMap).map((headerDate) => (
                            <div key={headerDate} className="space-y-2">
                              {/* Group Date Header */}
                              <div className="text-[10.5px] uppercase font-bold tracking-wider text-[#8E8E93] border-b border-[#E5E5EA] pb-1 flex items-center justify-between">
                                <span>{headerDate}</span>
                                <span className="text-[9px] font-mono text-[#8E8E93] bg-[#E5E5EA] px-2 py-0.5 rounded-full font-bold">{groupedEntriesMap[headerDate].length} {groupedEntriesMap[headerDate].length === 1 ? "note" : "notes"}</span>
                              </div>

                              {/* Rows in this date group */}
                              <div className="space-y-2">
                                {groupedEntriesMap[headerDate].map((e) => (
                                  <div 
                                    key={e.id}
                                    onClick={() => handleOpenEditEntry(e)}
                                    className="p-3 bg-white hover:bg-white/95 rounded-2xl border border-[#E5E5EA] transition-all cursor-pointer relative group overflow-hidden shadow-xs"
                                  >
                                    <div className="flex justify-between items-start gap-1">
                                      <h3 className="font-bold text-xs text-[#1C1C1E] leading-tight line-clamp-1">{e.title}</h3>
                                      <span className="text-[9px] text-[#007AFF] font-bold font-mono flex-shrink-0 bg-[#007AFF]/10 px-1.5 py-0.5 rounded border border-[#007AFF]/10">
                                        {new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#3A3A3C] line-clamp-2 mt-1.5 leading-relaxed">{e.content || "Empty content..."}</p>
                                    
                                    {/* Footer with tag and deletion support */}
                                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#F2F2F7]">
                                      <span className="inline-flex items-center gap-1 text-[9px] text-[#8E8E93] font-semibold">
                                        {getCategoryIcon(e.category)}
                                        {e.category}
                                      </span>
                                      
                                      <button 
                                        onClick={(ev) => handleDeleteEntry(e.id, ev)}
                                        className="p-1 text-[#8E8E93] hover:text-rose-600 rounded transition-colors"
                                        title="Delete Entry"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* NEW/EDIT DIARY SHEET */}
                  {currentScreen === "editor" && (
                    <motion.div 
                      key="editor"
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 100 }}
                      className="absolute inset-0 flex flex-col bg-[#F2F2F7] z-10"
                    >
                      {/* Editor top bar navigation */}
                      <div className="px-4 py-3 bg-white border-b border-[#E5E5EA] flex justify-between items-center">
                        <button 
                          onClick={() => setCurrentScreen("timeline")}
                          className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-[#007AFF]/95 font-semibold cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Discard
                        </button>
                        <h2 className="text-xs font-bold text-[#1C1C1E] tracking-tight uppercase">
                          {isNewEntry ? "New Timeline" : "Modify Note"}
                        </h2>
                        <button 
                          onClick={handleSaveEntry}
                          disabled={!editTitle.trim()}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                            editTitle.trim() 
                              ? "bg-[#007AFF] text-white hover:bg-[#007AFF]/90" 
                              : "bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed"
                          }`}
                        >
                          Save
                        </button>
                      </div>

                      {/* Content Form container */}
                      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-device-scroll form-content p-4">
                        
                        {/* Interactive Title String */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#8E8E93]">Record Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Mount Tamalpais Hiking"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-white border border-[#E5E5EA] text-xs font-bold rounded-lg px-3 py-2 text-[#1C1C1E] placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                          />
                        </div>

                        {/* Automatic Live Timestamp display (simulating SwiftData Date captures) */}
                        <div className="p-3 bg-white border border-[#E5E5EA] rounded-xl space-y-1.5 shadow-xs">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-[#007AFF] block">Automatic Metadata Tracker</span>
                          <div className="flex items-center gap-2 text-xs text-[#1C1C1E]">
                            <span className="font-mono text-[9px] bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 px-1.5 py-0.5 rounded font-bold">AUTO-TIMESTAMP</span>
                            <span>{isNewEntry ? new Date().toLocaleDateString('en-US', { dateStyle: 'long' }) + " " + new Date().toLocaleTimeString('en-US', { timeStyle: 'short' }) : new Date(editingEntry?.timestamp || "").toLocaleDateString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</span>
                          </div>
                        </div>

                        {/* Segmented Picker category */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#8E8E93]">Category Section</label>
                          <div className="grid grid-cols-4 gap-1 p-1 bg-[#E5E5EA]/60 border border-[#E5E5EA] rounded-xl">
                            {["Personal", "Work", "Thoughts", "Inspiration"].map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setEditCategory(cat)}
                                className={`py-1 text-[9px] font-bold rounded-md transition-all ${
                                  editCategory === cat 
                                    ? "bg-white text-[#1C1C1E] shadow-sm" 
                                    : "text-[#3A3A3D] hover:text-[#1C1C1E]"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Textarea Diary Content */}
                        <div className="space-y-1.5 flex flex-col flex-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#8E8E93]">Secure Reflection Body</label>
                          <textarea 
                            placeholder="Write your private memories here..."
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white border border-[#E5E5EA] text-xs rounded-lg px-3 py-2.5 text-[#1C1C1E] placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#007AFF] min-h-[160px] resize-none flex-1 leading-relaxed"
                          />
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* BIOMETRIC SIMULATION SCANNING WINDOW HUD */}
                <AnimatePresence>
                  {faceIDScanning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6"
                    >
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Standard FaceID concentric layout boxes */}
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className={`absolute inset-0 border-2 rounded-full border-dashed ${
                            faceIDSuccess ? "border-emerald-500" : "border-[#007AFF]/45"
                          }`}
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute w-24 h-24 border border-[#007AFF]/20 rounded-full"
                        />

                        {faceIDSuccess ? (
                          <motion.div 
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="text-emerald-400 flex flex-col items-center"
                          >
                            <CheckCircle className="w-14 h-14" />
                          </motion.div>
                        ) : (
                          <div className="text-[#007AFF] flex flex-col items-center animate-pulse">
                            {/* Scanning indicator */}
                            <Shield className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white mt-6 tracking-wide">
                        {faceIDSuccess ? "Biometric Authenticated" : "Securing Scanner Link"}
                      </h3>
                      <p className="text-[10px] text-neutral-300 px-6 mt-1.5 leading-normal">
                        {faceIDSuccess ? "Keychain permission unlocked." : "Simulating system calling iOS SecTrustEvaluate framework context."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SUCCESS CODE SAVED ANIMATION */}
                <AnimatePresence>
                  {successAnimation && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white z-55 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="font-black text-[#1C1C1E] text-base">Security Provisioned!</h4>
                      <p className="text-xs text-[#8E8E93] px-10 mt-1">
                        Keychain state successfully updated. Starting application timeline scene context.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* HOME INDICATOR ACCENT */}
              <div className="h-4 pb-2 flex justify-center items-center select-none bg-[#F2F2F7]">
                <div onClick={handleSimulateBackground} className="w-32 h-1 bg-[#1C1C1E]/30 rounded-full transition-colors hover:bg-[#1C1C1E]/65 cursor-pointer" />
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Chevron Helper
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

// Inner keypad helper component
interface SimKeypadProps {
  onTap: (num: string) => void;
  onBack: () => void;
  showBiometricBtn?: boolean;
  onBiometricClick?: () => void;
  shake?: boolean;
}

function SimKeypad({ onTap, onBack, showBiometricBtn = false, onBiometricClick, shake = false }: SimKeypadProps) {
  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"]
  ];

  return (
    <div className={`mt-auto space-y-3 px-2 ${shake ? "animate-shake" : ""}`}>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-4">
          {row.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => onTap(digit)}
              className="w-14 h-14 rounded-full bg-white hover:bg-[#E5E5EA] active:bg-[#D1D1D6] active:scale-90 text-[20px] font-medium text-[#1C1C1E] flex items-center justify-center transition-all select-none cursor-pointer border border-[#E5E5EA] shadow-xs"
            >
              {digit}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-4">
        {/* FaceID slot */}
        {showBiometricBtn ? (
          <button
            type="button"
            onClick={onBiometricClick}
            className="w-14 h-14 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/15 hover:bg-[#007AFF]/20 active:scale-90 flex items-center justify-center text-[#007AFF] transition-all cursor-pointer"
            title="Biometrics evaluation"
          >
            {/* Simple biometric face scan vector icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
               <path d="M3 7V5a2 2 0 0 1 2-2h2" />
               <path d="M17 3h2a2 2 0 0 1 2 2v2" />
               <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
               <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
               <path d="M8 14s1.5 2 4 2 4-2 4-2" />
               <line x1="9" y1="9" x2="9.01" y2="9" />
               <line x1="15" y1="9" x2="15.01" y2="9" />
               <line x1="12" y1="12" x2="12" y2="12" />
            </svg>
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}

        {/* Zero button */}
        <button
          type="button"
          onClick={() => onTap("0")}
          className="w-14 h-14 rounded-full bg-white hover:bg-[#E5E5EA] active:bg-[#D1D1D6] active:scale-90 text-[20px] font-medium text-[#1C1C1E] flex items-center justify-center transition-all cursor-pointer border border-[#E5E5EA] shadow-xs"
        >
          0
        </button>

        {/* Backspace button */}
        <button
          type="button"
          onClick={onBack}
          className="w-14 h-14 rounded-full bg-transparent hover:bg-[#E5E5EA]/50 active:scale-95 text-[#1C1C1E] flex items-center justify-center transition-all cursor-pointer"
        >
          {/* Backspace standard vector */}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

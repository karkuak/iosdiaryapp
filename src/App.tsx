import React, { useState } from "react";
import Simulator from "./components/Simulator";
import CodeViewer from "./components/CodeViewer";
import { 
  ShieldAlert, Settings, Sparkles, Layers, BookOpen, Key, CheckCircle, Smartphone 
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"workspace" | "info">("workspace");

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] flex flex-col font-sans">
      
      {/* GLOBAL TOP BAR */}
      <header className="bg-white border-b border-[#D1D1D6] px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#007AFF] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
              IOS DEVELOPMENT
            </span>
            <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-mono tracking-wide font-semibold uppercase">READY TO EXPORT</span>
            </div>
          </div>
          
          <h1 className="text-xl font-black tracking-tight text-[#1C1C1E] mt-1 flex items-center gap-2">
            Secure Diary <span className="text-[#007AFF]">SwiftUI Studio</span>
          </h1>
          <p className="text-xs text-[#8E8E93] mt-1 max-w-2xl leading-relaxed">
            Configure, simulate, and download a secure iOS diary application featuring state-of-the-art 
            <strong> SwiftData local storage</strong>, encrypted <strong>Keychain credentials</strong>, and robust <strong>Face ID biometrics</strong>.
          </p>
        </div>

        {/* STATS BOARD */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl border border-[#D1D1D6]">
          <div className="text-center px-3.5 py-1 border-r border-[#E5E5EA]">
            <span className="text-[10px] text-[#8E8E93] block uppercase font-bold tracking-wider">Swift Language</span>
            <span className="text-xs font-bold text-[#1C1C1E] font-mono">v5.10 / v6.0</span>
          </div>
          <div className="text-center px-3.5 py-1 border-r border-[#E5E5EA]">
            <span className="text-[10px] text-[#8E8E93] block uppercase font-bold tracking-wider">Persistence</span>
            <span className="text-xs font-bold text-[#FF9500] font-mono">SwiftData</span>
          </div>
          <div className="text-center px-3.5 py-1">
            <span className="text-[10px] text-[#8E8E93] block uppercase font-bold tracking-wider">Target SDK</span>
            <span className="text-xs font-bold text-[#007AFF] font-mono">iOS 17.0+</span>
          </div>
        </div>
      </header>

      {/* WORKSPACE DIVIDER GRID */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden h-[calc(100vh-140px)]">
        
        {/* LEFT PANEL: INTERACTIVE SIMULATOR (4 COLS ON XL) */}
        <div className="xl:col-span-5 flex flex-col bg-[#F2F2F7] border-r border-[#D1D1D6] overflow-hidden">
          
          {/* SIMULATOR HEADER SPECIFICATION */}
          <div className="p-4 bg-white border-b border-[#E5E5EA] space-y-1">
            <h2 className="text-xs font-bold text-[#1C1C1E] flex items-center gap-1.5 uppercase tracking-wide">
              <Smartphone className="w-4 h-4 text-[#007AFF]" /> VIRTUAL DEVICE EMULATION
            </h2>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              Test first-time security PIN generation, subsequent biometric lockups, and database timestamp query sorting instantly on our simulated iOS build frame.
            </p>
          </div>

          {/* ACTIVE SIMULATOR ELEMENT */}
          <div className="flex-1 overflow-y-auto custom-device-scroll">
            <Simulator />
          </div>

          {/* SIMULATOR QUICK INFO HELP */}
          <div className="p-4 bg-white border-t border-[#E5E5EA] text-xs text-[#8E8E93] space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5" />
              <p className="leading-snug">
                <strong>Background Auto-Lock:</strong> Click <code className="text-[#1C1C1E] bg-[#F2F2F7] px-1 py-0.5 rounded font-mono">Drag To Background</code> at the top. Moving away immediate arms the safety block, matching active <code className="text-[#007AFF] font-mono">ScenePhase</code> hooks.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5" />
              <p className="leading-snug">
                <strong>Reset PIN:</strong> Click the <code className="text-[#1C1C1E] bg-[#F2F2F7] px-1 py-0.5 rounded font-mono block sm:inline mt-1 sm:mt-0">PIN: 1234</code> badge inside the app bar on the timeline screen to wipe local storage.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: DEV HUB / EXPLORER (7 COLS ON XL) */}
        <div className="xl:col-span-7 flex flex-col bg-white overflow-hidden">
          <CodeViewer />
        </div>

      </main>

      {/* MINI FOOTER CREDITS */}
      <footer className="bg-white border-t border-[#D1D1D6] px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8E8E93]">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Architected with pure <strong>SwiftUI 5.0</strong> &amp; <strong>SwiftData</strong> APIs</span>
        </span>
        <span className="mt-1 sm:mt-0 font-mono text-[#8E8E93]">
          Created secure daily diary timelines with Local🔐Authentication layers.
        </span>
      </footer>

    </div>
  );
}

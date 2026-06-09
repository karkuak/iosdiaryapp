import React, { useState } from "react";
import { swiftFiles, xcodeSetupGuideMarkdown, SwiftFile } from "../data/swiftCodeTemplates";
import { 
  Copy, Check, FileText, Download, Code, Globe, HelpCircle, 
  Settings, Terminal, Layers, AppWindow, Cpu, ShieldAlert 
} from "lucide-react";

export default function CodeViewer() {
  const [selectedFile, setSelectedFile] = useState<SwiftFile>(swiftFiles[0]);
  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "guide">("code");

  const handleCopyCode = (file: SwiftFile) => {
    navigator.clipboard.writeText(file.code);
    setCopiedMap({ ...copiedMap, [file.name]: true });
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [file.name]: false }));
    }, 2000);
  };

  const handleCopyAllCodeAndManifests = () => {
    const combined = swiftFiles.map(f => `// ==========================================\n// FILE: ${f.path}\n// ==========================================\n\n${f.code}`).join("\n\n");
    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 2500);
  };

  const handleDownloadZipSimulator = () => {
    // Generate a downloadable plain text representation of the complete workspace
    const header = `=======================================================\nSECURE DIARY SWIFTUI ARCHITECTURE WORKSPACE EXPORT\n=======================================================\n\n`;
    const body = swiftFiles.map(f => `--- FILE PATH: ${f.path} ---\n${f.code}`).join("\n\n");
    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SecureDiarySwiftCodebase.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to colorize/highlight Swift code lines roughly for a premium IDE look
  const formatSwiftLine = (line: string) => {
    if (!line.trim()) return "\n";
    
    // Quick escape HTML
    let text = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Highlighting replacements
    // Comments
    if (text.trim().startsWith("///") || text.trim().startsWith("//")) {
      return `<span class="text-slate-500 italic">${text}</span>`;
    }

    // Keywords, attribute macro annotations
    const keywords = [
      "import", "final", "public", "private", "class", "struct", "enum", "extension", 
      "let", "var", "init", "func", "return", "if", "else", "guard", "switch", "case", 
      "try", "await", "catch", "do", "self", "nil", "true", "false", "@main", "@Model", 
      "@Attribute", "@Published", "@StateObject", "@State", "@ObservedObject", 
      "@Environment", "@Query"
    ];

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, "g");
      if (kw.startsWith("@")) {
        text = text.replace(regex, `<span class="text-rose-400 font-semibold">${kw}</span>`);
      } else if (["import", "public", "private", "final", "class", "struct", "enum"].includes(kw)) {
        text = text.replace(regex, `<span class="text-indigo-400 font-semibold">${kw}</span>`);
      } else {
        text = text.replace(regex, `<span class="text-amber-300 font-medium">${kw}</span>`);
      }
    });

    // Type casting/type signatures e.g., String, Date, Bool, UUID
    const types = ["String", "Date", "Bool", "UUID", "Int", "Data", "Keychain", "Double", "View", "App", "Scene", "Void"];
    types.forEach(t => {
      const regex = new RegExp(`\\b${t}\\b`, "g");
      text = text.replace(regex, `<span class="text-emerald-400 font-mono">${t}</span>`);
    });

    // Strings
    text = text.replace(/("[^"]*")/g, `<span class="text-green-300">$1</span>`);

    return text;
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] text-[#1C1C1E] font-sans overflow-hidden">
      
      {/* TABS SELECTOR */}
      <div className="p-4 bg-white border-b border-[#D1D1D6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex gap-2.5 bg-[#F2F2F7] p-1.5 rounded-xl border border-[#E5E5EA]">
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "code" 
                ? "bg-[#007AFF] text-white shadow-sm" 
                : "text-[#8E8E93] hover:text-[#1C1C1E]"
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Core App Source (Swift)
          </button>
          <button
            onClick={() => setViewMode("guide")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "guide" 
                ? "bg-[#007AFF] text-white shadow-sm" 
                : "text-[#8E8E93] hover:text-[#1C1C1E]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Xcode Setup Guide
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllCodeAndManifests}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 hover:bg-[#007AFF]/20 active:scale-95 transition-all cursor-pointer`}
            title="Copies all 6 project files sequentially for easy local backup"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? "Copied All Files!" : "Copy Full Codebase"}
          </button>
          
          <button
            onClick={handleDownloadZipSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-[#F2F2F7] active:scale-95 border border-[#D1D1D6] text-[#1C1C1E] transition-all cursor-pointer shadow-xs"
            title="Download unified plaintext export file of all modules"
          >
            <Download className="w-3.5 h-3.5" /> Download TXT Project
          </button>
        </div>
      </div>

      {/* CORE DISPLAY */}
      {viewMode === "code" ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* FILE LIST SIDEBAR */}
          <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#D1D1D6] overflow-y-auto p-4 space-y-3.5 flex-shrink-0">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#007AFF]" /> FILE SELECTOR
            </h3>
            
            <div className="space-y-1">
              {swiftFiles.map((file) => {
                const isSelected = file.name === selectedFile.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex flex-col border cursor-pointer ${
                      isSelected 
                        ? "bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF] font-semibold" 
                        : "border-transparent text-[#3A3A3D] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-[#007AFF]" : "text-neutral-400"}`} />
                      {file.name}
                    </span>
                    <span className="text-[9px] text-[#8E8E93] pl-5 mt-0.5 font-light truncate">
                      {file.path}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-[#E5E5EA] text-[10px] text-[#8E8E93] space-y-2.5">
              <span className="font-bold tracking-wide text-[#1C1C1E] block flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#007AFF]" /> SYSTEM ARCHITECTURE
              </span>
              <p className="leading-relaxed">
                Our secure diary requires 4 layers of native protection:
              </p>
              <ul className="list-disc pl-3.5 space-y-1.5">
                <li><strong>Keychain:</strong> Encrypted passcode persistence (with biometrics fallback integration).</li>
                <li><strong>ScenePhase:</strong> Hook context trigger back to locked mode automatically.</li>
                <li><strong>SwiftData:</strong> Indexing local SQLite container context.</li>
              </ul>
            </div>
          </div>

          {/* ACTIVE FILE PREVIEW CODE AREA */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0D131F] border-l border-[#D1D1D6]">
            
            {/* Header with name and copy individual file */}
            <div className="px-5 py-3 bg-[#131B2C] border-b border-[#24314C] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-1 bg-[#090D16] text-[#60A5FA] border border-[#24314C] rounded">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] text-slate-400 hidden lg:inline">
                  {selectedFile.description}
                </span>
              </div>
              
              <button
                onClick={() => handleCopyCode(selectedFile)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#60A5FA] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 rounded-md border border-[#3B82F6]/30 transition-all cursor-pointer font-semibold"
              >
                {copiedMap[selectedFile.name] ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Rich commented and marked code viewer */}
            <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed relative text-slate-300 custom-device-scroll">
              <div className="absolute top-4 left-3 w-8 text-slate-600 text-right select-none pr-3 border-r border-[#24314C]">
                {selectedFile.code.split("\n").map((_, i) => (
                  <div key={i} className="text-[10px] leading-relaxed h-[18px]">{i + 1}</div>
                ))}
              </div>
              <pre className="pl-11 select-text selection:bg-slate-700/60 font-mono">
                <code>
                  {selectedFile.code.split("\n").map((line, idx) => (
                    <div 
                      key={idx} 
                      className="h-[18px] whitespace-pre"
                      dangerouslySetInnerHTML={{ __html: formatSwiftLine(line) }}
                    />
                  ))}
                </code>
              </pre>
            </div>

          </div>

        </div>
      ) : (
        /* XCODE SETUP GUIDE TAB */
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white text-[#1C1C1E] custom-device-scroll">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-4 bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#007AFF]">Important SDK Dependency Note</h4>
                <p className="text-xs text-[#3A3A3C] mt-1 leading-relaxed">
                  The security elements utilize LocalAuthentication (iOS biometric chips) and system security Keychain dictionary wrappers. You must run these files inside Xcode (either via the Simulator or an active iPhone device) as web browsers lack access to Apple security hardware.
                </p>
              </div>
            </div>

            {/* Render hardcoded guide styled properly using Tailwind since they are static blocks */}
            <div className="markdown-body space-y-5 text-xs text-[#3A3A3C] leading-relaxed">
              <h2 className="text-lg font-black text-[#1C1C1E] border-b border-[#E5E5EA] pb-2">Xcode Swift App Setup Manual</h2>
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5 pt-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF]/10 text-[10px] flex items-center justify-center font-bold text-[#007AFF]">1</span>
                  Create a New Project in Xcode
                </h3>
                <p className="pl-6 text-[#8E8E93]">
                  Open Xcode 15 or 16, tap <strong>File &gt; New &gt; Project...</strong>, and select <strong>App (iOS)</strong>.
                  Name the project <code className="text-[#007AFF] font-mono bg-[#F2F2F7] px-1 py-0.5 rounded border border-[#E5E5EA]">SecureDiary</code>. Under Interface select <strong>SwiftUI</strong>, and set Storage to <strong>SwiftData</strong>. Click Next and create the directory workspace.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5 pt-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF]/10 text-[10px] flex items-center justify-center font-bold text-[#007AFF]">2</span>
                  Replicate Folder Code Layout
                </h3>
                <p className="pl-6 text-[#8E8E93]">
                  Right-click the SecureDiary root folder inside Xcode's File list and build groups representing:
                </p>
                <div className="pl-6 grid grid-cols-2 gap-3 max-w-md pt-1">
                  <div className="p-2 border border-[#E5E5EA] rounded-xl bg-[#F2F2F7]/50">
                    <span className="font-mono text-[10px] font-bold text-[#007AFF] block">📁 Models</span>
                    <span className="text-[10px] text-[#8E8E93] font-sans">DiaryEntry.swift</span>
                  </div>
                  <div className="p-2 border border-[#E5E5EA] rounded-xl bg-[#F2F2F7]/50">
                    <span className="font-mono text-[10px] font-bold text-[#007AFF] block">📁 Managers</span>
                    <span className="text-[10px] text-[#8E8E93] font-sans">SecurityManager.swift</span>
                  </div>
                  <div className="p-2 border border-[#E5E5EA] rounded-xl bg-[#F2F2F7]/50">
                    <span className="font-mono text-[10px] font-bold text-[#007AFF] block">📁 Views</span>
                    <span className="text-[10px] text-[#8E8E93] font-sans">AuthViews.swift, TimelineView.swift, EditorView.swift</span>
                  </div>
                  <div className="p-2 border border-[#E5E5EA] rounded-xl bg-[#F2F2F7]/50">
                    <span className="font-mono text-[10px] font-bold text-[#007AFF] block">📁 Supporting Files</span>
                    <span className="text-[10px] text-[#8E8E93] font-sans">Info.plist</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5 pt-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF]/10 text-[10px] flex items-center justify-center font-bold text-[#007AFF]">3</span>
                  Copy Files Content
                </h3>
                <p className="pl-6 text-[#8E8E93]">
                  Select each file from our list, hit <strong>⌘N</strong> inside your Xcode group, select Swift File or SwiftUI view interface, and paste the precise code lines. Ensure you replace the main <code className="text-[#007AFF] font-mono bg-[#F2F2F7] px-1 py-0.5 rounded border border-[#E5E5EA]">SecureDiaryApp.swift</code> of the project root with the <code className="text-[#007AFF] font-mono">DiaryApp.swift</code> content.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5 pt-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF]/10 text-[10px] flex items-center justify-center font-bold text-[#007AFF]">4</span>
                  Bundle biometric keys in Info.plist
                </h3>
                <p className="pl-6 text-[#8E8E93]">
                  App Store applications using Face ID must describe the security usage reasoning. Head over to your project target, select **Info**, right-click any line to define a new key:
                </p>
                <div className="pl-6 pt-1">
                  <div className="p-3.5 bg-[#F2F2F7] rounded-xl border border-[#D1D1D6] space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-tight text-[#8E8E93] block">Key Name (Xcode Property List)</span>
                    <code className="text-[10.5px] font-mono text-[#007AFF] block">Privacy - Face ID Usage Description</code>
                    <span className="text-[10px] uppercase font-bold tracking-tight text-[#8E8E93] block pt-1.5">Value</span>
                    <p className="text-[11px] leading-relaxed text-[#3A3A3C] font-sans italic">"Secure Diary requires Face ID biometric authentication to quickly and safely grant access to your encrypted entries."</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5 pt-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF]/10 text-[10px] flex items-center justify-center font-bold text-[#007AFF]">5</span>
                  Simulating Biometrics and Enrolling
                </h3>
                <p className="pl-6 text-[#8E8E93]">
                  When debugging the app in the Simulator, Xcode can emulate FaceID registration:
                </p>
                <ul className="list-disc pl-11 space-y-1 text-[#8E8E93]">
                  <li>In the top MacOS menu bar of the Simulator (not Xcode), trace to: <strong>Features &gt; Face ID</strong>.</li>
                  <li>Verify <strong>Enrolled</strong> is checked.</li>
                  <li>Click the Biometric scanner inside the app, then select <strong>Features &gt; Face ID &gt; Matching Face</strong> to trigger successful auth.</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-[#E5E5EA] text-center">
                <button 
                  onClick={() => setViewMode("code")}
                  className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Explore Code Workspace Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

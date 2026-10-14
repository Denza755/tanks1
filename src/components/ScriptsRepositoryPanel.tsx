import React, { useState } from 'react';
import { UNITY_SCRIPTS, UnityScriptFile, UPGRADE_GUIDE_STEPS } from '../data/unityScripts';
import JSZip from 'jszip';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  FolderTree,
  Terminal,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ScriptsRepositoryPanel: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<UnityScriptFile>(UNITY_SCRIPTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter scripts
  const filteredScripts = UNITY_SCRIPTS.filter(
    (s) =>
      s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedScript.code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zip = new JSZip();

      // Add each upgraded script inside its exact project directory structure
      UNITY_SCRIPTS.forEach((script) => {
        zip.file(script.relativePath, script.code);
      });

      // Add a README.md in the root of the zip with instructions
      const readmeContent = `# UMA 3 Upgrade & Character Creator Package for MMO Lite
Project: Denza755/mmo_lite (Unity 6000.3.14f1)

## Included Files:
${UNITY_SCRIPTS.map((s) => `- ${s.relativePath} (${s.description})`).join('\n')}

## Quick Installation:
1. Extract this zip archive into your Unity project root so that the files merge into your 'Assets/' folder.
2. In Unity 6 Editor: Click 'Tools -> UMA -> Upgrade to UMA 3 & Unity 6 Shaders'.
3. Right click 'Assets/UMA/Core/ShaderPackages' -> 'Reimport'.
4. Open 'UMA -> Global Library' -> 'Rebuild Index'.
5. Open scene 'AnyMMODemoMainMenu' and test the new Character Creation panel!
`;
      zip.file('README_UMA3_UPGRADE.md', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MMO_Lite_UMA3_Upgrade_Scripts.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Top Banner with Download Action */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950/40 border border-sky-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-base mb-1">
            <FolderTree className="w-5 h-5" />
            <h3>Complete UMA 3 & AnyRPG C# Upgrade Source Files</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Drop-in replacement C# scripts configured specifically for Unity 6000.3.14f1 and UMA 3.
            Maintains full compatibility with AnyRPG's save system, unit controllers, and FishNet MMO networking.
          </p>
        </div>
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isDownloading ? 'Building ZIP...' : 'Download All Scripts (.zip)'}</span>
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Script Explorer */}
        <div className="md:col-span-4 flex flex-col gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Scripts List */}
          <div className="flex flex-col gap-2">
            {filteredScripts.map((script) => {
              const isSelected = selectedScript.filename === script.filename;
              return (
                <button
                  key={script.filename}
                  onClick={() => setSelectedScript(script)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono flex items-center gap-1.5 truncate">
                      <FileCode2 className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                      {script.filename}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                      {script.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {script.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="md:col-span-8 flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          {/* File Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-mono">{selectedScript.filename}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                  {selectedScript.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedScript.relativePath}</p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedScript ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Description */}
          <div className="p-3 bg-slate-950/40 rounded-xl text-xs text-slate-300 border border-slate-800/80 leading-relaxed">
            {selectedScript.description}
          </div>

          {/* Code Viewer */}
          <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] border border-slate-800 custom-scrollbar select-text leading-relaxed">
            {selectedScript.code}
          </pre>
        </div>
      </div>

      {/* Migration Workflow Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h4>Complete Step-by-Step Terminal & Unity Upgrade Workflow</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {UPGRADE_GUIDE_STEPS.map((s) => (
            <div key={s.step} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 text-[11px] font-extrabold flex items-center justify-center">
                    {s.step}
                  </span>
                  <h5 className="text-xs font-bold text-slate-200">{s.title}</h5>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{s.description}</p>
              </div>

              <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-sky-300 border border-slate-800/80 space-y-1">
                {s.commands.map((cmd, i) => (
                  <div key={i} className="truncate" title={cmd}>
                    &gt; {cmd}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

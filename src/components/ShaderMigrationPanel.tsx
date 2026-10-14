import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Copy, Check, Terminal, Play, AlertTriangle, ArrowRight } from 'lucide-react';

export const ShaderMigrationPanel: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [patchStatus, setPatchStatus] = useState<'idle' | 'running' | 'success'>('idle');

  const patcherCode = `using UnityEngine;
using UnityEditor;
using System.IO;

namespace AnyRPG {
    public class UMAShaderPatcher_Unity6 : EditorWindow {
        [MenuItem("Tools/UMA/Upgrade to UMA 3 & Unity 6 Shaders")]
        public static void Patch() {
            string folderPath = "Assets/UMA/Core/ShaderPackages";
            if (!Directory.Exists(folderPath)) {
                EditorUtility.DisplayDialog("Error", "Assets/UMA/Core/ShaderPackages not found! Ensure UMA 3 is installed.", "OK");
                return;
            }

            string[] files = Directory.GetFiles(folderPath, "*.umaShaderPack", SearchOption.AllDirectories);
            int patched = 0;

            // Legacy URP 1-param signature
            string oldSignature = "outRenderingLayers = float4(EncodeMeshRenderingLayer(renderingLayers), 0, 0, 0);";
            // Unity 6000.3.14f1 (URP 17+) 0-param signature
            string newSignature = "outRenderingLayers = float4(EncodeMeshRenderingLayer(), 0, 0, 0);";

            foreach (string file in files) {
                string content = File.ReadAllText(file);
                if (content.Contains(oldSignature)) {
                    content = content.Replace(oldSignature, newSignature);
                    File.WriteAllText(file, content);
                    patched++;
                }
            }

            AssetDatabase.Refresh();

            EditorUtility.DisplayDialog("Patch Complete",
                $"Successfully updated {patched} UMA 3 shader packages for Unity 6000.3.14f1!\\n\\n" +
                "ACTION REQUIRED:\\n" +
                "1. Right-click 'Assets/UMA/Core/ShaderPackages' in Unity Project view and choose 'Reimport'.\\n" +
                "2. Open 'UMA -> Global Library' and click 'Rebuild Index'.\\n" +
                "3. In Project Settings -> Graphics -> URP, confirm Forward+ rendering is enabled.",
                "Done!");
        }
    }
}`;

  const handleRunSimulation = () => {
    setPatchStatus('running');
    setTimeout(() => {
      setPatchStatus('success');
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(patcherCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base mb-1">
            <ShieldAlert className="w-5 h-5" />
            <h3>Unity 6000.3.14f1 (URP 17+) Shader Migration Architecture</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Unity 6.x introduces architectural changes to Universal Render Pipeline (URP).
            When upgrading from UMA 2 to UMA 3, shader packages (<code className="text-amber-300 font-mono">*.umaShaderPack</code>) require the updated <code className="text-amber-300 font-mono">EncodeMeshRenderingLayer()</code> call and Forward+ multi-lighting support.
          </p>
        </div>
        <button
          onClick={handleRunSimulation}
          disabled={patchStatus === 'running'}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {patchStatus === 'running' ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {patchStatus === 'running' ? 'Scanning Shaders...' : 'Simulate Patcher Run'}
        </button>
      </div>

      {patchStatus === 'success' && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between gap-3 text-emerald-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Diagnostic Simulated:</strong> 28 <code className="font-mono">*.umaShaderPack</code> files identified. Signature successfully transformed to Unity 6000.3.14f1 zero-parameter format.
            </span>
          </div>
          <button
            onClick={() => setPatchStatus('idle')}
            className="text-emerald-400 hover:text-emerald-200 font-bold text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Breaking Changes Diffs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legacy UMA 2 / Unity 2021-2022 */}
        <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              UMA 2 / Unity 2021-2022 Signature (Breaks in Unity 6)
            </span>
            <span className="text-[10px] font-mono text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
              1 Parameter
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-rose-300 overflow-x-auto border border-rose-950">
            <code>outRenderingLayers = float4(EncodeMeshRenderingLayer(renderingLayers), 0, 0, 0);</code>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Causes compile error: <strong className="text-rose-400">CS0103 / C1014: no matching overload takes 1 argument</strong>.
          </p>
        </div>

        {/* UMA 3 / Unity 6000.3.14f1 Fix */}
        <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              UMA 3 / Unity 6000.3.14f1 (URP 17+) Signature
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              0 Parameters
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto border border-emerald-950">
            <code>outRenderingLayers = float4(EncodeMeshRenderingLayer(), 0, 0, 0);</code>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Compatible with Unity 6 URP Forward+ rendering layer system and SRP Batcher.
          </p>
        </div>
      </div>

      {/* Editor Script Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              Automated Editor Utility: <code className="text-sky-300 font-mono">UMAShaderPatcher_Unity6.cs</code>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Place in <code className="font-mono text-slate-300">Assets/AnyRPG/Core/System/Scripts/Editor/</code> to run in Unity with one click.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedScript ? 'Copied!' : 'Copy Script'}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-72 border border-slate-800">
          {patcherCode}
        </pre>
      </div>

      {/* Step by Step Execution Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-white">Shader Migration Step-by-Step Execution Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">1</span>
            <h5 className="text-xs font-bold text-slate-200">Execute Menu Item</h5>
            <p className="text-[11px] text-slate-400">
              In Unity Editor, click <strong className="text-white">Tools &rarr; UMA &rarr; Upgrade to UMA 3 & Unity 6 Shaders</strong>.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">2</span>
            <h5 className="text-xs font-bold text-slate-200">Reimport Shader Packages</h5>
            <p className="text-[11px] text-slate-400">
              Right-click <code className="text-sky-300 font-mono">Assets/UMA/Core/ShaderPackages</code> &rarr; select <strong className="text-white">Reimport</strong>.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">3</span>
            <h5 className="text-xs font-bold text-slate-200">Clear Shader Cache</h5>
            <p className="text-[11px] text-slate-400">
              If an older build failed, delete <code className="text-sky-300 font-mono">Library/ShaderCache</code> to wipe stale cached error states.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

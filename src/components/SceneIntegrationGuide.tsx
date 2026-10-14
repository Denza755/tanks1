import React, { useState } from 'react';
import { TARGET_SCENES } from '../data/umaData';
import { TargetSceneInfo } from '../types/uma';
import {
  Compass,
  CheckCircle2,
  Layers,
  Sparkles,
  MapPin,
  Play,
  Monitor,
  Castle,
  Film,
  Globe
} from 'lucide-react';

export const SceneIntegrationGuide: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<TargetSceneInfo>(TARGET_SCENES[0]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string, idx: number) => {
    const key = `${id}_${idx}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSceneIcon = (type: TargetSceneInfo['type']) => {
    switch (type) {
      case 'Menu':
        return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'Dungeon':
        return <Castle className="w-4 h-4 text-rose-400" />;
      case 'Cutscene':
        return <Film className="w-4 h-4 text-purple-400" />;
      case 'Zone':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-base mb-1">
            <Compass className="w-5 h-5" />
            <h3>MMO Lite 5 Target Scenes Migration Matrix</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Detailed integration blueprints for the 5 working scenes in <code className="text-indigo-300 font-mono">Denza755/mmo_lite</code>:
            validating UMA 3 DynamicCharacterAvatar instancing, bone sockets, URP lighting, and multiplayer state replication.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <span>5 Scenes Configured</span>
        </div>
      </div>

      {/* Main Grid: Scene Selector & Detail View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Scene Selector Tabs */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
            Working Scenes (MMO Lite)
          </span>
          {TARGET_SCENES.map((scene) => {
            const isSelected = selectedScene.id === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 shrink-0">
                  {getSceneIcon(scene.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{scene.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                      {scene.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {scene.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Scene Migration Blueprint */}
        <div className="md:col-span-8 flex flex-col gap-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          {/* Scene Title Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{selectedScene.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {selectedScene.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedScene.description}</p>
            </div>
          </div>

          {/* UMA Role in Scene */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              UMA 3 Architecture & Lifecycle in {selectedScene.name}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedScene.umaRole}</p>
          </div>

          {/* Key Components Required */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Required Scene Components & Prefabs
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedScene.keyComponents.map((comp) => (
                <span
                  key={comp}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Verification & Setup Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Scene Upgrade Checklist
            </h4>
            <div className="flex flex-col gap-2">
              {selectedScene.integrationNotes.map((note, idx) => {
                const isChecked = !!checkedSteps[`${selectedScene.id}_${idx}`];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(selectedScene.id, idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs leading-relaxed">{note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

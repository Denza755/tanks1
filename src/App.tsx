import React, { useState } from 'react';
import { Header, MainNavTab } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { CharacterCreatorSimpleSetup } from './components/CharacterCreatorSimpleSetup';
import { ShaderMigrationPanel } from './components/ShaderMigrationPanel';
import { ScriptsRepositoryPanel } from './components/ScriptsRepositoryPanel';
import { SceneIntegrationGuide } from './components/SceneIntegrationGuide';
import { CharacterCustomizationState } from './types/uma';
import { PRESETS } from './data/umaData';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('creator');
  const [customization, setCustomization] = useState<CharacterCustomizationState>(
    PRESETS['Knight Protector']
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Application Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'creator' && (
          <div className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-4rem)]">
            {/* 3D Viewport Column (Left on Large screens) */}
            <div className="lg:col-span-6 xl:col-span-5 h-[500px] lg:h-full flex flex-col">
              <Viewport3D customization={customization} />
            </div>

            {/* UMA DCS Demo - Simple Setup Customizer Panel (Right on Large screens) */}
            <div className="lg:col-span-6 xl:col-span-7 h-[700px] lg:h-full flex flex-col">
              <CharacterCreatorSimpleSetup
                customization={customization}
                onChange={setCustomization}
              />
            </div>
          </div>
        )}

        {activeTab === 'shaders' && <ShaderMigrationPanel />}

        {activeTab === 'scripts' && <ScriptsRepositoryPanel />}

        {activeTab === 'scenes' && <SceneIntegrationGuide />}
      </main>
    </div>
  );
}

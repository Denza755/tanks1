import React, { useState } from 'react';
import { CharacterCustomizationState, WardrobeItem } from '../types/uma';
import { DNA_DEFINITIONS, WARDROBE_ITEMS, SHARED_COLORS, PRESETS } from '../data/umaData';
import {
  Sparkles,
  RotateCcw,
  Sliders,
  Palette,
  Shield,
  FileCode,
  User,
  Copy,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';

interface CharacterCreatorSimpleSetupProps {
  customization: CharacterCustomizationState;
  onChange: (updated: CharacterCustomizationState) => void;
}

export const CharacterCreatorSimpleSetup: React.FC<CharacterCreatorSimpleSetupProps> = ({
  customization,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'faceDna' | 'bodyDna' | 'colors' | 'inspector'>('wardrobe');
  const [activeSlot, setActiveSlot] = useState<WardrobeItem['slot']>('Chest');
  const [activeColorChannel, setActiveColorChannel] = useState<string>('Skin');
  const [copiedString, setCopiedString] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Slots available
  const wardrobeSlots: WardrobeItem['slot'][] = [
    'Hair',
    'Beard',
    'Helmet',
    'Chest',
    'Shoulders',
    'Legs',
    'Feet',
    'Hands',
    'Weapon'
  ];

  // Filter recipes for active slot & current race
  const currentSlotItems = WARDROBE_ITEMS.filter(
    (item) => item.slot === activeSlot && item.compatibleRaces.includes(customization.race)
  );

  // Handle Race Change
  const handleRaceChange = (newRace: 'HumanMale' | 'HumanFemale') => {
    if (newRace === customization.race) return;
    onChange({
      ...customization,
      race: newRace,
      presetName: 'Custom',
      wardrobe: {
        ...customization.wardrobe,
        Beard: newRace === 'HumanFemale' ? 'beard_none' : customization.wardrobe.Beard,
        Hair: newRace === 'HumanFemale' ? 'hair_wavy_long' : 'hair_short'
      }
    });
  };

  // Handle Preset Load
  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      onChange({ ...preset });
    }
  };

  // Handle Randomize
  const handleRandomize = () => {
    const newDna = { ...customization.dna };
    DNA_DEFINITIONS.forEach((def) => {
      newDna[def.key] = Number((Math.random() * 0.6 + 0.2).toFixed(2));
    });

    const newColors = { ...customization.colors };
    SHARED_COLORS.forEach((col) => {
      const randomSwatch = col.palette[Math.floor(Math.random() * col.palette.length)];
      newColors[col.name] = randomSwatch;
    });

    onChange({
      ...customization,
      presetName: 'Randomized',
      dna: newDna,
      colors: newColors
    });
  };

  // Handle Reset Defaults
  const handleReset = () => {
    const defaultDna: Record<string, number> = {};
    DNA_DEFINITIONS.forEach((def) => {
      defaultDna[def.key] = def.defaultValue;
    });

    const defaultColors: Record<string, string> = {};
    SHARED_COLORS.forEach((col) => {
      defaultColors[col.name] = col.defaultColor;
    });

    onChange({
      ...customization,
      presetName: 'Default',
      dna: defaultDna,
      colors: defaultColors,
      wardrobe: {
        Hair: 'hair_short',
        Beard: 'beard_none',
        Helmet: 'helm_none',
        Chest: 'chest_novice_tunic',
        Shoulders: 'shoulders_none',
        Legs: 'legs_cloth_pants',
        Feet: 'feet_leather_boots',
        Hands: 'hands_leather_gloves',
        Weapon: 'weapon_greatsword'
      }
    });
  };

  // Handle DNA Slider
  const handleDnaChange = (key: string, value: number) => {
    onChange({
      ...customization,
      dna: {
        ...customization.dna,
        [key]: value
      }
    });
  };

  // Handle Wardrobe Equip
  const handleEquipItem = (item: WardrobeItem) => {
    onChange({
      ...customization,
      wardrobe: {
        ...customization.wardrobe,
        [item.slot]: item.id
      }
    });
  };

  // Handle Wardrobe Clear Slot
  const handleClearSlot = (slot: WardrobeItem['slot']) => {
    const noneItem = WARDROBE_ITEMS.find((i) => i.slot === slot && (i.id.endsWith('_none') || i.recipeName === 'None'));
    const idToSet = noneItem ? noneItem.id : '';
    onChange({
      ...customization,
      wardrobe: {
        ...customization.wardrobe,
        [slot]: idToSet
      }
    });
  };

  // Handle Color Select
  const handleColorSelect = (channelName: string, hexColor: string) => {
    onChange({
      ...customization,
      colors: {
        ...customization.colors,
        [channelName]: hexColor
      }
    });
  };

  // Generate serialized AvatarDefinition compressed string
  const generateAvatarDefinitionString = () => {
    // Format: RaceName|WardrobeRecipesJoined|DnaJoined|ColorsJoined
    const activeRecipes: string[] = [];
    Object.entries(customization.wardrobe).forEach(([slot, itemId]) => {
      const item = WARDROBE_ITEMS.find((w) => w.id === itemId);
      if (item && item.recipeName !== 'None' && item.recipeName !== '') {
        activeRecipes.push(item.recipeName);
      }
    });

    const dnaSegments = Object.entries(customization.dna).map(([k, v]) => `${k}:${v}`);
    const colorSegments = Object.entries(customization.colors).map(([k, v]) => `${k}:${v.replace('#', '')}`);

    return `${customization.race}|${activeRecipes.join(',')}|${dnaSegments.join(',')}|${colorSegments.join(',')}`;
  };

  // Generate Unity C# API snippet
  const generateUnityCSharpSnippet = () => {
    const avatarDefStr = generateAvatarDefinitionString();
    return `// UMA 3 DCS Dynamic Character Creation API snippet for AnyRPG MMO
using UMA;
using UMA.CharacterSystem;

public void SetupPlayerAvatar(DynamicCharacterAvatar avatar) {
    // 1. Set Race
    avatar.ChangeRace("${customization.race}");

    // 2. Load serialized AvatarDefinition
    string appearanceData = "${avatarDefStr}";
    AvatarDefinition def = AvatarDefinition.FromCompressedString(appearanceData, '|');
    avatar.LoadAvatarDefinition(def);

    // 3. Deep DNA manual overrides via UMA 3 DnaSetter API
    var dnaDict = avatar.GetDNA();
    dnaDict["height"].Set(${customization.dna.height?.toFixed(2)}f);
    dnaDict["upperMuscle"].Set(${customization.dna.upperMuscle?.toFixed(2)}f);
    dnaDict["headSize"].Set(${customization.dna.headSize?.toFixed(2)}f);

    // 4. Force asynchronous rebuild
    avatar.BuildCharacter(true);
}`;
  };

  const handleCopyCompressedString = () => {
    navigator.clipboard.writeText(generateAvatarDefinitionString());
    setCopiedString(true);
    setTimeout(() => setCopiedString(false), 2000);
  };

  const handleCopyCodeSnippet = () => {
    navigator.clipboard.writeText(generateUnityCSharpSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header Bar: Race & Global Actions */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Race Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => handleRaceChange('HumanMale')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                customization.race === 'HumanMale'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Human Male
            </button>
            <button
              onClick={() => handleRaceChange('HumanFemale')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                customization.race === 'HumanFemale'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Human Female
            </button>
          </div>

          {/* Preset Selector */}
          <select
            value={customization.presetName}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-slate-600"
          >
            <option value="Custom">Custom Preset</option>
            {Object.keys(PRESETS).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Randomize
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-3 pt-2 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'wardrobe'
              ? 'border-sky-500 text-sky-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Wardrobe & Equipment
        </button>
        <button
          onClick={() => setActiveTab('faceDna')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'faceDna'
              ? 'border-sky-500 text-sky-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Face DNA
        </button>
        <button
          onClick={() => setActiveTab('bodyDna')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'bodyDna'
              ? 'border-sky-500 text-sky-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Body DNA
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'colors'
              ? 'border-sky-500 text-sky-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colors & Dyes
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'inspector'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          DCS Recipe Output
        </button>
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* 1. Wardrobe & Equipment Tab (UMA DCS Simple Setup Layout) */}
        {activeTab === 'wardrobe' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
            {/* Left Column: Slot Selector */}
            <div className="md:col-span-4 flex flex-col gap-1.5 pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1 flex items-center justify-between">
                <span>DCS Slots</span>
                <span className="text-slate-500 text-[10px]">API: AvailableRecipes</span>
              </span>
              {wardrobeSlots.map((slot) => {
                const currentEquippedId = customization.wardrobe[slot];
                const currentEquippedItem = WARDROBE_ITEMS.find((w) => w.id === currentEquippedId);
                const isSelected = activeSlot === slot;
                const isEquipped = currentEquippedItem && currentEquippedItem.recipeName !== 'None';

                return (
                  <button
                    key={slot}
                    onClick={() => setActiveSlot(slot)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white font-bold shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{slot}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {isEquipped ? currentEquippedItem.name : 'Empty / None'}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-sky-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Recipe Picker for Selected Slot */}
            <div className="md:col-span-8 flex flex-col gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeSlot} Recipes</span>
                    <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                      slot: "{activeSlot}"
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a UMATextRecipe to equip dynamically on the avatar.
                  </p>
                </div>
                <button
                  onClick={() => handleClearSlot(activeSlot)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all"
                >
                  Unequip / Clear
                </button>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentSlotItems.map((item) => {
                  const isCurrent = customization.wardrobe[activeSlot] === item.id;
                  const rarityColors: Record<string, string> = {
                    Common: 'text-slate-400 border-slate-700',
                    Rare: 'text-sky-400 border-sky-600',
                    Epic: 'text-purple-400 border-purple-600',
                    Legendary: 'text-amber-400 border-amber-600'
                  };

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleEquipItem(item)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/20 ring-1 ring-sky-400'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold leading-tight">{item.name}</span>
                        {item.rarity && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-extrabold ${
                              rarityColors[item.rarity] || 'text-slate-400 border-slate-700'
                            }`}
                          >
                            {item.rarity}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.description}</div>
                      <div className="mt-2 text-[9px] font-mono text-slate-500 flex items-center justify-between">
                        <span>Recipe: {item.recipeName}</span>
                        {isCurrent && <span className="text-sky-400 font-bold">EQUIPPED</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Face DNA Sliders */}
        {activeTab === 'faceDna' && (
          <div className="flex flex-col gap-4">
            <div className="bg-sky-950/20 border border-sky-800/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-sky-200">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong>UMA 3 DnaSetter API:</strong> Real-time bone transformations and facial morph targets.
                Adjust sliders to deform skull, eyes, nose, cheeks, jawline, and chin structure.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DNA_DEFINITIONS.filter((d) => d.category === 'Face').map((def) => {
                const val = customization.dna[def.key] ?? def.defaultValue;
                return (
                  <div
                    key={def.key}
                    className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{def.name}</span>
                      <span className="font-mono text-[11px] text-sky-400 font-bold">{(val * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min={def.min}
                      max={def.max}
                      step={0.01}
                      value={val}
                      onChange={(e) => handleDnaChange(def.key, parseFloat(e.target.value))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{def.description}</span>
                      <button
                        onClick={() => handleDnaChange(def.key, def.defaultValue)}
                        className="text-slate-400 hover:text-slate-200"
                        title="Reset to default"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Body DNA Sliders */}
        {activeTab === 'bodyDna' && (
          <div className="flex flex-col gap-4">
            <div className="bg-sky-950/20 border border-sky-800/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-sky-200">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong>Somatic DNA Morphs:</strong> Height automatically triggers AnyRPG navmesh capsule and camera target recalculation (<code className="text-sky-300">ShouldCalculateFloatHeight()</code>).
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DNA_DEFINITIONS.filter((d) => d.category === 'Body').map((def) => {
                const val = customization.dna[def.key] ?? def.defaultValue;
                return (
                  <div
                    key={def.key}
                    className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{def.name}</span>
                      <span className="font-mono text-[11px] text-sky-400 font-bold">{(val * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min={def.min}
                      max={def.max}
                      step={0.01}
                      value={val}
                      onChange={(e) => handleDnaChange(def.key, parseFloat(e.target.value))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{def.description}</span>
                      <button
                        onClick={() => handleDnaChange(def.key, def.defaultValue)}
                        className="text-slate-400 hover:text-slate-200"
                        title="Reset to default"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Colors & Shared Color Tables */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
            {/* Color Channels */}
            <div className="md:col-span-4 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                Shared Color Channels
              </span>
              {SHARED_COLORS.map((col) => {
                const isSelected = activeColorChannel === col.name;
                const activeColor = customization.colors[col.name] || col.defaultColor;

                return (
                  <button
                    key={col.name}
                    onClick={() => setActiveColorChannel(col.name)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white font-bold shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: activeColor }}
                      />
                      <div>
                        <div className="text-xs font-semibold">{col.displayName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{activeColor}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Swatch Palette Picker */}
            <div className="md:col-span-8 flex flex-col gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {(() => {
                const currentChannel = SHARED_COLORS.find((c) => c.name === activeColorChannel);
                if (!currentChannel) return null;
                const activeHex = customization.colors[activeColorChannel] || currentChannel.defaultColor;

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{currentChannel.displayName} Palette</h4>
                        <p className="text-xs text-slate-400">
                          UMA 3 <code className="text-sky-400 font-mono">SharedColorTable</code> tinting channel.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">Custom Hex:</label>
                        <input
                          type="color"
                          value={activeHex}
                          onChange={(e) => handleColorSelect(currentChannel.name, e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {currentChannel.palette.map((swatch) => {
                        const isMatch = activeHex.toLowerCase() === swatch.toLowerCase();
                        return (
                          <button
                            key={swatch}
                            onClick={() => handleColorSelect(currentChannel.name, swatch)}
                            className={`w-12 h-12 rounded-xl transition-all relative transform hover:scale-105 shadow-md flex items-center justify-center ${
                              isMatch
                                ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-110'
                                : 'border border-white/10 hover:border-white/30'
                            }`}
                            style={{ backgroundColor: swatch }}
                          >
                            {isMatch && <Check className="w-5 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* 5. DCS Recipe Output & AnyRPG Synchronization */}
        {activeTab === 'inspector' && (
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>AnyRPG & FishNet Network Synchronization:</strong> The compressed AvatarDefinition string below is stored in the player profile and synced over RPC in MMO multiplayer gameplay across all 5 working scenes.
              </div>
            </div>

            {/* Compressed String Box */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Serialized AvatarDefinition (<code className="text-sky-400">ToCompressedString('|')</code>)
                </span>
                <button
                  onClick={handleCopyCompressedString}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  {copiedString ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedString ? 'Copied!' : 'Copy String'}
                </button>
              </div>
              <textarea
                readOnly
                value={generateAvatarDefinitionString()}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-300 select-all focus:outline-none"
              />
            </div>

            {/* C# Code Snippet Box */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Unity C# Runtime Integration Snippet</span>
                <button
                  onClick={handleCopyCodeSnippet}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied Code!' : 'Copy C# Code'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
                {generateUnityCSharpSnippet()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

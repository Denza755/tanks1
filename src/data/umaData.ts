import { DnaSliderDef, WardrobeItem, SharedColorDef, CharacterCustomizationState, TargetSceneInfo } from '../types/uma';

export const DNA_DEFINITIONS: DnaSliderDef[] = [
  // Face DNA
  { key: 'headSize', name: 'Head Size', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Overall skull scale' },
  { key: 'headWidth', name: 'Head Width', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Cranial lateral width' },
  { key: 'foreheadSize', name: 'Forehead Size', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Brow height and slope' },
  { key: 'eyeSize', name: 'Eye Size', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Eye aperture and scale' },
  { key: 'eyeSpacing', name: 'Eye Spacing', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Inter-pupillary distance' },
  { key: 'eyeRotation', name: 'Eye Angle / Rotation', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Canthal tilt angle' },
  { key: 'noseSize', name: 'Nose Size', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Overall nasal volume' },
  { key: 'noseWidth', name: 'Nose Width', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Nostril breadth' },
  { key: 'noseCurve', name: 'Nose Bridge Curve', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Dorsal hump curvature' },
  { key: 'noseInclination', name: 'Nose Tip Tilt', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Nasal tip pitch up/down' },
  { key: 'mouthSize', name: 'Mouth Width', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Commissure breadth' },
  { key: 'lipsSize', name: 'Lips Fullness', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Upper and lower vermilion thickness' },
  { key: 'cheekSize', name: 'Cheekbones Prominence', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Zygomatic arch projection' },
  { key: 'jawSize', name: 'Jawline Width', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Mandibular angle' },
  { key: 'chinSize', name: 'Chin Length', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Vertical mental protuberance' },
  { key: 'chinPronounced', name: 'Chin Projection', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Horizontal chin jut' },
  { key: 'earsSize', name: 'Ears Size', category: 'Face', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Auricle dimension' },

  // Body DNA
  { key: 'height', name: 'Height', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Overall avatar stature' },
  { key: 'upperMuscle', name: 'Upper Muscle / Torso', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Pectoral and shoulder hypertrophy' },
  { key: 'upperWeight', name: 'Upper Mass', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Upper torso fullness' },
  { key: 'waist', name: 'Waist Width', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Abdominal perimeter' },
  { key: 'belly', name: 'Belly Fullness', category: 'Body', defaultValue: 0.4, min: 0.0, max: 1.0, description: 'Visceral abdominal curve' },
  { key: 'armLength', name: 'Arm Length', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Bicep/forearm limb extension' },
  { key: 'armWidth', name: 'Arm Thickness', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Bicep girth' },
  { key: 'breastSize', name: 'Chest / Breast Volume', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Thoracic volume' },
  { key: 'legsSize', name: 'Legs Muscle / Length', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Femur and calf proportion' },
  { key: 'gluteusSize', name: 'Hips / Gluteus', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Pelvic width and gluteal projection' },
  { key: 'feetSize', name: 'Feet Size', category: 'Body', defaultValue: 0.5, min: 0.0, max: 1.0, description: 'Footwear footprint' }
];

export const WARDROBE_ITEMS: WardrobeItem[] = [
  // Hair
  { id: 'hair_short', name: 'Warrior Crop', slot: 'Hair', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Hair_Short_01', icon: 'Scissors', rarity: 'Common', description: 'Practical military haircut' },
  { id: 'hair_ponytail', name: 'Adventurer Ponytail', slot: 'Hair', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Hair_Ponytail_01', icon: 'Scissors', rarity: 'Common', description: 'Tied back with leather cord' },
  { id: 'hair_wavy_long', name: 'Flowing Waves', slot: 'Hair', compatibleRaces: ['HumanFemale'], recipeName: 'UMA_Hair_WavyLong_01', icon: 'Scissors', rarity: 'Rare', description: 'Long silky cascading locks' },
  { id: 'hair_braids', name: 'Nordic Braids', slot: 'Hair', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Hair_VikingBraids_01', icon: 'Scissors', rarity: 'Epic', description: 'Intertwined battle braids' },
  { id: 'hair_spiky', name: 'Fighter Spikes', slot: 'Hair', compatibleRaces: ['HumanMale'], recipeName: 'UMA_Hair_Spiky_01', icon: 'Scissors', rarity: 'Common', description: 'Dyed battle mohawk spikes' },
  { id: 'hair_bald', name: 'Clean Shaven', slot: 'Hair', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'None', icon: 'Scissors', rarity: 'Common', description: 'Smooth shaved head' },

  // Beard
  { id: 'beard_none', name: 'Clean Shaven', slot: 'Beard', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'None', icon: 'User', rarity: 'Common', description: 'No facial hair' },
  { id: 'beard_stubble', name: 'Rough Stubble', slot: 'Beard', compatibleRaces: ['HumanMale'], recipeName: 'UMA_Beard_Stubble_01', icon: 'User', rarity: 'Common', description: 'Three-day battle stubble' },
  { id: 'beard_full', name: 'Full Bushy Beard', slot: 'Beard', compatibleRaces: ['HumanMale'], recipeName: 'UMA_Beard_Full_01', icon: 'User', rarity: 'Rare', description: 'Dwarven-styled full beard' },
  { id: 'beard_goatee', name: 'Noble Goatee', slot: 'Beard', compatibleRaces: ['HumanMale'], recipeName: 'UMA_Beard_Goatee_01', icon: 'User', rarity: 'Common', description: 'Stylishly trimmed goatee' },

  // Helmets
  { id: 'helm_none', name: 'No Helmet', slot: 'Helmet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'None', icon: 'Shield', rarity: 'Common', description: 'Show character hair' },
  { id: 'helm_steel_visored', name: 'Steel Knight Greathelm', slot: 'Helmet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASteelPlateHelmEquipmentModel', icon: 'Shield', rarity: 'Epic', description: 'Heavy steel helmet with reinforced visor' },
  { id: 'helm_mage_hood', name: 'Archmage Cowl', slot: 'Helmet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMAMageCowlEquipmentModel', icon: 'Shield', rarity: 'Rare', description: 'Enchanted embroidered silk cowl' },
  { id: 'helm_leather_circlet', name: 'Ranger Silver Circlet', slot: 'Helmet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASilverCircletEquipmentModel', icon: 'Shield', rarity: 'Rare', description: 'Agile crown adorned with small sapphire' },

  // Chest Armor
  { id: 'chest_novice_tunic', name: 'Novice Cloth Tunic', slot: 'Chest', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Novice_Tunic_01', icon: 'Shirt', rarity: 'Common', description: 'Basic breathable linen doublet' },
  { id: 'chest_steel_plate', name: 'Vanguard Steel Cuirass', slot: 'Chest', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASteelPlateArmorEquipmentModel', icon: 'Shirt', rarity: 'Epic', description: 'Fluted heavy steel breastplate' },
  { id: 'chest_leather_brigandine', name: 'Rogue Studded Brigandine', slot: 'Chest', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMALeatherTunicEquipmentModel', icon: 'Shirt', rarity: 'Rare', description: 'Supple leather with brass rivets' },
  { id: 'chest_mage_robes', name: 'Netherflame Mage Robes', slot: 'Chest', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMAFireMageRobesEquipmentModel', icon: 'Shirt', rarity: 'Epic', description: 'Long flowing arcane vestment' },

  // Shoulders
  { id: 'shoulders_none', name: 'No Pauldrons', slot: 'Shoulders', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'None', icon: 'Shield', rarity: 'Common', description: 'Bare shoulders' },
  { id: 'shoulders_steel_pauldrons', name: 'Steel Lion Pauldrons', slot: 'Shoulders', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASteelPlatePauldronsEquipmentModel', icon: 'Shield', rarity: 'Epic', description: 'Heavy articulated shoulder guards' },
  { id: 'shoulders_leather_guards', name: 'Hardened Leather Spauleds', slot: 'Shoulders', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMALeatherPauldronsEquipmentModel', icon: 'Shield', rarity: 'Common', description: 'Lightweight shoulder protection' },

  // Legs
  { id: 'legs_cloth_pants', name: 'Traveler Breeches', slot: 'Legs', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Traveler_Breeches_01', icon: 'Scissors', rarity: 'Common', description: 'Sturdy wool trousers' },
  { id: 'legs_steel_greaves', name: 'Steel Knight Greaves', slot: 'Legs', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASteelPlateLegsEquipmentModel', icon: 'Scissors', rarity: 'Epic', description: 'Articulated steel poleyns and greaves' },
  { id: 'legs_leather_chaps', name: 'Scout Reinforced Chaps', slot: 'Legs', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMALeatherLegsEquipmentModel', icon: 'Scissors', rarity: 'Rare', description: 'Cured hide with reinforced knee pads' },

  // Boots
  { id: 'feet_leather_boots', name: 'Sturdy Wanderer Boots', slot: 'Feet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Leather_Boots_01', icon: 'Footprints', rarity: 'Common', description: 'Heavy leather boots with bronze buckles' },
  { id: 'feet_steel_sabatons', name: 'Steel Plated Sabatons', slot: 'Feet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASteelPlateBootsEquipmentModel', icon: 'Footprints', rarity: 'Epic', description: 'Spurred heavy steel foot armor' },
  { id: 'feet_cloth_slippers', name: 'Arcane Embroidered Shoes', slot: 'Feet', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMAMageBootsEquipmentModel', icon: 'Footprints', rarity: 'Rare', description: 'Silent enchanted cloth shoes' },

  // Gloves
  { id: 'hands_leather_gloves', name: 'Padded Archer Gloves', slot: 'Hands', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMA_Archer_Gloves_01', icon: 'Hand', rarity: 'Common', description: 'Flexible archery gloves' },
  { id: 'hands_steel_gauntlets', name: 'Steel Vanguard Gauntlets', slot: 'Hands', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'UMASilverPlateGlovesEquipmentModel', icon: 'Hand', rarity: 'Epic', description: 'Finger-articulated steel gauntlets' },

  // Weapons
  { id: 'weapon_greatsword', name: 'Claymore of Valor', slot: 'Weapon', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'Greatsword_01', icon: 'Sword', rarity: 'Legendary', description: 'Two-handed engraved steel broadsword' },
  { id: 'weapon_staff', name: 'Archon Crystal Staff', slot: 'Weapon', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'ArcaneStaff_01', icon: 'Wand', rarity: 'Epic', description: 'Carved hardwood with pulsating rune core' },
  { id: 'weapon_bow', name: 'Elven Recurve Bow', slot: 'Weapon', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'RecurveBow_01', icon: 'Target', rarity: 'Rare', description: 'Yew composite bow' },
  { id: 'weapon_daggers', name: 'Dual Shadowfang Daggers', slot: 'Weapon', compatibleRaces: ['HumanMale', 'HumanFemale'], recipeName: 'DualDaggers_01', icon: 'Zap', rarity: 'Rare', description: 'Serrated obsidian blades' }
];

export const SHARED_COLORS: SharedColorDef[] = [
  {
    name: 'Skin',
    displayName: 'Skin Tone',
    category: 'Body',
    color: '#d6a382',
    defaultColor: '#d6a382',
    palette: [
      '#fae0cd', '#f3cfb3', '#e4b694', '#d6a382', '#b7805c',
      '#8f5c3a', '#6a3c20', '#4a2613', '#627c68', '#4d6984'
    ]
  },
  {
    name: 'Hair',
    displayName: 'Hair Color',
    category: 'Body',
    color: '#3d2314',
    defaultColor: '#3d2314',
    palette: [
      '#1c1714', '#3d2314', '#603813', '#8b5a2b', '#b97a38',
      '#d7aa64', '#e2d3af', '#922b21', '#85929e', '#f5b041', '#8e44ad'
    ]
  },
  {
    name: 'Eyes',
    displayName: 'Iris Color',
    category: 'Body',
    color: '#2e86c1',
    defaultColor: '#2e86c1',
    palette: [
      '#1b4f72', '#2e86c1', '#117864', '#27ae60', '#d35400',
      '#6e2c00', '#7d3c98', '#99a3a4', '#b03a2e', '#f39c12'
    ]
  },
  {
    name: 'GearPrimary',
    displayName: 'Armor Primary Tint',
    category: 'Gear',
    color: '#34495e',
    defaultColor: '#34495e',
    palette: [
      '#2c3e50', '#34495e', '#7f8c8d', '#bdc3c7', '#922b21',
      '#196f3d', '#1f618d', '#6c3483', '#b7950b', '#212f3d'
    ]
  },
  {
    name: 'GearSecondary',
    displayName: 'Armor Trim / Accent',
    category: 'Gear',
    color: '#d4ac0d',
    defaultColor: '#d4ac0d',
    palette: [
      '#d4ac0d', '#f39c12', '#b9770e', '#797d7f', '#2c3e50',
      '#c0392b', '#27ae60', '#2980b9', '#884ea0', '#ecf0f1'
    ]
  }
];

export const PRESETS: Record<string, CharacterCustomizationState> = {
  'Knight Protector': {
    race: 'HumanMale',
    presetName: 'Knight Protector',
    dna: {
      height: 0.65,
      upperMuscle: 0.8,
      upperWeight: 0.6,
      waist: 0.45,
      belly: 0.35,
      armLength: 0.55,
      armWidth: 0.75,
      breastSize: 0.5,
      legsSize: 0.65,
      gluteusSize: 0.5,
      feetSize: 0.55,
      headSize: 0.5,
      headWidth: 0.55,
      foreheadSize: 0.5,
      eyeSize: 0.45,
      eyeSpacing: 0.5,
      eyeRotation: 0.5,
      noseSize: 0.55,
      noseWidth: 0.5,
      noseCurve: 0.5,
      noseInclination: 0.5,
      mouthSize: 0.5,
      lipsSize: 0.45,
      cheekSize: 0.6,
      jawSize: 0.7,
      chinSize: 0.6,
      chinPronounced: 0.65,
      earsSize: 0.5
    },
    wardrobe: {
      Hair: 'hair_short',
      Beard: 'beard_stubble',
      Helmet: 'helm_steel_visored',
      Chest: 'chest_steel_plate',
      Shoulders: 'shoulders_steel_pauldrons',
      Legs: 'legs_steel_greaves',
      Feet: 'feet_steel_sabatons',
      Hands: 'hands_steel_gauntlets',
      Weapon: 'weapon_greatsword'
    },
    colors: {
      Skin: '#d6a382',
      Hair: '#3d2314',
      Eyes: '#2e86c1',
      GearPrimary: '#34495e',
      GearSecondary: '#d4ac0d'
    }
  },
  'Arcane Sorceress': {
    race: 'HumanFemale',
    presetName: 'Arcane Sorceress',
    dna: {
      height: 0.52,
      upperMuscle: 0.35,
      upperWeight: 0.4,
      waist: 0.35,
      belly: 0.25,
      armLength: 0.5,
      armWidth: 0.4,
      breastSize: 0.6,
      legsSize: 0.55,
      gluteusSize: 0.55,
      feetSize: 0.45,
      headSize: 0.48,
      headWidth: 0.48,
      foreheadSize: 0.52,
      eyeSize: 0.65,
      eyeSpacing: 0.5,
      eyeRotation: 0.55,
      noseSize: 0.4,
      noseWidth: 0.38,
      noseCurve: 0.45,
      noseInclination: 0.55,
      mouthSize: 0.45,
      lipsSize: 0.65,
      cheekSize: 0.55,
      jawSize: 0.4,
      chinSize: 0.45,
      chinPronounced: 0.45,
      earsSize: 0.45
    },
    wardrobe: {
      Hair: 'hair_wavy_long',
      Beard: 'beard_none',
      Helmet: 'helm_mage_hood',
      Chest: 'chest_mage_robes',
      Shoulders: 'shoulders_none',
      Legs: 'legs_cloth_pants',
      Feet: 'feet_cloth_slippers',
      Hands: 'hands_leather_gloves',
      Weapon: 'weapon_staff'
    },
    colors: {
      Skin: '#fae0cd',
      Hair: '#922b21',
      Eyes: '#7d3c98',
      GearPrimary: '#6c3483',
      GearSecondary: '#d4ac0d'
    }
  },
  'Shadow Rogue': {
    race: 'HumanMale',
    presetName: 'Shadow Rogue',
    dna: {
      height: 0.5,
      upperMuscle: 0.55,
      upperWeight: 0.45,
      waist: 0.4,
      belly: 0.3,
      armLength: 0.52,
      armWidth: 0.5,
      breastSize: 0.45,
      legsSize: 0.5,
      gluteusSize: 0.48,
      feetSize: 0.5,
      headSize: 0.5,
      headWidth: 0.48,
      foreheadSize: 0.5,
      eyeSize: 0.5,
      eyeSpacing: 0.52,
      eyeRotation: 0.6,
      noseSize: 0.48,
      noseWidth: 0.45,
      noseCurve: 0.52,
      noseInclination: 0.48,
      mouthSize: 0.48,
      lipsSize: 0.45,
      cheekSize: 0.65,
      jawSize: 0.55,
      chinSize: 0.55,
      chinPronounced: 0.5,
      earsSize: 0.48
    },
    wardrobe: {
      Hair: 'hair_ponytail',
      Beard: 'beard_goatee',
      Helmet: 'helm_leather_circlet',
      Chest: 'chest_leather_brigandine',
      Shoulders: 'shoulders_leather_guards',
      Legs: 'legs_leather_chaps',
      Feet: 'feet_leather_boots',
      Hands: 'hands_leather_gloves',
      Weapon: 'weapon_daggers'
    },
    colors: {
      Skin: '#e4b694',
      Hair: '#1c1714',
      Eyes: '#117864',
      GearPrimary: '#212f3d',
      GearSecondary: '#797d7f'
    }
  }
};

export const TARGET_SCENES: TargetSceneInfo[] = [
  {
    id: 'AnyMMODemoMainMenu',
    name: 'AnyMMODemoMainMenu',
    type: 'Menu',
    description: 'Game launch & Main Menu screen where character creation and character selection take place.',
    umaRole: 'Instantiates UMA3 DynamicCharacterAvatar preview in the CharacterCreatorWindowPanel. Drives interactive appearance editing, race switching, wardrobe recipes, and persistent AvatarDefinition serialization into AnyRPG save files.',
    keyComponents: ['NewGameMecanimCharacterPanel', 'UMAAppearanceEditorPanel', 'PreviewCameraController', 'UMA3SimpleSetupBridge'],
    integrationNotes: [
      'Replace legacy UMA2 panel bindings with upgraded UMAAppearanceEditorPanel',
      'Ensure UMA_GLIB prefab is loaded in scene to initialize UMAAssetIndexer',
      'Wire OnRaceChanged and OnCharacterCreated events to save AvatarDefinition.ToCompressedString("|") into CharacterSaveData'
    ]
  },
  {
    id: 'AnyMMODemo',
    name: 'AnyMMODemo',
    type: 'Zone',
    description: 'Primary MMO hub scene featuring quest givers, vendor NPCs, other players, and combat dummies.',
    umaRole: 'Spawns both player avatar and network proxies using UMAModelController. Re-applies saved AvatarDefinition, dynamic equipment from inventory, and FishNet network serialization.',
    keyComponents: ['UMAModelController', 'UnitModelController', 'CharacterEquipmentManager', 'FishNet PlayerController'],
    integrationNotes: [
      'Check ShouldCalculateFloatHeight() for correct navmesh grounding after DNA stature changes',
      'Ensure UMA3 async mesh generation notifies MecanimModelController.OnModelCreated so weapon attachment sockets attach to bones',
      'Sync equipment changes via dynamicCharacterAvatar.SetSlot(recipe) without full avatar re-instantiation'
    ]
  },
  {
    id: 'AnyMMODemoCutsceneZone',
    name: 'AnyMMODemoCutsceneZone',
    type: 'Cutscene',
    description: 'Story dialogue and cinematic sequence area with custom timeline cameras focusing on player facial expressions.',
    umaRole: 'Renders high-detail UMA expressions (UMAExpressionPlayer) and facial morph targets during cinematic dialogues.',
    keyComponents: ['UMAExpressionPlayer', 'PreviewCameraController', 'Timeline PlayableDirector', 'UMAModelController'],
    integrationNotes: [
      'Enable UMAExpressionPlayer in UMA3 DynamicCharacterAvatar for eyelid and mouth speech animations',
      'Verify Unity 6000.3.14f1 depth-of-field and skin subsurface scattering shaders under cinematic lighting',
      'Lock DNA modifiers during camera transitions to prevent mesh jitter'
    ]
  },
  {
    id: 'AnyMMODemoDungeon',
    name: 'AnyMMODemoDungeon',
    type: 'Dungeon',
    description: 'Instanced dungeon environment with low ambient lighting, point torches, mob spawns, and boss encounters.',
    umaRole: 'Tests UMA3 URP Lit shaders under Forward+ multi-light conditions, real-time shadows, and mob armor variants.',
    keyComponents: ['UMAModelController', 'URP Additional Camera Data', 'Lightweight ShaderPasses', 'LODManager'],
    integrationNotes: [
      'Verify UMA3 shader packager patch for Unity 6: EncodeMeshRenderingLayer() ensures no pink shaders in dungeon darkness',
      'Verify GPU Instancing and SRP Batcher support on UMA dynamic atlas materials',
      'Confirm point light specular response on armor dyes and skin albedo'
    ]
  },
  {
    id: 'AnyMMODemoZone',
    name: 'AnyMMODemoZone',
    type: 'Zone',
    description: 'Expansive open-world MMO zone with rolling terrain, day/night cycle, atmospheric fog, and large player counts.',
    umaRole: 'Tests scalability, LOD transitions, texture merging, and memory pooling for multiple simultaneous UMA avatars.',
    keyComponents: ['DCARendererManager', 'UMALODConversionSet', 'Terrain / Water System', 'NetworkManager'],
    integrationNotes: [
      'Configure UMA3 DCARendererManager to share atlas memory between identical race/wardrobe combos',
      'Enable UMA3 Burst compiler acceleration for skinning and blendshape computation',
      'Verify shadow casting layers on UMA mesh colliders across distant terrain'
    ]
  }
];

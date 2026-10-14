export type RaceType = 'HumanMale' | 'HumanFemale';

export interface DnaSliderDef {
  key: string;
  name: string;
  category: 'Face' | 'Body';
  defaultValue: number;
  min: number;
  max: number;
  description: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  slot: 'Hair' | 'Eyebrows' | 'Beard' | 'Helmet' | 'Chest' | 'Legs' | 'Feet' | 'Shoulders' | 'Hands' | 'Weapon';
  compatibleRaces: RaceType[];
  recipeName: string;
  icon: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description?: string;
}

export interface SharedColorDef {
  name: string;
  displayName: string;
  category: 'Body' | 'Gear';
  color: string; // hex
  defaultColor: string;
  palette: string[];
}

export interface CharacterCustomizationState {
  race: RaceType;
  presetName: string;
  dna: Record<string, number>;
  wardrobe: Record<string, string>; // slot -> wardrobe item id
  colors: Record<string, string>; // colorKey -> hex
}

export interface TargetSceneInfo {
  id: string;
  name: string;
  type: 'Menu' | 'Zone' | 'Dungeon' | 'Cutscene';
  description: string;
  umaRole: string;
  keyComponents: string[];
  integrationNotes: string[];
}

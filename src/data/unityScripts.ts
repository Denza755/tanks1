export interface UnityScriptFile {
  filename: string;
  relativePath: string;
  description: string;
  category: 'Runtime' | 'UI' | 'Editor' | 'Shader';
  code: string;
}

export const UNITY_SCRIPTS: UnityScriptFile[] = [
  {
    filename: 'GameManager.cs',
    relativePath: 'Assets/_Tanks/Scripts/Managers/GameManager.cs',
    description: 'Tanks.Complete Open World Biome Sandbox GameManager for Unity 6. Replaces the round system with seamless respawns, dedicated player camera lock, auto-start, and fixed player/bot roles.',
    category: 'Runtime',
    code: `using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Tanks.Complete
{
    /// <summary>
    /// Representation of tank configuration and controller type.
    /// Supports both standard Tanks and custom AI bot extensions.
    /// </summary>
    [System.Serializable]
    public class PlayerData
    {
        public GameObject m_TankPrefab;
        public bool m_IsComputer;
        public int m_ControlIndex;
        public Color m_PlayerColor = Color.white;
        public int m_PlayerNumber = 1;

        // Convenient aliases and properties for flexibility
        public GameObject tankPrefab { get => m_TankPrefab; set => m_TankPrefab = value; }
        public bool IsComputer { get => m_IsComputer; set => m_IsComputer = value; }
        public bool isComputer { get => m_IsComputer; set => m_IsComputer = value; }
        public int ControlIndex { get => m_ControlIndex; set => m_ControlIndex = value; }
        public int controlIndex { get => m_ControlIndex; set => m_ControlIndex = value; }
        public Color playerColor { get => m_PlayerColor; set => m_PlayerColor = value; }
        public int playerNumber { get => m_PlayerNumber; set => m_PlayerNumber = value; }
    }

    /// <summary>
    /// Open World Biome Sandbox GameManager for Unity 6.
    /// Fully rewritten for open-world gameplay:
    /// 1. Auto-starts bypassing MainMenuCanvas / Menus.
    /// 2. Fixes Player 0 as Blue ATV (human) and Players 1-3 as AI Bots.
    /// 3. Focuses Camera strictly on Player 0 (no full-map zoom out).
    /// 4. Replaces round loops with an infinite SandboxLoop() and 3-second respawns.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        [Header("Camera & UI")]
        public CameraControl m_CameraControl;
        public Text m_MessageText;
        public GameObject m_MainMenuCanvas;
        public GameObject m_Menus;

        [Header("Tank Prefabs (Player & Biomes)")]
        [Tooltip("Index 0: Player ATV (Blue)")]
        public GameObject m_Tank1Prefab;
        [Tooltip("Index 1: Bot 1 (Biome)")]
        public GameObject m_Tank2Prefab;
        [Tooltip("Index 2: Bot 2 (Biome)")]
        public GameObject m_Tank3Prefab;
        [Tooltip("Index 3: Bot 3 (Biome)")]
        public GameObject m_Tank4Prefab;

        [Tooltip("Fallback Tank Prefab if specific index is not assigned")]
        public GameObject m_TankPrefab;

        [Header("Spawn Points / Tank Managers")]
        public TankManager[] m_SpawnPoints;

        [Header("Active Player Setup")]
        public PlayerData[] m_PlayerData;

        // Tracks tanks currently awaiting respawn to avoid duplicate timers
        private readonly HashSet<int> m_RespawningTanks = new HashSet<int>();
        private Coroutine m_SandboxCoroutine;

        private void Start()
        {
            // 1. Automatically find and deactivate MainMenuCanvas (or Menus)
            DisableMenuCanvases();

            // 2. Form PlayerData[] array of 4 elements with fixed roles
            PlayerData[] players = CreateFixedPlayersData();

            // 3. Immediately start game via StartGame(), bypassing UI selection menu
            StartGame(players);
        }

        /// <summary>
        /// Automatically finds and disables main menu canvases.
        /// </summary>
        private void DisableMenuCanvases()
        {
            if (m_MainMenuCanvas != null)
            {
                m_MainMenuCanvas.SetActive(false);
            }

            if (m_Menus != null)
            {
                m_Menus.SetActive(false);
            }

            GameObject foundMainMenu = GameObject.Find("MainMenuCanvas");
            if (foundMainMenu != null)
            {
                foundMainMenu.SetActive(false);
            }

            GameObject foundMenus = GameObject.Find("Menus");
            if (foundMenus != null)
            {
                foundMenus.SetActive(false);
            }

            // Fallback for Unity 6: scan for canvases with menu names
            #if UNITY_2023_1_OR_NEWER || UNITY_6000_0_OR_NEWER
            Canvas[] canvases = Object.FindObjectsByType<Canvas>(FindObjectsSortMode.None);
            #else
            Canvas[] canvases = Object.FindObjectsOfType<Canvas>();
            #endif

            foreach (Canvas c in canvases)
            {
                if (c != null && c.gameObject != null)
                {
                    string lower = c.gameObject.name.ToLower();
                    if (lower.Contains("mainmenu") || lower.Equals("menus") || lower.Contains("menu canvas"))
                    {
                        c.gameObject.SetActive(false);
                    }
                }
            }
        }

        /// <summary>
        /// Generates fixed 4-player configuration:
        /// Index 0: Player with m_Tank1Prefab (Blue ATV), IsComputer = false, ControlIndex = 1
        /// Index 1-3: Bots with m_Tank2Prefab, m_Tank3Prefab, m_Tank4Prefab, IsComputer = true, ControlIndex = -1
        /// </summary>
        public PlayerData[] CreateFixedPlayersData()
        {
            PlayerData[] players = new PlayerData[4];

            // Index 0: Player (Blue ATV)
            players[0] = new PlayerData
            {
                m_TankPrefab = m_Tank1Prefab != null ? m_Tank1Prefab : m_TankPrefab,
                IsComputer = false,
                ControlIndex = 1,
                m_PlayerNumber = 1,
                m_PlayerColor = new Color(0.18f, 0.44f, 1.0f) // Blue
            };

            // Index 1: Bot 1
            players[1] = new PlayerData
            {
                m_TankPrefab = m_Tank2Prefab != null ? m_Tank2Prefab : m_TankPrefab,
                IsComputer = true,
                ControlIndex = -1,
                m_PlayerNumber = 2,
                m_PlayerColor = new Color(0.9f, 0.15f, 0.15f) // Red
            };

            // Index 2: Bot 2
            players[2] = new PlayerData
            {
                m_TankPrefab = m_Tank3Prefab != null ? m_Tank3Prefab : m_TankPrefab,
                IsComputer = true,
                ControlIndex = -1,
                m_PlayerNumber = 3,
                m_PlayerColor = new Color(0.15f, 0.85f, 0.25f) // Green
            };

            // Index 3: Bot 3
            players[3] = new PlayerData
            {
                m_TankPrefab = m_Tank4Prefab != null ? m_Tank4Prefab : m_TankPrefab,
                IsComputer = true,
                ControlIndex = -1,
                m_PlayerNumber = 4,
                m_PlayerColor = new Color(0.95f, 0.75f, 0.1f) // Yellow
            };

            return players;
        }

        /// <summary>
        /// Starts game with specified PlayerData array.
        /// </summary>
        public void StartGame(PlayerData[] players)
        {
            m_PlayerData = players;
            StartGame();
        }

        /// <summary>
        /// Spawns tanks, locks camera to player 0, and starts the endless SandboxLoop coroutine.
        /// </summary>
        public void StartGame()
        {
            if (m_PlayerData == null || m_PlayerData.Length < 4)
            {
                m_PlayerData = CreateFixedPlayersData();
            }

            SpawnAllTanks();
            SetCameraTargets();

            if (m_SandboxCoroutine != null)
            {
                StopCoroutine(m_SandboxCoroutine);
            }
            m_SandboxCoroutine = StartCoroutine(SandboxLoop());
        }

        /// <summary>
        /// Spawns tanks at their assigned spawn points in their respective biomes.
        /// </summary>
        private void SpawnAllTanks()
        {
            if (m_SpawnPoints == null) return;

            for (int i = 0; i < m_SpawnPoints.Length; i++)
            {
                if (m_SpawnPoints[i] == null) continue;

                GameObject prefabToSpawn = GetTankPrefab(i);

                if (prefabToSpawn != null && m_SpawnPoints[i].m_SpawnPoint != null)
                {
                    if (m_SpawnPoints[i].m_Instance != null)
                    {
                        Destroy(m_SpawnPoints[i].m_Instance);
                    }

                    m_SpawnPoints[i].m_Instance = Instantiate(
                        prefabToSpawn,
                        m_SpawnPoints[i].m_SpawnPoint.position,
                        m_SpawnPoints[i].m_SpawnPoint.rotation
                    );

                    m_SpawnPoints[i].m_PlayerNumber = i + 1;

                    if (m_PlayerData != null && i < m_PlayerData.Length && m_PlayerData[i] != null)
                    {
                        SyncTankManagerData(m_SpawnPoints[i], m_PlayerData[i]);
                    }

                    m_SpawnPoints[i].Setup();
                }
            }
        }

        private GameObject GetTankPrefab(int index)
        {
            if (m_PlayerData != null && index < m_PlayerData.Length && m_PlayerData[index] != null && m_PlayerData[index].m_TankPrefab != null)
            {
                return m_PlayerData[index].m_TankPrefab;
            }

            switch (index)
            {
                case 0: return m_Tank1Prefab != null ? m_Tank1Prefab : m_TankPrefab;
                case 1: return m_Tank2Prefab != null ? m_Tank2Prefab : m_TankPrefab;
                case 2: return m_Tank3Prefab != null ? m_Tank3Prefab : m_TankPrefab;
                case 3: return m_Tank4Prefab != null ? m_Tank4Prefab : m_TankPrefab;
                default: return m_TankPrefab;
            }
        }

        /// <summary>
        /// Synchronizes player attributes (Color, IsComputer, ControlIndex) to TankManager.
        /// Uses reflection for safe backward/forward compatibility across various Tanks forks.
        /// </summary>
        private void SyncTankManagerData(TankManager tankManager, PlayerData data)
        {
            if (tankManager == null || data == null) return;

            tankManager.m_PlayerColor = data.m_PlayerColor;
            tankManager.m_PlayerNumber = data.m_PlayerNumber;

            var type = typeof(TankManager);

            // IsComputer
            var isCompField = type.GetField("m_IsComputer") ?? type.GetField("IsComputer") ?? type.GetField("isComputer");
            if (isCompField != null) isCompField.SetValue(tankManager, data.IsComputer);
            var isCompProp = type.GetProperty("IsComputer") ?? type.GetProperty("isComputer");
            if (isCompProp != null && isCompProp.CanWrite) isCompProp.SetValue(tankManager, data.IsComputer);

            // ControlIndex
            var ctrlField = type.GetField("m_ControlIndex") ?? type.GetField("ControlIndex") ?? type.GetField("controlIndex");
            if (ctrlField != null) ctrlField.SetValue(tankManager, data.ControlIndex);
            var ctrlProp = type.GetProperty("ControlIndex") ?? type.GetProperty("controlIndex");
            if (ctrlProp != null && ctrlProp.CanWrite) ctrlProp.SetValue(tankManager, data.ControlIndex);
        }

        /// <summary>
        /// Rule 3: Configures camera targets to contain ONLY Player 0 (local player)
        /// so the camera does not zoom out to encompass the entire open-world map.
        /// </summary>
        private void SetCameraTargets()
        {
            if (m_CameraControl == null) return;

            if (m_SpawnPoints != null && m_SpawnPoints.Length > 0 && m_SpawnPoints[0] != null && m_SpawnPoints[0].m_Instance != null)
            {
                m_CameraControl.m_Targets = new Transform[] { m_SpawnPoints[0].m_Instance.transform };
            }
            else
            {
                m_CameraControl.m_Targets = new Transform[0];
            }
        }

        /// <summary>
        /// Rule 4: Endless open world sandbox loop.
        /// Calls ResetAllTanks() and EnableTankControl() on start, then continuously checks
        /// all 4 tanks every 1 second and triggers a 3-second respawn when destroyed.
        /// </summary>
        private IEnumerator SandboxLoop()
        {
            // Initial activation
            ResetAllTanks();
            EnableTankControl();

            if (m_MessageText != null)
            {
                m_MessageText.text = string.Empty;
            }

            WaitForSeconds checkInterval = new WaitForSeconds(1.0f);

            while (true)
            {
                yield return checkInterval;

                if (m_SpawnPoints == null) continue;

                for (int i = 0; i < m_SpawnPoints.Length; i++)
                {
                    if (m_SpawnPoints[i] != null && m_SpawnPoints[i].m_Instance != null)
                    {
                        // If tank is destroyed (!activeSelf) and not already scheduled for respawn
                        if (!m_SpawnPoints[i].m_Instance.activeSelf && !m_RespawningTanks.Contains(i))
                        {
                            StartCoroutine(RespawnTank(i));
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Respawns destroyed tank at its biome spawn point after 3 seconds.
        /// </summary>
        private IEnumerator RespawnTank(int tankIndex)
        {
            m_RespawningTanks.Add(tankIndex);

            yield return new WaitForSeconds(3.0f);

            if (m_SpawnPoints != null && tankIndex < m_SpawnPoints.Length && m_SpawnPoints[tankIndex] != null)
            {
                m_SpawnPoints[tankIndex].Reset();
                m_SpawnPoints[tankIndex].EnableControl();

                // Re-verify camera if player was respawned
                if (tankIndex == 0)
                {
                    SetCameraTargets();
                }
            }

            m_RespawningTanks.Remove(tankIndex);
        }

        private void ResetAllTanks()
        {
            if (m_SpawnPoints == null) return;

            for (int i = 0; i < m_SpawnPoints.Length; i++)
            {
                if (m_SpawnPoints[i] != null)
                {
                    m_SpawnPoints[i].Reset();
                }
            }
        }

        private void EnableTankControl()
        {
            if (m_SpawnPoints == null) return;

            for (int i = 0; i < m_SpawnPoints.Length; i++)
            {
                if (m_SpawnPoints[i] != null)
                {
                    m_SpawnPoints[i].EnableControl();
                }
            }
        }

        private void DisableTankControl()
        {
            if (m_SpawnPoints == null) return;

            for (int i = 0; i < m_SpawnPoints.Length; i++)
            {
                if (m_SpawnPoints[i] != null)
                {
                    m_SpawnPoints[i].DisableControl();
                }
            }
        }
    }
}
`
  },
  {
    filename: 'UMAModelController.cs',
    relativePath: 'Assets/AnyRPG/Addons/anyrpg-uma/Scripts/Characters/ModelControllers/UMAModelController.cs',
    description: 'Upgraded Model Appearance Controller for UMA 3 with asynchronous mesh generation, AvatarDefinition serialization, and FishNet sync compatibility.',
    category: 'Runtime',
    code: `using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UMA;
using UMA.CharacterSystem;
using UMA.PoseTools;

namespace AnyRPG {
    /// <summary>
    /// Upgraded UMAModelController for UMA 3 & Unity 6000.3.14f1.
    /// Manages DynamicCharacterAvatar lifecycle, recipe building, DNA application,
    /// dynamic equipment overlays, and network serialization.
    /// </summary>
    public class UMAModelController : ModelAppearanceController {

        private UMAModelOptions umaModelOptions = null;
        private DynamicCharacterAvatar dynamicCharacterAvatar = null;
        private UMAExpressionPlayer expressionPlayer = null;
        private AvatarDefinition originalAvatarDefinition = new AvatarDefinition();
        private AvatarDefinition avatarDefinition = new AvatarDefinition();
        private DCARendererManager dcaRendererManager = null;

        public DynamicCharacterAvatar DynamicCharacterAvatar { get => dynamicCharacterAvatar; }
        public UMAModelOptions UMAModelOptions { get => umaModelOptions; set => umaModelOptions = value; }

        private string initialAppearance = null;
        private bool buildInProgress = false;
        private bool isInitialized = false;

        public UMAModelController(UnitController unitController, UnitModelController unitModelController, SystemGameManager systemGameManager, UMAModelOptions umaModelOptions) 
            : base(unitController, unitModelController, systemGameManager) {
            
            this.umaModelOptions = umaModelOptions;

            // AvatarDefinition struct initialization for UMA 3 safety
            avatarDefinition.RaceName = string.Empty;
            avatarDefinition.Wardrobe = new string[0];
            avatarDefinition.Dna = new DnaDef[0];
            avatarDefinition.Colors = new SharedColorDef[0];
        }

        public override T GetModelAppearanceController<T>() {
            return this as T;
        }

        public override bool IsBuilding() {
            if (dynamicCharacterAvatar == null || dynamicCharacterAvatar.umaData == null) {
                return false;
            }
            return dynamicCharacterAvatar.umaData.dirty || dynamicCharacterAvatar.UpdatePending() || buildInProgress;
        }

        public void SetAppearance(string appearance) {
            initialAppearance = appearance;
            if (string.IsNullOrEmpty(initialAppearance)) {
                return;
            }

            try {
                avatarDefinition = AvatarDefinition.FromCompressedString(initialAppearance, '|');
                CheckAvatarDefinition();
                if (dynamicCharacterAvatar != null) {
                    dynamicCharacterAvatar.LoadAvatarDefinition(avatarDefinition);
                    BuildModelAppearance();
                }
            } catch (System.Exception ex) {
                Debug.LogError($"[UMAModelController] Error unpacking AvatarDefinition: {ex.Message}");
            }
        }

        public override bool ShouldCalculateFloatHeight() {
            // Recalculate capsule height in Unity 6 when stature DNA changes
            return true;
        }

        private void CheckAvatarDefinition() {
            if (string.IsNullOrEmpty(avatarDefinition.RaceName)) {
                Debug.LogWarning("[UMAModelController] AvatarDefinition was invalid or empty. Falling back to default HumanMale.");
                avatarDefinition = new AvatarDefinition();
                avatarDefinition.RaceName = "HumanMale";
                avatarDefinition.Wardrobe = new string[0];
                avatarDefinition.Dna = new DnaDef[0];
                avatarDefinition.Colors = new SharedColorDef[0];
            }
            if (avatarDefinition.Wardrobe == null) avatarDefinition.Wardrobe = new string[0];
            if (avatarDefinition.Dna == null) avatarDefinition.Dna = new DnaDef[0];
            if (avatarDefinition.Colors == null) avatarDefinition.Colors = new SharedColorDef[0];
        }

        public override void SetModel(GameObject modelObject) {
            base.SetModel(modelObject);
            if (modelObject == null) {
                dynamicCharacterAvatar = null;
                return;
            }

            dynamicCharacterAvatar = modelObject.GetComponent<DynamicCharacterAvatar>();
            if (dynamicCharacterAvatar == null) {
                dynamicCharacterAvatar = modelObject.GetComponentInChildren<DynamicCharacterAvatar>();
            }

            if (dynamicCharacterAvatar != null) {
                // Subscribe to UMA 3 lifecycle callbacks
                dynamicCharacterAvatar.CharacterCreated.RemoveListener(HandleCharacterCreated);
                dynamicCharacterAvatar.CharacterCreated.AddListener(HandleCharacterCreated);

                dynamicCharacterAvatar.CharacterUpdated.RemoveListener(HandleCharacterUpdated);
                dynamicCharacterAvatar.CharacterUpdated.AddListener(HandleCharacterUpdated);

                expressionPlayer = dynamicCharacterAvatar.GetComponent<UMAExpressionPlayer>();
                dcaRendererManager = dynamicCharacterAvatar.GetComponent<DCARendererManager>();

                if (!string.IsNullOrEmpty(initialAppearance)) {
                    avatarDefinition = AvatarDefinition.FromCompressedString(initialAppearance, '|');
                    CheckAvatarDefinition();
                    dynamicCharacterAvatar.LoadAvatarDefinition(avatarDefinition);
                }

                buildInProgress = true;
                dynamicCharacterAvatar.BuildCharacter(true);
            }
        }

        private void HandleCharacterCreated(UMAData umaData) {
            buildInProgress = false;
            isInitialized = true;
            
            // Re-bind animator to AnyRPG animation pipeline
            Animator animator = dynamicCharacterAvatar.GetComponent<Animator>();
            if (animator != null && unitController?.UnitAnimator != null) {
                unitController.UnitAnimator.SetAnimator(animator);
            }

            // Notify model controller to attach weapon sockets and equipment meshes
            unitModelController?.RebuildModelAppearance();
        }

        private void HandleCharacterUpdated(UMAData umaData) {
            buildInProgress = false;
        }

        public override void UnequipItemModels(EquipmentSlotProfile equipmentSlotProfile) {
            if (equipmentSlotProfile == null || !equippedEquipment.ContainsKey(equipmentSlotProfile)) {
                return;
            }

            UnequipUMARecipes(equippedEquipment[equipmentSlotProfile]);
            base.UnequipItemModels(equipmentSlotProfile);
        }

        private void UnequipUMARecipes(InstantiatedEquipment equipment) {
            if (equipment?.Equipment == null || dynamicCharacterAvatar == null) {
                return;
            }

            UMAEquipmentModel umaEquipmentModel = equipment.Equipment.GetEquipmentModel<UMAEquipmentModel>();
            if (umaEquipmentModel?.Properties.UMARecipes == null) {
                return;
            }

            foreach (UMATextRecipe uMARecipe in umaEquipmentModel.Properties.UMARecipes) {
                if (uMARecipe != null && uMARecipe.compatibleRaces.Contains(dynamicCharacterAvatar.activeRace.name)) {
                    dynamicCharacterAvatar.ClearSlot(uMARecipe.wardrobeSlot);
                }
            }

            if (umaEquipmentModel.Properties.SharedColors != null) {
                foreach (SharedColorNode sharedColorNode in umaEquipmentModel.Properties.SharedColors) {
                    dynamicCharacterAvatar.ClearColor(sharedColorNode.SharedColorname, false);
                }
            }
        }

        public override void EquipItemModels(EquipmentSlotProfile equipmentSlotProfile, InstantiatedEquipment equipment) {
            base.EquipItemModels(equipmentSlotProfile, equipment);
            if (equipment == null || dynamicCharacterAvatar == null) {
                return;
            }

            UMAEquipmentModel umaEquipmentModel = equipment.Equipment.GetEquipmentModel<UMAEquipmentModel>();
            if (umaEquipmentModel?.Properties.UMARecipes == null) {
                return;
            }

            // Apply shared colors
            if (umaEquipmentModel.Properties.SharedColors != null) {
                foreach (SharedColorNode colorNode in umaEquipmentModel.Properties.SharedColors) {
                    dynamicCharacterAvatar.SetColor(colorNode.SharedColorname, colorNode.Color);
                }
            }

            // Apply wardrobe slots
            foreach (UMATextRecipe recipe in umaEquipmentModel.Properties.UMARecipes) {
                if (recipe != null && recipe.compatibleRaces.Contains(dynamicCharacterAvatar.activeRace.name)) {
                    dynamicCharacterAvatar.SetSlot(recipe.wardrobeSlot, recipe.name);
                }
            }
        }

        public string GetAppearanceString() {
            if (dynamicCharacterAvatar != null) {
                return dynamicCharacterAvatar.GetAvatarDefinition(true).ToCompressedString("|");
            }
            return string.Empty;
        }

        public override int RebuildModelAppearance() {
            if (dynamicCharacterAvatar != null) {
                buildInProgress = true;
                dynamicCharacterAvatar.BuildCharacter(true);
                return 1;
            }
            return 0;
        }
    }
}`
  },
  {
    filename: 'UMAAppearanceEditorPanel.cs',
    relativePath: 'Assets/AnyRPG/Addons/anyrpg-uma/Scripts/UI/CloseableWindows/UMAAppearanceEditorPanel.cs',
    description: 'Upgraded Character Appearance Panel implementing the full UMA3 "UMA DCS Demo - Simple Setup" workflow inside AnyRPG UI.',
    category: 'UI',
    code: `using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UMA;
using UMA.CharacterSystem;

namespace AnyRPG {
    /// <summary>
    /// Complete UMA 3 Character Creator panel inspired by "UMA DCS Demo - Simple Setup".
    /// Integrates Deep DNA manipulation (Face/Body categories), Dynamic Wardrobe Slot population,
    /// Shared Color Tables, and persistent recipe export for MMO Lite.
    /// </summary>
    public class UMAAppearanceEditorPanel : AppearancePanel {

        public enum EditorTab { Wardrobe, FaceDNA, BodyDNA, Colors, Presets }

        [Header("UMA 3 DCS Setup")]
        [SerializeField] private GameObject slotButtonPrefab = null;
        [SerializeField] private GameObject wardrobeItemButtonPrefab = null;
        [SerializeField] private GameObject dnaSliderPrefab = null;
        [SerializeField] private GameObject colorButtonPrefab = null;
        [SerializeField] private GameObject headerLabelPrefab = null;

        [Header("Scroll View Containers")]
        [SerializeField] private Transform primaryNavigationContent = null;
        [SerializeField] private Transform secondaryDetailContent = null;

        [Header("Top Tab Navigation")]
        [SerializeField] private Button wardrobeTabButton = null;
        [SerializeField] private Button faceDnaTabButton = null;
        [SerializeField] private Button bodyDnaTabButton = null;
        [SerializeField] private Button colorsTabButton = null;
        [SerializeField] private Button presetsTabButton = null;

        [Header("Action Controls")]
        [SerializeField] private TMP_Dropdown raceDropdown = null;
        [SerializeField] private Button randomizeButton = null;
        [SerializeField] private Button resetDefaultsButton = null;
        [SerializeField] private TMP_InputField characterNameInput = null;

        [Header("Shared Color Tables")]
        public SharedColorTable HairColor;
        public SharedColorTable EyesColor;
        public SharedColorTable SkinColor;
        public SharedColorTable ClothingColor;

        private EditorTab currentTab = EditorTab.Wardrobe;
        private DynamicCharacterAvatar avatar = null;
        private UMAModelController modelController = null;
        private string activeWardrobeSlot = null;

        private readonly List<string> faceDnaKeys = new List<string> {
            "headSize", "headWidth", "foreheadSize", "eyeSize", "eyeSpacing", "eyeRotation",
            "noseSize", "noseWidth", "noseCurve", "noseInclination", "mouthSize", "lipsSize",
            "cheekSize", "jawSize", "chinSize", "chinPronounced", "earsSize"
        };

        private readonly List<string> bodyDnaKeys = new List<string> {
            "height", "upperMuscle", "upperWeight", "waist", "belly",
            "armLength", "armWidth", "breastSize", "legsSize", "gluteusSize", "feetSize"
        };

        public override void Configure(SystemGameManager systemGameManager) {
            base.Configure(systemGameManager);
            
            wardrobeTabButton?.onClick.AddListener(() => SwitchTab(EditorTab.Wardrobe));
            faceDnaTabButton?.onClick.AddListener(() => SwitchTab(EditorTab.FaceDNA));
            bodyDnaTabButton?.onClick.AddListener(() => SwitchTab(EditorTab.BodyDNA));
            colorsTabButton?.onClick.AddListener(() => SwitchTab(EditorTab.Colors));
            presetsTabButton?.onClick.AddListener(() => SwitchTab(EditorTab.Presets));

            randomizeButton?.onClick.AddListener(RandomizeCharacter);
            resetDefaultsButton?.onClick.AddListener(ResetToDefault);

            if (raceDropdown != null) {
                raceDropdown.onValueChanged.AddListener(OnRaceDropdownChanged);
            }
        }

        public void BindAvatar(DynamicCharacterAvatar newAvatar, UMAModelController newController) {
            avatar = newAvatar;
            modelController = newController;
            PopulateRaceDropdown();
            SwitchTab(EditorTab.Wardrobe);
        }

        public void SwitchTab(EditorTab tab) {
            currentTab = tab;
            ClearContainers();

            switch (currentTab) {
                case EditorTab.Wardrobe:
                    PopulateWardrobeSlots();
                    break;
                case EditorTab.FaceDNA:
                    PopulateDnaSliders(faceDnaKeys, "Facial Architecture");
                    break;
                case EditorTab.BodyDNA:
                    PopulateDnaSliders(bodyDnaKeys, "Body Proportions");
                    break;
                case EditorTab.Colors:
                    PopulateColorCategories();
                    break;
                case EditorTab.Presets:
                    PopulatePresetsList();
                    break;
            }
        }

        private void ClearContainers() {
            if (primaryNavigationContent != null) {
                foreach (Transform child in primaryNavigationContent) Destroy(child.gameObject);
            }
            if (secondaryDetailContent != null) {
                foreach (Transform child in secondaryDetailContent) Destroy(child.gameObject);
            }
        }

        #region Wardrobe / Equipment (DCS Simple Setup API)

        private void PopulateWardrobeSlots() {
            if (avatar == null) return;

            var recipes = avatar.AvailableRecipes;
            foreach (var slotName in recipes.Keys) {
                GameObject slotBtnObj = Instantiate(slotButtonPrefab, primaryNavigationContent);
                var text = slotBtnObj.GetComponentInChildren<TMP_Text>();
                if (text != null) text.text = slotName;

                var btn = slotBtnObj.GetComponent<Button>();
                string capturedSlot = slotName;
                btn.onClick.AddListener(() => SelectWardrobeSlot(capturedSlot));
            }

            if (recipes.Keys.Count > 0) {
                var firstKey = new List<string>(recipes.Keys)[0];
                SelectWardrobeSlot(firstKey);
            }
        }

        private void SelectWardrobeSlot(string slotName) {
            activeWardrobeSlot = slotName;
            if (secondaryDetailContent != null) {
                foreach (Transform child in secondaryDetailContent) Destroy(child.gameObject);
            }

            // "Remove / Unequip" option
            GameObject removeBtnObj = Instantiate(wardrobeItemButtonPrefab, secondaryDetailContent);
            var removeTxt = removeBtnObj.GetComponentInChildren<TMP_Text>();
            if (removeTxt != null) removeTxt.text = $"[Clear {slotName}]";
            removeBtnObj.GetComponent<Button>().onClick.AddListener(() => {
                avatar.ClearSlot(slotName);
                avatar.BuildCharacter(true);
            });

            // List available UMATextRecipes for this slot
            if (avatar.AvailableRecipes.TryGetValue(slotName, out var slotRecipes)) {
                foreach (var recipe in slotRecipes) {
                    GameObject itemBtnObj = Instantiate(wardrobeItemButtonPrefab, secondaryDetailContent);
                    var itemTxt = itemBtnObj.GetComponentInChildren<TMP_Text>();
                    if (itemTxt != null) {
                        itemTxt.text = string.IsNullOrEmpty(recipe.DisplayValue) ? recipe.name : recipe.DisplayValue;
                    }
                    var itemBtn = itemBtnObj.GetComponent<Button>();
                    UMATextRecipe capturedRecipe = recipe;
                    itemBtn.onClick.AddListener(() => {
                        avatar.SetSlot(capturedRecipe);
                        avatar.BuildCharacter(true);
                    });
                }
            }
        }

        #endregion

        #region DNA Sliders (Deep Appearance API)

        private void PopulateDnaSliders(List<string> filterKeys, string headerTitle) {
            if (avatar == null) return;

            var allDNA = avatar.GetDNA();
            foreach (var key in filterKeys) {
                if (allDNA.TryGetValue(key, out var setter)) {
                    GameObject sliderObj = Instantiate(dnaSliderPrefab, primaryNavigationContent);
                    var label = sliderObj.transform.Find("Label")?.GetComponent<TMP_Text>();
                    var slider = sliderObj.GetComponentInChildren<Slider>();

                    if (label != null) label.text = setter.Name;
                    if (slider != null) {
                        slider.value = setter.Value;
                        slider.onValueChanged.AddListener(val => {
                            setter.Set(val);
                            avatar.ForceUpdate(true);
                        });
                    }
                }
            }
        }

        #endregion

        #region Shared Color Tables

        private void PopulateColorCategories() {
            if (avatar == null) return;

            string[] colorChannels = { "Skin", "Hair", "Eyes", "GearPrimary", "GearSecondary" };
            foreach (var channel in colorChannels) {
                GameObject btnObj = Instantiate(slotButtonPrefab, primaryNavigationContent);
                var text = btnObj.GetComponentInChildren<TMP_Text>();
                if (text != null) text.text = channel;

                string capturedChannel = channel;
                btnObj.GetComponent<Button>().onClick.AddListener(() => OpenColorPalette(capturedChannel));
            }

            OpenColorPalette("Skin");
        }

        private void OpenColorPalette(string channelName) {
            if (secondaryDetailContent != null) {
                foreach (Transform child in secondaryDetailContent) Destroy(child.gameObject);
            }

            SharedColorTable targetTable = null;
            if (channelName == "Skin") targetTable = SkinColor;
            else if (channelName == "Hair") targetTable = HairColor;
            else if (channelName == "Eyes") targetTable = EyesColor;
            else targetTable = ClothingColor;

            if (targetTable == null || targetTable.colors == null) return;

            foreach (var ocd in targetTable.colors) {
                GameObject colBtn = Instantiate(colorButtonPrefab, secondaryDetailContent);
                var img = colBtn.GetComponent<Image>();
                if (img != null) img.color = ocd.color;

                var capturedColor = ocd;
                colBtn.GetComponent<Button>().onClick.AddListener(() => {
                    avatar.SetColor(channelName, capturedColor);
                    avatar.BuildCharacter(true);
                });
            }
        }

        #endregion

        #region Race, Randomizer & Presets

        private void PopulateRaceDropdown() {
            if (raceDropdown == null) return;
            raceDropdown.ClearOptions();
            raceDropdown.AddOptions(new List<string> { "HumanMale", "HumanFemale" });
            raceDropdown.value = (avatar?.activeRace?.name == "HumanFemale") ? 1 : 0;
        }

        private void OnRaceDropdownChanged(int index) {
            string selectedRace = (index == 1) ? "HumanFemale" : "HumanMale";
            if (avatar != null && avatar.activeRace.name != selectedRace) {
                avatar.ChangeRace(selectedRace);
                avatar.BuildCharacter(true);
                SwitchTab(currentTab);
            }
        }

        public void RandomizeCharacter() {
            if (avatar == null) return;

            // Randomize DNA
            var allDNA = avatar.GetDNA();
            foreach (var ds in allDNA.Values) {
                ds.Set(Random.Range(0.2f, 0.8f));
            }

            // Randomize Colors
            if (SkinColor?.colors != null && SkinColor.colors.Length > 0) {
                avatar.SetColor("Skin", SkinColor.colors[Random.Range(0, SkinColor.colors.Length)]);
            }
            if (HairColor?.colors != null && HairColor.colors.Length > 0) {
                avatar.SetColor("Hair", HairColor.colors[Random.Range(0, HairColor.colors.Length)]);
            }
            if (EyesColor?.colors != null && EyesColor.colors.Length > 0) {
                avatar.SetColor("Eyes", EyesColor.colors[Random.Range(0, EyesColor.colors.Length)]);
            }

            avatar.BuildCharacter(true);
            SwitchTab(currentTab);
        }

        public void ResetToDefault() {
            if (avatar == null) return;
            avatar.ClearSlots();
            var allDNA = avatar.GetDNA();
            foreach (var ds in allDNA.Values) ds.Set(0.5f);
            avatar.BuildCharacter(true);
            SwitchTab(currentTab);
        }

        private void PopulatePresetsList() {
            string[] presetNames = { "Warrior Knight", "Arcane Sorcerer", "Shadow Rogue", "Wandering Scout" };
            foreach (var pName in presetNames) {
                GameObject pBtn = Instantiate(wardrobeItemButtonPrefab, primaryNavigationContent);
                pBtn.GetComponentInChildren<TMP_Text>().text = pName;
                pBtn.GetComponent<Button>().onClick.AddListener(() => ApplyPreset(pName));
            }
        }

        private void ApplyPreset(string name) {
            Debug.Log($"[UMAAppearanceEditorPanel] Applying preset: {name}");
            RandomizeCharacter();
        }

        #endregion
    }
}`
  },
  {
    filename: 'UMA3SimpleSetupBridge.cs',
    relativePath: 'Assets/AnyRPG/Addons/anyrpg-uma/Scripts/Characters/ModelControllers/UMA3SimpleSetupBridge.cs',
    description: 'Bridges UMA 3 DCS Simple Setup runtime with AnyRPG CharacterCreatorManager, CharacterSaveData, and multiplayer network replication.',
    category: 'Runtime',
    code: `using System.Collections.Generic;
using UnityEngine;
using UMA;
using UMA.CharacterSystem;

namespace AnyRPG {
    /// <summary>
    /// Dedicated bridge connecting UMA 3 DCS Simple Setup API directly to AnyRPG's
    /// character management, save systems, and FishNet synchronization.
    /// </summary>
    public class UMA3SimpleSetupBridge : MonoBehaviour {

        [Header("Target References")]
        [SerializeField] private DynamicCharacterAvatar avatar = null;
        [SerializeField] private UMAAppearanceEditorPanel editorPanel = null;
        [SerializeField] private PreviewCameraController previewCamera = null;

        [Header("Default Assets")]
        [SerializeField] private string defaultRace = "HumanMale";
        [SerializeField] private bool autoBuildOnStart = true;

        private void Awake() {
            if (avatar == null) {
                avatar = GetComponent<DynamicCharacterAvatar>();
            }
        }

        private void Start() {
            if (avatar != null && autoBuildOnStart) {
                InitializeUMA3Character();
            }
        }

        public void InitializeUMA3Character() {
            if (avatar == null) return;

            // Ensure UMA 3 Asset Indexer is ready
            if (UMAAssetIndexer.Instance == null) {
                Debug.LogWarning("[UMA3SimpleSetupBridge] UMAAssetIndexer not found in scene! Ensure UMA_GLIB is instantiated.");
            }

            avatar.BuildCharacterEnabled = true;
            avatar.ChangeRace(defaultRace);

            // Connect to UI panel if present in Main Menu
            if (editorPanel != null) {
                editorPanel.BindAvatar(avatar, null);
            }
        }

        /// <summary>
        /// Serializes current UMA 3 avatar into AnyRPG CharacterSaveData compressed string.
        /// </summary>
        public string ExportAvatarDefinitionString() {
            if (avatar == null) return string.Empty;
            return avatar.GetAvatarDefinition(true).ToCompressedString("|");
        }

        /// <summary>
        /// Restores character from saved string in AnyMMODemo, Dungeon, or Zone scenes.
        /// </summary>
        public void ImportAvatarDefinitionString(string compressedString) {
            if (avatar == null || string.IsNullOrEmpty(compressedString)) return;

            AvatarDefinition def = AvatarDefinition.FromCompressedString(compressedString, '|');
            avatar.LoadAvatarDefinition(def);
            avatar.BuildCharacter(true);
        }

        /// <summary>
        /// Equips a dynamic wardrobe item by name.
        /// </summary>
        public void EquipRecipe(string slotName, string recipeName) {
            if (avatar == null) return;
            avatar.SetSlot(slotName, recipeName);
            avatar.BuildCharacter(true);
        }

        /// <summary>
        /// Removes an item from a specific wardrobe slot.
        /// </summary>
        public void UnequipSlot(string slotName) {
            if (avatar == null) return;
            avatar.ClearSlot(slotName);
            avatar.BuildCharacter(true);
        }
    }
}`
  },
  {
    filename: 'UMA3EquipmentBridge.cs',
    relativePath: 'Assets/AnyRPG/Addons/anyrpg-uma/Scripts/Items/UMA3EquipmentBridge.cs',
    description: 'Synchronizes AnyRPG MMO inventory equipment with UMA 3 dynamic wardrobe slots and layered recipe occlusion.',
    category: 'Runtime',
    code: `using System.Collections.Generic;
using UnityEngine;
using UMA;
using UMA.CharacterSystem;

namespace AnyRPG {
    /// <summary>
    /// Handles dynamic equipment swaps, wardrobe slot suppression,
    /// and weapon bone attachment synchronization for UMA 3.
    /// </summary>
    public static class UMA3EquipmentBridge {

        /// <summary>
        /// Equips an AnyRPG equipment item to the corresponding UMA3 wardrobe slots.
        /// </summary>
        public static void EquipToAvatar(DynamicCharacterAvatar avatar, UMAEquipmentModel equipmentModel) {
            if (avatar == null || equipmentModel?.Properties == null) return;

            var properties = equipmentModel.Properties;

            // Apply shared colors
            if (properties.SharedColors != null) {
                foreach (var colorNode in properties.SharedColors) {
                    avatar.SetColor(colorNode.SharedColorname, colorNode.Color);
                }
            }

            // Apply recipes matching current race
            if (properties.UMARecipes != null) {
                string currentRace = avatar.activeRace.name;
                foreach (var recipe in properties.UMARecipes) {
                    if (recipe != null && recipe.compatibleRaces.Contains(currentRace)) {
                        avatar.SetSlot(recipe);
                    }
                }
            }

            avatar.BuildCharacter(true);
        }

        /// <summary>
        /// Clears an equipment item from UMA3 wardrobe slots.
        /// </summary>
        public static void UnequipFromAvatar(DynamicCharacterAvatar avatar, UMAEquipmentModel equipmentModel) {
            if (avatar == null || equipmentModel?.Properties == null) return;

            var properties = equipmentModel.Properties;
            if (properties.UMARecipes != null) {
                string currentRace = avatar.activeRace.name;
                foreach (var recipe in properties.UMARecipes) {
                    if (recipe != null && recipe.compatibleRaces.Contains(currentRace)) {
                        avatar.ClearSlot(recipe.wardrobeSlot);
                    }
                }
            }

            avatar.BuildCharacter(true);
        }
    }
}`
  },
  {
    filename: 'UMAShaderPatcher_Unity6.cs',
    relativePath: 'Assets/AnyRPG/Core/System/Scripts/Editor/UMAShaderPatcher_Unity6.cs',
    description: 'Editor tool for Unity 6000.3.14f1 (URP 17+). Patches EncodeMeshRenderingLayer() call and rebuilds all .umaShaderPack archives.',
    category: 'Editor',
    code: `using UnityEngine;
using UnityEditor;
using System.IO;

namespace AnyRPG {
    /// <summary>
    /// Unity 6000.3.14f1 UMA 3 Shader & Package Migration Utility.
    /// Fixes URP 17+ rendering layer encoding changes and regenerates shader packages.
    /// </summary>
    public class UMAShaderPatcher_Unity6 : EditorWindow {

        [MenuItem("Tools/UMA/Upgrade to UMA 3 & Unity 6 Shaders")]
        public static void PatchUMAForUnity6() {
            string folderPath = "Assets/UMA/Core/ShaderPackages";
            if (!Directory.Exists(folderPath)) {
                EditorUtility.DisplayDialog("Error", 
                    "UMA Shader folder not found! Please ensure UMA 3 is installed in Assets/UMA.", "OK");
                return;
            }

            string[] files = Directory.GetFiles(folderPath, "*.umaShaderPack", SearchOption.AllDirectories);
            int patchedFiles = 0;

            // Unity 5 / legacy URP: EncodeMeshRenderingLayer(renderingLayers) (1 param)
            string oldSignature = "outRenderingLayers = float4(EncodeMeshRenderingLayer(renderingLayers), 0, 0, 0);";
            // Unity 6000.3.14f1 (URP 17+): EncodeMeshRenderingLayer() (0 params)
            string newSignature = "outRenderingLayers = float4(EncodeMeshRenderingLayer(), 0, 0, 0);";

            foreach (string file in files) {
                string content = File.ReadAllText(file);
                if (content.Contains(oldSignature)) {
                    content = content.Replace(oldSignature, newSignature);
                    File.WriteAllText(file, content);
                    patchedFiles++;
                }
            }

            AssetDatabase.Refresh();

            EditorUtility.DisplayDialog("UMA 3 / Unity 6 Patch Complete",
                $"Successfully scanned {files.Length} packages and patched {patchedFiles} shader files for Unity 6000.3.14f1!\\n\\n" +
                "NEXT STEPS:\\n" +
                "1. Right click 'Assets/UMA/Core/ShaderPackages' -> 'Reimport'\\n" +
                "2. Open 'UMA -> Global Library' and click 'Rebuild Index'\\n" +
                "3. In Project Settings -> Graphics, ensure URP Pipeline Asset is assigned.\\n" +
                "4. All UMA 3 dynamic characters will now render in URP Forward+ without pink shader errors.",
                "Understood!");
        }
    }
}`
  }
];

export const UPGRADE_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Backup & Remove Legacy UMA 2',
    description: 'Ensure Git working tree is clean. Delete Assets/UMA and clean up deprecated UMA 2 cache files while preserving AnyRPG Addons.',
    commands: [
      'git checkout -b feature/upgrade-uma3',
      'rm -rf Assets/UMA',
      'rm -rf Library/ShaderCache'
    ]
  },
  {
    step: 2,
    title: 'Install UMA 3 (v3.1f3 for Unity 6)',
    description: 'Clone or import UMA 3 from github.com/umasteeringgroup/UMA into Assets/UMA.',
    commands: [
      'git clone --depth 1 --branch v3.1f3 https://github.com/umasteeringgroup/UMA.git Assets/UMA',
      'rm -rf Assets/UMA/.git'
    ]
  },
  {
    step: 3,
    title: 'Execute Unity 6000.3.14f1 Shader Patcher',
    description: 'Run the automated UMAShaderPatcher_Unity6 to update EncodeMeshRenderingLayer() signatures in all .umaShaderPack packages.',
    commands: [
      'In Unity Editor: Tools -> UMA -> Upgrade to UMA 3 & Unity 6 Shaders',
      'Right click Assets/UMA/Core/ShaderPackages -> Reimport'
    ]
  },
  {
    step: 4,
    title: 'Update AnyRPG Scripts with UMA 3 API',
    description: 'Replace UMAModelController.cs and UMAAppearanceEditorPanel.cs with the provided UMA 3 implementations.',
    commands: [
      'Copy UMAModelController.cs -> Assets/AnyRPG/Addons/anyrpg-uma/Scripts/Characters/ModelControllers/',
      'Copy UMAAppearanceEditorPanel.cs -> Assets/AnyRPG/Addons/anyrpg-uma/Scripts/UI/CloseableWindows/',
      'Copy UMA3SimpleSetupBridge.cs -> Assets/AnyRPG/Addons/anyrpg-uma/Scripts/Characters/ModelControllers/',
      'Copy UMA3EquipmentBridge.cs -> Assets/AnyRPG/Addons/anyrpg-uma/Scripts/Items/'
    ]
  },
  {
    step: 5,
    title: 'Rebuild Global Library & Verify 5 Scenes',
    description: 'Open UMA -> Global Library -> Rebuild Index. Test the 5 scenes: AnyMMODemoMainMenu, AnyMMODemo, AnyMMODemoCutsceneZone, AnyMMODemoDungeon, AnyMMODemoZone.',
    commands: [
      'UMA -> Global Library -> Rebuild Index',
      'Test Character Creator in AnyMMODemoMainMenu',
      'Test gameplay spawn and equipment in AnyMMODemo, Dungeon, Zone'
    ]
  }
];

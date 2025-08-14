





export interface StoryPart {
  id: number;
  type: 'story' | 'action';
  text: string;
  notifications?: string[];
}

export interface Choice {
  title: string;
  benefit: string;

  risk: string;
  successChance: number;
  durationInMinutes: number;
  isCustom?: boolean; // Add this line
}

export interface StatusEffect {
  name: string;
  description: string;
  duration: string; // "Vĩnh viễn", "3 lượt", "Trang bị", etc.
}

export interface Achievement {
  name: string;
  description: string;
  tier?: string; // e.g., "Sơ cấp", "Trung cấp"
  isNew?: boolean;
}

export enum SkillType {
  ATTACK = 'Công Kích',
  DEFENSE = 'Phòng Ngự',
  MOVEMENT = 'Thân Pháp',
  CULTIVATION = 'Tu Luyện',
  SUPPORT = 'Hỗ Trợ',
  SPECIAL = 'Đặc Biệt',
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  quality: string;
  level: number;
  experience: number;
  description: string;
  effect: string;
  isNew?: boolean;
}

export interface SkillUpdate {
  skillName: string;
  gainedExperience: number;
}

export enum LocationType {
  WORLD = 'THẾ GIỚI',
  CITY = 'THÀNH TRẤN',
  THE_LUC = 'THẾ LỰC',
  TOWN = 'THÔN LÀNG',
  DUNGEON = 'BÍ CẢNH',
  FOREST = 'RỪNG RẬM',
  SHOP = 'CỬA HÀNG',
  INN = 'NHÀ TRỌ',
  RESTAURANT = 'TỬU LÂU',
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  coordinates: Coordinates;
  parentId: string | null;
  ownerId: string | null; // ID của nhân vật sở hữu
  rules: string[]; // Các luật lệ hoặc đặc tính của địa điểm
  isDestroyed?: boolean; // Cờ báo hiệu thế giới đã bị phá hủy
  isNew?: boolean;
}

export interface MienLuc {
  body: number; // Vóc dáng /25
  face: number; // Mặt /30
  aura: number; // Khí chất /25
  power: number; // Tu vi /25
}

export interface NpcRelationship {
  targetNpcId: string;
  value: number; // Quan hệ, -1000 to 1000
  relationshipType?: string; // Loại mối quan hệ, vd: "Phụ thân", "Sư phụ", "Nô lệ"
}

// Data NPC được AI cung cấp khi tạo mới
export interface NewNPCFromAI {
  id: string; 
  name: string;
  aliases?: string;
  gender: CharacterGender;
  race: string;
  personality: string;
  description: string; 
  avatarUrl?: string;
  level: number;
  powerSystem: string; // Tên của hệ thống tu luyện
  aptitude: string;
  mienLuc: MienLuc;
  locationId: string;
  specialConstitution?: { name: string; description: string };
  innateTalent?: { name:string; description: string };
  statusEffects: StatusEffect[];
  npcRelationships?: NpcRelationship[];
  isDaoLu?: boolean; // Trạng thái bạn đời
}

export interface NPC extends NewNPCFromAI {
  // Stats - Các chỉ số này sẽ được tính toán
  health: number; // Sinh lực HIỆN TẠI
  mana: number; // Linh lực HIỆN TẠI

  // Progression
  experience: number;
  realm: string; // Cảnh giới (được tính toán)

  // Relationships & Memory
  relationship?: number; // Quan hệ với người chơi, -1000 to 1000. Not set until first interaction.
  memories: string[]; 
  npcRelationships: NpcRelationship[];
  isDaoLu: boolean; // Trạng thái bạn đời
  isDead?: boolean; // Trạng thái đã chết
  isNew?: boolean;
}

// Đối tượng dùng để cập nhật một NPC đã tồn tại
export interface NPCUpdate {
    id: string;
    gainedExperience?: number;
    relationship?: number;
    memories?: string[]; // Gửi toàn bộ mảng ký ức đã cập nhật
    health?: number; // Cập nhật sinh lực hiện tại
    mana?: number; // Cập nhật linh lực hiện tại
    newStatusEffects?: StatusEffect[];
    removedStatusEffects?: string[];
    breakthroughToRealm?: string; // Tên cảnh giới mới, hệ thống sẽ tự tính EXP.
    // Các trường khác có thể được AI cập nhật
    gender?: CharacterGender;
    personality?: string;
    description?: string;
    locationId?: string;
    aptitude?: string;
    specialConstitution?: { name: string; description: string };
    innateTalent?: { name: string; description: string };
    updatedNpcRelationships?: NpcRelationship[];
    isDaoLu?: boolean; // Cập nhật trạng thái bạn đời
    isDead?: boolean; // Cập nhật trạng thái đã chết
}

export interface Monster {
    id: string;
    name: string;
    description: string;
    isNew?: boolean;
}

export interface StoryResponse {
  story: string;
  choices: Choice[];
  updatedStats?: Partial<{
    health: number;
    mana: number;
    gainedExperience: number; // Điểm kinh nghiệm NHẬN ĐƯỢỢC, không phải tổng số.
    currencyAmount: number;
    updatedLevel?: number; // (Không dùng nữa) Cấp độ mới của nhân vật nếu có đột phá trực tiếp.
    breakthroughToRealm?: string; // Tên cảnh giới mới, hệ thống sẽ tự tính EXP.
    newStatusEffects?: StatusEffect[];
    removedStatusEffects?: string[]; // Mảng tên các trạng thái cần xóa
    newAchievements?: Achievement[];
    updatedAchievements?: { name: string; description?: string; tier?: string }[];
  }>;
  updatedGameTime?: string; // ISO 8601 string for major time skips
  updatedGender?: CharacterGender;
  updatedSkills?: SkillUpdate[];
  newSkills?: Skill[]; // AI sẽ cung cấp dữ liệu một phần, ứng dụng sẽ hoàn thiện nó.
  newLocations?: Location[];
  updatedLocations?: Location[]; // Các địa điểm đã tồn tại nhưng có sự thay đổi (vd: chủ sở hữu, luật lệ, bị phá hủy)
  updatedPlayerLocationId?: string | null;
  newNPCs?: NewNPCFromAI[]; // New NPCs encountered
  updatedNPCs?: NPCUpdate[]; // Instructions to update existing NPCs
  newItems?: Item[];
  updatedItems?: { name: string; quantity: number }[];
  removedItemIds?: string[];
  newMonsters?: { name: string; description: string }[];
  newWorldKnowledge?: WorldKnowledge[];
}

export enum GameState {
  HOME,
  WORLD_SETUP,
  PLAYING,
  ERROR,
  SAVE_MANAGEMENT,
}

export enum NarrativePerspective {
  FIRST_PERSON = 'first_person',
  SECOND_PERSON = 'second_person',
}

export enum CharacterGender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface PowerSystemDefinition {
  id: string;
  name: string;
  realms: string;
}

export interface WorldKnowledge {
    id: string;
    title: string;
    content: string;
    category: 'Bang Phái' | 'Lịch Sử' | 'Nhân Vật' | 'Khác';
    isNew?: boolean;
}

export interface WorldSettings {
    storyIdea: string;
    openingScene: string;
    theme: string;
    genre: string;
    context: string;
    powerSystems: PowerSystemDefinition[];
    qualityTiers: string;
    aptitudeTiers: string;
    playerDefinedRules: string[];
    initialKnowledge: WorldKnowledge[];
}

export enum ItemType {
    TRANG_BI = 'Trang Bị',
    DUOC_PHAM = 'Dược Phẩm',
    DAC_THU = 'Đặc Thù',
    BI_KIP = 'Bí Kíp Công Pháp',
    KHAC = 'Khác',
    NGUYEN_LIEU = 'Nguyên Liệu',
}

export enum EquipmentType {
    VU_KHI = 'Vũ Khí',
    NON = 'Nón',
    AO = 'Áo',
    GIAY = 'Giày',
    PHU_KIEN = 'Phụ Kiện',
    THONG_DUNG = 'Thông Dụng' // For "Đặc Thù" items
}

export enum EquipmentSlot {
    WEAPON_1 = 'weapon1',
    WEAPON_2 = 'weapon2',
    HELMET = 'helmet',
    ARMOR = 'armor',
    BOOTS = 'boots',
    ACCESSORY_1 = 'accessory1',
    ACCESSORY_2 = 'accessory2',
    ACCESSORY_3 = 'accessory3',
    ACCESSORY_4 = 'accessory4',
    COMMON_1 = 'common1',
    COMMON_2 = 'common2',
}

export interface EquipmentStat {
    key: 'attack' | 'maxHealth' | 'maxMana'; 
    value: number;
}

export interface EquipmentDetails {
    type: EquipmentType;
    stats: EquipmentStat[];
    effect?: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    quality: string;
    quantity: number;
    value?: number;
    isEquipped?: boolean;
    equipmentDetails?: EquipmentDetails;
    effectsDescription?: string;
    isNew?: boolean;
}

export interface CharacterProfile {
  id: string; // ID duy nhất cho nhân vật
  name: string;
  gender: CharacterGender;
  race: string;
  powerSystem: string;
  realm: string;
  currencyName: string;
  currencyAmount: number;
  personality: string;
  backstory: string;
  goal: string;
  specialConstitution: {
    name: string;
    description: string;
  };
  talent: {
    name: string;
    description: string;
  };
  avatarUrl?: string;

  // -- Core Stats --
  // Base stats are from leveling up.
  baseMaxHealth: number;
  baseMaxMana: number;
  baseAttack: number;
  
  // Derived stats include equipment bonuses. These are what's displayed and used in checks.
  maxHealth: number; 
  maxMana: number;
  attack: number;
  
  // Current values
  health: number;
  mana: number;

  // Progression
  experience: number;
  level: number;
  lifespan: number;

  // Status Effects
  statusEffects: StatusEffect[];
  achievements: Achievement[];

  // Skills
  skills: Skill[];
  
  // Items & Equipment
  items: Item[];
  equipment: Partial<Record<EquipmentSlot, string>>; // Key is slot, value is Item ID

  // Map & Location
  currentLocationId: string | null;
  discoveredLocations: Location[];
  discoveredMonsters: Monster[];
  discoveredItems: Item[];
  gameTime: string; // Thời gian trong game, định dạng ISO 8601
  
  // User-defined initial elements
  initialNpcs?: NewNPCFromAI[];
  initialLocations?: Location[];
  initialItems?: Item[];
  initialMonsters?: Monster[];
}

export enum ApiProvider {
    GEMINI = 'gemini',
    OPENAI = 'openai',
}

export interface StoredApiKey {
  id: string;
  name: string;
  key: string;
}

export interface GeminiSettings {
    useDefault: boolean;
    customKeys: StoredApiKey[];
    activeCustomKeyId: string | null;
}

export interface AppSettings {
   isMature: boolean;
   perspective: NarrativePerspective;
   apiProvider: ApiProvider;
   openaiApiKey: string;
   gemini: GeminiSettings;
   historyContextSize: number;
   storyFontSize: number;
}

export interface GameSnapshot {
  turnNumber: number;
  // State at the START of this turn (for rewind)
  preActionState?: {
      characterProfile: CharacterProfile;
      worldSettings: WorldSettings;
      npcs: NPC[];
      history: StoryPart[]; // full history BEFORE this turn
      choices: Choice[];
  };
  // The content of this turn (for display in log)
  turnContent: {
      playerAction?: StoryPart;
      storyResult: StoryPart;
  };
}

export interface FullGameState {
  id: string; // characterProfile.id
  name: string;
  lastSaved: number; // timestamp
  characterProfile: CharacterProfile;
  worldSettings: WorldSettings;
  npcs: NPC[];
  history: StoryPart[];
  choices: Choice[];
  gameLog: GameSnapshot[];
}

export interface SaveMetadata {
    id: string;
    name: string;
    lastSaved: number;
    size: number;
}

export interface UsageMetadata {
    totalTokenCount?: number;
    promptTokenCount?: number;
    candidatesTokenCount?: number;
}

export interface StoryApiResponse {
    storyResponse: StoryResponse;
    usageMetadata?: UsageMetadata;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

export interface AvatarData {
    url: string;
    type: 'character' | 'monster' | 'pet';
    gender: 'male' | 'female' | 'none';
    tags: string[];
}

export interface CustomAvatarData {
    id: string;
    url: string;
    tags: string[];
    isMonsterImage: boolean;
}
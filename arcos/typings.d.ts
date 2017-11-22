type AOS_BOOST_PROCESS = 'boost'
type AOS_BUILD_PROCESS = 'build'
type AOS_BUILDER_LIFETIME_PROCESS = 'blf'
type AOS_CLAIM_PROCESS = 'claim'
type AOS_COLLECT_PROCESS = 'collect'
type AOS_COURRIER_LIFETIME_PROCESS = 'courrierLifetime'
type AOS_DELIVER_PROCESS = 'deliver'
type AOS_DISTRO_LIFETIME_PROCESS = 'dlf'
type AOS_ENERGY_MANAGEMENT_PROCESS = 'em'
type AOS_FLAG_WATCHER_PROCESS = 'flagWatcher'
type AOS_HARVEST_PROCESS = 'harvest'
type AOS_HARVESTER_LIFETIME_PROCESS = 'hlf'
type AOS_HOLD_PROCESS = 'hold'
type AOS_HOLD_ROOM_PROCESS = 'holdRoom'
type AOS_INIT_PROCESS = 'init'
type AOS_LAB_MANAGEMENT_PROCESS = 'labManagement'
type AOS_LOAN_DATA_PROCESS = 'loanData'
type AOS_MINERAL_HARVEST_PROCESS = 'mh'
type AOS_MINERAL_HARVESTER_LIFETIME_PROCESS = 'mhlf'
type AOS_MINERAL_MANAGEMENT_PROCESS = 'mineralManagement'
type AOS_MOVE_PROCESS = 'move'
type AOS_RANGER_LIFETIME_PROCESS = 'rangerLifetime'
type AOS_RANGER_MANAGEMENT_PROCESS = 'rangerManagement'
type AOS_REMOTE_BUILDER_LIFETIME_PROCESS = 'rblf'
type AOS_REMOTE_MINER_LIFETIME_PROCESS = 'rmlf'
type AOS_REMOTE_MINING_MANAGEMENT_PROCESS = 'rmmp'
type AOS_REPAIR_PROCESS = 'repair'
type AOS_REPAIRER_LIFETIME_PROCESS = 'rlf'
type AOS_ROOM_DATA_PROCESS = 'roomData'
type AOS_ROOM_LAYOUT_PROCESS = 'roomLayout'
type AOS_SPAWN_REMOTE_BUILDER_PROCESS = 'spawnRemoteBuilder'
type AOS_STRUCTURE_MANAGEMENT_PROCESS = 'sm'
type AOS_SUSPENSION_PROCESS = 'suspend'
type AOS_TOWER_DEFENSE_PROCESS = 'td'
type AOS_TOWER_REPAIR_PROCESS = 'towerRepair'
type AOS_TRANSPORTER_LIFETIME_PROCESS = 'transporterLifetime'
type AOS_UPGRADE_PROCESS = 'upgrade'
type AOS_UPGRADER_LIFETIME_PROCESS = 'ulf'

type STATE_LOAD = 'load'
type STATE_READ = 'read'

declare const AOS_BOOST_PROCESS = 'boost'
declare const AOS_BUILD_PROCESS = 'build'
declare const AOS_BUILDER_LIFETIME_PROCESS = 'blf'
declare const AOS_CLAIM_PROCESS = 'claim'
declare const AOS_COLLECT_PROCESS = 'collect'
declare const AOS_COURRIER_LIFETIME_PROCESS = 'courrierLifetime'
declare const AOS_DELIVER_PROCESS = 'deliver'
declare const AOS_DISTRO_LIFETIME_PROCESS = 'dlf'
declare const AOS_ENERGY_MANAGEMENT_PROCESS = 'em'
declare const AOS_FLAG_WATCHER_PROCESS = 'flagWatcher'
declare const AOS_HARVEST_PROCESS = 'harvest'
declare const AOS_HARVESTER_LIFETIME_PROCESS = 'hlf'
declare const AOS_HOLD_PROCESS = 'hold'
declare const AOS_HOLD_ROOM_PROCESS = 'holdRoom'
declare const AOS_INIT_PROCESS = 'init'
declare const AOS_LAB_MANAGEMENT_PROCESS = 'labManagement'
declare const AOS_LOAN_DATA_PROCESS = 'loanData'
declare const AOS_MINERAL_HARVEST_PROCESS = 'mh'
declare const AOS_MINERAL_HARVESTER_LIFETIME_PROCESS = 'mhlf'
declare const AOS_MINERAL_MANAGEMENT_PROCESS = 'mineralManagement'
declare const AOS_MOVE_PROCESS = 'move'
declare const AOS_RANGER_LIFETIME_PROCESS = 'rangerLifetime'
declare const AOS_RANGER_MANAGEMENT_PROCESS = 'rangerManagement'
declare const AOS_REMOTE_BUILDER_LIFETIME_PROCESS = 'rblf'
declare const AOS_REMOTE_MINER_LIFETIME_PROCESS = 'rmlf'
declare const AOS_REMOTE_MINING_MANAGEMENT_PROCESS = 'rmmp'
declare const AOS_REPAIR_PROCESS = 'repair'
declare const AOS_REPAIRER_LIFETIME_PROCESS = 'rlf'
declare const AOS_ROOM_DATA_PROCESS = 'roomData'
declare const AOS_ROOM_LAYOUT_PROCESS = 'roomLayout'
declare const AOS_SPAWN_REMOTE_BUILDER_PROCESS = 'spawnRemoteBuilder'
declare const AOS_STRUCTURE_MANAGEMENT_PROCESS = 'sm'
declare const AOS_SUSPENSION_PROCESS = 'suspend'
declare const AOS_TOWER_DEFENSE_PROCESS = 'td'
declare const AOS_TOWER_REPAIR_PROCESS = 'towerRepair'
declare const AOS_TRANSPORTER_LIFETIME_PROCESS = 'transporterLifetime'
declare const AOS_UPGRADE_PROCESS = 'upgrade'
declare const AOS_UPGRADER_LIFETIME_PROCESS = 'ulf'

declare const STATE_LOAD = 'load'
declare const STATE_READ = 'read'

/** Alliance Name (LOAN Data Key) */
declare const AOS_ALLIANCE: string
declare const AOS_NO_AGRESS: string[]

type ProcessTypes =
  AOS_BOOST_PROCESS |
  AOS_BUILD_PROCESS |
  AOS_BUILDER_LIFETIME_PROCESS |
  AOS_CLAIM_PROCESS |
  AOS_COLLECT_PROCESS |
  AOS_COURRIER_LIFETIME_PROCESS |
  AOS_DELIVER_PROCESS |
  AOS_DISTRO_LIFETIME_PROCESS |
  AOS_ENERGY_MANAGEMENT_PROCESS |
  AOS_FLAG_WATCHER_PROCESS |
  AOS_HARVEST_PROCESS |
  AOS_HARVESTER_LIFETIME_PROCESS |
  AOS_HOLD_PROCESS |
  AOS_HOLD_ROOM_PROCESS |
  AOS_INIT_PROCESS |
  AOS_LAB_MANAGEMENT_PROCESS |
  AOS_LOAN_DATA_PROCESS |
  AOS_MINERAL_HARVEST_PROCESS |
  AOS_MINERAL_HARVESTER_LIFETIME_PROCESS |
  AOS_MINERAL_MANAGEMENT_PROCESS |
  AOS_MOVE_PROCESS |
  AOS_RANGER_LIFETIME_PROCESS |
  AOS_RANGER_MANAGEMENT_PROCESS |
  AOS_REMOTE_BUILDER_LIFETIME_PROCESS |
  AOS_REMOTE_MINER_LIFETIME_PROCESS |
  AOS_REMOTE_MINING_MANAGEMENT_PROCESS |
  AOS_REPAIR_PROCESS |
  AOS_REPAIRER_LIFETIME_PROCESS |
  AOS_ROOM_DATA_PROCESS |
  AOS_ROOM_LAYOUT_PROCESS |
  AOS_SPAWN_REMOTE_BUILDER_PROCESS |
  AOS_STRUCTURE_MANAGEMENT_PROCESS |
  AOS_SUSPENSION_PROCESS |
  AOS_TOWER_DEFENSE_PROCESS |
  AOS_TOWER_REPAIR_PROCESS |
  AOS_TRANSPORTER_LIFETIME_PROCESS |
  AOS_UPGRADE_PROCESS |
  AOS_UPGRADER_LIFETIME_PROCESS

type StateConstant =
  STATE_LOAD |
  STATE_READ

type ProcessWithTypedMetaData<T extends ProcessTypes> = {
  metaData: MetaData[T]
}

type BlankMetaData = {}
type RoomMetaData = BlankMetaData & {
  /** The room this process is running in. */
  roomName: string
}
type CreepMetaData = BlankMetaData & {
  /** The creep this process is running. */
  creep: string
}
type ResourceMoveMetaData = CreepMetaData & {
  resource: ResourceConstant
  target: string
}
type FlagMetaData = {
  flag: string
}

type MetaData = {
  [processType: string]: {}
  boost: CreepMetaData & {
    /** The lab to boost the creep */
    lab: string
  }
  build: CreepMetaData & {
    site: string
  }
  blf: CreepMetaData & {
    suicide?: boolean
  }
  claim: {
    creep?: string
    targetRoom: string
    flagName: string
    spawnRoom?: string
  }
  collect: ResourceMoveMetaData
  courrierLifetime: CreepMetaData
  deliver: ResourceMoveMetaData
  dlf: CreepMetaData & {
    sourceContainer: string
  }
  em: RoomMetaData & {
    harvestCreeps?: {
      [source: string]: string[]
    }
    distroCreeps?: {
      [container: string]: string
    }
    upgradeCreeps?: string[]
    linker?: string
    linkRequests?: {
      link: string
      send: boolean
      stage: number
    }[]
    courrier?: string
    terminator?: string
    terminalTransfers?: {
      in: boolean
      stage: number
      count: number
      resource: ResourceConstant
      id: string
      onComplete: boolean | string
    }[]
    orderLastDiscounted?: {
      [orderId: string]: number
    }
  }
  flagWatcher: {}
  harvest: CreepMetaData & {
    source: string
  }
  hold: CreepMetaData & FlagMetaData
  holdRoom: FlagMetaData & {
    creep?: string
  }
  hlf: CreepMetaData & {
    source: string
  }
  init: {}
  labManagement: RoomMetaData & {
    creep?: string
    creepProcess?: string | false
    creepPickup?: [ResourceConstant, string]
    boostLabs?: {
      [key: string]: string
    }
    reactLabs?: {
      [key: string]: string
    }
  }
  loanData: {
    state: StateConstant
  }
  mh: CreepMetaData & {
    mineral: string
    extractor: string
  }
  mhlf: CreepMetaData & {
    mineral: string
    extractor: string
  }
  mineralManagement: RoomMetaData & {
    creep?: string
  }
  move: CreepMetaData & {
    /** The target room position */
    pos: {
      x: number
      y: number
      roomName: string
    }
    /** How close to the target pos should the process terminate */
    range: number
    path?: string
    lastPos?: [number, number, string]
    stuck?: number
  }
  rangerLifetime: CreepMetaData & FlagMetaData & {
    rangedBoosted?: boolean
  }
  rangerManagement: FlagMetaData & {
    rangers: string[]
    count: number
  }
  rblf: CreepMetaData & {
    site: string
  }
  rmlf: CreepMetaData & FlagMetaData & {
    deliverRoom: string
  }
  rmmp: FlagMetaData & {
    miningCreep?: string
    transportCreep?: string
  }
  repair: CreepMetaData & {
    target: string
  }
  rlf: CreepMetaData & RoomMetaData
  roomData: RoomMetaData
  roomLayout: RoomMetaData
  spawnRemoteBuilder: RoomMetaData & {
    site: string
  }
  sm: RoomMetaData & {
    spareCreeps?: string[]
    buildCreeps?: string[]
    repairCreeps?: string[]
  }
  suspend: {
    master?: boolean
  }
  td: RoomMetaData & {
    /** How long this process has been running */
    runTime?: number
  }
  towerRepair: RoomMetaData
  transporterLifetime: CreepMetaData & {
    sourceContainer: string
    destinationContainer: string
  }
  upgrade: CreepMetaData
  ulf: CreepMetaData
}

declare namespace NodeJS{
  interface Global {
    SCRIPT_VERSION: number
    lastTick: number
    LastMemory: Memory
    Memory: Memory
    roomData: {
      [key: string]: RoomData
    }
    AOS_BOOST_PROCESS: AOS_BOOST_PROCESS
    AOS_BUILD_PROCESS: AOS_BUILD_PROCESS
    AOS_BUILDER_LIFETIME_PROCESS: AOS_BUILDER_LIFETIME_PROCESS
    AOS_CLAIM_PROCESS: AOS_CLAIM_PROCESS
    AOS_COLLECT_PROCESS: AOS_COLLECT_PROCESS
    AOS_COURRIER_LIFETIME_PROCESS: AOS_COURRIER_LIFETIME_PROCESS
    AOS_DELIVER_PROCESS: AOS_DELIVER_PROCESS
    AOS_DISTRO_LIFETIME_PROCESS: AOS_DISTRO_LIFETIME_PROCESS
    AOS_ENERGY_MANAGEMENT_PROCESS: AOS_ENERGY_MANAGEMENT_PROCESS
    AOS_FLAG_WATCHER_PROCESS: AOS_FLAG_WATCHER_PROCESS
    AOS_HARVEST_PROCESS: AOS_HARVEST_PROCESS
    AOS_HARVESTER_LIFETIME_PROCESS: AOS_HARVESTER_LIFETIME_PROCESS
    AOS_HOLD_PROCESS: AOS_HOLD_PROCESS
    AOS_HOLD_ROOM_PROCESS: AOS_HOLD_ROOM_PROCESS
    AOS_INIT_PROCESS: AOS_INIT_PROCESS
    AOS_LAB_MANAGEMENT_PROCESS: AOS_LAB_MANAGEMENT_PROCESS
    AOS_LOAN_DATA_PROCESS: AOS_LOAN_DATA_PROCESS
    AOS_MINERAL_HARVEST_PROCESS: AOS_MINERAL_HARVEST_PROCESS
    AOS_MINERAL_HARVESTER_LIFETIME_PROCESS: AOS_MINERAL_HARVESTER_LIFETIME_PROCESS
    AOS_MINERAL_MANAGEMENT_PROCESS: AOS_MINERAL_MANAGEMENT_PROCESS
    AOS_MOVE_PROCESS: AOS_MOVE_PROCESS
    AOS_RANGER_LIFETIME_PROCESS: AOS_RANGER_LIFETIME_PROCESS
    AOS_RANGER_MANAGEMENT_PROCESS: AOS_RANGER_MANAGEMENT_PROCESS
    AOS_REMOTE_BUILDER_LIFETIME_PROCESS: AOS_REMOTE_BUILDER_LIFETIME_PROCESS
    AOS_REMOTE_MINER_LIFETIME_PROCESS: AOS_REMOTE_MINER_LIFETIME_PROCESS
    AOS_REMOTE_MINING_MANAGEMENT_PROCESS: AOS_REMOTE_MINING_MANAGEMENT_PROCESS
    AOS_REPAIR_PROCESS: AOS_REPAIR_PROCESS
    AOS_REPAIRER_LIFETIME_PROCESS: AOS_REPAIRER_LIFETIME_PROCESS
    AOS_ROOM_DATA_PROCESS: AOS_ROOM_DATA_PROCESS
    AOS_ROOM_LAYOUT_PROCESS: AOS_ROOM_LAYOUT_PROCESS
    AOS_SPAWN_REMOTE_BUILDER_PROCESS: AOS_SPAWN_REMOTE_BUILDER_PROCESS
    AOS_STRUCTURE_MANAGEMENT_PROCESS: AOS_STRUCTURE_MANAGEMENT_PROCESS
    AOS_SUSPENSION_PROCESS: AOS_SUSPENSION_PROCESS
    AOS_TOWER_DEFENSE_PROCESS: AOS_TOWER_DEFENSE_PROCESS
    AOS_TOWER_REPAIR_PROCESS: AOS_TOWER_REPAIR_PROCESS
    AOS_TRANSPORTER_LIFETIME_PROCESS: AOS_TRANSPORTER_LIFETIME_PROCESS
    AOS_UPGRADE_PROCESS: AOS_UPGRADE_PROCESS
    AOS_UPGRADER_LIFETIME_PROCESS: AOS_UPGRADER_LIFETIME_PROCESS
    STATE_LOAD: STATE_LOAD
    STATE_READ: STATE_READ
    AOS_ALLIANCE: string
    AOS_NO_AGRESS: string[]
  }
}

interface RawMemory{
  _parsed: Memory
}

interface SerializedProcess{
  name: string
  priority: number
  metaData: object
  suspend: string | number | boolean
  parent: string | undefined
}

interface RoomData{
  [name: string]: any
  constructionSites: ConstructionSite[]
  coreLink: StructureLink | undefined
  containers: StructureContainer[]
  extensions: StructureExtension[]
  extractor: StructureExtractor | undefined
  generalContainers: StructureContainer[]
  mineral: Mineral | undefined
  labs: StructureLab[]
  links: StructureLink[]
  ramparts: StructureRampart[]
  roads: StructureRoad[]
  spawns: StructureSpawn[]
  sources: Source[]
  sourceContainers: StructureContainer[]
  sourceContainerMaps: {[id: string]: StructureContainer}
  towers: StructureTower[]
  upgraderLink: StructureLink | undefined
}

interface IPCMessage{
  from: string
  to: string
  message: object
}

interface DeliveryTarget extends Structure{
  energy: number
  energyCapacity: number
  store: {
    [resource: string]: number
  }
  storeCapacity: number
}

declare type BunkerStructures = STRUCTURE_ROAD | STRUCTURE_LINK | STRUCTURE_EXTENSION | STRUCTURE_SPAWN | STRUCTURE_TOWER | STRUCTURE_LAB | STRUCTURE_TERMINAL | STRUCTURE_POWER_SPAWN | STRUCTURE_STORAGE | STRUCTURE_OBSERVER | STRUCTURE_NUKER | STRUCTURE_RAMPART

interface BunkerLayout{
  buildings: {
    [structureType in BunkerStructures]: {
      pos: [
        {
          x: number
          y: number
        }
      ]
    }
  }
  creeps: {
    [creepName: string]: {
      x: number,
      y: number
    }
  }
  labs: {
    reactions: {
      x: number
      y: number
    }[]
    boosts: {
      x: number,
      y: number
    }[]
  }
}

interface RoomMemory{
  cache: {
    [field: string]: any
  }
  numSites: number
  bunkerBase: {
    x: number
    y: number
    roomName: string
  }
}

interface FlagMemory{
  [name: string]: any
}

interface RepairTarget{
  ticksToDecay: number
  structureType: StructureConstant
  hits: number
  hitsMax: number
  id: string
}

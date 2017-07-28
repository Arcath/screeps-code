// Typings for ArcAI2
declare namespace NodeJS{
  interface Global {
    SCRIPT_VERSION: number
    lastTick: number
    LastMemory: Memory
    Memory: Memory
  }
}

interface RawMemory{
  _parsed: Memory
}

interface NumberList{
  [key: string]: number
}

interface DBRevisions{
  rooms: number
  jobs: number
  sites: number
  flags: number
}

interface IDMap{
  [index: string]: string | ObjectJob
}

interface Constants{
  [key: string]: Object
  parties: Parties
}

interface Parties{
  [key: string]: Array<Array<String>>
}

interface Job{
  hash?: String
}

interface SODB{
  add(object: object): object
  indexLookup(key: string): ObjectRoom | ObjectJob | undefined
  findOne(...search: Array<object>): ObjectRoom | ObjectJob | undefined
  where(...search: Array<object>): ObjectRoom[] | ObjectJob[] | ObjectFlag[]
  count(): number
  refineSearch(objects: object[], ...search: object[]): ObjectRoom[] | ObjectJob[] | ObjectFlag[]
  update(object: object): void
  remove(object: object): void
  all(): object[]
  /** order last argument is the field to order the search by */
  order(...args: any[]): object[]
}

interface GameObject{
  id: string
}

interface SerializedIds extends Array<string> { _type: string }
interface SerializedContainers extends SerializedIds { _type: 'container' }
interface SerializedExtensions extends SerializedIds { _type: 'extension' }
interface SerializedExtractors extends SerializedIds { _type: 'extractor' }
interface SerializedLinks extends SerializedIds { _type: 'link' }
interface SerializedMinerals extends SerializedIds { _type: 'mineral' }
interface SerializedRamparts extends SerializedIds { _type: 'rampart' }
interface SerializedSources extends SerializedIds { _type: 'source' }
interface SerializedSpawns extends SerializedIds { _type: 'spawn' }
interface SerializedTowers extends SerializedIds { _type: 'tower' }
interface SerializedWalls extends SerializedIds { _type: 'wall' }

interface ObjectRoom{
  /** Links in the middle of the room which distribute energy*/
  coreLinks: SerializedLinks
  /** Current energy in the room for spawning */
  energyAvailable: number
  /** Maximum energy in the room for spawning */
  energyCapacityAvailable: number
  /** Links near exits for remote energy drop off */
  exitLinks: SerializedLinks
  exitLinkMaps: IDMap
  extensions: SerializedExtensions
  extractors: SerializedExtractors
  generalContainers: SerializedContainers
  links: SerializedLinks
  minerals: SerializedMinerals
  mine: boolean
  name: string
  ramparts: SerializedRamparts
  rcl: number
  recycleContainers: SerializedContainers
  sources: SerializedSources
  sourceContainers: SerializedContainers
  sourceContainerMaps: IDMap
  sourceLinkMaps: IDMap
  sourceLinks: SerializedLinks
  /** The ids of the spawns in the room. Use `Utils.inflate` to get the spawns */
  spawns: SerializedSpawns
  spawnable: boolean
  storage: string | undefined
  structures: SerializedIds
  terminal: string | undefined
  towers: SerializedTowers
  walls: SerializedWalls
}

interface ObjectJob{
  hash?: string
  priority: number
  collect: string
  act?: string
  target?: string
  room?: string
  changed?: boolean
}

interface DismantleJob extends ObjectJob { dismantle: string }
interface DistroJob extends ObjectJob {
  /** Id of the container to collect from */
  from: string
}
interface SupplyJob extends DistroJob { resource:string }
interface DeliverJob extends ObjectJob { target: string }
interface DeliverResourceJob extends DeliverJob { resource: string }
interface BuildJob extends ObjectJob { target: string, source?: string }
interface CollectJob extends ObjectJob { room: string }
interface ExtractJob extends ObjectJob { mineral: string }

interface FlagJob extends ObjectJob {
  flag: string
  room: string
}
interface PartyFlagJob extends FlagJob { actFlag: string }

interface HarvestJob extends ObjectJob{
  source: string
  target: string
  overflow?: string
}

interface RemoteWorkJob extends HarvestJob{
  remoteRoom: string
  targetRoom: string
}

interface ObjectFlag{
  name: string
}

interface ObjectSite{
  id: string
  priority: number
  structureType: string
  room: string
}

interface CreepDesigner{
  createCreep(options: {
    room: Room
    extend: string[]
    base: string[]
    canAffordOnly?: boolean
    cap: number
  }): string[]

  creepCost(body: string[]): number
}

interface DefconSystem{
  run(rooms: SODB, structureTotal: number[]): void
}

interface AnyStructure extends Structure{
  energy?: number
  energyCapacity?: number
  store?: number[]
  storeCapacity?: number
  pos: RoomPosition
}

interface TargetStructure extends Structure{
  energy?: number
  energyCapacity?: number
  store?: StoreDefinition
  storeCapacity?: number
  pos: RoomPosition
}

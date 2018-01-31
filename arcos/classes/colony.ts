import {isRoomVisible} from "@open-screeps/is-room-visible"
import {isObjectVisible} from "@open-screeps/is-object-visible"

import {Empire} from "./empire"
import {Bunker} from '../lib/classes/bunker'
import {POSCache} from './pos-cache'

/**
 * The colony class. Contains functions and data for the colony.
 */
export class Colony{
  coreRoom: Room
  empire: Empire
  rooms: Room[]
  sources: {[id: string]: Source}
  bunker: Bunker
  spawnCache: StructureSpawn[]
  posCache: POSCache

  constructor(coreRoomName: string, empire: Empire){
    this.empire = empire
    this.posCache = new POSCache()

    if(isRoomVisible(coreRoomName)){
      this.coreRoom = Game.rooms[coreRoomName]
      this.rooms = [this.coreRoom]
      this.sources = {}
      this.buildData()
      this.buildBunker()
    }else{
      console.log('[Colony Constructor] room ' + coreRoomName + ' does not exist')
    }
  }

  buildBunker(){
    if(!Memory.arcos.colonies[this.coreRoom.name].bunkerBase){
      if(Memory.bunkers[this.coreRoom.name].bunkerBase){
        Memory.arcos.colonies[this.coreRoom.name].bunkerBase = Memory.bunkers[this.coreRoom.name].bunkerBase
      }
    }else{
      this.bunker = new Bunker(new RoomPosition(
        Memory.arcos.colonies[this.coreRoom.name].bunkerBase!.x,
        Memory.arcos.colonies[this.coreRoom.name].bunkerBase!.y,
        Memory.arcos.colonies[this.coreRoom.name].bunkerBase!.roomName
      ))
    }    
  }

  buildData(){
    if(!Memory.arcos.colonies[this.coreRoom.name]){
      Memory.arcos.colonies[this.coreRoom.name] = {}
    }

    if(!Memory.arcos.colonies[this.coreRoom.name].sourceContainers){
      Memory.arcos.colonies[this.coreRoom.name].sourceContainers = {}
    }

    if(!Memory.arcos.colonies[this.coreRoom.name].sourceLinks){
      Memory.arcos.colonies[this.coreRoom.name].sourceLinks = {}
    }

    this.inflateRooms()
    this.inflateSources()
  }

  /**
   * Inflate the room list from memory
   */
  inflateRooms(){
    if(!Memory.arcos.colonies[this.coreRoom.name].rooms){
      Memory.arcos.colonies[this.coreRoom.name].rooms = [
        this.coreRoom.name
      ]
    }

    Memory.arcos.colonies[this.coreRoom.name].rooms!.forEach((roomName: string) => {
      if(isRoomVisible(roomName)){
        this.rooms.push(Game.rooms[roomName])
      }
    })
  }

  /**
   * Run the supplied function in each room.
   */
  inEachRoom(cb: (room: Room) => void){
    this.rooms.forEach(cb)
  }

  /**
   * Return the given source.
   * 
   * If the source is not in the sources list the list will be regenerated.
   * 
   * @param id The game ID of the source
   */
  source(id: string){
    if(this.sources[id]){
      return this.sources[id]
    }

    this.findSources()

    if(this.sources[id]){
      return this.sources[id]
    }

    return false
  }

  /**
   * Find all the sources in all the rooms in the colony
   */
  findSources(){
    this.inEachRoom((room) => {
      let sources = room.find(FIND_SOURCES)

      sources.forEach((source) => {
        this.sources[source.id] = source
        this.posCache.set(source)
        if(!_.includes(Memory.arcos.colonies[this.coreRoom.name].sources!, source.id)){
          Memory.arcos.colonies[this.coreRoom.name].sources!.push(source.id)
        }
      })
    })
  }

  /**
   * Turns the source IDs into `Source`s in the `Colony` object.
   */
  inflateSources(){
    if(!Memory.arcos.colonies[this.coreRoom.name].sources){
      Memory.arcos.colonies[this.coreRoom.name].sources = []
    }

    Memory.arcos.colonies[this.coreRoom.name].sources!.forEach((sourceId: string) => {
      let source = Game.getObjectById<Source>(sourceId)
      if(source){
        this.posCache.set(source)
        this.sources[sourceId] = source
      }
    })
  }

  /**
   * Get the source container
   * 
   * Returns:
   *  - `StructureContainer` if the container is visible.
   *  - `string` the id if it can't be seen.
   *  - `false` if there is none.
   * 
   * @param sourceId The id of the source that needs a container.
   */
  sourceContainer(sourceId: string){
    if(Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId]){
      // A container has been recorded in memory.

      if(isObjectVisible(Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId])){
        // If the container is visible.
        let container = Game.getObjectById<StructureContainer>(Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId])
        
        // This is only to keep typescript happy.
        if(container !== null){
          this.posCache.set(container)
          return container
        }
      }else{
        // The container was not visible.

        if(isObjectVisible(sourceId)){
          // The source is visible, so the container must not exist.
          // Delete the sourceContainer from memory.
          delete Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId]
        }else{
          // The source is not visible, so there must not be room vision.
          // Retuning true because a container exists we just can't see it.
          return Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId]
        }
      }
    }

    // To be here the container could not be found BUT we have room vision.
    let source = this.source(sourceId)
    if(source){
      // This should always get evaluated, this is just to stop typescript saying it could be `null`

      let containers = source.room.find(FIND_STRUCTURES, {filter: (structure) => {
        return structure.structureType === STRUCTURE_CONTAINER
      }})

      containers.forEach((container) => {
        let sources = container.pos.findInRange(FIND_SOURCES, 1)

        if(sources.length > 0){
          Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sources[0].id] = container.id
        }
      })
    }

    if(Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId]){
      let container =  Game.getObjectById<StructureContainer>(Memory.arcos.colonies[this.coreRoom.name].sourceContainers![sourceId])
      if(container){
        this.posCache.set(container)
        return container
      }
    }

    return false
  }

  /**
   * Find the core link for this colony
   */
  coreLink(){
    if(this.coreRoom.storage){
      let links = this.coreRoom.storage.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: (structure: Structure) => {
          return structure.structureType === STRUCTURE_LINK
        }
      })

      if(links[0]){
        return <StructureLink>links[0]
      }
    }

    return false
  }

  /**
   * 
   * @param sourceId the id of the source you are tying to find the link for.
   */
  sourceLink(sourceId: string){
    if(Memory.arcos.colonies[this.coreRoom.name].sourceLinks![sourceId]){
      // A source link exists in memory for this source.
      if(isObjectVisible(Memory.arcos.colonies[this.coreRoom.name].sourceLinks![sourceId])){
        // The link is visible.

        let link = Game.getObjectById<StructureLink>(Memory.arcos.colonies[this.coreRoom.name].sourceLinks![sourceId])

        if(link !== null){ return link }
      }else{
        // Can't see the link but one is recorded.
        if(isObjectVisible(sourceId)){
          // The source is visible but we can't see the link it must have been destroyed.
          delete Memory.arcos.colonies[this.coreRoom.name].sourceLinks![sourceId]
        }else{
          // The link may yet exist, return true so that scripts will try to move to it.
          return true
        }
      }
    }

    // To get here we have room vision BUT we can't find the link

    let sourceContainer = this.sourceContainer(sourceId)

    if(sourceContainer === false || typeof sourceContainer === 'string'){
      // The source container is non existent OR exists but we don't have vision.
      // Have to assume no link.
      return false
    }

    let links = sourceContainer.pos.findInRange(FIND_STRUCTURES, 1, { filter: (structure: Structure) => {
      return structure.structureType === STRUCTURE_LINK
    }})

    if(links[0]){
      Memory.arcos.colonies[this.coreRoom.name].sourceLinks![sourceId] = links[0].id

      return <StructureLink>links[0]
    }

    // Lastly return false
    return false
  }

  /**
   * Is the given room name part of this colony.
   * 
   * @param roomName The rooms name.
   */
  hasRoom(roomName: string){
    return _.includes(Memory.arcos.colonies[this.coreRoom.name].rooms!, roomName)
  }

  /**
   * Adds the given room to this colony.
   * 
   * @param roomName The name of the room to add.
   */
  addRoom(roomName: string){
    if(!_.includes(Memory.arcos.colonies[this.coreRoom.name].rooms!, roomName)){
      Memory.arcos.colonies[this.coreRoom.name].rooms!.push(roomName)
    }

    if(isRoomVisible(roomName)){
      this.rooms.push(Game.rooms[roomName])
    }
  }

  /** Calculates the total income of this colony in a single source cycle. */
  totalIncome(){
    return Object.keys(this.sources).length * SOURCE_ENERGY_CAPACITY
  }

  /** Required Income */
  requiredIncome(){
    /*return (
      (CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.coreRoom.controller!.level] * SPAWN_ENERGY_CAPACITY)
      +
      (CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.coreRoom.controller!.level] * EXTENSION_ENERGY_CAPACITY[this.coreRoom.controller!.level])
    ) * 2*/
    let required: {[rcl: number]: number} = {
      0: 0, // No income for RCL0 (not that a colony would ever be here)
      1: (SOURCE_ENERGY_CAPACITY * 2), // 6000 Income for RCL1 (2 Sources)
      2: (SOURCE_ENERGY_CAPACITY * 2), // 2 Sources for RCL2
      3: (SOURCE_ENERGY_CAPACITY * 3), // 3 sources for RCL3
      4: (SOURCE_ENERGY_CAPACITY * 4), // 4 Sources for RCL4
      5: (SOURCE_ENERGY_CAPACITY * 6), // 6 Sources for RCL5
      6: (SOURCE_ENERGY_CAPACITY * 8), // 8 Sources for RCL6
      7: (SOURCE_ENERGY_CAPACITY * 10), // 8 Sources for RCL7
      8: (SOURCE_ENERGY_CAPACITY * 12), // 10 Sources for RCL6
    }

    return required[this.coreRoom.controller!.level]
  }

  /**
   * Add a creep to the spawn queue.
   * 
   * @param key The key to add
   * @param type The creep type to spawn
   * @param name The name of the creep
   * @param priority The priority of this creeps spawning
   */
  addToSpawnQueue(key: string, type: string, name: string, priority: number){
    if(!Memory.arcos.colonies[this.coreRoom.name].spawnQueue){
      Memory.arcos.colonies[this.coreRoom.name].spawnQueue = []
    }
    
    if(this.checkQueue(key) === false){
      Memory.arcos.colonies[this.coreRoom.name].spawnQueue!.push({
        type: type,
        priority: priority,
        key: key,
        name: name
      })
    }
  }

  removeFromSpawnQueue(key: string){
    Memory.arcos.colonies[this.coreRoom.name].spawnQueue = _.filter(Memory.arcos.colonies[this.coreRoom.name].spawnQueue!, (entry) => {
      return entry.key !== key
    })
  }

  /** 
   * Check if the current spawn key is in the queue.
   * 
   * Returns:
   * 
   *  - `STATE_WAIT` if the keyed creep is waiting to spawn.
   *  - `STATE_SPAWNING` if the keyed creep is spawning.
   *  - `false` if the keyed creep isn't in the system.
   * 
   * @param key The key to check
   */
  checkQueue(key: string): STATE_WAIT | STATE_SPAWNING | false{
    if(Memory.arcos.colonies[this.coreRoom.name].spawnQueue){
      let results = _.filter(Memory.arcos.colonies[this.coreRoom.name].spawnQueue!, (entry: {key: string}) => {
        return entry.key === key
      })

      if(results.length > 0){
        return STATE_WAIT
      }

      // The creep was not in the queue
      let result = _.filter(this.spawns(), (spawn) => {
        return (spawn.memory.key === key && spawn.spawning !== null)
      })[0]

      if(result){
        return STATE_SPAWNING
      }
    }

    // Not in the queue, not spawning
    return false
  }

  /**
   * Returns the next object in the spawn queue.
   */
  nextInSpawnQueue(){
    return _.sortBy(Memory.arcos.colonies[this.coreRoom.name].spawnQueue!, 'priority')[0]
  }

  /**
   * Returns all the spawns in the core room. 
   */
  spawns(){
    if(this.spawnCache){
      return this.spawnCache
    }else{
      let spawns = this.coreRoom.find(FIND_MY_SPAWNS)

      this.spawnCache = spawns
      return spawns
    }
  }
}
import {Process} from '../os/process'

export class RoomDataProcess extends Process{
  type =  AOS_ROOM_DATA_PROCESS

  metaData: MetaData[AOS_ROOM_DATA_PROCESS]

  fields = [
    'constructionSites', 'containers', 'extensions', 'generalContainers', 'labs', 'links', 'ramparts', 'roads', 'spawns', 'sources', 'sourceContainers', 'towers'
  ]

  mapFields = [
    'sourceContainerMaps'
  ]

  singleFields = [
    'extractor', 'mineral', 'coreLink', 'upgraderLink'
  ]

  run(){
    let room = Game.rooms[this.metaData.roomName]

    if(!room){
      this.completed = true
      return
    }

    this.importFromMemory(room)

    if(this.kernel.data.roomData[this.metaData.roomName].spawns.length === 0){
      let hostiles = room.find(FIND_HOSTILE_CREEPS)
      let spawnSites = _.filter(this.roomData().constructionSites, function(site){
        return (site.structureType === STRUCTURE_SPAWN)
      })

      if(spawnSites.length > 0 && hostiles.length === 0){
        this.kernel.addProcess(AOS_SPAWN_REMOTE_BUILDER_PROCESS, 'srm-' + this.metaData.roomName, 90, {
          site: spawnSites[0].id,
          roomName: this.metaData.roomName
        })
      }
    }

    if(room.controller && room.controller.my && this.roomData().mineral && this.roomData().mineral!.mineralAmount > 0 && this.roomData().extractor){
      this.kernel.addProcessIfNotExist(AOS_MINERAL_MANAGEMENT_PROCESS, 'minerals-' + this.metaData.roomName, 20, {
        roomName: room.name
      })
    }

    if(room.controller && room.controller.my && room.controller.level >= 6){
      this.kernel.addProcessIfNotExist(AOS_LAB_MANAGEMENT_PROCESS, 'labs-' + this.metaData.roomName, 20, {
        roomName: room.name
      })
    }

    if(room.controller!.my){
      this.kernel.addProcessIfNotExist(AOS_ROOM_LAYOUT_PROCESS, 'room-layout-' + room.name, 20, {
        roomName: room.name
      })
    }

    if(this.kernel.data.roomData[this.metaData.roomName].ramparts.length > 0){
      this.kernel.addProcessIfNotExist(AOS_TOWER_REPAIR_PROCESS, 'tower-repair-' + room.name, 20, {
        roomName: room.name
      })
    }

    this.enemyDetection(room)

    this.completed = true
  }

  /** Returns the room data */
  build(room: Room){
    let structures = <Structure[]>room.find(FIND_STRUCTURES)
    let myStructures = <Structure[]>room.find(FIND_MY_STRUCTURES)

    let containers = <StructureContainer[]>_.filter(structures, function(structure){
      return (structure.structureType === STRUCTURE_CONTAINER)
    })

    let sourceContainerMaps = <{[id: string]: StructureContainer}>{}

    let sourceContainers = _.filter(containers, function(container){
      var sources: Array<Source> = container.pos.findInRange(FIND_SOURCES, 1)

      if(sources[0]){
        sourceContainerMaps[sources[0].id] = container
      }

      return (sources.length != 0)
    })

    let generalContainers = _.filter(containers, function(container){
      let matchContainers = <StructureContainer[]>[].concat(<never[]>sourceContainers)

      var matched = _.filter(matchContainers, function(mc){
        return (mc.id == container.id)
      })

      return (matched.length == 0)
    })

    let roads = <StructureRoad[]>_.filter(structures, function(structure){
      return (structure.structureType === STRUCTURE_ROAD)
    })

    let labs = <StructureLab[]>_.filter(myStructures, function(structure){
      return (structure.structureType === STRUCTURE_LAB)
    })

    let ramparts = <StructureRampart[]>_.filter(myStructures, function(structure){
      return (structure.structureType === STRUCTURE_RAMPART)
    })

    let links = <StructureLink[]>_.filter(structures, function(structure){
      return (structure.structureType === STRUCTURE_LINK)
    })

    let coreLink
    _.forEach(links, function(link){
      let storages = link.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: function(structure: Structure){
          return (structure.structureType === STRUCTURE_STORAGE)
        }
      })

      if(storages.length === 1){
        coreLink = link
      }
    })

    let upgraderLink
    _.forEach(links, function(link){
      let controllers = link.pos.findInRange(FIND_STRUCTURES, 4, {
        filter: function(structure: Structure){
          return (structure.structureType === STRUCTURE_CONTROLLER)
        }
      })

      let sources = link.pos.findInRange(FIND_SOURCES, 2)

      if(controllers.length === 1 && sources.length === 0){
        upgraderLink = link
      }
    })

    let roomData: RoomData = {
      constructionSites: <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES),
      containers: containers,
      coreLink: coreLink,
      extensions: <StructureExtension[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_EXTENSION)
      }),
      extractor: <StructureExtractor>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_EXTRACTOR)
      })[0],
      generalContainers: generalContainers,
      mineral: <Mineral>room.find(FIND_MINERALS)[0],
      labs: labs,
      links: links,
      ramparts: ramparts,
      roads: roads,
      spawns: <StructureSpawn[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_SPAWN)
      }),
      sources: <Source[]>room.find(FIND_SOURCES),
      sourceContainers: sourceContainers,
      sourceContainerMaps: sourceContainerMaps,
      towers: <StructureTower[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_TOWER)
      }),
      upgraderLink: upgraderLink
    }

    this.kernel.data.roomData[this.metaData.roomName] = roomData

    room.memory.cache = {}

    let proc = this
    _.forEach(this.fields, function(field){
      room.memory.cache[field] = proc.deflate(roomData[field])
    })

    _.forEach(this.mapFields, function(field){
      let result = <{[id:string]: string[]}>{}
      let keys = Object.keys(roomData[field])

      _.forEach(keys, function(key){
        result[key] = roomData[field][key].id
      })

      room.memory.cache[field] = result
    })

    _.forEach(this.singleFields, function(field){
      if(roomData[field] && roomData[field].id){
        room.memory.cache[field] = roomData[field].id
      }
    })
  }

  /** Import the room data from memory */
  importFromMemory(room: Room){
    if(!room.memory.cache){
      this.build(room)
      return
    }

    let roomData: RoomData = {
      constructionSites: [],
      containers: [],
      coreLink: undefined,
      extensions: [],
      extractor: undefined,
      generalContainers: [],
      mineral: undefined,
      labs: [],
      links: [],
      ramparts: [],
      roads: [],
      spawns: [],
      sources: [],
      sourceContainers: [],
      sourceContainerMaps: <{[id: string]: StructureContainer}>{},
      towers: [],
      upgraderLink: undefined
    }
    let run = true
    let i = 0

    if(room.memory.numSites != Object.keys(Game.constructionSites).length){
      delete room.memory.cache.constructionSites
      room.memory.numSites = Object.keys(Game.constructionSites).length
    }

    while(run){
      let field = this.fields[i]

      if(room.memory.cache[field]){
        let inflation = this.inflate(room.memory.cache[field])
        if(inflation.rebuild){
          run = false
          this.build(room)
          return
        }else{
          roomData[field] = inflation.result
        }
      }else{
        run = false
        this.build(room)
        return
      }

      i += 1
      if(i === this.fields.length){ run = false }
    }

    run = true
    i = 0
    let proc = this
    while(run){
      let field = this.mapFields[i]

      if(room.memory.cache[field]){
        let keys = Object.keys(room.memory.cache[field])
        _.forEach(keys, function(key){
          let structure = Game.getObjectById(room.memory.cache[field][key])

          if(structure){
            roomData[field][key] = structure
          }else{
            run = false
            proc.build(room)
            return
          }
        })
      }else{
        run = false
        this.build(room)
        return
      }

      i += 1
      if(i === this.mapFields.length){ run = false }
    }

    run = true
    i = 0
    while(run){
      let field = this.singleFields[i]

      if(room.memory.cache[field]){
        let object = Game.getObjectById(room.memory.cache[field])

        if(object){
          roomData[field] = object
        }else{
          run = false
          this.build(room)
          return
        }
      }else{
        run = false
        this.build(room)
        return
      }

      i += 1
      if(i === this.singleFields.length){ run = false }
    }


    this.kernel.data.roomData[this.metaData.roomName] = roomData
  }

  /** Inflate the IDs in the array. Returns an object, result is the resuting array and rebuild is wether the data is wrong */
  inflate(ids: string[]){
    let rebuild = false
    let result: Structure[] = []

    _.forEach(ids, function(id){
      let object = <Structure>Game.getObjectById(id)

      if(object){
        result.push(object)
      }else{
        rebuild = true
      }
    })

    return {
      result: result,
      rebuild: rebuild
    }
  }

  deflate(objects: Structure[]){
    let result: string[] = []

    _.forEach(objects, function(object){
      if(object && object.id){ result.push(object.id) }
    })

    return result
  }

  /** Find enemies in the room */
  enemyDetection(room: Room){
    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)

    if(enemies.length > 0 && !this.kernel.hasProcess('td-' + this.metaData.roomName)){
      this.kernel.addProcess(AOS_TOWER_DEFENSE_PROCESS, 'td-' + this.metaData.roomName, 80, {
        roomName: this.metaData.roomName
      })
    }

    if(Memory.bunkers[room.name]){
      if(Memory.bunkers[room.name].bunkerBase){
        let bunkerPos = new RoomPosition(
          Memory.bunkers[room.name].bunkerBase.x,
          Memory.bunkers[room.name].bunkerBase.y,
          Memory.bunkers[room.name].bunkerBase.roomName
        )

        _.forEach(enemies, function(enemy){
          if(enemy.pos.getRangeTo(bunkerPos) < 7){
            room.controller!.activateSafeMode()
          }
        })
      }
    }

    if(room.controller!.level === 2 && room.controller!.ticksToDowngrade < 30){
      room.controller!.activateSafeMode()
    }

    if(enemies.length > 0 && this.kernel.data.roomData[room.name].towers.length === 1){
      if(this.kernel.data.roomData[room.name].towers[0].energy === 0 && !room.storage){
        room.controller!.activateSafeMode()
      }
    }
  }
}

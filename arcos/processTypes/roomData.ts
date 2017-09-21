import {Process} from '../os/process'

import {MineralManagementProcess} from './management/mineral'
import {SpawnRemoteBuilderProcess} from './system/spawnRemoteBuilder'
import {TowerDefenseProcess} from './buildingProcesses/towerDefense'

interface RoomDataMeta{
  roomName: string
}

export class RoomDataProcess extends Process{
  metaData: RoomDataMeta
  fields = [
    'constructionSites', 'containers', 'extensions', 'generalContainers', 'labs', 'roads', 'spawns', 'sources', 'sourceContainers', 'towers'
  ]

  mapFields = [
    'sourceContainerMaps'
  ]

  singleFields = [
    'extractor', 'mineral'
  ]

  run(){
    let room = Game.rooms[this.metaData.roomName]

    this.importFromMemory(room)

    if(this.kernel.data.roomData[this.metaData.roomName].spawns.length === 0){
      if(this.kernel.data.roomData[this.metaData.roomName].constructionSites.length > 0 && this.kernel.data.roomData[this.metaData.roomName].constructionSites[0].structureType === STRUCTURE_SPAWN){
        this.kernel.addProcess(SpawnRemoteBuilderProcess, 'srm-' + this.metaData.roomName, 90, {
          site: this.kernel.data.roomData[this.metaData.roomName].constructionSites[0].id,
          roomName: this.metaData.roomName
        })
      }
    }

    if(this.roomData().mineral && this.roomData().extractor){
      this.kernel.addProcessIfNotExist(MineralManagementProcess, 'minerals-' + this.metaData.roomName, 20, {
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

    let roomData: RoomData = {
      constructionSites: <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES),
      containers: containers,
      extensions: <StructureExtension[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_EXTENSION)
      }),
      extractor: <StructureExtractor>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_EXTRACTOR)
      })[0],
      generalContainers: generalContainers,
      mineral: <Mineral>room.find(FIND_MINERALS)[0],
      labs: labs,
      roads: roads,
      spawns: <StructureSpawn[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_SPAWN)
      }),
      sources: <Source[]>room.find(FIND_SOURCES),
      sourceContainers: sourceContainers,
      sourceContainerMaps: sourceContainerMaps,
      towers: <StructureTower[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_TOWER)
      })
    }

    this.kernel.data.roomData[this.metaData.roomName] = roomData

    room.memory = {
      numSites: room.memory.numSites
    }

    let proc = this
    _.forEach(this.fields, function(field){
      room.memory[field] = proc.deflate(roomData[field])
    })

    _.forEach(this.mapFields, function(field){
      let result = <{[id:string]: string[]}>{}
      let keys = Object.keys(roomData[field])

      _.forEach(keys, function(key){
        result[key] = roomData[field][key].id
      })

      room.memory[field] = result
    })

    _.forEach(this.singleFields, function(field){
      if(roomData[field].id){
        room.memory[field] = roomData[field].id
      }
    })
  }

  /** Import the room data from memory */
  importFromMemory(room: Room){
    let roomData: RoomData = {
      constructionSites: [],
      containers: [],
      extensions: [],
      extractor: undefined,
      generalContainers: [],
      mineral: undefined,
      labs: [],
      roads: [],
      spawns: [],
      sources: [],
      sourceContainers: [],
      sourceContainerMaps: <{[id: string]: StructureContainer}>{},
      towers: []
    }
    let run = true
    let i = 0

    if(room.memory.numSites != Object.keys(Game.constructionSites).length){
      delete room.memory.constructionSites
      room.memory.numSites = Object.keys(Game.constructionSites).length
    }

    while(run){
      let field = this.fields[i]

      if(room.memory[field]){
        let inflation = this.inflate(room.memory[field])
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

      if(room.memory[field]){
        let keys = Object.keys(room.memory[field])
        _.forEach(keys, function(key){
          let structure = Game.getObjectById(room.memory[field][key])

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

      if(room.memory[field]){
        let object = Game.getObjectById(room.memory[field])

        if(object){
          roomData[field] = object
        }else{
          run = false
          this.build(room)
          return
        }
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
      result.push(object.id)
    })

    return result
  }

  /** Find enemies in the room */
  enemyDetection(room: Room){
    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)

    if(enemies.length > 0 && !this.kernel.hasProcess('td-' + this.metaData.roomName)){
      this.kernel.addProcess(TowerDefenseProcess, 'td-' + this.metaData.roomName, 80, {
        roomName: this.metaData.roomName
      })
    }
  }
}

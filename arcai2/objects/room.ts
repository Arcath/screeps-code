import {Utils} from '../utils'

module.exports = function(room: Room){
  var structures = room.find(FIND_MY_STRUCTURES)
  var spawns: Array<StructureSpawn> = room.find(FIND_MY_SPAWNS)

  var containers: Array<Structure> = _.filter(room.find(FIND_STRUCTURES), function(structure: Structure){
    return (structure.structureType == STRUCTURE_CONTAINER)
  })

  var walls = _.filter(room.find(FIND_STRUCTURES), function(structure: Structure){
    return (structure.structureType == STRUCTURE_WALL)
  })

  var ramparts = _.filter(room.find(FIND_STRUCTURES), function(structure: Structure){
    return (structure.structureType == STRUCTURE_RAMPART)
  })

  var sourceContainerMaps: IDMap = {}

  var sourceContainers = _.filter(containers, function(container: StructureContainer){
    var sources: Array<Source> = container.pos.findInRange(FIND_SOURCES, 1)

    if(sources[0]){
      sourceContainerMaps[sources[0].id] = container.id
    }

    return (sources.length != 0)
  })

  var recycleContainers = _.filter(containers, function(container: StructureContainer){
    var spawns: Array<StructureSpawn> = container.pos.findInRange(FIND_MY_SPAWNS, 1)

    return (spawns.length != 0)
  })

  var generalContainers = _.filter(containers, function(container: StructureContainer){
    var matchContainers: Array<StructureContainer> = [].concat(<Array<never>>recycleContainers, <Array<never>>sourceContainers)

    var matched = _.filter(matchContainers, function(mc: StructureContainer){
      return (mc.id == container.id)
    })

    return (matched.length == 0)
  })

  if(room.storage){
    generalContainers.push(room.storage)
    var storageId: any = room.storage.id
  }else{
    var storageId: any = undefined
  }


  if(recycleContainers.length == 0 && room.controller && room.controller.my && spawns.length != 0){
    var firstSpawn = spawns[0]

    var pos = new RoomPosition(firstSpawn.pos.x - 1, firstSpawn.pos.y, room.name)

    room.createConstructionSite(pos, STRUCTURE_CONTAINER)
  }

  var extensions = _.filter(structures, function(structure: Structure){
    return (structure.structureType == STRUCTURE_EXTENSION)
  })

  var towers = _.filter(structures, function(structure: Structure){
    return (structure.structureType == STRUCTURE_TOWER)
  })

  var extractors = _.filter(structures, function(structure: Structure){
    return(structure.structureType == STRUCTURE_EXTRACTOR)
  })

  var terminalId
  if(room.terminal){
    terminalId = room.terminal.id
  }

  var links = _.filter(structures, function(structure: Structure){
    return (structure.structureType == STRUCTURE_LINK)
  })

  var sourceLinkMaps: IDMap = {}

  var sourceLinks = _.filter(links, function(link: StructureLink){
    var sources: Array<Source> = link.pos.findInRange(FIND_SOURCES, 2)

    if(sources[0]){
      sourceLinkMaps[sources[0].id] = link.id
    }

    return (sources.length != 0)
  })

  var coreLinks = _.filter(links, function(link: StructureLink){
    var sources = link.pos.findInRange(FIND_SOURCES, 2)
    var exits = link.pos.findInRange(FIND_EXIT, 4)

    return (sources.length == 0 && exits.length == 0)
  })

  var exitLinks = _.filter(links, function(link: StructureLink){
    var exits = link.pos.findInRange(FIND_EXIT, 4)

    return (exits.length != 0)
  })

  var exitLinkMaps: IDMap = {}
  var exitFinds = [
    FIND_EXIT_TOP,
    FIND_EXIT_RIGHT,
    FIND_EXIT_BOTTOM,
    FIND_EXIT_LEFT
  ]
  _.forEach(exitLinks, function(link: StructureLink){
    var direction = 0

    for(var j in exitFinds){
      var exits = link.pos.findInRange(exitFinds[j], 3)

      if(exits.length){
        direction = exitFinds[j]
      }
    }

    var roomName = Game.map.describeExits(room.name)[direction]

    if(roomName){
      exitLinkMaps[roomName] = link.id
    }
  })

  if(room.controller){
    var mine = room.controller.my
    var level = room.controller.level
  }else{
    var mine = false
    var level = 0
  }

  var objectRoom: ObjectRoom = {
    coreLinks: <SerializedLinks>Utils.deflate(coreLinks),
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    exitLinks: <SerializedLinks>Utils.deflate(exitLinks),
    exitLinkMaps: exitLinkMaps,
    extensions: <SerializedExtensions>Utils.deflate(extensions),
    extractors: <SerializedExtractors>Utils.deflate(extractors),
    generalContainers: <SerializedContainers>Utils.deflate(generalContainers),
    links: <SerializedLinks>Utils.deflate(links),
    minerals: <SerializedMinerals>Utils.deflate(room.find(FIND_MINERALS)),
    mine: mine,
    name: room.name,
    ramparts: <SerializedRamparts>Utils.deflate(ramparts),
    rcl: level,
    recycleContainers: <SerializedContainers>Utils.deflate(recycleContainers),
    sources: <SerializedSources>Utils.deflate(room.find(FIND_SOURCES)),
    sourceContainers: <SerializedContainers>Utils.deflate(sourceContainers),
    sourceContainerMaps: sourceContainerMaps,
    sourceLinkMaps: sourceLinkMaps,
    sourceLinks: <SerializedLinks>Utils.deflate(sourceLinks),
    spawns: <SerializedSpawns>Utils.deflate(spawns),
    spawnable: (spawns.length > 0),
    storage: storageId,
    structures: <SerializedIds>Utils.deflate(structures),
    terminal: terminalId,
    towers: <SerializedTowers>Utils.deflate(towers),
    walls: <SerializedWalls>Utils.deflate(walls)
  }

  return objectRoom
}

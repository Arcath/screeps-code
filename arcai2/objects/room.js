var Utils = require('../utils')

module.exports = function(room){
  var structures = room.find(FIND_MY_STRUCTURES)
  var spawns = room.find(FIND_MY_SPAWNS)

  var containers = _.filter(room.find(FIND_STRUCTURES), function(structure){
    return (structure.structureType == STRUCTURE_CONTAINER)
  })

  var sourceContainerMaps = {}

  var sourceContainers = _.filter(containers, function(container){
    var sources = container.pos.findInRange(FIND_SOURCES, 2)

    if(sources[0]){
      sourceContainerMaps[sources[0].id] = container.id
    }

    return (sources.length != 0)
  })

  var recycleContainers = _.filter(containers, function(container){
    var spawns = container.pos.findInRange(FIND_MY_SPAWNS, 1)

    return (spawns.length != 0)
  })

  var generalContainers = _.filter(containers, function(container){
    var matchContainers = [].concat(recycleContainers, sourceContainers)

    var matched = _.filter(matchContainers, function(mc){
      return (mc.id == container.id)
    })

    return (matched.length == 0)
  })

  if(room.storage){
    generalContainers.push(room.storage)
    var storageId = room.storage.id
  }else{
    var storageId = undefined
  }


  if(recycleContainers.length == 0 && room.controller.my && spawns.length != 0){
    var firstSpawn = spawns[0]

    var pos = new RoomPosition(firstSpawn.pos.x - 1, firstSpawn.pos.y, room.name)

    room.createConstructionSite(pos, STRUCTURE_CONTAINER)
  }

  var extensions = _.filter(structures, function(structure){
    return (structure.structureType == STRUCTURE_EXTENSION)
  })

  var towers = _.filter(structures, function(structure){
    return (structure.structureType == STRUCTURE_TOWER)
  })

  var extractors = _.filter(structures, function(structure){
    return(structure.structureType == STRUCTURE_EXTRACTOR)
  })

  var terminalId
  if(room.terminal){
    terminalId = room.terminal.id
  }

  var links = _.filter(structures, function(structure){
    return (structure.structureType == STRUCTURE_LINK)
  })

  var sourceLinkMaps = {}

  var sourceLinks = _.filter(links, function(link){
    var sources = link.pos.findInRange(FIND_SOURCES, 2)

    if(sources[0]){
      sourceLinkMaps[sources[0].id] = link.id
    }

    return (sources.length != 0)
  })

  var coreLinks = _.filter(links, function(link){
    var sources = link.pos.findInRange(FIND_SOURCES, 2)

    return (sources.length == 0)
  })

  return {
    coreLinks: Utils.deflate(coreLinks),
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    extensions: Utils.deflate(extensions),
    extractors: Utils.deflate(extractors),
    generalContainers: Utils.deflate(generalContainers),
    links: Utils.deflate(links),
    minerals: Utils.deflate(room.find(FIND_MINERALS)),
    mine: room.controller.my,
    name: room.name,
    rcl: room.controller.level,
    recycleContainers: Utils.deflate(recycleContainers),
    sources: Utils.deflate(room.find(FIND_SOURCES)),
    sourceContainers: Utils.deflate(sourceContainers),
    sourceContainerMaps: sourceContainerMaps,
    sourceLinkMaps: sourceLinkMaps,
    sourceLinks: Utils.deflate(sourceLinks),
    spawns: Utils.deflate(spawns),
    spawnable: (spawns.length > 0),
    storage: storageId,
    structures: Utils.deflate(structures),
    terminal: terminalId,
    towers: Utils.deflate(towers)
  }
}

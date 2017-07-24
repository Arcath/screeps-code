var Utils = require('../utils')

module.exports = function(room){
  var structures = room.find(FIND_MY_STRUCTURES)
  var spawns = room.find(FIND_MY_SPAWNS)

  var containers = _.filter(room.find(FIND_STRUCTURES), function(structure){
    return (structure.structureType == STRUCTURE_CONTAINER)
  })

  var walls = _.filter(room.find(FIND_STRUCTURES), function(structure){
    return (structure.structureType == STRUCTURE_WALL)
  })

  var ramparts = _.filter(room.find(FIND_STRUCTURES), function(structure){
    return (structure.structureType == STRUCTURE_RAMPART)
  })

  var sourceContainerMaps = {}

  var sourceContainers = _.filter(containers, function(container){
    var sources = container.pos.findInRange(FIND_SOURCES, 1)

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


  if(recycleContainers.length == 0 && room.controller && room.controller.my && spawns.length != 0){
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
    var exits = link.pos.findInRange(FIND_EXIT, 4)

    return (sources.length == 0 && exits.length == 0)
  })

  var exitLinks = _.filter(links, function(link){
    var exits = link.pos.findInRange(FIND_EXIT, 4)

    return (exits.length != 0)
  })

  var exitLinkMaps = {}
  var exitFinds = [
    FIND_EXIT_TOP,
    FIND_EXIT_RIGHT,
    FIND_EXIT_BOTTOM,
    FIND_EXIT_LEFT
  ]
  _.forEach(exitLinks, function(link){
    var direction = 0

    for(var j in exitFinds){
      var exits = link.pos.findInRange(exitFinds[j], 3)

      if(exits.length){
        direction = exitFinds[j]
      }
    }

    exitLinkMaps[Game.map.describeExits(room.name)[direction]] = link.id
  })

  if(room.controller){
    var mine = room.controller.my
    var level = room.controller.level
  }else{
    var mine = false
    var level = 0
  }

  return {
    coreLinks: Utils.deflate(coreLinks),
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    exitLinks: Utils.deflate(exitLinks),
    exitLinkMaps: exitLinkMaps,
    extensions: Utils.deflate(extensions),
    extractors: Utils.deflate(extractors),
    generalContainers: Utils.deflate(generalContainers),
    links: Utils.deflate(links),
    minerals: Utils.deflate(room.find(FIND_MINERALS)),
    mine: mine,
    name: room.name,
    ramparts: Utils.deflate(ramparts),
    rcl: level,
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
    towers: Utils.deflate(towers),
    walls: Utils.deflate(walls)
  }
}

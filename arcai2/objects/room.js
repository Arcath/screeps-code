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

  console.log(containers.length + ' containers, ' + sourceContainers.length + ' source containers')

  var recycleContainers = _.filter(containers, function(container){
    var spawns = container.pos.findInRange(FIND_MY_SPAWNS, 2)

    return (spawns.length != 0)
  })

  var generalContainers = _.filter(containers, function(container){
    var matchContainers = [].concat(recycleContainers, sourceContainers)

    var matched = _.filter(matchContainers, function(mc){
      return (mc.id == container.id)
    })

    return (matched.length == 0)
  })


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

  return {
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    extensions: Utils.deflate(extensions),
    generalContainers: Utils.deflate(generalContainers),
    minerals: Utils.deflate(room.find(FIND_MINERALS)),
    mine: room.controller.my,
    name: room.name,
    rcl: room.controller.level,
    recycleContainers: Utils.deflate(recycleContainers),
    sources: Utils.deflate(room.find(FIND_SOURCES)),
    sourceContainers: Utils.deflate(sourceContainers),
    sourceContainerMaps: sourceContainerMaps,
    spawns: Utils.deflate(spawns),
    structures: Utils.deflate(structures),
    towers: Utils.deflate(towers)
  }
}

module.exports = {
  run: function(creep){
    if(creep.memory.hauling && creep.carry.energy == 0) {
      creep.memory.hauling = false;
      creep.say('harvesting');
	  }
	  if(!creep.memory.hauling && creep.carry.energy == creep.carryCapacity) {
	    creep.memory.hauling = true;
	    creep.say('Hauling');
	  }

	  if(creep.memory.hauling){
	    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (
              (
                structure.structureType == STRUCTURE_SPAWN
                || structure.structureType == STRUCTURE_EXTENSION
              )
              &&
              (structure.energy < structure.energyCapacity)
            )
            ||
            (
                structure.structureType == STRUCTURE_TOWER
                &&
                (structure.energy < structure.energyCapacity - 200)
            )
            ||
            (
              structure.structureType == STRUCTURE_CONTAINER
              &&
              _.sum(structure.store) < structure.storeCapacity
              &&
              structure.pos.findInRange(FIND_SOURCES, 2).length == 0
            )
          )
        }
      });

      targets.sort(function(a,b){
        if(a.structureType == STRUCTURE_SPAWN){
          return -1;
        }else{
          if(a.structureType == STRUCTURE_CONTAINER){
            return 1;
          }else{
            return 0;
          }
        }
      });

      if(targets.length > 0) {
        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
          }
        }
	    }else{
	      spawns = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType == STRUCTURE_CONTAINER
            &&
            structure.store[RESOURCE_ENERGY] > creep.carryCapacity
            &&
            structure.pos.findInRange(FIND_SOURCES, 2).length != 0
          )
        }
      });

      if(spawns.length){
        target = creep.pos.findClosestByRange(spawns)
          if(!(creep.pos.isNearTo(target))){
            creep.moveTo(target);
          }else{
            creep.withdraw(target, RESOURCE_ENERGY, (creep.carryCapacity - _.sum(creep.carry)));
          }
        }
	    }
    }
}

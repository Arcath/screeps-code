roleHealer = require('role.healer')
roleharvester = require('role.harvester')

var roleBuilder = {
  run: function(creep) {

	  if(creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('harvesting');
	  }
	  if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	    creep.memory.building = true;
	    creep.say('building');
	  }

	  if(creep.memory.building) {
	   var targets = creep.room.find(FIND_CONSTRUCTION_SITES);

       if(targets.length) {
         target = creep.pos.findClosestByRange(targets)
         if(creep.build(target) == ERR_NOT_IN_RANGE) {
           creep.moveTo(target);
         }
       }else{
         roleHealer.run(creep)
       }
	  }else{
	    spawns = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > creep.carryCapacity * 5);
        }
      });

      if(spawns.length == 0){
        roleharvester.run(creep)
      }

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
};

module.exports = roleBuilder;

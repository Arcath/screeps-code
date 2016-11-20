roleUpgrader = require('role.upgrader')

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.healing && creep.carry.energy == 0) {
            creep.memory.healing = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.healing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.healing = true;
	        creep.say('Healing');
	    }

	    if(creep.memory.healing) {
	        var targets = creep.room.find(FIND_STRUCTURES, {
	            filter: function(structure){
	                return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
	            }
	        })
            if(targets.length) {
                target = creep.pos.findClosestByRange(targets)
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }else{
                roleUpgrader.run(creep)
            }
	    }
	    else {
	        spawns = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
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
};

module.exports = roleBuilder;
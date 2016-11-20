roleHauler = require('role.hauler')

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
	        if(creep.memory.destRoom != creep.room.name){
                var exits = Game.map.findExit(creep.room, creep.memory.destRoom)
                var exit = creep.pos.findClosestByRange(exits)
                creep.moveTo(exit)
            }else{
                roleHauler.run(creep)
            }
	    }else{
	        if(creep.memory.sourceRoom != creep.room.name){
                var exits = Game.map.findExit(creep.room, creep.memory.sourceRoom)
                var exit = creep.pos.findClosestByRange(exits)
                creep.moveTo(exit)
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
}
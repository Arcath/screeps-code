var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.dropoff && creep.carry.energy == 0) {
            creep.memory.dropoff = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.dropoff && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.dropoff = true;
	        creep.say('Drop Off');
	    }

	    if(!creep.memory.dropoff) {
            var sources = creep.room.find(FIND_SOURCES)

            if(!creep.memory.source){
                for(source in sources){
                    var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.source == source));
                    if(harvesters.length != 2){
                        creep.memory.source = source
                    }
                }
            }

            if(creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.source]);
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity)
                                ||
                                (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity);
                    }
            });

            if(targets.length > 0) {
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

                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
	}
};

module.exports = roleHarvester;

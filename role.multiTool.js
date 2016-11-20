module.exports = {
    run: function(creep){
        if(creep.memory.targetRoom != creep.room.name){
            var exits = Game.map.findExit(creep.room, creep.memory.targetRoom)
            var exit = creep.pos.findClosestByRange(exits)
            creep.moveTo(exit)
        }else{
            if(!creep.memory.job){
                creep.memory.job = 'harvest'
            }
            
            if(creep.carry.energy == creep.carryCapacity){
                var sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(sites.length){
                    creep.memory.job = 'build'
                }else{
                    var targets = creep.room.find(FIND_STRUCTURES, {
	                    filter: function(structure){
	                        return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
	                    }
	                })
                    if(targets.length){
                        creep.memory.job = 'heal'
                    }else{
                        var targets = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: function(structure){
                                return (structure.structureType == STRUCTURE_CONTAINER)
                            }
                        })
    
                        if(targets.length > 0) {
                            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targets[0]);
                            }
                        }
                    }
                }
            }
            
            if(creep.memory.job == 'harvest' && creep.carry.energy < creep.carryCapacity){
                var sources = creep.room.find(FIND_SOURCES)
                
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
            
            if(creep.memory.job == 'heal'){
                if(creep.carry.energy == 0){
                    creep.memory.job = 'harvest'
                }else{
                    var targets = creep.room.find(FIND_STRUCTURES, {
	                    filter: function(structure){
	                        return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
	                    }
	                })
	                
	                if(targets.length){
	                    target = creep.pos.findClosestByRange(targets)
                        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
	                }else{
	                    creep.memory.job = 'harvest'
	                }
                }
            }
            
            if(creep.memory.job == 'build'){
                if(creep.carry.energy == 0){
                    creep.memory.job = 'harvest'
                }else{
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	   
                    if(targets.length) {
                        target = creep.pos.findClosestByRange(targets)
                        if(creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }else{
                        creep.memory.job = 'harvest'
                    }
                }
            }
        }
    }
}
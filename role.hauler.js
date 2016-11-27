module.exports = {
	run: function(creep){
		if(creep.memory.hauling && _.sum(creep.carry) == 0) {
			creep.memory.hauling = false;
			creep.say('harvesting');
		}
		if(!creep.memory.hauling && _.sum(creep.carry) == creep.carryCapacity) {
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
						&&
						creep.carry.energy != 0
						&&
						creep.room.find(FIND_HOSTILE_CREEPS).length == 0
					)
				}
			});

			if(targets.length == 0){
				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
						    (
							    structure.structureType == STRUCTURE_TOWER
							    &&
							    (structure.energy < structure.energyCapacity - 200)
							)
							&&
						    creep.carry.energy != 0
						)
					}
				});
			}

			if(targets.length == 0){
				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
						    (
							    structure.structureType == STRUCTURE_CONTAINER
							    &&
							    _.sum(structure.store) < (structure.storeCapacity - creep.carry.energy)
							    &&
							    structure.pos.findInRange(FIND_SOURCES, 2).length == 0
							    &&
							    structure.pos.findInRange(FIND_STRUCTURES, 1, {
					                filter: (structure) => {
					                    return structure.structureType == STRUCTURE_SPAWN
					                }
					            }).length == 0
							)
							&&
						    creep.carry.energy != 0
						)
					}
				});
			}

			if(targets.length == 0){
				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							structure.structureType == STRUCTURE_STORAGE
							&&
							_.sum(structure.store) < structure.storeCapacity
						)
					}
				});
			}

			if(targets.length > 0) {
				target = creep.pos.findClosestByRange(targets)
				if(target.structureType == STRUCTURE_STORAGE){
                    for(var resourceType in creep.carry) {
	                    if(creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE){
	                        creep.moveTo(target)
	                    }
                    }
				}else{
				    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					    creep.moveTo(target);
				    }
				}
			}
	    }else{
			var energy = creep.room.find(FIND_DROPPED_ENERGY, {
				filter: (res) => {
					return res.amount > 250
				}
			})

			if(energy.length == 0){
				spawns = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							structure.structureType == STRUCTURE_CONTAINER
							&&
							structure.store[RESOURCE_ENERGY] > creep.carryCapacity
							&&
							(
							    structure.pos.findInRange(FIND_SOURCES, 2).length != 0
							    ||
							    structure.pos.findInRange(FIND_STRUCTURES, 1, {
					                filter: (structure) => {
					                    return structure.structureType == STRUCTURE_SPAWN
					                }
					            }).length != 0
							)
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
			}else{
				target = creep.pos.findClosestByRange(energy)
				if(!(creep.pos.isNearTo(target))){
					creep.moveTo(target);
				}else{
					creep.pickup(target);
				}
			}
	    }
    }
}

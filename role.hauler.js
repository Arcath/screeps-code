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
					)
				}
			});
      
			if(targets.length == 0){
				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							structure.structureType == STRUCTURE_TOWER
							&&
							(structure.energy < structure.energyCapacity - 200)
						)
					}
				});
			}
      
			if(targets.length == 0){
				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							structure.structureType == STRUCTURE_CONTAINER
							&&
							_.sum(structure.store) < (structure.storeCapacity - creep.carry.energy)
							&&
							structure.pos.findInRange(FIND_SOURCES, 2).length == 0
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
				if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
	    }else{
			var energy = creep.room.find(FIND_DROPPED_ENERGY, {
				filter: (res) => {
					return res.amount > 50
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

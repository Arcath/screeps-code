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
                }
            }

            if(creep.memory.job == 'harvest' && creep.carry.energy < creep.carryCapacity){
                var sources = creep.room.find(FIND_SOURCES)

                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
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
                    }
                }
            }
        }
    }
}

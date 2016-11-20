module.exports = {
    run: function(creep){
        if(creep.memory.targetRoom != creep.room.name){
            var exits = Game.map.findExit(creep.room, creep.memory.targetRoom)
            var exit = creep.pos.findClosestByRange(exits)
            creep.moveTo(exit)
        }else{
            var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
            if(targets.length > 0) {
                creep.rangedAttack(targets[0]);
            }else{
                var targets = creep.room.find(FIND_HOSTILE_CREEPS);
                if(targets.length > 0){
                    creep.moveTo(targets[0])
                }
            }
        }
    }
}
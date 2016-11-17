module.exports = {
    run: function(creep){
        if(creep.memory.targetRoom != creep.room.name){
            var exits = Game.map.findExit(creep.room, creep.memory.targetRoom)
            var exit = creep.pos.findClosestByRange(exits)
            creep.memory.expiresAt += 1
            creep.moveTo(exit)
        }else{
            if(creep.room.controller) {
                if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.memory.expiresAt += 1
                    creep.moveTo(creep.room.controller);
                }
            }
        }
    }
}

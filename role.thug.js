module.exports = {
    run: function(creep){
        if(creep.memory.targetRoom != creep.room.name){
            var exits = Game.map.findExit(creep.room, creep.memory.targetRoom)
            var exit = creep.pos.findClosestByRange(exits)
            
            
            if(creep.pos.getRangeTo(exit) <= 3){
                creep.memory.ready = true
            }else{
                creep.moveTo(exit)
            }
            
            if(creep.memory.ready){
                var thugs = _.filter(Game.creeps, (cr) => cr.memory.role == 'thug' && cr.memory.targetRoom == creep.memory.targetRoom && cr.memory.ready == true)
                
                if(thugs.length == 2){
                    creep.moveTo(exit)
                }
            }
        }else{
            var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 20);
            if(targets.length > 0){
                var target = creep.pos.findClosestByRange(targets)
                creep.moveTo(target)
            }else{
                if(creep.hits < creep.hitsMax){
                    creep.heal(creep)
                }
            }
        }
    }
}
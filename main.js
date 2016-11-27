var targetRooms = {
}

var interHaulers = [
]

var roles = {
    claimer: require('role.claimer'),
    hauler: require('role.hauler'),
    multiTool: require('role.multiTool'),
    ranger: require('role.ranger'),
    interHauler: require('role.interHauler'),
    utility: require('creeps')
}

var structure = {
    tower: require('structure.tower')
}

var ai = {
    numbers: require('ai.numbers'),
    targetedRooms: require('ai.targetedRooms')
}

module.exports.loop = function () {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for(sp in Game.spawns){
        var spawn = Game.spawns[sp]
        roles.utility.loop(spawn)
        ai.numbers.haulers(spawn)
    }

    ai.numbers.interHaulers(interHaulers);

    ai.targetedRooms.process(targetRooms);


    for(var name in Game.creeps){
        var creep = Game.creeps[name];

        if(creep.memory.recycle){
            var spawn = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure) =>{
                    return (structure.structureType == STRUCTURE_SPAWN)
                }
            })

            spawn[0].recycleCreep(creep)
        }else{
            roles[creep.memory.role].run(creep);
        }
    }

    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_TOWER){
            structure.tower.run(Game.structures[id])
        }
    }
}

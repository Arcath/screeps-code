var targetRooms = {
}

var interHaulers = [
]

var roles = {
    builder: require('role.builder'),
    claimer: require('role.claimer'),
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    healer: require('role.healer'),
    hauler: require('role.hauler'),
    multiTool: require('role.multiTool'),
    ranger: require('role.ranger'),
    interHauler: require('role.interHauler')
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

    ai.numbers.harvesters();
    ai.numbers.upgraders();
    ai.numbers.builders();
    ai.numbers.healers();
    ai.numbers.haulers();
    ai.numbers.interHaulers(interHaulers);
    
    ai.targetedRooms.process(targetRooms);
    
    
    for(var name in Game.creeps){
        var creep = Game.creeps[name];
        
        roles[creep.memory.role].run(creep);
    }
    
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_TOWER){
            structure.tower.run(Game.structures[id])
        }
    }
}
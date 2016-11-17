var targetRooms = {
    W46S69: {
        hold: true,
        tool: true,
        tools: 1
    },
    W48S69: {
        hold: false
    }
}

var roles = {
    builder: require('role.builder'),
    claimer: require('role.claimer'),
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    healer: require('role.healer'),
    hauler: require('role.hauler'),
    multiTool: require('role.multiTool')
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

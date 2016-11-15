var roles = {
    builder: require('role.builder'),
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    healer: require('role.healer')
}

var ai = {
    numbers: require('ai.numbers')
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


    for(var name in Game.creeps){
        var creep = Game.creeps[name];

        roles[creep.memory.role].run(creep);
    }
}

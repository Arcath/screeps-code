module.exports.harvesters = function(){
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

    if(harvesters.length < 2) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
}

module.exports.upgraders = function(){
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    if(upgraders.length < 1){
        var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
        console.log('Spawning new Upgrader: ' + newName);
    }
}

module.exports.builders = function(){
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    if(upgraders.length < 2){
        var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
        console.log('Spawning new Builder: ' + newName);
    }
}

module.exports.healers = function(){
    var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');

    if(healers.length < 0){
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'healer'});
        console.log('Spawning new Healer: ' + newName);
    }
}

module.exports.haulers = function(){
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');

    if(haulers.length < 2){
        var newName = Game.spawns['Spawn1'].createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'hauler'});
        console.log('Spawning new Hauler: ' + newName);
    }
}

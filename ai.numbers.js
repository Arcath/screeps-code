creepBuilder = require('ai.creepBuilder')

module.exports.harvesters = function(){
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

    if(harvesters.length < 2) {
        creep = creepBuilder.createCreep({
          base: [WORK,WORK,CARRY,MOVE],
          spawn: Game.spawns['Spawn1']
        })

        var newName = Game.spawns['Spawn1'].createCreep(creep, undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
}

module.exports.upgraders = function(){
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    if(upgraders.length < 1){
      creep = creepBuilder.createCreep({
        base: [WORK,WORK,CARRY,MOVE],
        spawn: Game.spawns['Spawn1']
      })

        var newName = Game.spawns['Spawn1'].createCreep(creep, undefined, {role: 'upgrader'});
        console.log('Spawning new Upgrader: ' + newName);
    }
}

module.exports.builders = function(){
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    if(upgraders.length < 2){
      creep = creepBuilder.createCreep({
        base: [WORK,WORK,CARRY,MOVE],
        spawn: Game.spawns['Spawn1']
      })
        var newName = Game.spawns['Spawn1'].createCreep(creep, undefined, {role: 'builder'});
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
      creep = creepBuilder.createCreep({
        base: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        spawn: Game.spawns['Spawn1']
      })

        var newName = Game.spawns['Spawn1'].createCreep(creep, undefined, {role: 'hauler'});
        console.log('Spawning new Hauler: ' + newName);
    }
}

module.exports.interHaulers = function(interHaulers){
    for(var hauler in interHaulers){
        var interHauler = _.filter(Game.creeps, (creep) => creep.memory.role == 'interHauler' && creep.memory.sourceRoom == interHaulers[hauler].from && creep.memory.destRoom == interHaulers[hauler].to);

        if(interHauler.length < 1){
            var newName = Game.spawns['Spawn1'].createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'interHauler', sourceRoom: interHaulers[hauler].from, destRoom: interHaulers[hauler].to});
            console.log('Spawning new Inter Hauler: ' + newName);
        }
    }
}

module.exports = {
    process: function(targetedRooms){
        for(var targetRoom in targetedRooms){
            if(targetedRooms[targetRoom].hold){
                this.ensureClaimer(targetRoom)
            }

            if(targetedRooms[targetRoom].tool){
                this.toolsNumbers(targetRoom, targetedRooms[targetRoom].tools)
            }

            if(targetedRooms[targetRoom].attack){
                this.sendRanger(targetRoom)
            }

            if(targetedRooms[targetRoom].claim){
                this.setClaim(targetRoom)
            }
        }
    },

    ensureClaimer: function(room){
        var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.targetRoom == room);

        if(claimers.length == 1){
            if(claimers[0].ticksToLive < claimers[0].memory.expiresAt){
                Game.spawns['Spawn1'].createCreep([CLAIM, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'claimer', targetRoom: room, expiresAt: 30});
            }
        }

        if(claimers.length == 0){
            Game.spawns['Spawn1'].createCreep([CLAIM, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'claimer', targetRoom: room, expiresAt: 30});
        }
    },

    toolsNumbers: function(room, max){
        var tools = _.filter(Game.creeps, (creep) => creep.memory.role == 'multiTool' && creep.memory.targetRoom == room);

        if(tools.length < max) {
            var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'multiTool', targetRoom: room});
            console.log('Spawning new Multi Tool: ' + newName);
        }
    },

    sendRanger: function(room){
        var rangers = _.filter(Game.creeps, (creep) => creep.memory.role == 'ranger' && creep.memory.targetRoom == room);

        if(rangers.length < 1){
            var newName = Game.spawns['Spawn1'].createCreep([RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'ranger', targetRoom: room});
            console.log('Spawning new Ranger: ' + newName);
        }
    },

    setClaim: function(room){
      for(name in Game.creeps){
        creep = Game.creeps[name]

        if(creep.memory.targetRoom == room){
          creep.memory.claim = true
        }
      }
    }
};

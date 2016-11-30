creepBuilder = require('ai.creepBuilder')

module.exports = {
  spawn: undefined,

  loop: function(spawn){
    this.spawn = spawn

    sources = spawn.room.find(FIND_SOURCES).length

    var requiredCreeps = sources * 2
    var currentCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'utility' && creep.room.name == spawn.room.name)

    if(currentCreeps.length < requiredCreeps){
      creep = creepBuilder.createCreep({
        base: [WORK,WORK,CARRY,MOVE],
        spawn: spawn,
        canAffordOnly: (currentCreeps.length < sources)
      })
      var newName = spawn.createCreep(creep, undefined, {role: 'utility'})
      console.log('Creating Creep (' + spawn.room.name + ') ' + newName)
    }
  },

  run: function(creep){
    var sources = creep.room.find(FIND_SOURCES)
    var sites = creep.room.find(FIND_CONSTRUCTION_SITES)
    var harvesters = _.filter(Game.creeps, (cr) => cr.memory.role == 'utility' && cr.room.name == creep.room.name && cr.memory.job == 'harvester')
    
    var needHeal = creep.room.find(FIND_STRUCTURES, {
	   filter: function(structure){
	        return (structure.hits < (structure.hitsMax - 2000)) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
	   }
	})

    var oldJob = creep.memory.job

    if(harvesters.length != sources.length || creep.memory.job == 'harvester'){
      creep.memory.job = 'harvester'
    }else{
      if(sites.length > 0 && creep.room.controller.ticksToDowngrade > 500 && needHeal.length == 0){
        creep.memory.job = 'builder'
      }else{
          if(needHeal.length > 0){
              creep.memory.job = 'healer'
          }else{
              creep.memory.job = 'upgrader'
          }
      }
    }
    
    var spawnContainers = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (
			    	structure.structureType == STRUCTURE_CONTAINER
					&&
					structure.pos.findInRange(FIND_STRUCTURES, 1, {
					    filter: (structure) => {
					        return structure.structureType == STRUCTURE_SPAWN
					    }
					}).length != 0
				)
			}
	})

    if(creep.ticksToLive < 350 && spawnContainers.length > 0){
        creep.memory.job = 'recycle'
    }

    if(oldJob != creep.memory.job){
      creep.say(creep.memory.job)
    }

    this.workToggle(creep)
    this.jobs[creep.memory.job](creep, sources, sites, needHeal)
  },

  workToggle: function(creep){
    if(creep.memory.working && creep.carry.energy == 0){
			creep.memory.working = false
			creep.say('Collecting')
		}
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity){
			creep.memory.working = true
			creep.say('Using')
		}
  },

  jobs: {
    healer: function(creep, sources, sites, needHeal){
        if(creep.memory.working){
            target = creep.pos.findClosestByRange(needHeal)
			if(creep.repair(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target)
			}
        }else{
            this.collector(creep, sources, sites, needHeal)
        }
    },
    
    harvester: function(creep, sources, sites, needHeal){
      if(creep.memory.working){
        var targets = creep.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: function(structure){
            return (structure.structureType == STRUCTURE_CONTAINER)
          }
        })

        if(targets.length > 0){
          if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(targets[0])
          }
        }else{
            var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (
						structure.structureType == STRUCTURE_CONTAINER
						&&
						structure.pos.findInRange(FIND_SOURCES, 2).length == 1
					)
				}
			})

			if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(targets[0])
            }
        }
      }else{
        if(!creep.memory.source){
          for(source in sources){
            var sourceHarvesters = _.filter(Game.creeps, (cr) => (cr.memory.job == creep.memory.job) && (cr.memory.source == source) && (cr.room.name == creep.room.name))
            if(sourceHarvesters.length != 1){
              creep.memory.source = source
            }
          }
        }

        if(creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[creep.memory.source])
        }
      }
    },

    builder: function(creep, sources, sites, needHeal){
      if(creep.memory.working){
        target = creep.pos.findClosestByRange(sites)
				if(creep.build(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target)
				}
      }else{
        this.collector(creep, sources, sites, needHeal)
      }
    },

    upgrader: function(creep, sources, sites, needHeal){
      if(creep.memory.working){
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
          creep.moveTo(creep.room.controller);
        }
      }else{
        this.collector(creep, sources, sites, needHeal)
      }
    },

    collector: function(creep, sources, sites, needHeal){
      var haulers = _.filter(Game.creeps, (cr) => cr.memory.role == 'hauler' && cr.room.name == creep.room.name)
      var haulerCap = 0

      for(hauler in haulers){
        if(haulers[hauler].carryCapacity > haulerCap){
          haulerCap = haulers[hauler].carryCapacity
        }
      }

      var containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (
              structure.structureType == STRUCTURE_CONTAINER
              ||
              structure.structureType == STRUCTURE_STORAGE
            )
            &&
            structure.store[RESOURCE_ENERGY] > (creep.carryCapacity + haulerCap)
          )
        }
      })

      if(containers.length != 0){
        target = creep.pos.findClosestByRange(containers)
        if(!(creep.pos.isNearTo(target))){
          creep.moveTo(target)
        }else{
          creep.withdraw(target, RESOURCE_ENERGY, (creep.carryCapacity - _.sum(creep.carry)))
        }
      }else{
        this.harvester(creep, sources, sites, needHeal)
      }
    },

    recycle: function(creep, sources, sites, needHeal){
        var spawnContainers = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (
			    	structure.structureType == STRUCTURE_CONTAINER
					&&
					structure.pos.findInRange(FIND_STRUCTURES, 1, {
					    filter: (structure) => {
					        return structure.structureType == STRUCTURE_SPAWN
					    }
					}).length != 0
				)
			}
		})

		if(!creep.pos.inRangeTo(spawnContainers[0], 0)){
		    creep.moveTo(spawnContainers[0])
		}else{
		    creep.memory.recycle = true
		}
    }
  }
}

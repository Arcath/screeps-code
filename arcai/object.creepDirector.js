var Utils = require('utils')

module.exports = class{
  constructor(room){
    this.room = room
  }

  runCreeps(){
    for(var cr in this.room.creeps){
      var creep = this.room.creeps[cr]

      if(creep.memory.working && _.sum(creep.carry) == 0){
        creep.memory.working = false
        creep.memory.deliverTo = undefined
		  }
		  if(!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity){
        creep.memory.working = true
        creep.memory.collectFrom  = undefined
      }

      if(creep.ticksToLive < 350 && this.room.recycleContainers.length > 0){
        creep.memory.action = 'recycle'
      }

      if(this.room.room.controller.my){
        var roads = creep.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s)=>s.structureType==STRUCTURE_ROAD})
        if(roads.length == 0){
          this.room.room.createConstructionSite(creep.pos, STRUCTURE_ROAD)
        }
      }

      if(creep.memory.working){
        switch(creep.memory.action){
          case 'supply':
            this.deliverSupply(creep)
            break
          case 'recycle':
            this.recycle(creep)
            break
          case 'mineralHarvest':
            this.deliverMinerals(creep)
            break
          case 'harvest':
            this.deliverHarvest(creep)
            break
          case 'upgrade':
            this.upgrade(creep)
            break
          case 'build':
            this.build(creep)
            break
          case 'haul':
            this.deliverHaul(creep)
            break
          default:
        }
      }else{
        switch(creep.memory.action){
          case 'supply':
            this.collectSupply(creep)
            break
          case 'recycle':
            this.recycle(creep)
            break
          case 'mineralHarvest':
            this.mineralHarvest(creep)
            break
          case 'harvest':
            this.harvest(creep)
            break
          case 'haul':
            this.collectHaul(creep)
            break
          default:
            this.collect(creep)
        }
      }
    }
  }

  assignSource(creep){
    var room = this.room
    var availableSources = _.filter(room.sources, function(source){
      return (
        _.filter(room.creeps, function(cr){
          return (cr.memory.source == source.id)
        }).length == 0
      )
    })

    if(availableSources.length){
      creep.memory.source = availableSources[0].id
    }
  }

  assignExtractor(creep){
    var room = this.room
    var availableExtractors = _.filter(room.extractors, function(extractor){
      return (
        _.filter(room.creeps, function(cr){
          return (cr.memory.extractor == extractor.id)
        }).length == 0
      )
    })

    if(availableExtractors.length){
      creep.memory.extractor = availableExtractors[0].id
    }
  }

  assignDelivery(creep, targetKeys){
    for(var i in targetKeys){
      if(this.room[targetKeys[i]].length){
        var targets = _.filter(this.room[targetKeys[i]], function(structure){
          return Utils.shouldDeliverTo(creep, structure)
        })

        var target = creep.pos.findClosestByRange(targets)

        if(target){
          if(!creep.memory.deliverTo){
            creep.memory.deliverTo = target.id
          }
        }
      }
    }
  }

  assignCollection(creep, targetKeys){
    for(var i in targetKeys){
      if(this.room[targetKeys[i]].length){
        var targets = _.filter(this.room[targetKeys[i]], function(t){
          if(t){
            if(t.energy){
              return (t.energy > creep.carryCapacity)
            }else{
              return (t.store.energy > creep.carryCapacity)
            }
          }
        })
        var target = creep.pos.findClosestByRange(targets)

        if(!creep.memory.collectFrom && target){
          creep.memory.collectFrom = target.id
        }
      }
    }
  }

  build(creep){
    if(creep.memory.site){
      var target = Game.getObjectById(creep.memory.site)
      if(target){
        if(creep.build(target) == ERR_NOT_IN_RANGE){
          creep.moveTo(target)
        }
      }else{
        Memory.arc[this.room.name].newBuilding = true
        creep.memory.site = undefined
      }
    }else{
      var target = creep.pos.findClosestByRange(this.room.sites)
      if(target){
        creep.memory.site = target.id
      }
    }
  }

  harvest(creep){
    if(creep.memory.source){
      var source = Game.getObjectById(creep.memory.source)
      if(creep.harvest(source) == ERR_NOT_IN_RANGE){
        creep.moveTo(source)
      }
    }else{
      this.assignSource(creep)
    }
  }

  mineralHarvest(creep){
    if(creep.memory.extractor){
      var extractor = Game.getObjectById(creep.memory.extractor)
      if(extractor.cooldown == 0){
        var mineral = extractor.pos.findInRange(FIND_MINERALS, 0)[0]
        if(creep.harvest(mineral) == ERR_NOT_IN_RANGE){
          creep.moveTo(extractor)
        }
      }
    }else{
      this.assignExtractor(creep)
    }
  }

  upgrade(creep){
    if(creep.upgradeController(this.room.room.controller) == ERR_NOT_IN_RANGE){
      creep.moveTo(this.room.room.controller)
    }
  }

  recycle(creep){
    var target = creep.pos.findClosestByRange(this.room.recycleContainers)
    if(creep.pos.getRangeTo(target) != 0){
      creep.moveTo(target)
    }else{
      var spawn = creep.pos.findClosestByRange(this.room.spawns)
      spawn.recycleCreep(creep)
    }
  }

  deliverMinerals(creep){
    if(creep.memory.deliverTo){
      var target = Game.getObjectById(creep.memory.deliverTo)
      if(creep.pos.isNearTo(target)){
        for(var resourceType in creep.carry){
          if(creep.transfer(target, resourceType) == ERR_FULL){
            creep.memory.deliverTo = undefined
          }
        }
      }else{
        creep.moveTo(target)
      }
    }else{
      this.assignDelivery(creep, ['extractorContainers', 'storages'])
    }
  }

  deliverHarvest(creep){
    if(creep.memory.deliverTo){
      var target = Game.getObjectById(creep.memory.deliverTo)
      switch(creep.transfer(target, RESOURCE_ENERGY)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target)
          break
        case ERR_FULL:
          creep.memory.deliverTo = undefined
          break
      }
    }else{
      this.assignDelivery(creep, ['sourceContainers', 'notFullSpawns', 'notFullExtensions'])
    }
  }

  deliverHaul(creep){
    if(creep.memory.deliverTo){
      var target = Game.getObjectById(creep.memory.deliverTo)
      switch(creep.transfer(target, RESOURCE_ENERGY)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target)
          break
        default:
          creep.memory.deliverTo = undefined
      }
    }else{
      var deliverTo = ['notFullSpawns', 'notFullExtensions', 'notFullTowers', 'lowTerminals', 'generalUseContainers', 'storages']

      if(this.room.room.find(FIND_HOSTILE_CREEPS).length != 0){
        var deliverTo = ['notFullTowers']
      }

      this.assignDelivery(creep, deliverTo)
    }
  }

  collect(creep){
    if(creep.memory.collectFrom){
      var target = Game.getObjectById(creep.memory.collectFrom)
      switch(creep.withdraw(target, RESOURCE_ENERGY)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target)
          break
        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_FULL:
          creep.memory.collectFrom = undefined
      }
    }else{
      var collectFrom = ['generalUseContainers', 'storages', 'recycleContainers']

      if(this.room.generalUseContainers.length == 0){
        var collectFrom = ['generalUseContainers', 'storages', 'fullExtensions', 'fullSpawns']
      }

      this.assignCollection(creep, collectFrom)
    }
  }

  collectHaul(creep){
    if(creep.memory.collectFrom){
      var target = Game.getObjectById(creep.memory.collectFrom)
      switch(creep.withdraw(target, RESOURCE_ENERGY)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target)
          break
        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_FULL:
          creep.memory.collectFrom = undefined
          break
      }
    }else{
      this.assignCollection(creep, ['sourceContainers', 'recycleContainers', 'extractorContainers', 'storages'])
    }
  }

  collectSupply(creep){
    if(Memory.arc[creep.room.name].supplyJobs[0]){
      var target = Game.getObjectById(Memory.arc[creep.room.name].supplyJobs[0].source)

      switch(creep.withdraw(target, Memory.arc[creep.room.name].supplyJobs[0].resource)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target)
          break
        case ERR_NOT_ENOUGH_RESOURCES:
          if(_.sum(creep.carry) == 0){
            this.room.removeSupplyJob()
          }else{
            creep.memory.working = true
          }
          break
      }
    }
  }

  deliverSupply(creep){
    if(Memory.arc[creep.room.name].supplyJobs[0]){
      var target = Game.getObjectById(Memory.arc[creep.room.name].supplyJobs[0].dest)

      if(creep.transfer(target, Memory.arc[creep.room.name].supplyJobs[0].resource) == ERR_NOT_IN_RANGE){
        creep.moveTo(target)
      }
    }
  }
}

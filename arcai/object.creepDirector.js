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

      if(this.room.room.controller.my && !this.room.constructMode()){
        var roads = creep.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s)=>s.structureType==STRUCTURE_ROAD})
        if(roads.length == 0){
          this.room.room.createConstructionSite(creep.pos, STRUCTURE_ROAD)
        }
      }

      if(creep.memory.goToRoom){
        if(creep.memory.goToRoom != creep.room.name){
          creep.memory.source = undefined
          creep.memory.site = undefined
          this.sendToRoom(creep)
        }else{
          this.work(creep)
        }
      }else{
        this.work(creep)
      }
    }
  }

  sendToRoom(creep){
    var route = Game.map.findRoute(this.room.room, creep.memory.goToRoom)
    if(creep.memory.action == 'defend' && this.room.hostileCreeps.length){
      this.defend(creep)
    }else{
      if(route.length > 0){
        var exit = creep.pos.findClosestByRange(route[0].exit)
        creep.moveTo(exit)
      }
    }
  }

  work(creep){
    if(creep.memory.working){
      switch(creep.memory.action){
        case 'hold':
          this.hold(creep)
          break
        case 'claim':
          this.claim(creep)
          break
        case 'defend':
          this.defend(creep)
          break
        case 'attack':
          this.attack(creep)
          break
        case 'construct':
          this.construct(creep)
          break
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
        case 'remoteHarvest':
        case 'interHaul':
          this.interHaul(creep)
          break
        default:
      }
    }else{
      switch(creep.memory.action){
        case 'remoteHarvest':
          this.remoteHarvest(creep)
          break
        case 'claim':
          this.claim(creep)
          break
        case 'defend':
          this.defend(creep)
          break
        case 'attack':
          this.attack(creep)
          break
        case 'supply':
          this.collectSupply(creep)
          break
        case 'recycle':
          this.recycle(creep)
          break
        case 'mineralHarvest':
          this.mineralHarvest(creep)
          break
        case 'construct':
        case 'harvest':
          this.harvest(creep)
          break
        case 'haul':
          this.collectHaul(creep)
          break
        case 'interHaul':
          this.collectInterHaul(creep)
          break
        default:
          this.collect(creep)
      }
    }
  }

  assignSource(creep){
    var room = this.room
    var availableSources = _.filter(room.sources, function(source){
      return (
        _.filter(room.creeps, function(cr){
          return (cr.memory.source == source.id && cr.memory.action == 'harvest' && creep.memory.action != 'construct')
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

  construct(creep){
    if(this.room.room.controller.ticksToDowngrade < 500 || this.room.room.controller.level < 2){
      this.upgrade(creep)
    }else{
      if(this.room.sites.length){
        this.build(creep)
      }else{
        this.deliverHaul(creep)
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
      var deliverTo = ['notFullSpawns', 'notFullExtensions', 'notFullTowers', 'lowCoreLinks', 'lowTerminals', 'generalUseContainers', 'storages']

      if(Memory.arc[this.room.name].defcon > 0){
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
        var collectFrom = ['generalUseContainers', 'storages', 'recycleContainers', 'fullExtensions', 'fullSpawns']
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

  interHaul(creep){
    if(creep.room.name != creep.memory.to){
      creep.memory.goToRoom = creep.memory.to
    }else{
      this.deliverHaul(creep)
    }
  }

  collectInterHaul(creep){
    if(creep.room.name != creep.memory.from){
      creep.memory.goToRoom = creep.memory.from
    }else{
      if(creep.memory.collectFrom){
        this.collect(creep)
      }else{
        if(this.room.remoteLinksByRoom[creep.memory.to]){
          creep.memory.collectFrom = this.room.remoteLinksByRoom[creep.memory.to].id
        }else{
          this.collect(creep)
        }
      }
    }
  }

  defend(creep){
    var hostiles = this.room.room.find(FIND_HOSTILE_CREEPS)

    if(hostiles.length){
      var target = creep.pos.findClosestByRange(hostiles)

      if(creep.attack(target) == ERR_NOT_IN_RANGE){
        creep.moveTo(target)
      }
    }else{
      creep.moveTo(this.room.room.controller)
    }
  }

  attack(creep){
    if(creep.room.name != creep.memory.to){
      creep.memory.goToRoom = creep.memory.to
    }else{
      var towers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_TOWER && structure.my == false)
        }
      })

      var creepsNearby = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5)
      if(creepsNearby.length){
        var crp = creep.pos.findClosestByRange(creepsNearby)

        if(creep.attack(crp) == ERR_NOT_IN_RANGE){
          creep.moveTo(crp)
        }
      }else{
        if(towers.length){
          var tower = creep.pos.findClosestByRange(towers)

          if(creep.attack(tower) == ERR_NOT_IN_RANGE){
            creep.moveTo(tower)
          }
        }else{
          var spawns = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_SPAWN && structure.my == false)
            }
          })

          if(spawns.length){
            var spawn = creep.pos.findClosestByRange(spawns)

            if(creep.attack(spawn) == ERR_NOT_IN_RANGE){
              creep.moveTo(spawn)
            }
          }else{
            var hostileStructures = creep.room.find(FIND_STRUCTURES, {
              filter: (structure) => {
                return (structure.my == false)
              }
            })

            if(hostileStructures.length){
              var structure = creep.pos.findClosestByRange(hostileStructures)

              if(creep.attack(structure) == ERR_NOT_IN_RANGE){
                creep.moveTo(structure)
              }
            }
          }
        }
      }
    }
  }

  claim(creep){
    if(creep.room.name != creep.memory.to){
      creep.memory.goToRoom = creep.memory.to
    }else{
      if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE){
        creep.moveTo(creep.room.controller)
      }
    }
  }

  hold(creep){
    if(creep.room.name != creep.memory.to){
      creep.memory.goToRoom = creep.memory.to
    }else{
      if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE){
        creep.moveTo(creep.room.controller)
      }
    }
  }

  remoteHarvest(creep){
    if(creep.room.name != creep.memory.mine){
      creep.memory.goToRoom = creep.memory.mine
    }else{
      this.harvest(creep)
    }
  }
}

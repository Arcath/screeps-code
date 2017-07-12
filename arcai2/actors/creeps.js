const Utils = require('../utils')
const CreepDesigner = require('../functions/creepDesigner')

var CreepsActor = {
  run: function(rooms, jobs){
    _.forEach(Game.creeps, function(creep){
      var recycle = false

      if(creep.memory.jobHash != undefined){
        //var job = jobs.findOne({hash: creep.memory.jobHash})
        var job = jobs.indexLookup(creep.memory.jobHash)
      }else{
        if(!creep.memory.recycle){
          CreepsActor.reAssign(creep, rooms, jobs)

          if(creep.memory.jobHash != undefined){
            var job = jobs.findOne({hash: creep.memory.jobHash})
          }
        }
      }

      if(creep.memory.recycle){
        recycle = true
      }

      var room = rooms.findOne({name: creep.room.name})

      if((creep.ticksToLive <= 150 || recycle) && room && room.recycleContainers.length > 0){
        var target = creep.pos.findClosestByRange(Utils.inflate(room.recycleContainers))
        if(creep.pos.getRangeTo(target) != 0){
          creep.moveTo(target)
        }else{
          var spawn = creep.pos.findClosestByRange(Utils.inflate(room.spawns))
          spawn.recycleCreep(creep)
        }
      }else{
        if(job){
          if(creep.memory.act){
            if(_.sum(creep.carry) == 0){
              creep.memory.act = false
              creep.memory.actJobHash = undefined
            }

            if(creep.memory.actJobHash){
              var actJob = jobs.findOne({hash: creep.memory.actJobHash})

              if(actJob){
                CreepsActor.act(creep, actJob, rooms, jobs)
              }else{
                creep.memory.actJobHash = undefined
              }
            }else{
              CreepsActor.act(creep, job, rooms, jobs)
            }
          }else{
            if(_.sum(creep.carry) == creep.carryCapacity && creep.carryCapacity != 0){
              creep.memory.actJobHash = undefined
              creep.memory.act = true
            }
            CreepsActor.collect(creep, job, rooms, jobs)
          }
        }else{
          creep.memory.jobHash = undefined
        }
      }
    })
  },

  act: function(creep, job, rooms, jobs){
    if(job.act){
      // Do the jobs act
      switch(job.act){
        case 'upgrade':
          this.upgrade(creep)
          break
        case 'deliver':
          this.deliver(creep, job)
          break
        case 'build':
          this.build(creep, job)
          break
        case 'deliverAll':
          this.deliverAll(creep, job)
          break
        case 'remoteWorker':
          this.remoteWorker(creep, job, rooms)
          break
        case 'deliverResource':
          this.deliverResource(creep, job)
          break
        case 'repair':
          this.repair(creep, job)
          break
        case 'runParty':
          this.runParty(creep, job)
          break
      }
    }else{
      // Assign an acting job
      this.assignActJob(creep, job, rooms, jobs)
    }
  },

  collect: function(creep, job, rooms, jobs){
    switch(job.collect){
      case 'harvest':
        this.harvest(creep, job)
        break
      case 'sourceCollect':
      case 'distribute':
        this.sourceCollect(creep, job)
        break
      case 'lowCollect':
        this.lowCollect(creep, job, rooms)
        break
      case 'claim':
        this.claim(creep, job)
        break
      case 'extract':
        this.extract(creep, job)
        break
      case 'defend':
        this.defend(creep, job)
        break
      case 'reserve':
        this.reserve(creep, job)
        break
      case 'supply':
        this.supply(creep, job, jobs)
        break
      case 'dismantle':
        this.dismantle(creep, job)
        break
      case 'flagCollect':
        this.flagCollect(creep, job)
        break
      case 'rally':
        this.rally(creep, job)
        break
    }
  },

  assignActJob: function(creep, job, rooms, jobs){
    var actJobs = jobs.order(
      {room: creep.room.name},
      {act: {defined: true}},
      {collect: {isnot: 'harvest'}},
      'priority'
    ).reverse()

    if(creep.memory.actFilter){
      actJobs = jobs.refineSearch(actJobs, {act: creep.memory.actFilter})
    }

    actJobs.sort(function(a, b){
      return (a.priority - b.priority)
    }).reverse()

    if(actJobs[0]){
      var pJobs = jobs.refineSearch(actJobs, {priority: actJobs[0].priority})

      if(pJobs[0].target){
        var targets = []
        var targetMaps = {}

        _.forEach(pJobs, function(pj){
          targets.push(Game.getObjectById(pj.target))
          targetMaps[pj.target] = pj
        })

        var target = creep.pos.findClosestByRange(targets)

        if(target){
          var job = targetMaps[target.id]
        }else{
          var job = actJobs[0]
        }
      }else{
        var job = pJobs[0]
      }

      if(job){
        creep.memory.actJobHash = job.hash
      }
    }
  },

  reAssign: function(creep, rooms, jobs){
    var openJobs = jobs.order({act: {func: function(field, objects){
      return _.filter(objects, function(object){
        if(object){
          return (
            object.collect != undefined
            &&
            object.collect != 'harvest'
            &&
            object.collect != 'distribute'
            &&
            object.room == creep.room.name
          )
        }else{
          return false
        }
      })
    }}}, 'priority').reverse()

    if(creep.memory.actFilter){
      openJobs = jobs.refineSearch(openJobs, {act: creep.memory.actFilter})
    }

    if(openJobs[0]){
      creep.memory.jobHash = openJobs[0].hash
    }else{
      creep.memory.recycle = true
    }
  },

  deliver: function(creep, job){
    var target = Game.getObjectById(job.target)
    if(target){
      switch(creep.transfer(target, RESOURCE_ENERGY)){
        case ERR_NOT_IN_RANGE:
          Utils.moveCreep(creep, target, '#a9b7c6')
          break
        default:
          creep.memory.actJobHash = undefined
      }
    }
  },

  harvest: function(creep, job){
    creep.memory.actJobHash = undefined
    var source = Game.getObjectById(job.source)

    if(job.target && job.act == 'deliver'){
      var target = Game.getObjectById(job.target)
      if(job.overflow){
        var target = Game.getObjectById(job.overflow)
      }
      if(creep.pos.inRangeTo(target, 0)){
        if(job.overflow){
          if(target.store.energy > creep.carryCapacity){
            creep.withdraw(target, RESOURCE_ENERGY)
          }else{
            creep.harvest(source)
          }
        }else{
          creep.harvest(source)
        }
      }else{
        creep.moveTo(target, {
          visualizePathStyle: {
            fill: 'transparent',
            stroke: '#c0392b',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .3
          }
        })
      }
    }else{
      if(creep.harvest(source) == ERR_NOT_IN_RANGE){
        creep.moveTo(source, {
          visualizePathStyle: {
            fill: 'transparent',
            stroke: '#c0392b',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .3
          }
        })
      }
    }
  },

  upgrade: function(creep){
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
      creep.moveTo(creep.room.controller, {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#2ecc71',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }
  },

  build: function(creep, job){
    var site = Game.getObjectById(job.target)
    if(creep.build(site) == ERR_NOT_IN_RANGE){
      creep.moveTo(site, {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#9b59b6',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }
  },

  sourceCollect: function(creep, job){
    creep.memory.actJobHash = undefined
    var container = Game.getObjectById(job.from)
    if(container){
      if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(container, {
          visualizePathStyle: {
            fill: 'transparent',
            stroke: '#f1c40f',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1
          }
        })
      }
    }
  },

  lowCollect: function(creep, job, rooms){
    var room = rooms.findOne({name: job.room})
    var containers = _.filter([].concat(Utils.inflate(room.recycleContainers), Utils.inflate(room.generalContainers)), function(c){
      return (c.store[RESOURCE_ENERGY] > creep.carryCapacity)
    })
    var container = creep.pos.findClosestByRange(containers)

    if(container){
      if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(container, {
          visualizePathStyle: {
            fill: 'transparent',
            stroke: '#f1c40f',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1
          }
        })
      }
    }
  },

  claim: function(creep, job){
    if(!creep.pos.isNearTo(Game.flags[job.flag])){
      creep.moveTo(Game.flags[job.flag], {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#8e44ad',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }else{
      creep.claimController(creep.room.controller)
      Game.flags[job.flag].remove()
    }
  },

  extract: function(creep, job){
    var mineral = Game.getObjectById(job.mineral)
    if(creep.harvest(mineral) == ERR_NOT_IN_RANGE){
      creep.moveTo(mineral, {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#95a5a6',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }
  },

  deliverAll: function(creep, job){
    var target = Game.getObjectById(job.target)

    _.forEach(Object.keys(creep.carry), function(resource){
      if(creep.transfer(target, resource) == ERR_NOT_IN_RANGE){
        creep.moveTo(target, {
          visualizePathStyle: {
            fill: 'transparent',
            stroke: '#a9b7c6',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1
          }
        })
      }
    })
  },

  defend: function(creep, job){
    var room = Game.rooms[job.room]

    if(room){
      if(creep.room.name != job.room){
        creep.moveTo(room.controller)
      }else{
        var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)

        if(creep.attack(hostile) == ERR_NOT_IN_RANGE){
          creep.moveTo(hostile)
        }

        var hostileSite = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)

        if(hostileSite){
          creep.moveTo(hostileSite)
        }
      }
    }
  },

  reserve: function(creep, job){
    if(!creep.pos.isNearTo(Game.flags[job.flag])){
      creep.moveTo(Game.flags[job.flag], {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#8e44ad',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }else{
      if(!Memory.stats['remoteMining.' + creep.room.name + '.revenue']){
        Memory.stats['remoteMining.' + creep.room.name + '.revenue'] = 0
      }

      if(!creep.memory.costed){
        var costArray = []
        _.forEach(creep.body, function(part){
          costArray.push(part.type)
        })
        Memory.stats['remoteMining.' + creep.room.name + '.revenue'] -= CreepDesigner.creepCost(costArray)
        creep.memory.costed = true
      }

      creep.reserveController(creep.room.controller)
    }
  },

  remoteWorker: function(creep, job, rooms){
    if(job.target){
      var target = Game.getObjectById(job.target)
    }else{
      var roomObject = rooms.findOne({name: job.targetRoom})

      if(Game.rooms[job.targetRoom].storage){
        var target = Game.rooms[job.targetRoom].storage
      }else{
        var target = _.filter(Utils.inflate(roomObject.generalContainers), function(container){
          return (_.sum(container.store) < container.storeCapacity)
        })[0]
      }

      if(roomObject.exitLinkMaps[job.remoteRoom]){
        target = Game.getObjectById(roomObject.exitLinkMaps[job.remoteRoom])
      }
    }

    if(!Memory.stats['remoteMining.' + job.remoteRoom + '.revenue']){
      Memory.stats['remoteMining.' + job.remoteRoom + '.revenue'] = 0
    }

    if(!creep.memory.costed){
      var costArray = []
      _.forEach(creep.body, function(part){
        costArray.push(part.type)
      })
      Memory.stats['remoteMining.' + job.remoteRoom + '.revenue'] -= CreepDesigner.creepCost(costArray)
      creep.memory.costed = true
    }

    var sites = _.filter(creep.pos.lookFor(LOOK_CONSTRUCTION_SITES), function(site){
      return (site.structureType == STRUCTURE_ROAD || site.structureType == STRUCTURE_CONTAINER)
    })

    var roadsNeedingHealing = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), function(road){
      return (road.hits < road.hitsMax && road.structureType != STRUCTURE_RAMPART)
    })

    if(sites.length > 0){
      creep.build(sites[0])
    }else if(roadsNeedingHealing.length > 0){
      creep.repair(roadsNeedingHealing[0])
    }else{
      var carry = creep.carry.energy
      if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(target, {
          visualizePathStyle: {
            fill: 'transparent',
            stroke: '#a9b7c6',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1
          }
        })
      }else{
        if(!job.target){
          var trasfered = _.min([(target.storeCapacity - _.sum(target.store)), carry])

          Memory.stats['remoteMining.' + job.remoteRoom + '.revenue'] += trasfered
        }
      }
    }
  },

  supply: function(creep, job, jobs){
    var container = Game.getObjectById(job.from)

    if(container){
      switch(creep.withdraw(container, job.resource)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(container, {
            visualizePathStyle: {
              fill: 'transparent',
              stroke: '#f1c40f',
              lineStyle: 'dashed',
              strokeWidth: .15,
              opacity: .1
            }
          })
          break
        case ERR_NOT_ENOUGH_RESOURCES:
          creep.memory.act = true
          console.log(creep.name + ' would delete job')
          break
      }
    }
  },

  deliverResource: function(creep, job){
    var target = Game.getObjectById(job.target)
    if(target){
      switch(creep.transfer(target, job.resource)){
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target, {
            visualizePathStyle: {
              fill: 'transparent',
              stroke: '#a9b7c6',
              lineStyle: 'dashed',
              strokeWidth: .15,
              opacity: .1
            }
          })
          break
        default:
          creep.memory.act = false
      }
    }
  },

  repair: function(creep, job){
    var building = Game.getObjectById(job.target)
    if(creep.repair(building) == ERR_NOT_IN_RANGE){
      creep.moveTo(building, {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#9b59b6',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }
  },

  dismantle: function(creep, job){
    var structure = Game.getObjectById(job.dismantle)
    if(creep.dismantle(structure) == ERR_NOT_IN_RANGE){
      creep.moveTo(structure, {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#c0392b',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        }
      })
    }
  },

  flagCollect: function(creep, job){
    var flag = Game.flags[job.flag]

    if(flag.room){
      var target = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), function(structure){
        return (structure.structureType == STRUCTURE_STORAGE)
      })[0]

      if(target){
        if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          Utils.moveCreep(creep, flag.pos, '#f1c40f')
        }
      }
    }else{
      Utils.moveCreep(creep, flag.pos, '#f1c40f')
    }
  },

  rally: function(creep, job){
    var flag = Game.flags[job.flag]

    if(flag.room){
      if(creep.pos.getRangeTo(flag) > 1){
        Utils.moveCreep(creep, flag.pos, '#1abc9c')
      }else{
        creep.memory.ready = true
      }
    }else{
      Utils.moveCreep(creep, flag.pos, '#1abc9c')
    }
  },

  runParty: function(creep, job){
    var flag = Game.flags[job.actFlag]

    if(!flag.room || creep.room.name != flag.pos.roomName){
      Utils.moveCreep(creep, flag.pos, '#1abc9c')
    }else{
      var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)

      if(closestHostile){
        if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE){
          Utils.moveCreep(creep, closestHostile, '#1abc9c')
        }
      }
    }
  }
}

module.exports = CreepsActor

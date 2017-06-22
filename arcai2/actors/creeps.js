const Utils = require('../utils')

var CreepsActor = {
  run: function(rooms, jobs){
    _.forEach(Game.creeps, function(creep){
      var recycle = false

      if(creep.memory.jobHash != undefined){
        var job = jobs.findOne({hash: creep.memory.jobHash})
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

      if(creep.ticksToLive <= 150 || recycle && room.recycleContainers.length > 0){
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
            CreepsActor.collect(creep, job, rooms)
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
      }
    }else{
      // Assign an acting job
      this.assignActJob(creep, job, rooms, jobs)
    }
  },

  collect: function(creep, job, rooms){
    switch(job.collect){
      case 'harvest':
        this.harvest(creep, job)
        break
      case 'distribute':
        this.sourceCollect(creep, job)
        break
      case 'lowCollect':
        this.lowCollect(creep, job, rooms)
        break
      case 'claim':
        this.claim(creep, job)
        break
    }
  },

  assignActJob: function(creep, job, rooms, jobs){
    var actJobs = jobs.order({act: {func: function(field, objects){
      return _.filter(objects, function(object){
        if(object){
          return (object.act != undefined && object.collect != 'harvest' && object.room == creep.room.name)
        }else{
          return false
        }
      })
    }}}, {priority: {gte: job.priority}}, 'priority').reverse()

    if(creep.memory.actFilter){
      actJobs = jobs.refineSearch(actJobs, {act: creep.memory.actFilter})
    }

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
          console.log(creep.name + ' ' + targets.length)
        }
      }else{
        var job = pJobs[0]
      }

      if(job){
        console.log('Assigning ' + creep.name + ' to ' + job.act)
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
          creep.memory.actJobHash = undefined
      }
    }
  },

  harvest: function(creep, job){
    var source = Game.getObjectById(job.source)
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
  }
}

module.exports = CreepsActor

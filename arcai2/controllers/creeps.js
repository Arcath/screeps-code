var SODB = require('sodb')

var CreepDesigner = require('../functions/creepDesigner')
var Utils = require('../utils')

module.exports = {
  run: function(rooms, jobs, spawnQueue){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(roomObject){
      var roomJobs = jobs.where({room: roomObject.name})

      var distroJobs = jobs.refineSearch(roomJobs, {collect: 'distribute'})
      var harvestJobs = jobs.refineSearch(roomJobs, {collect: 'harvest'})
      var siteJobs = jobs.refineSearch(roomJobs, {act: 'build'})
      var extractJobs = jobs.refineSearch(roomJobs, {collect: 'extract'})
      var supplyJobs = jobs.refineSearch(roomJobs, {collect: 'supply'})

      if(supplyJobs.length > 0){
        var supplyCreeps = _.filter(Game.creeps, function(creep){
          return (creep.memory.collectFilter == 'supply' && creep.room.name == roomObject.name)
        })

        if(supplyCreeps.length == 0){
          spawnQueue.add({
            creepType: 'move',
            memory: {
              collectFilter: 'supply',
              actFilter: 'deliverResource'
            },
            priority: 40,
            spawned: false,
            room: roomObject.name
          })
        }
      }

      var totalWorkRate = 0
      _.forEach(harvestJobs, function(job){
        var creeps = Utils.findCreepsForJob(job)
        var workRate = Utils.workRate(creeps)
        var source = Game.getObjectById(job.source)

        totalWorkRate += workRate

        if(workRate < (source.energyCapacity / 300)){
          spawnQueue.add(
            {
              creep: CreepDesigner.createCreep({
                base: CreepDesigner.baseDesign.slowWork,
                cap: CreepDesigner.caps.slowWork,
                room: Game.rooms[roomObject.name]
              }),
              memory: {
                jobHash: job.hash
              },
              priority: job.priority,
              spawned: false,
              room: roomObject.name
            }
          )
        }
      })

      Memory.stats['room.' + roomObject.name + '.sourceWorkRate'] = totalWorkRate

      _.forEach(distroJobs, function(job){
        var creep = Utils.findCreepForJob(job)
        var creepsInRoom = _.filter(Game.creeps, function(cr){
          return (cr.room.name == roomObject.name && cr.memory.actFilter == 'deliver')
        })

        if(creepsInRoom.length == 0){
          var cap = 300
        }else{
          var cap = CreepDesigner.caps.move
        }

        if(!creep){
          spawnQueue.add({
            creep: CreepDesigner.createCreep({
              base: CreepDesigner.baseDesign.move,
              cap: cap,
              room: Game.rooms[roomObject.name]
            }),
            memory: {
              jobHash: job.hash,
              actFilter: 'deliver'
            },
            priority: 120,
            spawned: false,
            room: roomObject.name
          })
        }
      })

      if(siteJobs.length > 0){
        var numBuilders = parseInt((siteJobs.length / 10) + 1)

        var builderCreeps = _.filter(Game.creeps, function(creep){
          return (creep.memory.actFilter == 'build' && creep.room.name == roomObject.name)
        })

        var siteJob = _.sortBy(siteJobs, 'priority').reverse()[0]

        if(builderCreeps.length < numBuilders && roomObject.generalContainers.length > 0){
          spawnQueue.add({
            creep: CreepDesigner.createCreep({
              base: CreepDesigner.baseDesign.fastWork,
              cap: CreepDesigner.caps.fastWork,
              room: Game.rooms[roomObject.name]
            }),
            memory: {
              jobHash: siteJob.hash,
              actFilter: 'build'
            },
            priority: siteJob.priority,
            spawned: false,
            room: roomObject.name
          })
        }
      }

      var upgraderCreeps = _.filter(Game.creeps, function(creep){
        return (creep.memory.actFilter == 'upgrade' && creep.room.name == roomObject.name)
      })

      if(upgraderCreeps.length < 2 && roomObject.generalContainers.length > 0){
        var upgradeJob = jobs.refineSearch(roomJobs, {act: 'upgrade'})[0]

        spawnQueue.add({
          creepType: 'fastWork',
          memory: {
            jobHash: upgradeJob.hash,
            actFilter: 'upgrade'
          },
          priority: upgradeJob.priority,
          spawned: false,
          room: roomObject.name
        })
      }

      if(extractJobs.length > 0){
        _.forEach(extractJobs, function(job){
          var creep = Utils.findCreepForJob(job)

          if(!creep){
            spawnQueue.add({
              creep: CreepDesigner.createCreep({
                base: CreepDesigner.baseDesign.fastWork,
                cap: CreepDesigner.caps.fastWork,
                room: Game.rooms[roomObject.name]
              }),
              memory: {
                jobHash: job.hash
              },
              priority: job.priority,
              spawned: false,
              room: roomObject.name
            })
          }
        })
      }
    })
  }
}

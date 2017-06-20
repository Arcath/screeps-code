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

      _.forEach(harvestJobs, function(job){
        var creeps = Utils.findCreepsForJob(job)
        var workRate = Utils.workRate(creeps)
        var source = Game.getObjectById(job.source)

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

      _.forEach(distroJobs, function(job){
        var creep = Utils.findCreepForJob(job)

        if(!creep){
          spawnQueue.add({
            creep: CreepDesigner.createCreep({
              base: CreepDesigner.baseDesign.move,
              cap: CreepDesigner.caps.move,
              room: Game.rooms[roomObject.name]
            }),
            memory: {
              jobHash: job.hash,
              actFilter: 'deliver'
            },
            priority: job.priority,
            spawned: false,
            room: roomObject.name
          })
        }
      })

      if(siteJobs.length > 0){
        var numBuilders = parseInt((siteJobs.length / 10) + 1)

        var builderCreeps = _.filter(Game.creeps, function(creep){
          return (creep.memory.actFilter == 'build')
        })

        var siteJob = _.sortBy(siteJobs, 'priority').reverse()[0]

        if(builderCreeps.length < numBuilders){
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
        return (creep.memory.actFilter == 'upgrade')
      })

      if(upgraderCreeps.length < 2){
        var upgradeJob = jobs.refineSearch(roomJobs, {act: 'upgrade'})[0]

        spawnQueue.add({
          creep: CreepDesigner.createCreep({
            base: CreepDesigner.baseDesign.fastWork,
            cap: CreepDesigner.caps.fastWork,
            room: Game.rooms[roomObject.name]
          }),
          memory: {
            jobHash: upgradeJob.hash,
            actFilter: 'upgrade'
          },
          priority: upgradeJob.priority,
          spawned: false,
          room: roomObject.name
        })
      }
    })
  }
}
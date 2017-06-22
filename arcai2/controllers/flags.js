const CreepDesigner = require('../functions/creepDesigner')
const Utils = require('../utils')

var FlagsController = {
  run: function(rooms, jobs, flags, spawnQueue){
    var greenFlags = flags.where({color: COLOR_GREEN})
    var purpleFlags = flags.where({color: COLOR_PURPLE})
    var yellowFlags = flags.where({color: COLOR_YELLOW})

    _.forEach(greenFlags, function(flagObject){
      var flag = Game.flags[flagObject.name]
      var lookup = _.filter(flag.pos.look(), function(item){
        return (item.type == 'constructionSite')
      })[0]

      if(!lookup){
        flag.remove()
        return
      }else{
        var site = lookup.constructionSite
      }

      var siteJob = Utils.jobForTarget(site, jobs)

      if(siteJob.collect != 'harvest'){
        siteJob.collect = 'harvest'

        var room = rooms.findOne({name: flag.room.name})
        var sources = Utils.inflate(room.sources)

        var source = flag.pos.findClosestByRange(sources)

        siteJob.source = source.id

        jobs.update(siteJob)
      }

      if(!Utils.findCreepForJob(siteJob)){
        var nearestRoom = Utils.myNearestRoom(flag.room.name, rooms)

        spawnQueue.add({
          creep: CreepDesigner.createCreep({
            base: CreepDesigner.baseDesign.slowWork,
            cap: CreepDesigner.caps.slowWork,
            room: Game.rooms[nearestRoom]
          }),
          memory: {
            jobHash: siteJob.hash
          },
          priority: siteJob.priority,
          spawned: false,
          room: nearestRoom
        })
      }
    })

    _.forEach(purpleFlags, function(flagObject){
      var flag = Game.flags[flagObject.name]

      /*if(flag.pos.room.controller.my){
        flag.remove()
      }*/

      if(flag.secondaryColor == COLOR_PURPLE){
        console.log('purple-purple')
      }else if(flag.secondaryColor == COLOR_RED){
        var job = {
          collect: 'claim',
          room: flagObject.room,
          priority: 10,
          flag: flagObject.name
        }

        Utils.addWithHash(job, jobs)

        if(!Utils.findCreepForJob(job)){
          var nearestRoom = Utils.myNearestRoom(flagObject.room, rooms, CreepDesigner.caps.claim)

          spawnQueue.add({
            creep: CreepDesigner.createCreep({
              base: CreepDesigner.baseDesign.claim,
              cap: CreepDesigner.caps.claim,
              room: Game.rooms[nearestRoom]
            }),
            memory: {
              jobHash: job.hash
            },
            priority: job.priority,
            spawned: false,
            room: nearestRoom
          })
        }
      }
    })
  }
}

module.exports = FlagsController

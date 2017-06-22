var Utils = require('../utils')

var JobsController = {
  // Find all jobs in the room
  jobsForRoom: function(roomObject, jobs){

    // If the room is mine
    if(roomObject.mine){

      // Create the permemant harvesting job(s)
      _.forEach(roomObject.sources, function(source){
        var job = {
          collect: 'harvest',
          creepType: 'slowWork',
          source: source,
          room: roomObject.name,
          priority: 100
        }

        if(roomObject.sourceContainerMaps[source]){
          job.act = 'deliver'
          job.target = roomObject.sourceContainerMaps[source]

          Utils.addWithHash({
            collect: 'distribute',
            from: roomObject.sourceContainerMaps[source],
            room: roomObject.name,
            priority: 90
          }, jobs)
        }

        Utils.addWithHash(job, jobs)
      })

      // Create the permermant upgrade job
      Utils.addWithHash({
        collect: 'lowCollect',
        act: 'upgrade',
        creepType: 'fastWork',
        room: roomObject.name,
        priority: 10
      }, jobs)
    }
  },

  energyJobs: function(rooms, jobs){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(room){
      var spawns = Utils.inflate(room.spawns)

      _.forEach(spawns, function(spawn){
        JobsController.energyJobForBuilding(spawn, 120, jobs, room.name)
      })

      var extensions = Utils.inflate(room.extensions)

      _.forEach(extensions, function(extension){
        JobsController.energyJobForBuilding(extension, 120, jobs, room.name)
      })

      var generalContainers = Utils.inflate(room.generalContainers)

      _.forEach(generalContainers, function(container){
        JobsController.energyJobForBuilding(container, 90, jobs, room.name)
      })

      var towers = Utils.inflate(room.towers)

      _.forEach(towers, function(tower){
        JobsController.energyJobForBuilding(tower, 100, jobs, room.name)
      })
    })
  },

  energyJobForBuilding: function(building, priority, jobs, roomName){
    if(!building){
      return
    }

    if(building.energy >= 0){
      var energy = building.energy
      var capacity = building.energyCapacity
    }else{
      var energy = _.sum(building.store)
      var capacity = building.storeCapacity
    }

    if(building.structureType == STRUCTURE_TOWER){
      capacity = capacity * 0.8
    }

    var job = {
      act: 'deliver',
      priority: priority,
      room: roomName,
      target: building.id
    }

    var hash = Utils.hash(job)
    job.hash = hash

    var foundJob = jobs.findOne({hash: hash})

    if(energy < capacity){
      if(!foundJob){
        jobs.add(job)
      }
    }else{
      if(foundJob){
        jobs.remove(foundJob)
      }
    }
  },

  siteJobs: function(sites, jobs){
    _.forEach(sites.all(), function(site){
      var job = {
        collect: 'lowCollect',
        act: 'build',
        priority: site.priority,
        room: site.room,
        target: site.id
      }

      var hash = Utils.hash(job)
      job.hash = hash

      var foundJob = jobs.findOne({hash: hash})

      if(!foundJob){
        jobs.add(job)
      }
    })
  }
}

module.exports = JobsController

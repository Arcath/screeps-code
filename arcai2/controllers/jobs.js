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

        if(roomObject.sourceLinkMaps[source] && roomObject.coreLinks.length > 0){
          job.act = 'deliver'
          job.target = roomObject.sourceLinkMaps[source]
          job.overflow = roomObject.sourceContainerMaps[source]
        }

        if(roomObject.sourceContainerMaps[source] && (!roomObject.sourceLinkMaps[source] || roomObject.coreLinks.length == 0)){
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

      _.forEach(roomObject.coreLinks, function(link){
        Utils.addWithHash({
          collect: 'distribute',
          from: link,
          room: roomObject.name,
          priority: 90
        }, jobs)
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
    var energyJobsProfiler = {base: Game.cpu.getUsed()}
    var myRooms = rooms.where({mine: true})

    energyJobsProfiler.getRooms = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
    Memory.stats['methodProfiles.energyJobs.getRooms'] = energyJobsProfiler.getRooms

    _.forEach(myRooms, function(room){
      var spawns = Utils.inflate(room.spawns)

      _.forEach(spawns, function(spawn){
        JobsController.energyJobForBuilding(spawn, 120, jobs, room.name)
      })

      energyJobsProfiler[room.name + 'spawns'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'spawns'] = energyJobsProfiler[room.name + 'spawns']

      var extensions = Utils.inflate(room.extensions)

      _.forEach(extensions, function(extension){
        JobsController.energyJobForBuilding(extension, 120, jobs, room.name)
      })

      energyJobsProfiler[room.name + 'extensions'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'extensions'] = energyJobsProfiler[room.name + 'extensions']

      var generalContainers = Utils.inflate(room.generalContainers)

      _.forEach(generalContainers, function(container){
        if(container.structureType == STRUCTURE_STORAGE){
          var priority = 80
        }else{
          var priority = 90
        }
        JobsController.energyJobForBuilding(container, priority, jobs, room.name)
      })

      energyJobsProfiler[room.name + 'containers'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'containers'] = energyJobsProfiler[room.name + 'containers']

      var towers = Utils.inflate(room.towers)

      _.forEach(towers, function(tower){
        JobsController.energyJobForBuilding(tower, 100, jobs, room.name)
      })

      energyJobsProfiler[room.name + 'towers'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'towers'] = energyJobsProfiler[room.name + 'towers']

      var storage = Game.getObjectById(room.storage)

      if(storage){
        if(storage.store.energy > 300000){
          Utils.addIfNotExist({
            collect: 'distribute',
            from: room.storage,
            room: room.name,
            priority: 90
          }, jobs)
        }
      }

      energyJobsProfiler[room.name + 'storage'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'storage'] = energyJobsProfiler[room.name + 'storage']
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
      if(Memory.defcon[roomName].defcon != 0){
        priority = 200
      }
    }

    if(Memory.jobPremades[building.id]){
      var job = Memory.jobPremades[building.id]
    }else{
      var job = {
        act: 'deliver',
        priority: priority,
        room: roomName,
        target: building.id
      }

      var hash = Utils.hash(job)
      job.hash = hash

      Memory.jobPremades[building.id] = job
    }

    //var foundJob = jobs.findOne({hash: job.hash})
    var foundJob = jobs.indexLookup(job.hash)

    if(Memory.defcon[roomName].defcon != 0 && building.structureType == STRUCTURE_TOWER && foundJob){
      foundJob.priority = 200
      if(foundJob.changed){ jobs.update(foundJob) }
    }else if(building.structureType == STRUCTURE_TOWER && foundJob){
      foundJob.priority = priority
      if(foundJob.changed){ jobs.update(foundJob) }
    }

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
  },

  extractorJobs: function(rooms, jobs){
    var myRooms = rooms.where({mine: true}, {storage: {defined: true}})

    _.forEach(myRooms, function(room){
      if(room.extractors.length == 0){
        return
      }

      _.forEach(Utils.inflate(room.extractors), function(extractor){
        var mineral = Game.getObjectById(room.minerals[0])

        if(mineral.mineralAmount > 0){
          var job = {
            collect: 'extract',
            priority: 70,
            room: room.name,
            act: 'deliverAll',
            target: room.storage,
            mineral: room.minerals[0]
          }

          if(!jobs.findOne({collect: 'extract'}, {room: room.name})){
            Utils.addWithHash(job, jobs)
          }
        }
      })
    })
  },

  mineralJobs: function(rooms, jobs){

  },

  repairJobs: function(rooms, jobs){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(roomObject){
      if(roomObject.rcl < 4){
        _.forEach([].concat(
          Utils.inflate(roomObject.recycleContainers),
          Utils.inflate(roomObject.generalContainers),
          Utils.inflate(roomObject.sourceContainers)
        ), function(container){
          if(container.hits < (container.hitsMax * 0.5)){
            var job = {
              act: 'repair',
              target: container.id,
              room: roomObject.name,
              priority: 95
            }

            Utils.addIfNotExist(job, jobs)
          }
        })
      }
    })
  }
}

module.exports = JobsController

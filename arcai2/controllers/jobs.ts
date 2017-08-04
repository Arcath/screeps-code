import {Utils} from '../utils'

var JobsController = {
  // Find all jobs in the room
  jobsForRoom: function(roomObject: ObjectRoom, jobs: SODB){

    // If the room is mine
    if(roomObject.mine){

      // Create the permemant harvesting job(s)
      _.forEach(roomObject.sources, function(source){
        var job = <HarvestJob>{
          collect: 'harvest',
          source: source,
          room: roomObject.name,
          priority: 100
        }

        if(roomObject.sourceLinkMaps[source] && roomObject.coreLinks.length > 0){
          job.act = 'deliver'
          job.target = <string>roomObject.sourceLinkMaps[source]
          job.overflow = <string>roomObject.sourceContainerMaps[source]
        }

        if(roomObject.sourceContainerMaps[source] && (!roomObject.sourceLinkMaps[source] || roomObject.coreLinks.length == 0)){
          job.act = 'deliver'
          job.target = <string>roomObject.sourceContainerMaps[source]

          Utils.addWithHash(<DistroJob>{
            collect: 'distribute',
            from: roomObject.sourceContainerMaps[source],
            room: roomObject.name,
            priority: 90
          }, jobs)
        }

        Utils.addWithHash(job, jobs)
      })

      _.forEach(roomObject.coreLinks, function(link){
        if(roomObject.storage){
          Utils.addWithHash(<DistroJob>{
            collect: 'sourceCollect',
            from: link,
            priority: 90,
            act: 'deliverResource',
            resource: RESOURCE_ENERGY,
            target: roomObject.storage,
            room: roomObject.name,
            creepType: 'move',
            creepCount: 1
          }, jobs)
        }else{
          Utils.addWithHash(<DistroJob>{
            collect: 'distribute',
            from: link,
            room: roomObject.name,
            priority: 90
          }, jobs)
        }
      })

      // Create the permermant upgrade job
      Utils.addWithHash({
        collect: 'lowCollect',
        act: 'upgrade',
        room: roomObject.name,
        priority: 10
      }, jobs)
    }
  },

  energyJobs: function(rooms: SODB, jobs: SODB){
    var energyJobsProfiler = <NumberList>{
      base: Game.cpu.getUsed(),
      getRooms: 0
    }
    var myRooms = rooms.where({mine: true})

    energyJobsProfiler.getRooms = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
    Memory.stats['methodProfiles.energyJobs.getRooms'] = energyJobsProfiler.getRooms

    _.forEach(myRooms, function(room: ObjectRoom){
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

      var storage = <StructureStorage>Game.getObjectById(room.storage)

      if(storage){
        if(storage.store.energy > 300000){
          Utils.addIfNotExist(<DistroJob>{
            collect: 'distribute',
            from: room.storage,
            room: room.name,
            priority: 90
          }, jobs)
        }
      }

      energyJobsProfiler[room.name + 'storage'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'storage'] = energyJobsProfiler[room.name + 'storage']

      var labs = Utils.inflate(room.labs)
      _.forEach(labs, function(lab){
        JobsController.energyJobForBuilding(lab, 91, jobs, room.name)
      })

      energyJobsProfiler[room.name + 'labs'] = Game.cpu.getUsed() - _.sum(energyJobsProfiler)
      Memory.stats['methodProfiles.energyJobs.' + room.name + 'labs'] = energyJobsProfiler[room.name + 'labs']

      if(room.terminal){
        let terminal = <StructureTerminal>Game.getObjectById(room.terminal)

        JobsController.energyJobForBuilding(terminal, 91, jobs, room.name)

        var storage = <StructureStorage>Game.getObjectById(room.storage)

        if(storage){
          if(storage.store.energy < 300000 && terminal.store.energy > 50000){
            Utils.addIfNotExist(<DistroJob>{
              collect: 'distribute',
              from: room.terminal,
              room: room.name,
              priority: 90
            }, jobs)
          }
        }
      }
    })
  },

  energyJobForBuilding: function(building: AnyStructure, priority: number, jobs: SODB, roomName: string){
    if(!building){
      return
    }

    if(typeof building.energy != 'undefined'){
      var energy = building.energy
      var capacity = building.energyCapacity
    }else{
      var energy = _.sum(building.store!)
      var capacity = building.storeCapacity
    }

    if(building.structureType == STRUCTURE_TOWER){
      capacity = capacity! * 0.8
      if(Memory.defcon[roomName].defcon != 0){
        priority = 200
      }
    }

    if(building.structureType == STRUCTURE_TERMINAL){
      capacity = 5000
    }

    if(Memory.jobPremades[building.id]){
      var job = <ObjectJob>Memory.jobPremades[building.id]
    }else{
      var job = <ObjectJob>{
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
    var foundJob = <ObjectJob>jobs.indexLookup(<string>job.hash)

    if(Memory.defcon[roomName].defcon != 0 && building.structureType == STRUCTURE_TOWER && foundJob){
      foundJob.priority = 200
      if(foundJob.changed){ jobs.update(foundJob) }
    }else if(building.structureType == STRUCTURE_TOWER && foundJob){
      foundJob.priority = priority
      if(foundJob.changed){ jobs.update(foundJob) }
    }

    if(energy < capacity!){
      if(!foundJob){
        jobs.add(job)
      }
    }else{
      if(foundJob){
        jobs.remove(foundJob)
      }
    }
  },

  siteJobs: function(sites: SODB, jobs: SODB){
    _.forEach(sites.all(), function(site: ObjectSite){
      var job = <ObjectJob>{
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

  extractorJobs: function(rooms: SODB, jobs: SODB){
    var myRooms = rooms.where({mine: true}, {storage: {defined: true}})

    _.forEach(myRooms, function(room){
      if(room.extractors.length == 0){
        return
      }

      _.forEach(Utils.inflate(room.extractors), function(){
        var mineral = <Mineral>Game.getObjectById(room.minerals[0])

        if(mineral.mineralAmount > 0){
          var job = <ObjectJob>{
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

  repairJobs: function(rooms: SODB, jobs: SODB){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(roomObject: ObjectRoom){
      if(roomObject.rcl < 4){
        _.forEach([].concat(
          <never[]>Utils.inflate(roomObject.recycleContainers),
          <never[]>Utils.inflate(roomObject.generalContainers),
          <never[]>Utils.inflate(roomObject.sourceContainers)
        ), function(container: StructureContainer){
          if(container.hits < (container.hitsMax * 0.5)){
            var job = <ObjectJob>{
              act: 'repair',
              target: container.id,
              room: roomObject.name,
              priority: 95
            }

            Utils.addIfNotExist(job, jobs)
          }
        })
      }else{
        _.forEach([].concat(
          <never[]>Utils.inflate(roomObject.ramparts),
          <never[]>Utils.inflate(roomObject.walls)
        ), function(structure: Structure){
          if(structure.hits < (roomObject.rcl * 100000)){
            var job = {
              act: 'repair',
              target: structure.id,
              room: roomObject.name,
              priority: 40,
              collect: 'lowCollect'
            }

            Utils.addIfNotExist(job, jobs)
          }
        })
      }
    })
  }
}

module.exports = JobsController

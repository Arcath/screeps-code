import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

import {HarvesterLifetimeProcess} from '../lifetimes/harvester'
import {DistroLifetimeProcess} from '../lifetimes/distro'
import {MoveProcess} from '../creepActions/move'
import {UpgraderLifetimeProcess} from '../lifetimes/upgrader'

export class EnergyManagementProcess extends Process{
  metaData: EnergyManagementMetaData

  type = 'em'

  ensureMetaData(){
    if(!this.metaData.harvestCreeps)
      this.metaData.harvestCreeps = {}

    if(!this.metaData.distroCreeps)
      this.metaData.distroCreeps = {}

    if(!this.metaData.upgradeCreeps)
      this.metaData.upgradeCreeps = []

    if(!this.metaData.linkRequests){
      this.metaData.linkRequests = []
    }
  }

  run(){
    this.ensureMetaData()

    if(!this.kernel.data.roomData[this.metaData.roomName]){
      this.completed = true
      return
    }

    if(!this.room().controller!.my){
      this.completed = true
      return
    }

    let proc = this
    let sources = this.kernel.data.roomData[this.metaData.roomName].sources

    let safe =  true
    if(this.room().find(FIND_HOSTILE_CREEPS).length > 0){
      safe = false
    }

    _.forEach(sources, function(source){
      if(!proc.metaData.harvestCreeps[source.id])
        proc.metaData.harvestCreeps[source.id] = []

      let creepNames = Utils.clearDeadCreeps(proc.metaData.harvestCreeps[source.id])
      proc.metaData.harvestCreeps[source.id] = creepNames
      let creeps = Utils.inflateCreeps(creepNames)
      let workRate = Utils.workRate(creeps, 2)

      if(workRate < (source.energyCapacity / 300) && safe){
        let creepName = 'em-' + proc.metaData.roomName + '-' + Game.time

        let spawnRoom = proc.metaData.roomName

        if(proc.room().energyCapacityAvailable < 800 && proc.roomData().spawns.length > 0){
          let nearestRoom = Utils.nearestRoom(proc.metaData.roomName, 800)

          proc.log('nr: ' + nearestRoom)

          if(nearestRoom != ''){
            //spawnRoom = nearestRoom
          }
        }

        let spawned = Utils.spawn(
          proc.kernel,
          spawnRoom,
          'harvester',
          creepName,
          {}
        )

        if(spawned){
          proc.metaData.harvestCreeps[source.id].push(creepName)
        }
      }

      _.forEach(creeps, function(creep){
        if(!proc.kernel.hasProcess('hlf-' + creep.name)){
          proc.kernel.addProcess(HarvesterLifetimeProcess, 'hlf-' + creep.name, 49, {
            creep: creep.name,
            source: source.id
          })
        }
      })
    })

    _.forEach(this.kernel.data.roomData[this.metaData.roomName].sourceContainers, function(container){
      if(proc.metaData.distroCreeps[container.id]){
        let creep = Game.creeps[proc.metaData.distroCreeps[container.id]]

        if(!creep){
          delete proc.metaData.distroCreeps[container.id]
          return
        }
      }else{
        let creepName = 'em-m-' + proc.metaData.roomName + '-' + Game.time

        let link = <StructureLink>container.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: function(structure: Structure){
            return (structure.structureType === STRUCTURE_LINK)
          }
        })[0]

        if(safe && !link){
          let spawned = Utils.spawn(
            proc.kernel,
            proc.metaData.roomName,
            'mover',
            creepName,
            {}
          )

          if(spawned){
            proc.metaData.distroCreeps[container.id] = creepName
            proc.kernel.addProcess(DistroLifetimeProcess, 'dlp-' + creepName, 48, {
              sourceContainer: container.id,
              creep: creepName
            })
          }
        }
      }
    })

    if(this.room().storage){
      let container = this.room().storage!
      if(proc.metaData.distroCreeps[container.id]){
        let creep = Game.creeps[proc.metaData.distroCreeps[container.id]]

        if(!creep){
          delete proc.metaData.distroCreeps[container.id]
          return
        }
      }else{
        let creepName = 'em-m-' + proc.metaData.roomName + '-' + Game.time
        let spawned = Utils.spawn(
          proc.kernel,
          proc.metaData.roomName,
          'mover',
          creepName,
          {}
        )

        if(spawned){
          proc.metaData.distroCreeps[container.id] = creepName
          proc.kernel.addProcess(DistroLifetimeProcess, 'dlp-' + creepName, 48, {
            sourceContainer: container.id,
            creep: creepName
          })
        }
      }
    }

    this.metaData.upgradeCreeps = Utils.clearDeadCreeps(this.metaData.upgradeCreeps)

    if(this.metaData.upgradeCreeps.length < 2 && this.kernel.data.roomData[this.metaData.roomName].generalContainers.length > 0){
      let creepName = 'em-u-' + proc.metaData.roomName + '-' + Game.time
      let spawned = Utils.spawn(
        proc.kernel,
        proc.metaData.roomName,
        'worker',
        creepName,
        {}
      )

      if(spawned){
        this.metaData.upgradeCreeps.push(creepName)
        this.kernel.addProcess(UpgraderLifetimeProcess, 'ulf-' + creepName, 30, {
          creep: creepName
        })
      }
    }

    // Energy Movement
    if(this.roomData().coreLink){
      let creep = Game.creeps[this.metaData.linker]

      if(!creep){
        let creepName = 'em-bm-' + proc.metaData.roomName + '-' + Game.time
        let spawned = Utils.spawn(
          proc.kernel,
          proc.metaData.roomName,
          'bunkerMover',
          creepName,
          {}
        )

        if(spawned){
          this.metaData.linker = creepName
        }
      }else{
        let linkerPos = new RoomPosition(
          Memory.bunkers[this.metaData.roomName].bunker.creeps.linker.x,
          Memory.bunkers[this.metaData.roomName].bunker.creeps.linker.y,
          this.metaData.roomName
        )
        if(!creep.pos.isEqualTo(linkerPos)){
          this.kernel.addProcessIfNotExist(MoveProcess, 'move-' + creep.name, 40, {
            creep: creep.name,
            pos: {
              x: linkerPos.x,
              y: linkerPos.y,
              roomName: linkerPos.roomName
            },
            range: 0
          })
        }else{
          // Linker exists and is at the right POS.
          if(this.metaData.linkRequests.length > 0 && creep.ticksToLive > 10){
            let job = this.metaData.linkRequests[0]
            if(job.send){
              // Job wants energy sent to the target link
              switch(job.stage){
                case 0:
                  if(creep.withdraw(creep.room.storage!, RESOURCE_ENERGY) === OK){
                    job.stage = 1
                  }
                break
                case 1:
                  if(creep.transfer(this.roomData().coreLink!, RESOURCE_ENERGY) === OK){
                    job.stage = 2
                  }
                break
                case 2:
                  let link = <StructureLink>Game.getObjectById(job.link)
                  if(this.roomData().coreLink!.transferEnergy(link) === OK){
                    this.metaData.linkRequests.shift()
                  }
                break
              }
            }else{
              // Job wants target links energy sent to storage
              switch(job.stage){
                case 0:
                  let link = <StructureLink>Game.getObjectById(job.link)
                  if(link.transferEnergy(this.roomData().coreLink!) === OK){
                    job.stage = 1
                  }
                break
                case 1:
                  if(creep.withdraw(this.roomData().coreLink!, RESOURCE_ENERGY) === OK){
                    job.stage = 2
                  }
                break
                case 2:
                  if(creep.transfer(creep.room.storage!, RESOURCE_ENERGY) === OK){
                    this.metaData.linkRequests.shift()
                  }
                break
              }
            }
          }else{
            if(this.roomData().coreLink!.energy > 0){
              creep.withdraw(this.roomData().coreLink!, RESOURCE_ENERGY)
            }

            if(creep.carry.energy > 0){
              creep.transfer(creep.room.storage!, RESOURCE_ENERGY)
            }
          }
        }
      }
    }
  }
}

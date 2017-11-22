import {Bunker} from '../../lib/classes/bunker'
import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class LabManagementProcess extends Process{
  type = AOS_LAB_MANAGEMENT_PROCESS
  metaData: MetaData[AOS_LAB_MANAGEMENT_PROCESS]

  boostPriority: ResourceConstant[] = [
    'XKHO2',
    'LHO2'
  ]

  pickups: [ResourceConstant, string][] = []

  boosts: {[boost: string]: string} = {}

  run(){
    this.ensureMetaData()
    this.checkLabs()
    this.checkLevels()
    this.ensureCreep()
  }

  ensureMetaData(){
    if(!this.metaData.boostLabs){
      this.metaData.boostLabs = {}
    }

    if(!this.metaData.reactLabs){
      this.metaData.reactLabs = {}
    }
  }

  checkLabs(){
    let bunker = new Bunker(Memory.bunkers[this.metaData.roomName].bunkerBase)
    let proc = this

    _.forEach(bunker.bunkerMap.labs.boosts, function(labPos){
      if(!proc.metaData.boostLabs![labPos.x + '-' + labPos.y]){
        let looks = proc.room().lookAt(labPos.x, labPos.y)

        let lab = _.filter(looks, function(entry){
          return (entry.type === 'structure' && entry.structure && entry.structure.structureType === STRUCTURE_LAB)
        })[0]

        if(lab){
          proc.metaData.boostLabs![labPos.x + '-' + labPos.y] = lab.structure!.id
        }
      }

      if(Game.getObjectById(proc.metaData.boostLabs![labPos.x + '-' + labPos.y])){
        /*new RoomVisual(proc.metaData.roomName).circle(labPos.x, labPos.y, {
          stroke: '#9b59b6'
        })*/
      }else{
        delete proc.metaData.boostLabs![labPos.x + '-' + labPos.y]
      }
    })

    _.forEach(bunker.bunkerMap.labs.reactions, function(labPos){
      if(!proc.metaData.reactLabs![labPos.x + '-' + labPos.y]){
        let looks = proc.room().lookAt(labPos.x, labPos.y)

        let lab = _.filter(looks, function(entry){
          return (entry.type === 'structure' && entry.structure && entry.structure.structureType === STRUCTURE_LAB)
        })[0]

        if(lab){
          proc.metaData.reactLabs![labPos.x + '-' + labPos.y] = lab.structure!.id
        }
      }

      if(Game.getObjectById(proc.metaData.reactLabs![labPos.x + '-' + labPos.y])){
        /*new RoomVisual(proc.metaData.roomName).circle(labPos.x, labPos.y, {
          stroke: '#2ecc71'
        })*/
      }else{
        delete proc.metaData.reactLabs![labPos.x + '-' + labPos.y]
      }
    })
  }

  ensureCreep(){
    if(!Game.creeps[this.metaData.creep!]){
      let creepName = 'labs-' + this.metaData.roomName + '-' + Game.time
      let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'mover', creepName, {})

      if(spawned){
        this.metaData.creep = creepName
      }
    }else{
      this.runCreep(Game.creeps[this.metaData.creep!])
    }
  }

  checkLevels(){
    let i = 0
    let proc = this
    _.forEach(this.metaData.boostLabs!, function(labId){
      let boost = proc.boostPriority[i]
      let lab = <StructureLab>Game.getObjectById<StructureLab>(labId)
      proc.log(boost)
      if(boost){
        new RoomVisual(proc.metaData.roomName).text(boost, lab!.pos.x, lab!.pos.y, {color: '#9b59b6', font: 0.4})

        if(!lab.mineralType || lab.mineralAmount < lab.mineralCapacity){
          if(lab.mineralAmount < lab.mineralCapacity){
            if(proc.room().terminal){
              if(proc.room().terminal!.store[boost]){
                // Move boost to lab
                proc.log('pickup ' + boost + ' from terminal')
                proc.pickups.push([boost, lab.id])
              }else{
                // Buy boost
                let orders = Game.market.getAllOrders(function(order){
                  return (
                    order.type === ORDER_SELL
                    &&
                    order.resourceType === boost
                  )
                })

                let sorted = _.sortBy(orders, 'price')

                if(sorted[0]){
                  let result = Game.market.deal(
                    sorted[0].id,
                    (lab.mineralCapacity - lab.mineralAmount),
                    proc.metaData.roomName
                  )

                  proc.log('res: ' + result)
                }
              }
            }
          }
        }
      }

      i++
    })
  }

  runCreep(creep: Creep){
    if(!this.metaData.creepProcess){
      // No Creep Process

      this.log('creep needs process')

      if(this.pickups.length > 0 && creep.carry.energy === 0){
        if(!creep.carry[this.pickups[0][0]]){
          let procName = 'collect-' + creep.name
          this.metaData.creepPickup = this.pickups[0]

          this.kernel.addProcess(AOS_COLLECT_PROCESS, procName, this.priority - 1, {
            resource: this.pickups[0][0],
            target: this.room().terminal!.id,
            creep: creep.name
          })

          this.metaData.creepProcess = procName
        }else{
          let procName = 'deliver-' + creep.name

          this.kernel.addProcess(AOS_DELIVER_PROCESS, procName, this.priority - 1, {
            resource: this.metaData.creepPickup![0],
            target: this.metaData.creepPickup![1],
            creep: creep.name
          })

          this.metaData.creepProcess = procName
        }
      }else{
        let targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].spawns,
          <never[]>this.kernel.data.roomData[creep.room.name].extensions
        )

        let deliverTargets = _.filter(targets, function(target: DeliveryTarget){
          return (target.energy < target.energyCapacity)
        })

        if(deliverTargets.length > 0){
          if(creep.carry.energy === 0){
            let procName = 'collect-' + creep.name
            this.kernel.addProcess(AOS_COLLECT_PROCESS, procName, this.priority - 1, {
              creep: creep.name,
              target: this.room().storage!.id,
              resource: RESOURCE_ENERGY
            })

            this.metaData.creepProcess = procName
          }else{
            let target = creep.pos.findClosestByRange(deliverTargets)
            let procName = 'deliver-' + creep.name
            this.kernel.addProcess(AOS_DELIVER_PROCESS, procName, this.priority - 1, {
              creep: creep.name,
              target: target.id,
              resource: RESOURCE_ENERGY
            })

            this.metaData.creepProcess = procName
          }
        }
      }
    }else{
      if(!this.kernel.hasProcess(this.metaData.creepProcess)){
        this.metaData.creepProcess = false
      }
    }
  }
}

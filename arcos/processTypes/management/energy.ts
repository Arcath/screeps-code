import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class EnergyManagementProcess extends Process{
  metaData: MetaData[AOS_ENERGY_MANAGEMENT_PROCESS]
  type = AOS_ENERGY_MANAGEMENT_PROCESS

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

    if(!this.metaData.terminalTransfers){
      this.metaData.terminalTransfers = []
    }

    if(!this.metaData.orderLastDiscounted){
      this.metaData.orderLastDiscounted = {}
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

    /** If there are no enemies outside the bunker safe will be true */
    let safe =  true
    if(this.room().find(FIND_HOSTILE_CREEPS).length > 0 && this.room().controller!.safeMode === undefined){
      safe = false
    }

    _.forEach(sources, function(source){
      if(!proc.metaData.harvestCreeps![source.id])
        proc.metaData.harvestCreeps![source.id] = []

      let creepNames = Utils.clearDeadCreeps(proc.metaData.harvestCreeps![source.id])
      proc.metaData.harvestCreeps![source.id] = creepNames
      let creeps = Utils.inflateCreeps(creepNames)
      let workRate = Utils.workRate(creeps, 2)

      if(workRate < (source.energyCapacity / 300) && safe){
        let creepName = 'em-' + proc.metaData.roomName + '-' + Game.time

        let spawnRoom = proc.metaData.roomName

        /*if(proc.room().energyCapacityAvailable < 800 && proc.roomData().spawns.length > 0){
          let nearestRoom = Utils.nearestRoom(proc.metaData.roomName, 800, 5)

          if(nearestRoom != ''){
            spawnRoom = nearestRoom
          }
        }*/

        let spawned = Utils.spawn(
          proc.kernel,
          spawnRoom,
          'harvester',
          creepName,
          {}
        )

        if(spawned){
          proc.metaData.harvestCreeps![source.id].push(creepName)
        }
      }

      _.forEach(creeps, function(creep){
        if(!proc.kernel.hasProcess('hlf-' + creep.name)){
          proc.kernel.addProcess(AOS_HARVESTER_LIFETIME_PROCESS, 'hlf-' + creep.name, 49, {
            creep: creep.name,
            source: source.id
          })
        }
      })
    })

    _.forEach(this.kernel.data.roomData[this.metaData.roomName].sourceContainers, function(container){
      if(proc.metaData.distroCreeps![container.id]){
        let creep = Game.creeps[proc.metaData.distroCreeps![container.id]]

        if(!creep){
          delete proc.metaData.distroCreeps![container.id]
          return
        }
      }else{
        let creepName = 'em-m-' + proc.metaData.roomName + '-' + Game.time

        let link = <StructureLink>container.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: function(structure: Structure){
            return (structure.structureType === STRUCTURE_LINK)
          }
        })[0]

        let source = <Source>container.pos.findInRange(FIND_SOURCES, 1)[0]

        let harvesters = proc.metaData.harvestCreeps![source.id]

        if(safe && !link && harvesters.length > 0){
          let spawned = Utils.spawn(
            proc.kernel,
            proc.metaData.roomName,
            'mover',
            creepName,
            {}
          )

          if(spawned){
            proc.metaData.distroCreeps![container.id] = creepName
            proc.kernel.addProcess(AOS_DISTRO_LIFETIME_PROCESS, 'dlp-' + creepName, 48, {
              sourceContainer: container.id,
              creep: creepName
            })
          }
        }
      }
    })

    if(this.room().storage){
      let container = this.room().storage!
      if(proc.metaData.distroCreeps![container.id]){
        let creep = Game.creeps[proc.metaData.distroCreeps![container.id]]

        if(!creep){
          delete proc.metaData.distroCreeps![container.id]
          return
        }
      }else{
        let creepName = 'em-m-' + proc.metaData.roomName + '-' + Game.time

        let spawnRoom = proc.metaData.roomName
        if(this.room().energyAvailable < 1000){
          this.log('remote spawn')

          let nearest = Utils.nearestRoom(proc.metaData.roomName, 1000, 10)
          if(nearest){
            this.log('new nearest: ' + nearest)
            spawnRoom = nearest
          }
        }

        let spawned = Utils.spawn(
          proc.kernel,
          spawnRoom,
          'mover',
          creepName,
          {}
        )

        if(spawned){
          proc.metaData.distroCreeps![container.id] = creepName
          proc.kernel.addProcess(AOS_DISTRO_LIFETIME_PROCESS, 'dlp-' + creepName, 48, {
            sourceContainer: container.id,
            creep: creepName
          })
        }
      }
    }

    this.metaData.upgradeCreeps = Utils.clearDeadCreeps(this.metaData.upgradeCreeps!)

    if(this.metaData.upgradeCreeps.length < 2 && this.kernel.data.roomData[this.metaData.roomName].generalContainers.length > 0){
      let creepName = 'em-u-' + proc.metaData.roomName + '-' + Game.time
      let spawned = Utils.spawn(
        proc.kernel,
        proc.metaData.roomName,
        'upgrader',
        creepName,
        {}
      )

      if(spawned){
        this.metaData.upgradeCreeps.push(creepName)
        this.kernel.addProcess(AOS_UPGRADER_LIFETIME_PROCESS, 'ulf-' + creepName, 30, {
          creep: creepName
        })
      }
    }

    // Energy Movement
    if(this.roomData().coreLink){
      let creep = Game.creeps[this.metaData.linker!]

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
          this.kernel.addProcessIfNotExist(AOS_MOVE_PROCESS, 'move-' + creep.name, 40, {
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
          if(this.metaData.linkRequests!.length > 0 && creep.ticksToLive > 10){
            let job = this.metaData.linkRequests![0]
            if(job.send){
              // Job wants energy sent to the target link
              switch(job.stage){
                case 0:
                  creep.say('S > C (O)')
                  creep.withdraw(creep.room.storage!, RESOURCE_ENERGY)
                  job.stage = 1
                break
                case 1:
                  creep.say('C > CL (O)')
                  creep.transfer(this.roomData().coreLink!, RESOURCE_ENERGY)
                  job.stage = 2
                break
                case 2:
                  creep.say('CL > L (O)')
                  let link = <StructureLink>Game.getObjectById(job.link)
                  this.roomData().coreLink!.transferEnergy(link)
                  job.stage = 3
                break
                case 3:
                  creep.say('CL > C (O)')
                  creep.withdraw(this.roomData().coreLink!, RESOURCE_ENERGY)
                  job.stage = 4

                break
                case 4:
                  creep.say('C > S (O)')
                  creep.transfer(creep.room.storage!, RESOURCE_ENERGY)
                  this.metaData.linkRequests!.shift()
                break
              }
            }else{
              // Job wants target links energy sent to storage
              switch(job.stage){
                case 0:
                  creep.say('L > CL (I)')
                  let link = <StructureLink>Game.getObjectById(job.link)
                  link.transferEnergy(this.roomData().coreLink!)
                  job.stage = 1
                break
                case 1:
                  creep.say('CL > C (I)')
                  creep.withdraw(this.roomData().coreLink!, RESOURCE_ENERGY)
                  job.stage = 2
                break
                case 2:
                  creep.say('C > S (I)')
                  creep.transfer(creep.room.storage!, RESOURCE_ENERGY)
                  this.metaData.linkRequests!.shift()
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

    // Check Energy and maybe buy it from the market
    if(this.room().terminal){
      if(this.room().terminal!.store.energy < 5000){
        let matches = _.filter(this.metaData.terminalTransfers!, function(transfer){
          return (transfer.id === 'terminalRefill')
        })

        if(matches.length === 0){
          this.metaData.terminalTransfers!.push({
            id: 'terminalRefill',
            stage: 0,
            resource: RESOURCE_ENERGY,
            in: true,
            count: 5000 - this.room().terminal!.store.energy,
            onComplete: false
          })
        }
      }

      // Buy Energy if needed
      let needOrder = false
      if(this.room().storage!.store.energy < 100000){
        needOrder = true
      }

      let roomsWithEnergy = _.filter(Game.rooms, function(room){
        return (
          room.controller
          &&
          room.controller.my
          &&
          room.storage
          &&
          room.storage.store.energy > 200000
        )
      })

      let energyOrder

      if(roomsWithEnergy.length > 0 && needOrder){
        let rooms = _.sortBy(roomsWithEnergy, function(room){
          return Game.map.getRoomLinearDistance(proc.metaData.roomName, room.name)
        })

        let sourceRoom = rooms[0]

        let sourceRoomProc = this.kernel.getProcess(AOS_ENERGY_MANAGEMENT_PROCESS, 'em-' + sourceRoom.name)

        let transfer: any = false

        if(sourceRoomProc){
          transfer = _.filter(sourceRoomProc.metaData.terminalTransfers!, function(transfer){
            return (transfer.id === 'send-' + proc.metaData.roomName)
          })[0]
        }

        if(!transfer && sourceRoomProc){
          sourceRoomProc.metaData.terminalTransfers!.push({
            id: 'send-' + this.metaData.roomName,
            in: true,
            count: 100000,
            resource: RESOURCE_ENERGY,
            stage: 0,
            onComplete: 'send-100000'
          })
        }
      }else{
        energyOrder = _.filter(Game.market.orders, function(order){
          return (
            order.type === ORDER_BUY
            &&
            order.resourceType === RESOURCE_ENERGY
            &&
            order.roomName === proc.metaData.roomName
          )
        })[0]

        if(!energyOrder && needOrder){
          let orders = _.filter(Game.market.getAllOrders(), function(order){
            return (
              order.type === ORDER_BUY
              &&
              order.resourceType === RESOURCE_ENERGY
            )
          })

          orders = _.sortBy(orders, 'price').slice(10)

          let price = _.sum(<never[]>orders, 'price') / orders.length

          if(price < 0.01){
            price = price * 1.2
          }else{
            price = price * 1.05
          }

          let qty = 100000 - this.room().storage!.store.energy

          //this.log('buy ' + qty + ' for ' + price + ' (' + (qty*price) + ')')

          Game.market.createOrder(ORDER_BUY, RESOURCE_ENERGY, price, qty, this.metaData.roomName)
        }
      }


      if(energyOrder){
        if(
          (energyOrder.remainingAmount + (this.room().terminal!.store.energy - 5000))
          <
          (100000 - this.room().storage!.store.energy)
        ){
          let diff = (100000 - this.room().storage!.store.energy) - (energyOrder.remainingAmount + (this.room().terminal!.store.energy - 5000))
          Game.market.extendOrder(energyOrder.id, diff)
        }

        let lastTransaction = _.filter(Game.market.incomingTransactions, function(transaction){
          return (transaction.to === proc.metaData.roomName)
        })[0]

        if(lastTransaction && lastTransaction.time > (Game.time - 30)){
          let transfers = _.filter(this.metaData.terminalTransfers!, function(transfer){
            return (transfer.id === lastTransaction.transactionId)
          })

          if(transfers.length === 0){
            this.metaData.terminalTransfers!.push({
              id: lastTransaction.transactionId,
              in: false,
              count: lastTransaction.amount,
              stage: 0,
              resource: RESOURCE_ENERGY,
              onComplete: false
            })
          }
        }
      }

      _.forEach(Object.keys(this.room().storage!.store), function(resource: ResourceConstant){
        if(resource != RESOURCE_ENERGY){
          if(proc.room().storage!.store[resource]! > 1000){
            let matches = _.filter(proc.metaData.terminalTransfers!, function(transfer){
              return (transfer.id === 'sell-' + resource)
            })

            if(matches.length === 0){
              proc.metaData.terminalTransfers!.push({
                id: 'sell-' + resource,
                in: true,
                count: proc.room().storage!.store[resource]! - 1000,
                stage: 0,
                resource: resource,
                onComplete: false
              })
            }
          }
        }
      })

      // Refiller Creep
      let creep = Game.creeps[this.metaData.terminator!]

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
          this.metaData.terminator = creepName
        }
      }else{
        let terminatorPos = new RoomPosition(
          Memory.bunkers[this.metaData.roomName].bunker.creeps.terminator.x,
          Memory.bunkers[this.metaData.roomName].bunker.creeps.terminator.y,
          this.metaData.roomName
        )
        if(!creep.pos.isEqualTo(terminatorPos)){
          this.kernel.addProcessIfNotExist(AOS_MOVE_PROCESS, 'move-' + creep.name, 40, {
            creep: creep.name,
            pos: {
              x: terminatorPos.x,
              y: terminatorPos.y,
              roomName: terminatorPos.roomName
            },
            range: 0
          })
        }else{
          // Move resources in an out of the terminal
          let job = this.metaData.terminalTransfers![0]
          if(job && creep.ticksToLive > 10){
            if(job.in){
              // Move resource into terminal
              switch(job.stage){
                case 0:
                  creep.say('S > C (I)')
                  creep.withdraw(this.room().storage!, job.resource, _.min([job.count, creep.carryCapacity]))
                  job.stage = 1
                break
                case 1:
                  if(creep.carry[job.resource] === undefined){
                    creep.say('oops')
                    this.metaData.terminalTransfers!.shift()
                  }else{
                    creep.say('C > T (I)')
                    if(creep.carry[job.resource]){
                      job.count = job.count - creep.carry[job.resource]!
                    }
                    creep.transfer(this.room().terminal!, job.resource)

                    if(job.count <= 0){
                      if(job.onComplete){
                        job.stage = 2
                      }else{
                        this.metaData.terminalTransfers!.shift()
                      }
                    }else{
                      job.stage = 0
                    }
                  }
                break
                case 2:
                  let onComplete = <string>job.onComplete
                  let action = onComplete.split('-')[0]
                  let amount = parseInt(onComplete.split('-')[1])

                  switch(action){
                    case 'send':
                      let targetRoom = job.id.split('-')[1]
                      this.log('send ' + amount + ' to ' + targetRoom + '(' + Game.market.calcTransactionCost(100000, this.metaData.roomName, targetRoom) + ')')

                      this.log('send code resp: ' + this.room().terminal!.send(job.resource, amount, targetRoom))
                      let targetProc = <EnergyManagementProcess>this.kernel.getProcessByName('em-' + targetRoom)
                      targetProc.metaData.terminalTransfers!.push({
                        id: 'recv-' + this.metaData.roomName,
                        in: false,
                        resource: job.resource,
                        count: amount,
                        onComplete: false,
                        stage: 0
                      })

                      this.metaData.terminalTransfers!.shift()
                    break
                  }
                break
              }
            }else{
              // Move resource out of terminal
              switch(job.stage){
                case 0:
                  creep.say('T > C (O)')
                  creep.withdraw(this.room().terminal!, job.resource, _.min([job.count, creep.carryCapacity]))

                  if(creep.carry[job.resource]){
                    job.count = job.count - creep.carry[job.resource]!
                  }

                  job.stage = 1
                break
                case 1:
                  if(creep.carry[job.resource] === undefined || creep.carry[job.resource] === 0){
                    creep.say('oops')
                    this.metaData.terminalTransfers!.shift()
                  }else{
                    creep.say('C > S (O)')
                    creep.transfer(this.room().storage!, job.resource)

                    if(job.count <= 0){
                      this.metaData.terminalTransfers!.shift()
                    }else{
                      job.stage = 0
                    }
                  }
                break
              }
            }
          }
        }
      }

      _.forEach(Object.keys(this.room().terminal!.store), function(resource: ResourceConstant){
        if(resource != RESOURCE_ENERGY){
          let resourceOrders = _.filter(Game.market.orders, function(order){
            return (order.resourceType === resource)
          })

          if(resourceOrders.length > 0){
            let order = resourceOrders[0]

            if(order.roomName != proc.metaData.roomName){
              proc.room().terminal!.send(resource, proc.room().terminal!.store[resource]!, order.roomName!)
            }else{
              if(order.remainingAmount < proc.room().terminal!.store[resource]!){
                Game.market.extendOrder(
                  order.id,
                  (proc.room().terminal!.store[resource]! - order.remainingAmount)
                )
              }

              let lastDiscouted: number

              if(proc.metaData.orderLastDiscounted![order.id]){
                lastDiscouted = proc.metaData.orderLastDiscounted![order.id]
              }else{
                lastDiscouted = 0
              }

              if(order.amount >= (lastDiscouted + 1000)){
                let newPrice = order.price * 0.98

                proc.log(order.amount + ' is over ' + (lastDiscouted + 1000) + ' discount ' + order.price + ' to ' + newPrice)

                Game.market.changeOrderPrice(order.id, newPrice)

                proc.metaData.orderLastDiscounted![order.id] = order.amount
              }
            }
          }else{
            let orders = _.filter(Game.market.getAllOrders(), function(order){
              return (order.resourceType === resource && order.type === ORDER_SELL)
            })

            orders = _.sortBy(orders, 'price').reverse().slice(10)

            let price = _.sum(<never[]>orders, 'price') / orders.length
            //proc.log('sell ' + resource + ' for ' + price)
            Game.market.createOrder(ORDER_SELL, resource, price, proc.room().terminal!.store[resource]!, proc.metaData.roomName)
          }
        }
      })
    }

    let roomOrders = _.filter(Game.market.orders, function(order){
      return order.roomName === proc.metaData.roomName
    })

    if(!proc.room().terminal && roomOrders.length > 0){
      proc.log('has orders but no terminal')
    }

    _.forEach(roomOrders, function(order){
      if(order.remainingAmount === 0){
        Game.market.cancelOrder(order.id)
      }
    })

    // Courrier
    if(this.room().storage && this.room().storage!.store.energy > 50000 && !this.roomData().upgraderLink){
      let courrier = Game.creeps[this.metaData.courrier!]

      if(!courrier && safe){
        let creepName = 'em-c-' +this.metaData.roomName + '-' + Game.time

        let spawned = Utils.spawn(
          this.kernel,
          this.metaData.roomName,
          'mover',
          creepName,
          {}
        )

        if(spawned){
          this.kernel.addProcess(AOS_COURRIER_LIFETIME_PROCESS, 'courrierLifetime-' + creepName, 60, {
            creep: creepName,
            roomName: this.metaData.roomName
          })

          this.metaData.courrier = creepName
        }
      }
    }
  }
}

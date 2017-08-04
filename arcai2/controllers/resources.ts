import {Utils} from '../utils'

var ResourceController = {
  run: function(rooms: SODB, jobs: SODB){
    var resourceRooms = <ObjectRoom[]>rooms.where({mine: true}, {rcl: {gte: 6}})

    _.forEach(resourceRooms, function(roomObject){
      var room = Game.rooms[roomObject.name]

      if(room.storage){
        if(room.terminal){
          if(room.storage.store.energy > 500000 && room.terminal.store.energy < 150000){
            var job = {
              collect: 'supply',
              resource: RESOURCE_ENERGY,
              from: room.storage.id,
              act: 'deliverResource',
              target: room.terminal.id,
              room: room.name,
              priority: 30
            }

            Utils.addIfNotExist(job, jobs)
          }

          if(roomObject.labs.length > 0){
            _.forEach(Object.keys(Memory.labAssignments[room.name]), function(resource){
              var labs = Utils.inflate(<SerializedLabs>Memory.labAssignments[room.name][resource])

              _.forEach(labs, function(lab){
                if(lab.mineralAmount < lab.mineralCapacity){
                  if(room.storage!.store[resource]){
                    var job = {
                      collect: 'supply',
                      resource: resource,
                      from: room.storage!.id,
                      act: 'deliverResource',
                      target: lab.id,
                      room: room.name,
                      priority: 30
                    }

                    Utils.addIfNotExist(job, jobs)
                  }else if(room.terminal!.store[resource]){
                    var job = {
                      collect: 'supply',
                      resource: resource,
                      from: room.terminal!.id,
                      act: 'deliverResource',
                      target: lab.id,
                      room: room.name,
                      priority: 30
                    }

                    Utils.addIfNotExist(job, jobs)
                  }else{
                    Utils.buyResource(room.name, resource)
                  }
                }
              })
            })
          }

          _.forEach(Object.keys(room.storage.store), function(resource){
            if(resource != RESOURCE_ENERGY && room.storage!.store[resource]! >= 10000){
              let job = {
                collect: 'supply',
                resource: resource,
                from: room.storage!.id,
                act: 'deliverResource',
                target: room.terminal!.id,
                room: room.name,
                priority: 30
              }

              Utils.addIfNotExist(job, jobs)
            }
          })
        }

        var recycleContainers = <StructureContainer[]>Utils.inflate(roomObject.recycleContainers)

        _.forEach(recycleContainers, function(container){
          if(Object.keys(container.store).length > 1){
            _.forEach(Object.keys(container.store), function(resource){
              if(resource != RESOURCE_ENERGY || (resource == RESOURCE_ENERGY && container.store[resource] >= 1000)){
                var job = {
                  collect: 'supply',
                  resource: resource,
                  from: container.id,
                  act: 'deliverResource',
                  target: room.storage!.id,
                  room: roomObject.name,
                  priority: 40
                }

                Utils.addIfNotExist(job, jobs)
              }
            })
          }
        })
      }
    })
  }
}

module.exports = ResourceController

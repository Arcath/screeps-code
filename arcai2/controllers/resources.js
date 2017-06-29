const Utils = require('../utils')

var ResourceController = {
  run: function(rooms, jobs){
    var resourceRooms = rooms.where({mine: true}, {rcl: {gte: 6}})

    _.forEach(resourceRooms, function(roomObject){
      var room = Game.rooms[roomObject.name]

      if(room.storage){
        if(room.terminal){
          if(room.terminal.store.energy < 3000){
            var job = {
              collect: 'supply',
              resource: RESOURCE_ENERGY,
              from: room.storage.id,
              act: 'deliverResource',
              target: room.terminal.id,
              room: roomObject.name,
              priority: 30
            }

            Utils.addIfNotExist(job, jobs)
          }
        }

        var recycleContainers = Utils.inflate(roomObject.recycleContainers)

        _.forEach(recycleContainers, function(container){
          if(Object.keys(container.store).length > 1){
            _.forEach(Object.keys(container.store), function(resource){
              if(resource != RESOURCE_ENERGY){
                var job = {
                  collect: 'supply',
                  resource: resource,
                  from: container.id,
                  act: 'deliverResource',
                  target: room.storage.id,
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

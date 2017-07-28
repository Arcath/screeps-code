import {Utils} from '../utils'

module.exports = {
  run: function(rooms: SODB){
    var myRooms = <ObjectRoom[]>rooms.where({mine: true})

    _.forEach(myRooms, function(room){
      if(room.coreLinks.length != 0 && (room.sourceLinks.length != 0 || room.exitLinks.length != 0)){
        var coreLinks = Utils.inflate(room.coreLinks)
        var sourceLinks = Utils.inflate(room.sourceLinks)
        var exitLinks = Utils.inflate(room.exitLinks)

        _.forEach(coreLinks, function(coreLink){
          if(coreLink.energy < coreLink.energyCapacity){
            var needed = coreLink.energyCapacity - coreLink.energy - 30

            _.forEach(sourceLinks, function(sourceLink){
              if(needed > 0){
                var energy = sourceLink.energy
                sourceLink.transferEnergy(coreLink)

                needed = needed - energy
              }
            })

            _.forEach(exitLinks, function(exitLink){
              if(needed > 0){
                var energy = exitLink.energy
                exitLink.transferEnergy(coreLink)

                needed = needed - energy
              }
            })
          }
        })
      }
    })
  }
}

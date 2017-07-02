const Utils = require('../utils')

module.exports = {
  run: function(rooms){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(room){
      if(room.coreLinks.length != 0 && room.sourceLinks.length != 0){
        var coreLinks = Utils.inflate(room.coreLinks)
        var sourceLinks = Utils.inflate(room.sourceLinks)

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
          }
        })
      }
    })
  }
}

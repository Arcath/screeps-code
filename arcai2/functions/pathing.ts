module.exports = {
  buildCostMatrix: function(flags: SODB){
    var pathingFlags = flags.where({color: COLOR_ORANGE}, {secondaryColor: COLOR_WHITE})

    _.forEach(pathingFlags, function(flagObject){
      var flag = Game.flags[flagObject.name]

      if(!flag.room){
        // TODO request vision using an observer when I reach RCL8
      }else{
        var matrix = new PathFinder.CostMatrix

        var sourceKeepers = _.filter(flag.room.find(FIND_STRUCTURES), function(structure: Structure){
          return (structure.structureType == STRUCTURE_KEEPER_LAIR)
        })

        if(sourceKeepers.length > 0){
          var sources = flag.room.find(FIND_SOURCES)
          var minerals = flag.room.find(FIND_MINERALS)

          var avoids = [].concat(<never[]>sources, <never[]>minerals)

          _.forEach(avoids, function(avoid: RoomObject){
            var x = avoid.pos.x - 5
            var yStart = avoid.pos.y - 5

            while(x <= avoid.pos.x + 5){
              var y = yStart

              while(y <= avoid.pos.y + 5){
                matrix.set(x, y, 20)
                y += 1
              }
              x += 1
            }
          })
        }

        Memory.costMatrix[flag.room.name] = matrix.serialize()
        flag.remove()
      }
    })
  }
}

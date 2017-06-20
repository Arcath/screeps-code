var Utils = require('../utils')

var BuildingsController = {
  run: function(rooms, jobs, flags){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(room){
      var roomFlags = flags.where({room: room.name})

      if(room.rcl > 0){
        BuildingsController.createPaths(room, roomFlags, flags)
      }
    })
  },

  createPaths: function(room, roomFlags, flags){
    var spawnPathFlags = flags.refineSearch(roomFlags, {color: COLOR_ORANGE}, {secondaryColor: COLOR_ORANGE})

    _.forEach(spawnPathFlags, function(flagObject){
      var flag = Game.flags[flagObject.name]

      flag.memory = {}

      if(!flag.memory.sites){
        flag.memory.sites = []
        _.forEach(Utils.inflate(room.spawns), function(spawn){
          var path = PathFinder.search(spawn.pos, flag.pos)

          _.forEach(path.path, function(point){
            flag.memory.sites.push([point.x, point.y, point.roomName])
          })
        })

        _.forEach(flag.memory.sites, function(point){
          var pos = new RoomPosition(point[0], point[1], point[2])

          Game.rooms[point[2]].createConstructionSite(pos, STRUCTURE_ROAD)
        })
      }
    })
  }
}

module.exports = BuildingsController

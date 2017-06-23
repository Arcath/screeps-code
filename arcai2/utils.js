var SHA1 = require('crypto-js/sha1')

module.exports = {
  inflate: function(ids){
    return _.transform(ids, function(result, id){
      result.push(Game.getObjectById(id))
    })
  },

  deflate: function(objects){
    return _.transform(objects, function(result, object){
      result.push(object.id)
    })
  },

  hash: function(object){
    var string = JSON.stringify(object)
    var hash = SHA1(string)

    return hash.toString()
  },

  addWithHash: function(object, database){
    // Create a Hash of the object
    var hash = this.hash(object)

    // Assign the hash to the object
    object.hash = hash

    var jobs = database.where({hash: hash})
    console.log(jobs.length + ' entries with hash ' + hash)

    // Add the object to the database
    database.add(object)
  },

  findCreepsForJob: function(job){
    return _.filter(Game.creeps, function(creep){
      return (creep.memory.jobHash == job.hash)
    })
  },

  findCreepForJob: function(job){
    return this.findCreepsForJob(job)[0]
  },

  jobForTarget: function(target, jobs){
    return jobs.findOne({target: target.id})
  },

  workRate: function(creeps){
    var workRate = 0

    _.forEach(creeps, function(creep){
      _.forEach(creep.body, function(part){
        if(part.type == WORK){
          workRate += 2
        }
      })
    })

    return workRate
  },

  myNearestRoom: function(roomName, rooms){
    var myRooms = rooms.where({mine: true}, {spawnable: true})

    var nearestRoom
    var nearestRoomDistance = 999

    _.forEach(myRooms, function(room){
      var distance = Game.map.getRoomLinearDistance(roomName, room.name)


      if(distance < nearestRoomDistance){
        nearestRoomDistance = distance
        nearestRoom = room.name
      }
    })

    return nearestRoom
  }
}

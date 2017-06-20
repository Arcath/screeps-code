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
  }
}

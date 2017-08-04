import {Utils} from '../utils'

let LabsController = {
  run: function(rooms: SODB){
    if(!Memory.labAssignments)
      Memory.labAssignments = {}

    _.forEach(rooms.where({mine: true}), LabsController.labsInRoom)
  },

  labsInRoom: function(roomObject: ObjectRoom){
    if(!Memory.labAssignments[roomObject.name])
      Memory.labAssignments[roomObject.name] = {}

    let labsPerResource: any = {}

    if(Game.flags[roomObject.name + '-' + RESOURCE_CATALYZED_GHODIUM_ACID]){
      let flag = Game.flags[roomObject.name + '-' + RESOURCE_CATALYZED_GHODIUM_ACID]

      let lab = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), function(structure: Structure){
        return (structure.structureType == STRUCTURE_LAB)
      })[0]

      if(lab){
        labsPerResource[RESOURCE_CATALYZED_GHODIUM_ACID] = [lab]
      }
    }

    let serialized: any = {}

    _.forEach(Object.keys(labsPerResource), function(resource){
      serialized[resource] = Utils.deflate(labsPerResource[resource])
    })

    Memory.labAssignments[roomObject.name] = serialized
  }
}

module.exports = LabsController

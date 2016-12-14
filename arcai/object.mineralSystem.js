module.exports = class{
  constructor(room){
    this.room = room
    this.create = {
      reagent: [
        RESOURCE_HYDROGEN,
        RESOURCE_GHODIUM
      ],
      output: RESOURCE_GHODIUM_HYDRIDE
    }

    this.react = true
  }

  run(){
    if(!Memory.arc[this.room.name].mineralLabs){
      Memory.arc[this.room.name].mineralLabs = {
        reagentLabs: [this.room.labs[1].id, this.room.labs[2].id],
        outputLab : this.room.labs[0].id
      }

      this.labs = {
        reagentLabs: [this.room.labs[1], this.room.labs[2]],
        outputLab: this.room.labs[0]
      }
    }else{
      this.labs = {
        reagentLabs: [
          Game.getObjectById(Memory.arc[this.room.name].mineralLabs.reagentLabs[0]),
          Game.getObjectById(Memory.arc[this.room.name].mineralLabs.reagentLabs[1])
        ],
        outputLab: Game.getObjectById(Memory.arc[this.room.name].mineralLabs.outputLab)
      }
    }

    for(var i in this.labs.reagentLabs){
      var lab = this.labs.reagentLabs[i]

      this.getSuppliesFor(lab, this.create.reagent[i])
    }

    this.labs.outputLab.runReaction(this.labs.reagentLabs[0], this.labs.reagentLabs[1])

    if(this.labs.outputLab.mineralAmount > 10){
      var creeps = _.filter(this.room.creeps, function(creep){
        return (creep.memory.action == 'upgrade')
      })

      for(var i in creeps){
        var creep = creeps[i]

        //this.labs.outputLab.boostCreep(creep)
      }
    }
  }

  getSuppliesFor(lab, resource){
    if(lab.mineralAmount < (lab.mineralCapacity * 0.9)){
      var foundInRoom = false
      for(var i in this.room.minerals){
        if(this.room.minerals[i].mineralType == resource){
          foundInRoom = true
        }
      }

      for(var i in this.room.extractorContainers){
        var container = this.room.extractorContainers[i]

        if(container.store[resource]){
          this.room.createSupplyJob({
            source: container.id,
            dest: lab.id,
            resource: resource
          })
        }
      }

      if(!foundInRoom && this.room.room.terminal){
        this.room.buyResource(resource, 3000)

        for(var res in this.room.room.terminal.store){
          if(res == resource){
            this.room.createSupplyJob({
              source: this.room.room.terminal.id,
              dest: lab.id,
              resource: resource
            })
          }
        }
      }
    }
  }
}

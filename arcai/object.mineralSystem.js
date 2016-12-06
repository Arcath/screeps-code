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
  }
}

import {Kernel} from './kernel'

export class Process{
  /** Has the process been run this tick? */
  ticked = false
  /** Is the process complete? If it is it will not be passed to the next tick */
  completed = false
  /** The processes priority. The higher the priority the more likely it will be run this tick. */
  priority: number
  /** The name of the process. Should be unique */
  name: string
  /** An object of meta data. Should be serializeable into JSON */
  metaData: any
  /** Process type, used to re-infalte on the next tick */
  type: string
  /** The kernel that started this process. */
  kernel: Kernel
  /**
  Should the process be suspended?

  If `false` the process will be run.
  If a number the suspend counter will be reduced until it reaches 0 and then will be set back to false.
  If a string this process is suspended untill the named process is finished.
  */
  suspend: string | number | boolean = false

  /** Creates a new Process from the entry supplied */
  constructor(entry: SerializedProcess, kernel: Kernel){
    this.priority = entry.priority
    this.name = entry.name
    this.metaData = entry.metaData
    this.kernel = kernel
    this.suspend = entry.suspend
  }

  /** Run the process */
  run(kernel: Kernel){
    console.log('Process ' + this.name + ' did not have a type.')
    this.completed = true
    kernel.noop()
  }

  /** Serialize this process */
  serialize(){
    return <SerializedProcess>{
      priority: this.priority,
      name: this.name,
      metaData: this.metaData,
      type: this.type,
      suspend: this.suspend
    }
  }
}

export class LifetimeProcess extends Process{
  /** Returns the creep if it is alive, or completes the process */
  getCreep(): Creep | false{
    if(Game.creeps[this.metaData.creep]){
      return Game.creeps[this.metaData.creep]
    }else{
      this.completed = true
      return false
    }
  }
}

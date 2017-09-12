import {Process} from '../../os/process'

export class SuspensionProcess extends Process{
  type = 'suspend'
  /** Run the SuspensionProcess process */
  run(){
    let proc = this
    _.forEach(proc.kernel.processTable, function(process){
      if(!process.suspend === false){
        if(typeof process.suspend === 'number' && proc.metaData.master){
          process.suspend -= 1
          if(process.suspend === 0){
            process.suspend = false
          }
        }

        if(typeof process.suspend === 'string'){
          if(
            !process.kernel.hasProcess(process.suspend)
            ||
            process.kernel.getProcessByName(process.suspend).completed
          ){
            process.suspend = false
          }
        }
      }
    })

    this.completed = true
  }
}

import {Process} from '../../os/process'

export class LoanDataProcess extends Process{
  type = AOS_LOAN_DATA_PROCESS
  metaData: MetaData[AOS_LOAN_DATA_PROCESS]

  run(){
    if(this.metaData.state === STATE_LOAD){
      RawMemory.setActiveForeignSegment('LeagueOfAutomatedNations', 99)
      this.metaData.state = STATE_READ
    }else if(this.metaData.state === STATE_READ){
      Memory.loanData = JSON.parse(RawMemory.foreignSegment.data)
      this.metaData.state = STATE_LOAD
      this.suspend = 100
    }
  }
}

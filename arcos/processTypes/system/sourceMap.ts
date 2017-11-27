import {Process} from '../../os/process'
import {SourceMapConsumer} from "source-map"

const consumer = new SourceMapConsumer(require('main.js.map'))

export class SourceMapProcess extends Process{
  type: AOS_SOURCE_MAP_PROCESS = AOS_SOURCE_MAP_PROCESS
  metaData: MetaData[AOS_SOURCE_MAP_PROCESS]

  run(){
    this.completed = true // We don't want this process to ever pass into another tick

    console.log('<span style="color:#e74c3c">[ERROR]</span> Process ' + this.metaData.processName)

    const stack: string = this.metaData.error instanceof Error ? this.metaData.error.stack as string : this.metaData.error;

    const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm
    let match: RegExpExecArray | null
    let outStack = this.metaData.error.toString()

    while(match = re.exec(stack)){
      if(match[2] === 'main'){
        const pos = consumer.originalPositionFor({
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        })

        if(pos.line != null){
          if (pos.name) {
            outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`
          } else {
            if (match[1]) {
              // no original source file name known - use file name from given trace
              outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`
            } else {
              // no original source file name known or in given trace - omit name
              outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`
            }
          }
        } else {
          // no known position
          break;
        }
      } else {
        // no more parseable lines
        break;
      }
    }

    console.log(outStack)
  }
}
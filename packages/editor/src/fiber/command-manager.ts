/*
    Take from https://github.com/mozilla/Spoke/blob/master/src/editor/History.js
*/

export abstract class AbstractCommand<Context = unknown> {
    id: number = -1
    context: Context
    constructor ( context: Context ) {
        this.context = context
    }
    abstract undo(): void
    abstract execute(isRedo?: boolean): void
    shouldUpdate( command: AbstractCommand ) {
        return false
    }
    update( command: AbstractCommand ) {

    }
}

export class CommandHistory {

    undos: AbstractCommand[] = []

    redos: AbstractCommand[] = []

    idCounter: number = 0

    lastCommandTime: Date = new Date()

    execute ( command: AbstractCommand ) {
        const lastCommand = this.undos[this.undos.length - 1]
        const timeDifference = new Date().getTime() - this.lastCommandTime.getTime()

        if ( lastCommand && timeDifference < 1000 && lastCommand.shouldUpdate( command )) {
            lastCommand.update( command )
            command = lastCommand
        } else {
            this.undos.push( command )
            command.id = ++this.idCounter
            command.execute()
        }

        this.lastCommandTime = new Date();

        this.redos = []

        return command
    }

    canUndo ( ) {
        return this.undos.length > 0
    }

    undo ( ) {
      if ( this.canUndo() ) {
          const command = this.undos.pop()
          if ( command ) {
            command?.undo()
            this.redos.push( command )
            return command
          }
        }
    }

    canRedo() {
        return this.redos.length > 0
    }

    redo ( ) {
        if ( this.canRedo() ) {
            const command = this.redos.pop()
            if ( command ) {
                command.execute( true )
                this.undos.push( command )
                return command
            }
        }
    }

    clear ( ) {
        this.undos = []
        this.redos = []
        this.idCounter = 0
    }
}

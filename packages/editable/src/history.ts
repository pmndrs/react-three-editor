import { Editor } from "./Editor"

export abstract class ExecutableCommand {
  id: number = 0
  constructor(public editor: Editor) {}

  shouldUpdate(command: ExecutableCommand): boolean {
    return false
  }

  update(command: ExecutableCommand) {
    //
  }

  abstract execute(redo?: boolean): void

  abstract undo(): void
}

export class HistoryManager {
  idCounter: number = 0
  lastCommandTime: Date = new Date()
  undos: ExecutableCommand[] = []
  redos: ExecutableCommand[] = []
  constructor() {}

  execute(command: ExecutableCommand) {
    const lastCommand = this.undos[this.undos.length - 1]
    const timeDifference = new Date().getTime() - this.lastCommandTime.getTime()

    if (
      lastCommand &&
      lastCommand.constructor === command.constructor &&
      timeDifference < 1000 &&
      lastCommand.shouldUpdate(command)
    ) {
      lastCommand.update(command)
      command = lastCommand
    } else {
      this.undos.push(command)
      command.id = ++this.idCounter
      command.execute()
    }

    this.lastCommandTime = new Date()

    this.redos = []

    return command
  }

  canUndo() {
    return this.undos.length > 0
  }

  undo() {
    if (this.canUndo()) {
      const command = this.undos.pop()!
      command.undo()
      this.redos.push(command)
      return command
    }
  }

  canRedo() {
    return this.redos.length > 0
  }

  redo() {
    if (this.canRedo()) {
      const command = this.redos.pop()!
      command.execute(true)
      this.undos.push(command)
      return command
    }
  }

  clear() {
    this.undos = []
    this.redos = []
    this.idCounter = 0
  }
}

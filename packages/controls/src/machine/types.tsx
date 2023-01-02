import { Interpreter, StateMachine } from "xstate"

export type MachineInterpreter<M> = M extends StateMachine<
  infer Context,
  infer Schema,
  infer Event,
  infer State,
  infer _A,
  infer _B,
  infer _C
>
  ? Interpreter<Context, Schema, Event, State, _C>
  : never

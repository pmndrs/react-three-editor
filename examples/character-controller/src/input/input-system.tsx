import { InputController } from 'input/input-controller';

export function InputSystem() {
  return (
    <InputController
      devices={['keyboard', 'gamepad']}
      actions={({ keyboard, gamepad, processors }) => ({
        move: {
          type: 'vector',
          steps: [
            keyboard?.compositeVector('KeyW', 'KeyS', 'KeyA', 'KeyD'),
            gamepad?.axisVector(0, 1),
            processors?.deadzone(0.15),
          ],
        },
        look: {
          type: 'vector',
          steps: [
            keyboard?.compositeVector('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'),
            gamepad?.axisVector(2, 3),
            processors?.deadzone(0.15),
          ],
        },
        jump: { type: 'boolean', steps: [keyboard?.whenKeyPressed('Space'), gamepad?.whenButtonPressed(0)] },
      })}
    />
  );
}

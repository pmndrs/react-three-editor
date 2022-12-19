import { useCallback, useState } from 'react';
import * as THREE from 'three';

export class Modifier {
  private _value: THREE.Vector3;
  private _name: string;

  constructor(name?: string) {
    this._value = new THREE.Vector3();
    this._name = name ?? 'modifier';
  }

  get value(): THREE.Vector3 {
    return this._value;
  }

  set value(value: THREE.Vector3) {
    this._value = value;
  }

  get name(): string {
    return this._name;
  }
}

export const createModifier = (name?: string) => new Modifier(name);

export function useModifiers() {
  const [modifiers] = useState<Modifier[]>([]);

  const addModifier = (modifier: Modifier) => modifiers.push(modifier);

  const removeModifier = useCallback(
    (modifier: Modifier) => {
      const index = modifiers.indexOf(modifier);
      if (index !== -1) modifiers.splice(index, 1);
    },
    [modifiers],
  );

  return { modifiers, addModifier, removeModifier };
}

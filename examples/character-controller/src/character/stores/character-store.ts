import create from 'zustand';
import { Character } from './character';

type CharacterState = {
  characters: Map<string, Character>;
  addCharacter: (id: string, character: Character) => void;
  removeCharacter: (id: string) => void;
};

export const useCharacterController = create<CharacterState>((set) => ({
  characters: new Map(),
  addCharacter: (id, character) => set((state) => ({ characters: state.characters.set(id, character) })),
  removeCharacter: (id) =>
    set((state) => {
      state.characters.delete(id);
      return state;
    }),
}));

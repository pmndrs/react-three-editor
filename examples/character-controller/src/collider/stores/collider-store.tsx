import * as THREE from 'three';
import create from 'zustand';

interface ColliderState {
  collider: THREE.Mesh | null;
  setCollider: (collider: THREE.Mesh) => void;
}

export const useCollider = create<ColliderState>((set) => ({
  collider: null,
  setCollider: (collider) => set({ collider }),
}));

import * as THREE from 'three';
import create from 'zustand';

interface CameraState {
  camera: THREE.PerspectiveCamera | null;
  target: THREE.Object3D | null;
  setCamera: (camera: THREE.PerspectiveCamera | null) => void;
  setTarget: (target: THREE.Object3D | null) => void;
}

export const useCameraController = create<CameraState>((set) => ({
  camera: null,
  target: null,
  setTarget: (target) => set({ target }),
  setCamera: (camera) => set({ camera }),
}));

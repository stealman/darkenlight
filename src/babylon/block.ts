import {Scene, StandardMaterial, MeshBuilder, VertexBuffer, Color3, Texture, Vector3} from "@babylonjs/core";

export class Block {
  position: Vector3
  material: number

  constructor(position: Vector3, material: number) {
    this.position = position
    this.material = material
  }
}

export function createCube(scene?: Scene) {
  const cube = MeshBuilder.CreateBox("cube", { width: 1, depth: 1, height: 1 }, scene);

  const uvs = [
    // Front face (center)
    1/4, 3/3,  // Bottom-left (T1)
    2/4, 3/3,  // Bottom-right
    2/4, 2/3,  // Top-right
    1/4, 2/3,  // Top-left

    // Back face (opposite front)
    1/4, 1/3,  // Bottom-left (T1)
    2/4, 1/3,  // Bottom-right
    2/4, 0,    // Top-right
    1/4, 0,    // Top-left

    // Left face (left of front)
    1/4, 2/3,  // Bottom-left (T1)
    0, 2/3,    // Bottom-right
    0, 1/3,    // Top-right
    1/4, 1/3,  // Top-left

    // Right face (right of front)
    2/4, 2/3,  // Bottom-left (T1)
    3/4, 2/3,  // Bottom-right
    3/4, 1/3,  // Top-right
    2/4, 1/3,  // Top-left

    // Top face (above front)
    1/4, 2/3,  // Bottom-left (T1)
    2/4, 2/3,  // Bottom-right
    2/4, 1/3,  // Top-right
    1/4, 1/3,  // Top-left

    // Bottom face (below front)
    1/4, 2/3,  // Bottom-left (D1)
    2/4, 2/3,  // Bottom-right
    2/4, 1.0,  // Top-right
    1/4, 1.0   // Top-left
  ];

  cube.setVerticesData(VertexBuffer.UVKind, uvs);
  return cube;
}

export function getGrassMaterial(scene: Scene) {
    const mat = new StandardMaterial('grassMaterial', scene)
    mat.specularColor = new Color3(0, 0, 0)
    mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

    const diffuseTexture = new Texture('./assets/grass.png', scene)
    const normalTexture = new Texture('./assets/normal.jpg', scene)

    mat.diffuseTexture = diffuseTexture
    mat.bumpTexture = normalTexture

    return mat
}

export function getDirtMaterial(scene: Scene) {
    const mat = new StandardMaterial('dirtMaterial', scene)
    mat.specularColor = new Color3(0, 0, 0)
    mat.emissiveColor = new Color3(0.35, 0.35, 0.35)

    const texture = new Texture('./assets/dirt.png', scene)

    mat.diffuseTexture = texture
    return mat
}

export function getWaterMaterial(scene: Scene) {
    const mat = new StandardMaterial('waterMaterial', scene)
    mat.specularColor = new Color3(0, 0, 0)

    const texture = new Texture('./assets/water.png', scene)
    texture.uScale = 64
    texture.vScale = 64

    mat.diffuseTexture = texture
    mat.alpha = 0.1;

    mat.ambientColor = new Color3(1, 1, 1.0); // Bright blue color
    return mat
}

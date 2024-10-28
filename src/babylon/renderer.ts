import {
    Engine,
    Scene,
    Vector3,
    SolidParticleSystem,
    FreeCamera,
    MeshBuilder,
    PointLight,
    ShadowGenerator, SpotLight, Color3, DirectionalLight, Color4
} from "@babylonjs/core"
import {UnwrapRef} from "vue"
import {createCube, getDirtMaterial, getGrassMaterial, getWaterMaterial} from "./block.ts"
import '@babylonjs/inspector'
import {getWorldMap} from "./world.ts"

export function initializeBabylon(canvasRef: UnwrapRef<HTMLCanvasElement>): { engine: Engine; scene: Scene } {
    const engine = new Engine(canvasRef, true)
    const scene: Scene = new Scene(engine)
    scene.clearColor = new Color4(0.2, 0.4, 0.2)
    scene.imageProcessingConfiguration.exposure = 1.2

    const camera = new FreeCamera('camera1', new Vector3(-20, 20, -20), scene)
    camera.setTarget(new Vector3(20, -30, 20))
    camera.attachControl(canvasRef, true)

    //const light = new SpotLight("spotLight", new Vector3(5, 30, -5), new Vector3(-0.2, -1, 0.4), Math.PI / 2, 0, scene);

    const light = new PointLight("pointLight", new Vector3(-25, 25, 20), scene);
    light.intensity = 1.5;
    light.diffuse = new Color3(1, 1, 1);
    light.range = 500;

    const shadow = new ShadowGenerator(2048, light, false);
    shadow.bias = 0.00;
    shadow.setDarkness(0.25);
    shadow.usePercentageCloserFiltering = true;
    shadow.filteringQuality = 2;
    // shadow.forceBackFacesOnly = true;

    // Create initial cube mesh and use it to add shapes to SPS
    const cube = createCube(scene)

    const spsGrass = new SolidParticleSystem("spsG", scene, { isPickable: false })
    spsGrass.addShape(cube, 1024)

    const spsDirt = new SolidParticleSystem("spsD", scene, { isPickable: false })
    spsDirt.addShape(cube, 2048)

    cube.dispose()

    // Initialize and set particle visibility
    spsGrass.initParticles()
    spsDirt.initParticles()

    const grassMesh = spsGrass.buildMesh()
    grassMesh.material = getGrassMaterial(scene)

    const dirtMesh = spsDirt.buildMesh()
    dirtMesh.material = getDirtMaterial(scene)

    for (const particle of spsGrass.particles) particle.isVisible = false
    for (const particle of spsDirt.particles) particle.isVisible = false

    const map = getWorldMap()
    let dirtIndex = 0
    let grassIndex = 0

    for (let x = 0; x < map.length; x++) {
        for (let z = 0; z < map[x].length; z++) {
            const color = map[x][z]
            const yPos = Math.floor(color / 30)

            let particle = null
            if (yPos > 3) {
                particle = spsGrass.particles[grassIndex++]
            } else {
                particle = spsDirt.particles[dirtIndex++]
            }

            particle.isVisible = true
            particle.position.set(x - 16, yPos, z - 16)

            const dirtParticle = spsDirt.particles[dirtIndex++]
            dirtParticle.isVisible = true
            dirtParticle.position.set(x - 16, yPos - 1, z - 16)
        }
    }

    spsGrass.setParticles()
    spsDirt.setParticles()

    // Water planes
    const plane = MeshBuilder.CreatePlane('plane', { width: 32, height: 32 }, scene)
    plane.rotation.x = Math.PI / 2
    plane.material = getWaterMaterial(scene)
    plane.position.y = 0.15

    for (let i = 0.4; i <= 4.5; i += 0.125) {
        const instance = plane.createInstance('plane' + i)
        instance.position.y = i
    }

    grassMesh.receiveShadows = true
    dirtMesh.receiveShadows = true

    shadow.addShadowCaster(grassMesh)
    //shadow.addShadowCaster(dirtMesh)

    engine.runRenderLoop(() => {
        scene.render()
    })

    window.addEventListener('resize', () => {
        engine.resize()
    })

    scene.debugLayer.show({
        embedMode: true
    })

    return { engine, scene }
}

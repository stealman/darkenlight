/**
 * Manager pro brneni
 */
function ArmorsManager() {
    this.armorsUrl = "models/armors/";

    // BOOTS
    this.bootSps = null;
    this.bootSourceMeshes = [];
    this.bootSourceFinalCount = 6;
    this.bootColorFinalCount = 2;
    this.bootsMesh = null;

    //GLOVES
    this.gloveSps = null;
    this.gloveSourceMeshes = [];
    this.gloveSourceFinalCount = 6;
    this.gloveColorFinalCount = 2;
    this.glovesMesh = null;

    // FACES
    this.faceSps = null;
    this.faceSourceMeshes = [];
    this.faceSourceFinalCount = 6;
    this.faceColorFinalCount = 2;
    this.facesMesh = null;

    //HAIR
    this.hairSps = null;
    this.hairSourceMeshes = [];
    this.hairSourceFinalCount = 6;
    this.hairColorFinalCount = 2;
    this.hairsMesh = null;

    /**
     * Inicializace objektu
     */
    this.initialize = function() {

        // Boty
        loadArmorMesh("1_boots.babylon", this.bootSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, Math.PI / 2, 0));
        loadArmorMesh("4_boots.babylon", this.bootSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, Math.PI / 2, 0));

        loadArmorMesh("501_boots.babylon", this.bootSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, -Math.PI / 2, 0));
        loadArmorMesh("504_boots.babylon", this.bootSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, -Math.PI / 2, 0));

        // Rukavice
        loadArmorMesh("2_gloves.babylon", this.gloveSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, Math.PI / 2, 0));
        loadArmorMesh("3_gloves.babylon", this.gloveSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, Math.PI / 2, 0));

        loadArmorMesh("502_gloves.babylon", this.gloveSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, -Math.PI / 2, 0));
        loadArmorMesh("503_gloves.babylon", this.gloveSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, -Math.PI / 2, 0));

        // Obliceje
        loadArmorMesh("401_face.babylon", this.faceSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, -Math.PI / 2, Math.PI));

        // Vlasy
        loadArmorMesh("451_hair.babylon", this.hairSourceMeshes, new BABYLON.Vector3(8, 8, 8), new BABYLON.Vector3(0, -Math.PI / 2, Math.PI));

        /**
         * Nacte brneni z daneho URL a ulozi do seznamu
         */
        function loadArmorMesh(url, sourceList, scaling, rotation) {

            BABYLON.SceneLoader.LoadAssetContainer(ArmorMgr.armorsUrl, url, scene, function(object) {
                var armorId = url.substring(0, url.indexOf("_"));

                var arm = object.meshes[0];
                arm.rotation = rotation;
                arm.scaling = scaling;

                // Nastacim meshi IDcko zbrane a pridam do seznamu
                var mesh = BABYLON.Mesh.MergeMeshes([ arm ], true);
                scene.addMesh(mesh);
                mesh.setEnabled(false);
                mesh['armorId'] = parseInt(armorId);
                sourceList.push(mesh);

                // Pokud uz mam nacteny vsechny, vytvorim SPS
                if (getActualSourceCount() >= getFinalSourceCount()) {
                    ArmorMgr.createParticleSystems();
                }
            });

            function getActualSourceCount() {
                return ArmorMgr.bootSourceMeshes.length + ArmorMgr.gloveSourceMeshes.length + ArmorMgr.faceSourceMeshes.length + ArmorMgr.hairSourceMeshes.length;
            }

            function getFinalSourceCount() {
                return /*ArmorMgr.bootFinalCount*/10;
            }
        }
    };

    /**
     * Vytvori casticovy systemy
     */
    this.createParticleSystems = function() {

        // BOOTS
        this.bootSps = new BABYLON.SolidParticleSystem("bootSps", scene, {
            expandable : true
        });

        // Naplnim SPS objekty a sestavim mesh
        initializeParticleSysem(this.bootSps, this.bootSourceMeshes);
        this.bootsMesh = buildMesh(this.bootSps, "items/boots.png", "images/items/bootsSpec.png");

        // Update castic
        this.bootSps.updateParticle = function(p) {
            ArmorMgr.syncParticlePosition(p, ArmorMgr.bootsMesh);
        };

        // GLOVES
        this.gloveSps = new BABYLON.SolidParticleSystem("gloveSps", scene, {
            expandable : true
        });

        // Naplnim SPS objekty a sestavim mesh
        initializeParticleSysem(this.gloveSps, this.gloveSourceMeshes);
        this.glovesMesh = buildMesh(this.gloveSps, "items/gloves.png", "images/items/glovesSpec.png");

        // Update castic
        this.gloveSps.updateParticle = function(p) {
            ArmorMgr.syncParticlePosition(p, ArmorMgr.glovesMesh);
        };

        // FACES
        this.faceSps = new BABYLON.SolidParticleSystem("faceSps", scene, {
            expandable : true
        });

        // Naplnim SPS objekty a sestavim mesh
        initializeParticleSysem(this.faceSps, this.faceSourceMeshes);
        this.facesMesh = buildMesh(this.faceSps, "items/faces.png", "images/items/facesSpec.png");

        // Update castic
        this.faceSps.updateParticle = function(p) {
            ArmorMgr.syncParticlePosition(p, ArmorMgr.facesMesh);
        };

        // HAIR
        this.hairSps = new BABYLON.SolidParticleSystem("hairSps", scene, {
            expandable : true
        });

        // Naplnim SPS objekty a sestavim mesh
        initializeParticleSysem(this.hairSps, this.hairSourceMeshes);
        this.hairsMesh = buildMesh(this.hairSps, "items/hairs.png", "images/items/hairsSpec.png");

        // Update castic
        this.hairSps.updateParticle = function(p) {
            ArmorMgr.syncParticlePosition(p, ArmorMgr.hairsMesh);
        };

        // Naplni castice do SPS ze zdroje
        function initializeParticleSysem(sps, sourceList) {

            // Projdu zdrojove meshe a vytvorim pro kazdy jednu castici
            for (var i = 0; i < sourceList.length; i++) {
                sps.addShape(sourceList[i], 1);

                //Vsem casticim nastavim parametr OBJ na NULL, nastavim armorId a zneviditelnim
                for (var j = 0; j < sps.particles.length; j++) {
                    var p = sps.particles[j];
                    if (p.isVisible) {
                        p['obj'] = null;
                        p['armorId'] = sourceList[i].armorId;
                        p.isVisible = false;
                    }
                }
            }
        }

        // Sestavi mesh a priradi material
        function buildMesh(sps, diffuseUrl, specularUrl) {
            var mesh = sps.buildMesh();

            // Material
            var mat = Materials.getTexturedMaterial(diffuseUrl, null, 1, 1, new BABYLON.Color3(1, 1, 1), new BABYLON.Color3(0.31, 0.31, 0.31));
            mat.diffuseTexture.hasAlpha = true;

            var specTexture = new BABYLON.Texture(specularUrl, scene);
            mat.specularTexture = specTexture;
            mat.backFaceCulling = false;
            mat.specularPower = 32;
            mesh.material = mat;
            mesh.position.y = -10;

            if (Renderer.mobShadows) {
                Lights.myLight.addShadowCaster(mesh);
            }

            return mesh;
        }

        /**
         * Dane castici nastavi pozici v ramci jejiho meshe
         */
        this.syncParticlePosition = function(p, spsMesh) {
            // Prevezmu rotaci, pozici z nody
            if (p.obj != null) {
                var rotq = new BABYLON.Quaternion();
                p.obj.getWorldMatrix().decompose(null, rotq, null);
                p.rotationQuaternion = rotq;

                p.position.x = (p.obj.getAbsolutePosition().x + p.obj.owner.movedX * 2) - spsMesh.position.x;
                p.position.z = (p.obj.getAbsolutePosition().z - p.obj.owner.movedY * 2) - spsMesh.position.z;
                p.position.y = p.obj.getAbsolutePosition().y + 10;
            } else if (p.isVisible) {
                p.isVisible = false;
            }
        };
    };

    /**
     * Priradi zbran k prvni volne castici daneho typu
     */
    this.assignArmor = function(node, armor, scale, rotation) {
        if (this.bootSps == null) {
            return;
        }

        var armorFound = false;
        var spsObject = null;
        var meshSourceList = null;

        switch (armor.category) {
            case "BOOT":
                spsObject = this.bootSps;
                meshSourceList = this.bootSourceMeshes;
                break;
            case "GLOVE":
                spsObject = this.gloveSps;
                meshSourceList = this.gloveSourceMeshes;
                break;
            case "FACE":
                spsObject = this.faceSps;
                meshSourceList = this.faceSourceMeshes;
                break;
            case "HAIR":
                spsObject = this.hairSps;
                meshSourceList = this.hairSourceMeshes;
                break;
        }

        // Projdu castice a hledam nejakou neprirazenou
        for (var i = 0; i < spsObject.particles.length; i++) {
            var p = spsObject.particles[i];

            if (p.armorId == armor.modelType && p.obj == null) {
                p.obj = node;
                p.isVisible = true;
                p.uvs = armor.getUvs();

                if (scale != null) {
                    p.scaling.x = scale.x;
                    p.scaling.y = scale.y;
                    p.scaling.z = scale.z;
                } else {
                    p.scaling.x = 1;
                    p.scaling.y = 1;
                    p.scaling.z = 1;
                }

                armorFound = true;
                break;
            }
        }

        // Pokud jsem nenasel castici, pridam do SPS novou
        if (!armorFound) {
            for (var i = 0; i < meshSourceList.length; i++) {
                if (meshSourceList[i].armorId == armor.modelType) {
                    spsObject.addShape(meshSourceList[i], 5);
                    spsObject.buildMesh();

                    // Novym casticim nastavim IDcko zbrane jejihoz jsou typu
                    for (var j = 0; j < spsObject.particles.length; j++) {
                        var p = spsObject.particles[j];
                        if (typeof p.armorId === "undefined") {
                            p['obj'] = null;
                            p['armorId'] = armor.modelType;
                            p.isVisible = false;
                        }
                    }

                    break;
                }
            }
            this.assignArmor(node, armor, scale);
        }

        // Provedu hned update
        spsObject.setParticles();
    };

    /**
     * Odpoji zbran
     */
    this.unassignArmor = function(armor, node) {
        var spsObject = null;

        switch (armor.category) {
            case "BOOT":
                spsObject = this.bootSps;
                break;
            case "GLOVE":
                spsObject = this.gloveSps;
                break;
            case "FACE":
                spsObject = this.faceSps;
                break;
            case "HAIR":
                spsObject = this.hairSps;
                break;
        }

        for (var i = 0; i < spsObject.particles.length; i++) {
            var p = spsObject.particles[i];
            if (p.obj == node) {
                p.obj = null;
                p.isVisible = false;
                break;
            }
        }
    };

    /**
     * Pohne casticemi
     */
    this.processOneFrame = function(time) {

        // Boty
        if (this.bootSps != null && this.bootsMesh != null) {
            this.bootsMesh.position.x = Data.myChar.model.node.position.x;
            this.bootsMesh.position.z = Data.myChar.model.node.position.z;
            this.bootSps.setParticles();
        }

        // Rukavice
        if (this.gloveSps != null && this.glovesMesh != null) {
            this.glovesMesh.position.x = Data.myChar.model.node.position.x;
            this.glovesMesh.position.z = Data.myChar.model.node.position.z;
            this.gloveSps.setParticles();
        }

        // Obliceje
        if (this.faceSps != null && this.facesMesh != null) {
            this.facesMesh.position.x = Data.myChar.model.node.position.x;
            this.facesMesh.position.z = Data.myChar.model.node.position.z;
            this.faceSps.setParticles();
        }

        // Vlasy
        if (this.hairSps != null && this.hairsMesh != null) {
            this.hairsMesh.position.x = Data.myChar.model.node.position.x;
            this.hairsMesh.position.z = Data.myChar.model.node.position.z;
            this.hairSps.setParticles();
        }
    };
}

/**
 * Objekt brneni
 */
function Armor(id, type) {
    this.id = id;
    this.cbData = getArmorCb(type);
    this.materialType = this.cbData.materialType;
    this.modelType = this.cbData.modelType;
    this.textureIndex = this.cbData.textureIndex;
    this.category = this.cbData.category;

    /**
     * Vraci pozici zbrane na texture
     */
    this.getUvs = function() {
        var width = 1;
        var height = 1;

        switch (this.category) {
            case "BOOT":
                width = ArmorMgr.bootColorFinalCount;
                height = ArmorMgr.bootSourceFinalCount;
                break;
            case "GLOVE":
                width = ArmorMgr.gloveColorFinalCount;
                height = ArmorMgr.gloveSourceFinalCount;
                break;
            case "FACE":
                width = ArmorMgr.faceColorFinalCount;
                height = ArmorMgr.faceSourceFinalCount;
                break;
            case "HAIR":
                width = ArmorMgr.hairColorFinalCount;
                height = ArmorMgr.hairSourceFinalCount;
                break;
        }

        var colorIdx = this.materialType - 1;
        var txIdx = (height - this.textureIndex) / height;

        return new BABYLON.Vector4(colorIdx / width, txIdx, (colorIdx + 1) / width, txIdx + (1 / height));
    };

}

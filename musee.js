var canvas = document.getElementById("musee");

//Chargement du moteur
var engine = new BABYLON.Engine(canvas, true); //Moteur WebGL

var createScene = function() 
{
    var scene = new BABYLON.Scene(engine);
    
    scene.clearColor = new BABYLON.Color3(0, 0, 0.2); //Couleur par défaut quand il n'y a pas d'élement.
    
	//Gestion de la caméra
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 3, -10), scene);
    camera.applyGravity = true;
	camera.checkCollisions = true; //Pour les collisions, et éviter de rentrer dans des murs et autres éléments.
    camera.setTarget(new BABYLON.Vector3(0,3,0)); //Fait regarder la caméra à l'origine de la scène
	
	camera.speed = 0.5;
	camera.angularSensibility = 2000; //Plus la sensibilité est haute, moins la souris va vite.
	camera.ellipsoid = new BABYLON.Vector3(1,1.5,1); //Modification de la hitbox de la caméra.
	
	//GESTION DES CONTROLES
	camera.keysLeft = [81, 37]; //Q et <-
	camera.keysUp = [90, 38]; //Z et Flèche du haut
	camera.keysRight = [68, 39]; //D et ->
	camera.keysDown = [83, 40]; //S et flèche du bas
	
    camera.attachControl(canvas, false); //Attachement de la caméra au canvas (pour voir la scène dans celui-ci);
    
    //Gestion de la lumière
	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .75;
    
    //Création d'une sphere avec 16 largitudes (comprendre le découpage, plus c'est haut, plus il y aura de polygones), de taille 2.
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 1;
	sphere.checkCollisions = true;
	
	var matWireframe = new BABYLON.StandardMaterial("wireframe", scene); //On crée une texture dediée à l'affichage en fil de fer
	matWireframe.wireframe = true;
	
	sphere.material = matWireframe;
    
	//CREATION DU SOL
    //Nom, longueur, profondeur, sous-parties, scène
    var ground = BABYLON.Mesh.CreateGround("ground1", 150, 100, 8, scene);
	ground.checkCollisions = true;
	
	
	//On crée une nouvelle texture pour le sol
	var groundMat = new BABYLON.StandardMaterial("ground", scene);
	groundMat.diffuseTexture = new BABYLON.Texture("texture/floor.jpg", scene); //Le diffuse est ce qui va être affiché (aka le diffuse)
	groundMat.bumpTexture = new BABYLON.Texture("texture/floor_nor.jpg", scene); //Le bump permet de simuler une profondeur avec une "normal texture".
	groundMat.diffuseTexture.uScale = 16.0; //Et on répète la texture pour avoir un meilleur résultat.
	groundMat.diffuseTexture.vScale = 16.0;
	groundMat.bumpTexture.uScale = 16.0;
	groundMat.bumpTexture.vScale = 16.0;
	
	ground.material = groundMat; //Et on l'applique au sol
	
	//CREATION D'UN ECRAN VIDEO
	//Ecran TV
	var ecranFac = BABYLON.Mesh.CreatePlane("TVFac", 1, scene); 
	ecranFac.scaling.x = 16;
	ecranFac.scaling.y = 9;
	ecranFac.position = new BABYLON.Vector3(0, 10, 20);
	
	//Materiau de vidéo
	var videoMat = new BABYLON.StandardMaterial("textVid", scene);
    videoMat.diffuseTexture = new BABYLON.VideoTexture("video", ["video/faculte.mp4"], scene, false);
    videoMat.backFaceCulling = false; //Pour pouvoir la voir des deux côtés du plan.
	
	ecranFac.material = videoMat; //On applique la texture de vidéo à la surface concernée
	
	videoMat.diffuseTexture.video.loop = true; //Et on joue la vidéo (en boucle).
	
	//Chargement de la salle (chargement d'un objet)
	var loader = new BABYLON.AssetsManager(scene);
	
	var salle = loader.addMeshTask("salle", "", "obj/", "salle.obj"); //On charge l'objet en question
	salle.onSuccess = function(t) {
        t.loadedMeshes.forEach(function(m) {
            m.position.y = 2.5; //Pour le monter en hauteur
			m.checkCollisions = true;
        });
	};
	  
	loader.onFinish = function() {
		//On fait le rendu de la scène ici.
		engine.runRenderLoop(function() {scene.render();});
	}
	
	loader.load();
	
    return scene;
}

var scene = createScene();

//Pour adapter la taille du canvas si la taille de fenêtre change
window.addEventListener('resize', function(){engine.resize()});
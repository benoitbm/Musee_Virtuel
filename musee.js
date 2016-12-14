var canvas = document.getElementById("musee");

var canTuto = false;

//Chargement du moteur
var engine = new BABYLON.Engine(canvas, true); //Moteur WebGL

var createScene = function() 
{
    var scene = new BABYLON.Scene(engine);
	
	scene.collisionsEnabled = true;
    
    scene.clearColor = new BABYLON.Color3(0, 0, 0.2); //Couleur par défaut quand il n'y a pas d'élement.
    	
	//Création d'un asset manager pour charger les éléments avant le rendu.
	var loader = new BABYLON.AssetsManager(scene);
	
	//Gestion de la caméra
    var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 3, -10), scene);
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
	
    scene.activeCamera = camera;
	scene.activeCamera.attachControl(canvas, true); //Attachement de la caméra au canvas (pour voir la scène dans celui-ci);
    
	/*
	//Blocage du pointeur de la souris
	var islocked = false;
	
	scene.onPointerDown = function(evt)
	{
		if (!islocked) //Si la souris n'est pas bloqué...
		{
			canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock || false; //On la bloque (on fait la requete pour différents navigateurs ici, html5, IE + Edge, Mozilla, Webkit)
			if (canvas.requestPointerLock) //Si la requête aboutie,
				canvas.requestPointerLock(); //On appelle la fonction
		}
		
		//continue with shooting requests or whatever :P
		//evt === 0 (left mouse click)
		//evt === 1 (mouse wheel click (not scrolling))
		//evt === 2 (right mouse click)
	}
	
	var pointerlockchange = function () 
	{
		var controlEnabled = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || false; //On rajoute le false par sécrité au cas où aucun des précédents éléments ne fonctionnement pas.
		if (!controlEnabled) {
			//camera.detachControl(canvas);
			isLocked = false;
		} else {
			camera.attachControl(canvas);
			isLocked = true;
		}
	};
	
	//Evenements liés au verouillage du pointeur (et à son mouvement)
	document.addEventListener("pointerlockchange", pointerlockchange, false);
	document.addEventListener("mspointerlockchange", pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
	*/
			
    //Gestion de la lumière
	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0.1, 0.1, 0), scene);
    light.intensity = .75;
    
	//Gestion de la skybox
	var skybox = BABYLON.Mesh.CreateBox("skyBox", 300.0, scene);
	var skyboxMat = new BABYLON.StandardMaterial("skyBox/", scene);
	skyboxMat.backFaceCulling = false;
	skyboxMat.disableLighting = true;
	skybox.material = skyboxMat;
	
	skyboxMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMat.specularColor = new BABYLON.Color3(0, 0, 0);
	
	skyboxMat.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
	skyboxMat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	
	skybox.infiniteDistance = true;

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
	groundMat.diffuseTexture = new BABYLON.Texture("texture/240.jpg", scene); //Le diffuse est ce qui va être affiché (aka le diffuse)
	groundMat.bumpTexture = new BABYLON.Texture("texture/240_norm.jpg", scene); //Le bump permet de simuler une profondeur avec une "normal texture".
	groundMat.diffuseTexture.uScale = 16.0 * 1.5; //Et on répète la texture pour avoir un meilleur résultat.
	groundMat.diffuseTexture.vScale = 16.0;
	groundMat.bumpTexture.uScale = 16.0 * 1.5;
	groundMat.bumpTexture.vScale = 16.0;
	
	ground.material = groundMat; //Et on l'applique au sol
	
	
	//BOITE DE COLLISION
	var box = BABYLON.Mesh.CreateBox("learn", 5, scene);
	box.position = new BABYLON.Vector3(50, 0, -20);
	//box.checkCollisions = true;
	
	camera.actionManager = new BABYLON.ActionManager(scene);
	camera.actionManager.registerAction(new BABYLON.SetValueAction({ trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: box }, box, "scaling", new BABYLON.Vector3(1.2, 1.2, 1.2)));
	console.log(camera);
	
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
	
	
	//Création des murs de la salle
	var salle = loader.addMeshTask("salle", "", "obj/", "salle.obj"); //On charge l'objet en question
	salle.onSuccess = function(t) {
        t.loadedMeshes.forEach(function(m) { //On édite ici chaque maillage de l'objet
            m.position.y = 2.5; //Pour le monter en hauteur
			m.position.x = 10; //Et on le décale un peu pour que quand on commence, il soit bien placé.
			m.checkCollisions = true; //Et bien sûr, on s'assure qu'on ne puisse pas les traverser.
        });
	};
	
	//Modification du texte de l'écran de chargement
	engine.loadingUIText = "Chargement de l'exposition en cours.";
	engine.loadingUIBackgroundColor = "purple"; //Et de sa couleur
	  
	loader.onFinish = function() {
		//On fait le rendu de la scène ici.
		engine.runRenderLoop(function() {
			
			
			scene.render();
		});
	}
	
	
	loader.load();
	return scene;
}

var scene = createScene();

//Pour adapter la taille du canvas si la taille de fenêtre change
window.addEventListener('resize', function(){engine.resize()});

window.addEventListener("keypress", function(e){
	if (e.key == "e")
		window.open("https://codepen.io/kowlor/pen/ZYYQoy", '_blank');
	
});

//document.addEventListener("contextmenu", function(e) { e.preventDefault();}); //On surpasse le clic droit pour éviter que le menu par défaut s'affiche

var canvas = document.getElementById("musee");

var canTuto = false;

var islocked = false;

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
	camera.angularSensibility = 3500; //Plus la sensibilité est haute, moins la souris va vite.
	camera.ellipsoid = new BABYLON.Vector3(1,1.5,1); //Modification de la hitbox de la caméra.
	
	//GESTION DES CONTROLES
	camera.keysLeft = [81, 37]; //Q et <-
	camera.keysUp = [90, 38]; //Z et Flèche du haut
	camera.keysRight = [68, 39]; //D et ->
	camera.keysDown = [83, 40]; //S et flèche du bas
	
    scene.activeCamera = camera;
	scene.activeCamera.attachControl(canvas, true); //Attachement de la caméra au canvas (pour voir la scène dans celui-ci);
    
	
	//GESTION HITBOX POUR LES EVENEMENTS DE LA CAMERA
	var hitbox = BABYLON.Mesh.CreateSphere("hitbox", 16, 1, scene);	
	hitbox.parent = camera; //On attache la zone de collision à la caméra (pour qu'elle la suive)
	hitbox.position = new BABYLON.Vector3(0, 0, 0);

	
	//Blocage du pointeur de la souris	
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
			camera.detachControl(canvas);
			islocked = false;
		} else {
			camera.attachControl(canvas);
			islocked = true;
		}
	};
	
	//Evenements liés au verouillage du pointeur (et à son mouvement)
	document.addEventListener("pointerlockchange", pointerlockchange, false);
	document.addEventListener("mspointerlockchange", pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", pointerlockchange, false);

			
    //Gestion de la lumière
	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0.1, 0.2, 0), scene);
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
	var box = BABYLON.Mesh.CreateBox("learn", 38, scene);
	box.position = new BABYLON.Vector3(55, -15, -27);
	
	var invisibleMat = new BABYLON.StandardMaterial("invisible", scene);
	invisibleMat.alpha = 0; //On met l'alpha à 0, ce qui rend la texture invisible

	box.material = invisibleMat;
	
	//Mini système solaire pour zone collision 
	
	//Commencons avec le soleil qui sera la référence
	var soleil = BABYLON.Mesh.CreateSphere('sun', 16, 6, scene);
	soleil.position = new BABYLON.Vector3(55, 13, -27);
	var soleilMat = new BABYLON.StandardMaterial('sun', scene);
	soleilMat.emissiveTexture = new BABYLON.Texture('texture/soleil.jpg', scene);
	soleilMat.diffuseColor = new BABYLON.Color3(0, 0, 0); //On met là aussi à 0 pour éviter les reflets et autres puisque la lumière vient de l'interieur
	soleilMat.specularColor = new BABYLON.Color3(0, 0, 0);
	soleil.material = soleilMat;

	var sunLight = new BABYLON.PointLight('sunLight', new BABYLON.Vector3(40, 10, -27), scene);
	sunLight.intensity = .7;
	
	//Creation des planetes
	var mercure = BABYLON.Mesh.CreateSphere('mercure', 16, 0.4 * 2, scene); //Dans un premier temps la planète
	mercure.position = new BABYLON.Vector3(55, 13, -27); //On met le même centre que le soleil (= soleil.position ne semble pas fonctionner)
  	mercure.position.x += 3 + 3.5 * 2; //On rajoute la distance (3 = diamètre soleil + distance planete-soleil en UA * 10)
  	mercure.orbit = {
		radius: soleil.position.x - mercure.position.x, //C'est la distance += sur la ligne précédente, utilisée pour les calculs plus tard
		speed: -(0.01 * (365/88)), //La vitesse qu'on lui donnera
		angle: 0
  	};
	
	var mercureMat = new BABYLON.StandardMaterial("matMerc", scene);
	mercureMat.emissiveTexture = new BABYLON.Texture('texture/mercurymap.jpg', scene);
	mercure.material = mercureMat;

	
	var venus = BABYLON.Mesh.CreateSphere('venus', 16, 0.95 * 2, scene);
	venus.position = new BABYLON.Vector3(55, 13, -27);
  	venus.position.x += 3 + 7.23 * 2;
  	venus.orbit = {
		radius: soleil.position.x - venus.position.x,
		speed: -(0.01 * (365/224)),
		angle: 0
  	};
	
	var venusMat = new BABYLON.StandardMaterial("matVen", scene);
	venusMat.emissiveTexture = new BABYLON.Texture('texture/venusmap.jpg', scene);
	venus.material = venusMat;

	
	var terre = BABYLON.Mesh.CreateSphere('terre', 16, 1 * 2, scene);
	terre.position = new BABYLON.Vector3(55, 13, -27);
  	terre.position.x += 3 + 10 * 2;
  	terre.orbit = {
		radius: soleil.position.x - terre.position.x,
		speed: -0.01,
		angle: 0
  	};
	
	var terreMat = new BABYLON.StandardMaterial("matTer", scene);
	terreMat.emissiveTexture = new BABYLON.Texture('texture/earthmap.jpg', scene);
	terre.material = terreMat;
	
	
	var mars = BABYLON.Mesh.CreateSphere('mars', 16, 0.6 * 2, scene);
	mars.position = new BABYLON.Vector3(55, 13, -27);
  	mars.position.x += 3 + 15.2 * 2;
  	mars.orbit = {
		radius: soleil.position.x - mars.position.x,
		speed: -0.005, //Mars met 2x plus de temps pour faire sa révolution que la Terre
		angle: 0
  	};
	
	var marsMat = new BABYLON.StandardMaterial("matMar", scene);
	marsMat.emissiveTexture = new BABYLON.Texture('texture/marsmap.jpg', scene);
	mars.material = marsMat;
	
	
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
	videoMat.diffuseColor = new BABYLON.Color3(1, 1, 1); //On manipule ces deux couleurs pour voir la vidéo quelque soit la luminosité.
	videoMat.specularColor = new BABYLON.Color3(1, 1, 1);
	
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
			canTuto = hitbox.intersectsMesh(box, false); 
			
			scene.render();
		});
	}
	
	
	loader.load();
	
  	scene.beforeRender = function() {
		mercure.position.x = 55 + mercure.orbit.radius * Math.sin(mercure.orbit.angle);
		mercure.position.z = -27 + mercure.orbit.radius * Math.cos(mercure.orbit.angle);
		mercure.orbit.angle += mercure.orbit.speed;
		
		venus.position.x = 55 + venus.orbit.radius * Math.sin(venus.orbit.angle);
		venus.position.z = -27 + venus.orbit.radius * Math.cos(venus.orbit.angle);
		venus.orbit.angle += venus.orbit.speed;
		
		terre.position.x = 55 + terre.orbit.radius * Math.sin(terre.orbit.angle);
		terre.position.z = -27 + terre.orbit.radius * Math.cos(terre.orbit.angle);
		terre.orbit.angle += terre.orbit.speed;
		
		mars.position.x = 55 + mars.orbit.radius * Math.sin(mars.orbit.angle);
		mars.position.z = -27 + mars.orbit.radius * Math.cos(mars.orbit.angle);
		mars.orbit.angle += mars.orbit.speed;
  	};
	
	return scene;
}

var scene = createScene();

//Pour adapter la taille du canvas si la taille de fenêtre change
window.addEventListener('resize', function(){engine.resize()});

window.addEventListener("keypress", function(e){
	if (e.key == "e" && canTuto)
	{
		modal.style.display = "block";
		islocked = false;
		
	}
	
});

//document.addEventListener("contextmenu", function(e) { e.preventDefault();}); //On surpasse le clic droit pour éviter que le menu par défaut s'affiche

var modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
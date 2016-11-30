var canvas = document.getElementById("musee");

//Chargement du moteur
var engine = new BABYLON.Engine(canvas, true); //Moteur WebGL

var createScene = function() 
{
    var scene = new BABYLON.Scene(engine);
    
    scene.clearColor = new BABYLON.Color3(0, 0, 0.2);
    
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    
    camera.setTarget(BABYLON.Vector3.Zero()); //Fait regarder la caméra à l'origine de la scène
    
    camera.attachControl(canvas, false); //Attachement de la caméra au canvas (pour voir la scène dans celui-ci);
    
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    
    light.intensity = .5;
    
    //Création d'une sphere avec 16 largitudes (comprendre le découpage, plus c'est haut, plus il y aura de polygones), de taille 2.
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    
    sphere.position.y = 1;
    
    //Nom, longueur, profondeur, sous-parties, scène
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    
    return scene;
}

var scene = createScene();

//On fait le rendu de la scène ici.
engine.runRenderLoop(function() {scene.render();});

//Pour adapter la taille du canvas si la taille de fenêtre change
window.addEventListener("resize", function(){engine.resize()});
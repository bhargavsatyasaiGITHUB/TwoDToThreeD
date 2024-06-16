// Import Babylon.js and earcut library
import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut'

// Initialize Babylon.js components
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.53, 0.81, 0.98);

// Set up camera and lights
const alpha =  Math.PI/4;
const beta = Math.PI/3;
const radius = 60;
const target = new BABYLON.Vector3(0, 0, 0);
            
const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, scene);
camera.attachControl(canvas, true);

// Add a directional light to simulate sunlight
const light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
light.position = new BABYLON.Vector3(20, 40, 20);
light.intensity = 0.5;

// Add a second light to brighten the scene
const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
light2.intensity = 0.5;

// Create a ground plane
const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50});

// Create a standard material
var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
var highlightMaterial = new BABYLON.StandardMaterial("highlighMaterial", scene);
highlightMaterial.diffuseColor = new BABYLON.Color3(0,1,0);
highlightMaterial.alpha = 0.5;
var sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
sphereMaterial.diffuseColor = new BABYLON.Color3(1,1,0);
var extrusionMaterial = new BABYLON.StandardMaterial("extrusionMaterial", scene);

// Change ground color to sandy
groundMaterial.diffuseColor = new BABYLON.Color3(0.76, 0.70, 0.50); 


// Create Materials and Textures
var buildingTexture = new BABYLON.Texture("./building.jpg", scene);
var groundTexture = new BABYLON.Texture("./ground.jpg", scene);
extrusionMaterial.diffuseTexture = buildingTexture;
groundMaterial.diffuseTexture = groundTexture;
ground.material = groundMaterial;


// Setup UI Elements and Buttons

//Buttons related to AddShape
var addShapeButton = document.getElementById("addShapeButton");
var extrudeButton = document.getElementById("extrudeButton");
var extrudeLengthText = document.getElementById("extrudeLength");
var cancelAddShapeButton = document.getElementById("cancelAddShapeButton");



//Buttons related to Move Shape
var moveButton = document.getElementById("moveButton");
var saveMoveButton = document.getElementById("saveMoveButton");
var cancelMoveButton = document.getElementById("cancelMoveButton");

//Buttons related to vertex edit 
var vertexEditButton = document.getElementById("vertexEditButton");

var addPointButton = document.getElementById("addPointButton");
var addStartPointButton = document.getElementById("addStartPointButton");
var addEndPointButton = document.getElementById("addEndPointButton");
var saveAddingPointButton = document.getElementById("saveAddingPointButton");
var cancelAddingPointButton = document.getElementById("cancelAddingPointButton");
var doneAddPointButton = document.getElementById("doneAddPointButton");

var removePointButton = document.getElementById("removePointButton");
var cancelRemovePointButton = document.getElementById("cancelRemovePointButton");
var saveRemovePointButton = document.getElementById("saveRemovePointButton");

var movePointButton = document.getElementById("movePointButton");
var saveMovePointButton = document.getElementById("saveMovePointButton");
var cancelMovePointButton = document.getElementById("cancelMovePointButton");

var doneEditButton = document.getElementById("doneEditButton");

//Initializing booleans to represent state
var isDrawing = false;
var isMoving = false;
var isDeleting = false;
var isEditing = false;
var isRemovingPoint = false;
var isMovingPoint = false;
var isAddingStart = false;
var isAddingEnd = false;

//Intializing global variables
var extrusionToMove = null;
var hologram = null;
var depthMoveExtrusion = 0;
var selectedMesh = null;
var selectedPointMesh = null;
var extrusionToDelete = null;
var extrusionToEdit = null;
var pointFigure = null;
var pointMeshToMove = null;
var hologramPointMesh = null;
var hologramPoints = [];
var hologramPointIndex = 0;
var hologramPointFigure = null;
var startPosition = null;
var endPostiion = null;

var points = [] // Vertices of the drawing
var lines = []; // Lines created by the 2D drawing
var extrusions = []; // Keep track of the extrusions
var shapeCount = 0; // Keep track of the number of shapes drawn
var pointMeshes = []; // Spherical meshes of vertices of points
var pointsTemp = []; //copy of points for use

var shapeDepthMap = {};
var shapePointsMap = {};

// Function to disable all buttons
function disableAllButtons() {
  const buttons = [moveButton, vertexEditButton];
  buttons.forEach(btn => {
    btn.disabled = true;
  });
}

// Function to enable all buttons
function enableAllButtons() {
  
  addShapeButton.disabled = false;
  if (extrusions.length > 0){
    moveButton.disabled = false;
    vertexEditButton.disabled = false;
  }else{
    moveButton.disabled = true;
    vertexEditButton.disabled = true;
  }
}

//////////////////////////////////////////////////////////////ADDD SHAPE BUTTON//////////////////////////////////////////////////////
addShapeButton.addEventListener("click", function () {
    // Reset drawing state
    isDrawing = true;
    ground.visibility = 1;
    shapeCount++;
    points = [];
    lines = [];
    extrudeButton.classList.remove('hidden');
    cancelAddShapeButton.classList.remove('hidden');
    extrudeLengthText.classList.remove('hidden');
    disableAllButtons();
});

extrudeButton.addEventListener("click", function () {
  isDrawing = false;
  var depth = document.getElementById("extrudeLength").value;
  if (points.length >= 2) {
      var extruded = BABYLON.MeshBuilder.ExtrudePolygon("Shape " + shapeCount, { shape: points, depth: depth, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable : true }, scene, earcut);
      shapeDepthMap["Shape " + shapeCount] = depth;
      extruded.position.y += depth;
      
      var vertices = extruded.getVerticesData(BABYLON.VertexBuffer.PositionKind);
      var indices = extruded.getIndices();

      // Calculate UV mapping
      var uv = [];
      for (var i = 0; i < vertices.length; i += 3) {
          var x = vertices[i];
          var y = vertices[i + 1];
          var z = vertices[i + 2];

          // Apply UV mapping formula
          var range = (Math.min(...vertices) - Math.max(...vertices)) * -1;
          var offset = 0 - Math.min(...vertices);
          var u = (x + offset) / range;
          var v = (y + offset) / range;

          uv.push(u, v);
      }

      // Set UV values for each vertex
      extruded.setVerticesData(BABYLON.VertexBuffer.UVKind, uv);

      // Set UV indices for each face
      extruded.setIndices(indices);
      extruded.material = extrusionMaterial;

      extrusions.push(extruded);
  }

    for (var i = 0; i < lines.length; i++) {
        lines[i].visibility = 0;
    }
    shapePointsMap["Shape " + shapeCount] = points;
    extrudeButton.classList.add('hidden');
    cancelAddShapeButton.classList.add('hidden');
    extrudeLengthText.classList.add('hidden');
    enableAllButtons();
});

cancelAddShapeButton.addEventListener("click", function(){
  for (var i = 0; i < lines.length; i++) {
    lines[i].dispose();
  }
  lines = [];
  points = [];
  isDrawing = false;
  extrudeButton.classList.add('hidden');
  cancelAddShapeButton.classList.add('hidden');
  extrudeLengthText.classList.add('hidden');
  shapeCount-- ;
  enableAllButtons();
});




////////////////////////////////////////////////////////////////////////MOVE SHAPE BUTTONS///////////////////////////////////////////////
moveButton.addEventListener("click", function () {
  extrusionToMove = null;
  hologram = null;
  depthMoveExtrusion = 0;
  selectedMesh = null;
  isMoving = true;
  disableAllButtons();
  
  // Disable camera controls during move operation
  camera.detachControl(canvas);
  cancelMoveButton.classList.remove('hidden');
  saveMoveButton.classList.remove('hidden');
});

saveMoveButton.addEventListener("click", function(){
  if (extrusionToMove){
    if (startPosition && endPostiion){
      var direction = endPostiion.subtract(startPosition);
      var oldPoints = shapePointsMap[extrusionToMove.name];
      for (var i = 0; i < oldPoints.length; i++){
        oldPoints[i] = oldPoints[i].add(direction);
      }
      shapePointsMap[extrusionToMove.name] = oldPoints
    }
    extrusionToMove.position.copyFrom(hologram.position);
    extrusionToMove.visibility = 1;
  }
  extrusionToMove = null;
  if (hologram){
  hologram.dispose();
  }
  hologram = null;

  // Re-enable camera controls
  camera.attachControl(canvas, true);
  cancelMoveButton.classList.add('hidden');
  saveMoveButton.classList.add('hidden');
  enableAllButtons();
});

cancelMoveButton.addEventListener("click", function(){
  if (extrusionToMove){
    extrusionToMove.visibility = 1;
  }
  extrusionToMove = null;
  if (hologram){
  hologram.dispose();
  }
  hologram = null;

  // Re-enable camera controls
  camera.attachControl(canvas, true);
  cancelMoveButton.classList.add('hidden');
  saveMoveButton.classList.add('hidden');
  enableAllButtons();
});


/////////////////////////////////////////////////////////VERTEX EDIT BUTTONS//////////////////////////////////////////////
vertexEditButton.addEventListener("click", function(){
  isEditing = true;
  extrusionToEdit = null;
  pointFigure = null;
  selectedMesh = null;

  points = []
  disableAllButtons();
  doneEditButton.classList.remove('hidden');
  movePointButton.classList.remove('hidden');
});

doneEditButton.addEventListener("click", function(){
  isEditing = false;
  camera.attachControl(canvas, true);
  doneEditButton.classList.add('hidden');
  movePointButton.classList.add('hidden');
  if (extrusionToEdit){
  var index = extrusions.indexOf(extrusionToEdit);
  var name = extrusionToEdit.name;
  shapePointsMap[name] = points;
  extrusionToEdit.dispose();
  extrusionToEdit = null;
  var extruded = BABYLON.MeshBuilder.ExtrudePolygon(name, { shape: points, depth: shapeDepthMap[name], sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable : true }, scene, earcut);
  extruded.position.y += shapeDepthMap[name];
  var vertices = extruded.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  var indices = extruded.getIndices();

  // Calculate UV mapping
  var uv = [];
  for (var i = 0; i < vertices.length; i += 3) {
      var x = vertices[i];
      var y = vertices[i + 1];
      var z = vertices[i + 2];

      // Apply UV mapping formula
      var range = (Math.min(...vertices) - Math.max(...vertices)) * -1;
      var offset = 0 - Math.min(...vertices);
      var u = (x + offset) / range;
      var v = (y + offset) / range;

      uv.push(u, v);
  }

  // Set UV values for each vertex
  extruded.setVerticesData(BABYLON.VertexBuffer.UVKind, uv);

  // Set UV indices for each face
  extruded.setIndices(indices);
  extruded.material = extrusionMaterial;

  extrusions[index] = extruded;
  }
  if (pointFigure){
  pointFigure.dispose();
  }
  enableAllButtons();
  movePointButton.disabled = true;
});




/////////////////////////////////////////////// MOVE VERTEX BUTTONS//////////////////////////////////////////////////
movePointButton.addEventListener("click", function(){
  doneEditButton.classList.add('hidden');
  movePointButton.disabled = true;
  isMovingPoint = true;
  pointMeshToMove = null;
  hologramPointMesh = null;
  hologramPoints = [];
  hologramPointIndex = 0;
  hologramPointFigure = null;
  pointsTemp = [...points];
  hologramPoints = [...points];
  selectedPointMesh = null;
  cancelMovePointButton.classList.remove('hidden');
  saveMovePointButton.classList.remove('hidden');
  pointMeshes = [];
  for (var i = 0; i < points.length; i ++){
      var pointSphere = new BABYLON.MeshBuilder.CreateSphere('point' + i, {diameter: 1}, scene);
      pointSphere.position = points[i].clone();
      pointSphere.material = sphereMaterial;
      pointMeshes.push(pointSphere);
  }

});

saveMovePointButton.addEventListener("click", function(){
  cancelMovePointButton.classList.add('hidden');
  saveMovePointButton.classList.add('hidden');
  points = [...pointsTemp];
  pointsTemp = [];
  for (var i = 0; i < pointMeshes.length; i ++){
    pointMeshes[i].dispose();
  }
  pointMeshes = [];
  doneEditButton.classList.remove('hidden');
  movePointButton.disabled = false;
  hologramPointFigure.dispose();
  hologramPointFigure = null;
  isMovingPoint = false;
});

cancelMovePointButton.addEventListener("click", function(){
  cancelMovePointButton.classList.add('hidden');
  saveMovePointButton.classList.add('hidden');
  for (var i = 0; i < pointMeshes.length; i ++){
    pointMeshes[i].dispose();
  }
  pointMeshes = [];
  hologramPointFigure.dispose();
  hologramPointFigure = null;
  pointFigure.dispose();
  pointFigure = BABYLON.MeshBuilder.CreateLines("edit", {points : points}, scene);
  doneEditButton.classList.remove('hidden');
  addPointButton.classList.remove('hidden');
  removePointButton.classList.remove('hidden');
  movePointButton.disabled = false;
  isMovingPoint = false;
});



/////////////////////////////////////////////////////////////////////MOUSE EVENT LISTENERS//////////////////////////////////////////


///////////////////////////////////////////////////////// POINTER DOWN LISTENER/////////////////////////
canvas.addEventListener("pointerdown", function (event) {
    if (isMoving) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && extrusions.indexOf(pickResult.pickedMesh) !== -1) {
          selectedMesh.material = extrusionMaterial;
          selectedMesh = null;
          extrusionToMove = pickResult.pickedMesh;
          hologram = extrusionToMove.clone();
          hologram.material = highlightMaterial.clone();
          depthMoveExtrusion = shapeDepthMap[extrusionToMove.name];
          startPosition = pickResult.pickedMesh.position;
      }
    }else if (isEditing && !extrusionToEdit){
      var pickResult = scene.pick(event.clientX, event.clientY);
        if (pickResult.hit && extrusions.indexOf(pickResult.pickedMesh) !== -1) {
          selectedMesh.material = extrusionMaterial;
          selectedMesh = null;
          extrusionToEdit = pickResult.pickedMesh;
          points = shapePointsMap[extrusionToEdit.name];
          extrusionToEdit.visibility = 0;
          pointFigure = BABYLON.MeshBuilder.CreateLines("edit", {points : points}, scene);
          movePointButton.disabled = false;
        }
    }
    else if (isDeleting){
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && extrusions.indexOf(pickResult.pickedMesh) !== -1) {
          selectedMesh.material = extrusionMaterial;
          selectedMesh = null;
          extrusionToDelete = pickResult.pickedMesh;
          extrusionToDelete.visibility = 0;
          isDeleting = false;
      }
    } 
    else if (isDrawing) {
      var point = scene.pick(event.clientX, event.clientY);
      if (point.hit && point.pickedMesh == ground){
        points.push(point.pickedPoint);
        if (points.length >= 2){
          var line = BABYLON.MeshBuilder.CreateLines("lines", {points: points}, scene);
          lines.push(line);
        }
      }
    }else if (isAddingStart){
      var point = scene.pick(event.clientX, event.clientY);
      if (point.hit && point.pickedMesh == ground){
          pointsTemp.unshift(point.pickedPoint);
      }
      pointFigure.dispose();
      pointFigure = BABYLON.MeshBuilder.CreateLines("pointFigure", {points: pointsTemp}, scene);
    }else if(isAddingEnd){
      var point = scene.pick(event.clientX, event.clientY);
      if (point.hit && point.pickedMesh == ground){
          pointsTemp.push(point.pickedPoint);
      }
      pointFigure.dispose();
      pointFigure = BABYLON.MeshBuilder.CreateLines("pointFigure", {points: pointsTemp}, scene);
    }else if(isRemovingPoint){
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && pointMeshes.indexOf(pickResult.pickedMesh) !== -1) {
          selectedPointMesh.material = sphereMaterial;
          selectedPointMesh = null;

          // Remove the meshes
          var pointIndex = pointMeshes.indexOf(pickResult.pickedMesh);
          for (var i = 0; i < pointMeshes.length; i++){
          pointMeshes[i].dispose();
          }
          pointMeshes = [];
          pointsTemp.splice(pointIndex, 1);

          for (var i = 0; i < pointsTemp.length; i ++){
              var pointSphere = new BABYLON.MeshBuilder.CreateSphere('point' + i, {diameter: 1}, scene);
              pointSphere.position = pointsTemp[i];
              pointSphere.material = sphereMaterial;
              pointMeshes.push(pointSphere);
          }
          pointFigure.dispose();
          pointFigure = BABYLON.MeshBuilder.CreateLines("edit", {points : pointsTemp}, scene);
      }
    }else if (isMovingPoint){
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && pointMeshes.indexOf(pickResult.pickedMesh) !== -1) {
          if (selectedPointMesh){
          selectedPointMesh.material = sphereMaterial;
          selectedPointMesh = null;}
          camera.detachControl(canvas);
          pointMeshToMove = pickResult.pickedMesh;
          hologramPointMesh = pointMeshToMove.clone();
          hologramPointMesh.material = highlightMaterial;
          hologramPointIndex = pointMeshes.indexOf(pointMeshToMove);
      }
    }
});


////////////////////////////////////////////////POINTER MOVE LISTENER///////////////////////////////////////////////
canvas.addEventListener("pointermove", function (event) {
  if (isMoving && extrusionToMove) {
      var pickInfo = scene.pick(event.clientX, event.clientY);
      if (pickInfo.hit && pickInfo.pickedMesh === ground) {
          pickInfo.pickedPoint.y = ground.position.y + depthMoveExtrusion; 
          hologram.position.copyFrom(pickInfo.pickedPoint);
      }
  } else if (isMoving){
    var pickResult = scene.pick(event.clientX, event.clientY);
    if (pickResult.hit && extrusions.indexOf(pickResult.pickedMesh) !== -1) {
        if (selectedMesh !== pickResult.pickedMesh) {

            // Remove highlight from the previous mesh
            if (selectedMesh) {
                selectedMesh.material = extrusionMaterial;
                selectedMesh = null;
            }

            // Highlight the new mesh
            selectedMesh = pickResult.pickedMesh;
            selectedMesh.material = highlightMaterial;
        }
    }else {

        // Remove highlight when not hovering over a mesh
        if (selectedMesh) {
            selectedMesh.material = extrusionMaterial;
            selectedMesh = null;
        }
    }
  }
  else if (isDeleting || (isEditing && !isRemovingPoint && !isMovingPoint) ) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && extrusions.indexOf(pickResult.pickedMesh) !== -1) {
          if (selectedMesh !== pickResult.pickedMesh) {

              // Remove highlight from the previous mesh
              if (selectedMesh) {
                  selectedMesh.material = extrusionMaterial;
                  selectedMesh = null;
              }

              // Highlight the new mesh
              selectedMesh = pickResult.pickedMesh;
              selectedMesh.material = highlightMaterial;
          }
      } else {
          // Remove highlight when not hovering over a mesh
          if (selectedMesh) {
              selectedMesh.material = extrusionMaterial;
              selectedMesh = null;
          }
      }
  }else if (isRemovingPoint){
    var pickResult = scene.pick(event.clientX, event.clientY);
    if (pickResult.hit && pointMeshes.indexOf(pickResult.pickedMesh) !== -1){
      if (selectedPointMesh !== pickResult.pickedMesh) {

        // Remove highlight from the previous mesh
        if (selectedPointMesh) {
            selectedPointMesh.material = sphereMaterial;
            selectedPointMesh = null;
        }

        // Highlight the new mesh
        selectedPointMesh = pickResult.pickedMesh;
        selectedPointMesh.material = highlightMaterial;
    }
    } else {
      // Remove highlight when not hovering over a mesh
      if (selectedPointMesh) {
        selectedPointMesh.material = sphereMaterial;
        selectedPointMesh = null;
      }
    }
  } else if(isMovingPoint){
    if ( pointMeshToMove) {
      var pickInfo = scene.pick(event.clientX, event.clientY);
      if (pickInfo.hit && pickInfo.pickedMesh === ground) {
          hologramPoints[hologramPointIndex] = pickInfo.pickedPoint.clone();
          if (hologramPointFigure){
          hologramPointFigure.dispose();
          }
          hologramPointFigure = BABYLON.MeshBuilder.CreateLines("holoPointFig", {points : hologramPoints}, scene);
          hologramPointMesh.position.copyFrom(pickInfo.pickedPoint);
    }
    }else{
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && pointMeshes.indexOf(pickResult.pickedMesh) !== -1){
        if (selectedPointMesh !== pickResult.pickedMesh) {

          // Remove highlight from the previous mesh
          if (selectedPointMesh) {
              selectedPointMesh.material = sphereMaterial;
              selectedPointMesh = null;
          }

          // Highlight the new mesh
          selectedPointMesh = pickResult.pickedMesh;
          selectedPointMesh.material = highlightMaterial;
        }
      } else {
          // Remove highlight when not hovering over a mesh
          if (selectedPointMesh) {
            selectedPointMesh.material = sphereMaterial;
            selectedPointMesh = null;
          }
      }
    }
  }
});


//////////////////////////////////////////////////////////////// POINTER OUT LISTENER////////////////////////////////////////////
canvas.addEventListener("pointerout", function () {
  if ((isDeleting && selectedMesh) || (isEditing && selectedMesh)) {
      // Remove highlight when moving the mouse away
      selectedMesh.material = extrusionMaterial;
      selectedMesh = null;
  }else if (isRemovingPoint  && selectedPointMesh){
    selectedPointMesh.material = sphereMaterial;
    selectedPointMesh = null;
  }else if ( isMoving && selectedMesh) {
    // Remove highlight when moving the mouse away
    selectedMesh.material = extrusionMaterial;
    selectedMesh = null;
  }else if (isMovingPoint && selectedPointMesh && !pointMeshToMove){
    selectedPointMesh.material = sphereMaterial;
    selectedPointMesh = null;
  }
});

////////////////////////////////////////////////POINTER UP LISTENER//////////////////////////////////
canvas.addEventListener("pointerup", function () {
    if (isMoving && extrusionToMove) {
      extrusionToMove.visibility = 0;
      hologram.material = extrusionMaterial;
      isMoving = false;
      endPostiion = hologram.position;
      // Re-enable camera controls after move operation
      camera.attachControl(canvas, true);
    }else if (isMovingPoint && pointMeshToMove) {
      pointsTemp[hologramPointIndex] = hologramPointMesh.position.clone();
      pointMeshes[hologramPointIndex].dispose();
      hologramPointMesh.material = sphereMaterial;
      pointMeshes[hologramPointIndex] = hologramPointMesh;
      hologramPointMesh = null;
      pointFigure.dispose();
      pointFigure = hologramPointFigure.clone();
      pointMeshToMove.dispose();
      pointMeshToMove = null;

      // Re-enable camera controls after move operation
      camera.attachControl(canvas, true);
  }
});

//Render Loop
engine.runRenderLoop(function () { 
    scene.render();
});


//Handle windows resize
window.addEventListener("resize", function () {
    engine.resize();
});
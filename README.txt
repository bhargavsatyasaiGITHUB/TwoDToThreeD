Imports and Initializations:

Import Babylon.js and the earcut library for polygon triangulation.
Initialize the Babylon.js engine and create a scene.
Set the background color of the scene.



Camera and Lights:

I Set up an ArcRotateCamera that orbits around a target pointand attach the camera control to the canvas.
I also add a directional light to simulate sunlight and a hemispheric light to brighten the scene.

Ground Plane and Materials:

I created a ground plane mesh,
Created and configured standard materials for the ground, shapes, and highlights and alsoset textures for the ground and buildings.


UI Elements and Buttons:

Selected and assigned  various buttons related to adding shapes, extruding, moving shapes, and editing vertices.
Initialized boolean variables to track different states (e.g., drawing, moving, and editing vertices).
Initialized global variables for managing shapes, points, and extrusions.


Helper Functions:

Defined disableAllButtons to disable all buttons.
Defined enableAllButtons to enable buttons based on the state of the application.

Add Shape Functionality:

When the "Add Shape" button is clicked, start the drawing process by enabling drawing state and resetting points and lines.
When the "Extrude" button is clicked, create an extruded shape from the drawn points and add it to the scene.
Handle canceling the drawing process by disposing of temporary lines and resetting the state.

Extrusion Setup:

Disabled drawing mode since the shape creation process is complete.
Retrieved the depth value from the input field for extrusion.
Check if there are at least two points to form a shape. If yes, proceed with extrusion.

Shape Extrusion:

Used Babylon.js's ExtrudePolygon method to create a 3D shape from the 2D points with the specified depth.
Stored the depth value associated with the shape.
Adjusted the position of the extruded shape.
Get the vertices data of the extruded shape.
Get the indices of the shape's vertices for defining faces.

UV Mapping:

Calculated UV coordinates for texture mapping:
Computed the range of vertex positions.
Computed the offset for normalization.
var u = (x + offset) / range; var v = (y + offset) / range;: Normalized the x and y coordinates to get UV values.
Assigned the UV coordinates to the vertices.
Assigned the indices to the shape.
Applied the material to the extruded shape.


Move Shape Functionality:

When the "Move" button is clicked, start the move process by selecting a mesh to move and creating a hologram.
Handle saving the move by updating the shape's position and finalizing the move.
Handle canceling the move by resetting the state and re-enabling camera controls.

moveButton: Prepares the UI and state for moving a shape. Disables camera controls and other buttons, making relevant UI elements visible.
saveMoveButton: Finalizes the shape movement, updates the shape's points and position, disposes of the hologram, and restores the UI and camera controls.
cancelMoveButton: Cancels the shape movement, restores the original state and visibility of the shape, disposes of the hologram, and restores the UI and camera controls.

Move Vertex Functionality:

When the "Move Vertex" button is clicked, start the vertex moving process by selecting a vertex to move and creating holograms.
Handle saving the move by updating the vertex positions and finalizing the move.
Handle canceling the move by resetting the state and re-displaying the original vertices.






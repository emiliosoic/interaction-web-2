let gridSize = 10; // Distance between particles in the grid
let interactionRadius = 30; // Interaction range for mouse hover
let particleSize = 2; // Size of each particle
let gridParticles = []; // Store all particles in the grid
let mousePath = []; // Store points for the drawn path
let attractionForce = 0.8; // Force that moves particles toward the mouse path
let returnSpeed = 0.05; // Speed at which particles return to their home position
let hoverDelay = 2000; // Time in milliseconds before the particle starts returning after hover stops

function setup() {
  createCanvas(1000, 1000);

  // Generate particle grid
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      gridParticles.push(new Particle(x, y));
    }
  }
}

function draw() {
  background(0);

  // Store mouse path if mouse is pressed (to leave a trail)
  if (mouseIsPressed) {
    mousePath.push(createVector(mouseX, mouseY));
  }

  // Show particles and interact with mouse path
  gridParticles.forEach(particle => {
    particle.moveToPath(mousePath); // Move particles toward the path
    particle.checkHover(); // Check if the particle is being hovered over
    particle.returnToHome(); // Gradually return particles to their home positions after delay
    particle.show();
  });

  // Fade out mouse path after a few frames
  if (mousePath.length > 50) {
    mousePath.shift(); // Remove oldest point to create a fading effect
  }
}

// Particle class that handles movement and interaction with the mouse path
class Particle {
  constructor(x, y) {
    this.home = createVector(x, y); // Particle's home position
    this.pos = this.home.copy(); // Initial position at home
    this.vel = createVector(0, 0); // Velocity for movement
    this.acc = createVector(0, 0); // Acceleration for smooth movement
    this.size = particleSize; // Particle size
    this.movingToPath = false; // To track if the particle is moving toward the path
    this.lastHoverTime = 0; // Last time the particle was hovered over by the mouse
  }

  moveToPath(path) {
    // Find the closest point in the path to the particle
    let closestDist = Infinity;
    let closestPoint = null;

    for (let i = 0; i < path.length; i++) {
      let distance = p5.Vector.dist(path[i], this.pos);
      if (distance < closestDist) {
        closestDist = distance;
        closestPoint = path[i];
      }
    }

    // If the particle is near the path, move toward the closest point
    if (closestPoint && closestDist < interactionRadius) {
      let force = p5.Vector.sub(closestPoint, this.pos); // Vector pointing towards the closest path point
      force.normalize(); // Normalize to keep the movement consistent
      force.mult(attractionForce); // Scale force to control the speed
      this.acc.add(force); // Apply the force as acceleration
      this.movingToPath = true; // Track that the particle is moving toward the path
      this.lastHoverTime = millis(); // Update hover time when the particle is near the path
    } else {
      this.movingToPath = false; // Particle stops moving to the path when it's not near it
    }
  }

  checkHover() {
    // Check if the mouse is not near the particle anymore and start the return timer
    if (!this.movingToPath) {
      // If more than `hoverDelay` milliseconds have passed since the particle was last hovered over
      if (millis() - this.lastHoverTime > hoverDelay) {
        this.returningToHome = true; // Start returning to the home position
      }
    }
  }

  returnToHome() {
    // If the particle has finished interacting with the path, move it back to its original position
    if (this.returningToHome) {
      let force = p5.Vector.sub(this.home, this.pos); // Vector pointing back to the home position
      force.normalize(); // Normalize the force
      force.mult(returnSpeed); // Apply return speed to control the rate of return
      this.acc.add(force); // Apply the force as acceleration
    }
  }

  show() {
    noStroke();
    fill(255); // Keep the particles white
    ellipse(this.pos.x, this.pos.y, this.size, this.size);

    // Update position based on velocity and apply damping
    this.vel.add(this.acc); // Update velocity
    this.vel.mult(0.9); // Apply damping to smooth the motion
    this.pos.add(this.vel); // Update position
    this.acc.mult(0); // Reset acceleration for the next frame
  }
}

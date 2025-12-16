let floorImages = [];
let wallpaperImages = [];
let frameImages = [];
let furnitureImages = [];
let bedImages = [];

let otherImages = {};
let draggableImages = [];

let selectedImage = null;
let offsetX = 0;
let offsetY = 0;
let dividerY;

function preload() {
  function loadImg(path) {
    return loadImage(
      path,
      () => console.log("Loaded:", path),
      () => console.error("Failed:", path)
    );
  }

  // Base
  otherImages.plainWall = loadImg("images/plainWall.png");
  otherImages.plainFloor = loadImg("images/plainFloor.png");

  // Floors
  for (let i = 1; i <= 10; i++) {
    floorImages.push(loadImg(`images/floorImage${nf(i, 2)}.png`));
  }

  // Wallpapers
  for (let i = 1; i <= 12; i++) {
    wallpaperImages.push(loadImg(`images/wallpaperImage${nf(i, 2)}.png`));
  }

  // Frames
  for (let i = 1; i <= 9; i++) {
    frameImages.push(loadImg(`images/frame${nf(i, 2)}.png`));
  }

  // Furniture
  for (let i = 1; i <= 16; i++) {
    furnitureImages.push(loadImg(`images/furniture${nf(i, 2)}.png`));
  }

  // Beds
  for (let i = 1; i <= 5; i++) {
    bedImages.push(loadImg(`images/bed${nf(i, 2)}.png`));
  }

  // Windows
  otherImages.windows = [];
  for (let i = 1; i <= 5; i++) {
    otherImages.windows.push(loadImg(`images/niceWindow${nf(i, 2)}.png`));
  }
}

function setup() {
  const c = createCanvas(900, 600);
  c.parent(document.body);

  dividerY = height * 2 / 3;
  noLoop();
  drawBaseScene();
}

function draw() {
  drawBaseScene();
}

function drawBaseScene() {
  background(220);

  if (otherImages.plainWall)
    image(otherImages.plainWall, 0, 0, width, dividerY);

  if (otherImages.plainFloor)
    image(otherImages.plainFloor, 0, dividerY, width, height - dividerY);

  stroke(0);
  strokeWeight(4);
  line(0, dividerY, width, dividerY);
  noStroke();

  for (let d of draggableImages) {
    push();
    translate(d.x + d.w / 2, d.y + d.h / 2);
    rotate(d.rotation);
    image(d.img, -d.w / 2, -d.h / 2, d.w, d.h);
    pop();
  }
}

// ---------- RANDOM IMAGE ----------
function revealRandomImage() {
  const section = random(["floor", "wallpaper", "other"]);
  const count = section === "other" ? 1 : 2;

  for (let i = 0; i < count; i++) {
    let pool = [];

    if (section === "floor") pool = floorImages;
    else if (section === "wallpaper") pool = wallpaperImages;
    else {
      pool = [
        ...bedImages,
        ...frameImages,
        ...furnitureImages,
        ...otherImages.windows
      ];
    }

    pool = pool.filter(
      img => !draggableImages.some(d => d.img === img)
    );

    if (pool.length === 0) return;

    const img = random(pool);
    const aspect = img.height / img.width;
    const w = 120;
    const h = w * aspect;

    let y =
      floorImages.includes(img)
        ? random(dividerY + 10, height - h)
        : wallpaperImages.includes(img)
        ? random(10, dividerY - h)
        : random(10, height - h);

    draggableImages.push({
      img,
      x: random(50, width - w),
      y,
      w,
      h,
      aspect,
      rotation: 0
    });
  }

  redraw();
}

// ---------- DRAG ----------
function mousePressed() {
  for (let i = draggableImages.length - 1; i >= 0; i--) {
    const d = draggableImages[i];
    if (
      mouseX > d.x &&
      mouseX < d.x + d.w &&
      mouseY > d.y &&
      mouseY < d.y + d.h
    ) {
      selectedImage = d;
      offsetX = mouseX - d.x;
      offsetY = mouseY - d.y;
      draggableImages.push(draggableImages.splice(i, 1)[0]);
      loop();
      break;
    }
  }
}

function mouseDragged() {
  if (!selectedImage) return;
  selectedImage.x = mouseX - offsetX;
  selectedImage.y = mouseY - offsetY;
  redraw();
}

function mouseReleased() {
  selectedImage = null;
  noLoop();
}

// ---------- RESET ----------
function resetSketch() {
  draggableImages = [];
  selectedImage = null;
  redraw();
}

// ---------- IFRAME MESSAGES ----------
window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "RESET") {
    resetSketch();
  }

  if (event.data.type === "DOWNLOAD") {
    saveCanvas("take-my-mess", "png");
  }

  if (event.data.type === "REVEAL") {
    revealRandomImage();
  }
});

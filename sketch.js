let floorImages = [];
let wallpaperImages = [];
let frameImages = [];
let furnitureImages = [];
let bedImages = [];

let otherImages = { windows: [] };
let draggableImages = [];

let selectedImage = null;
let offsetX = 0, offsetY = 0;
let dividerY;

function preload() {
  function loadImg(path) {
    return loadImage(
      path,
      () => console.log(`✅ Loaded: ${path}`),
      err => console.error(`❌ Failed: ${path}`)
    );
  }

  // Base
  otherImages.plainWall  = loadImg('images/plainWall.png');
  otherImages.plainFloor = loadImg('images/plainFloor.png');

  // Floors (01–12)
  for (let i = 1; i <= 12; i++) {
    floorImages.push(
      loadImg(`images/floorImage${nf(i, 2)}.png`)
    );
  }

  // Wallpapers (01–13)
  for (let i = 1; i <= 13; i++) {
    wallpaperImages.push(
      loadImg(`images/wallpaperImage${nf(i, 2)}.png`)
    );
  }

  // Frames (01–09)
  for (let i = 1; i <= 9; i++) {
    frameImages.push(
      loadImg(`images/frame${nf(i, 2)}.png`)
    );
  }

  // Furniture (01–17)
  for (let i = 1; i <= 17; i++) {
    furnitureImages.push(
      loadImg(`images/furniture${nf(i, 2)}.png`)
    );
  }

  // Beds (01–05)
  for (let i = 1; i <= 5; i++) {
    bedImages.push(
      loadImg(`images/bed${nf(i, 2)}.png`)
    );
  }

  // Windows (01–05)
  otherImages.windows = [];
  for (let i = 1; i <= 5; i++) {
    otherImages.windows.push(
      loadImg(`images/niceWindow${nf(i, 2)}.png`)
    );
  }
}

function setup() {
  createCanvas(900, 600);
  dividerY = height * 2 / 3;
  noLoop();
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
    if (!d.img) continue;

    push();
    translate(d.x + d.w / 2, d.y + d.h / 2);
    rotate(d.rotation);
    image(d.img, -d.w / 2, -d.h / 2, d.w, d.h);
    pop();
  }
}

// ---------- IMAGE REVEAL ----------
function revealRandomImage() {
  const section = random(['floor', 'wallpaper', 'other']);
  const count = section === 'other' ? 1 : 2;

  for (let i = 0; i < count; i++) {
    let pool =
      section === 'floor' ? floorImages :
      section === 'wallpaper' ? wallpaperImages :
      [...bedImages, ...frameImages, ...furnitureImages, ...otherImages.windows];

    pool = pool.filter(img => !draggableImages.some(d => d.img === img));

    if (draggableImages.some(d => bedImages.includes(d.img))) {
      pool = pool.filter(img => !bedImages.includes(img));
    }

    if (pool.length === 0) return;

    const img = random(pool);
    const aspect = img.height / img.width;
    const w = 120;
    const h = w * aspect;

    let y =
      floorImages.includes(img) ? random(dividerY + 5, height - h) :
      wallpaperImages.includes(img) ? random(5, dividerY - h) :
      random(5, height - h);

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

// ---------- INTERACTION ----------
function mousePressed() {
  for (let i = draggableImages.length - 1; i >= 0; i--) {
    const d = draggableImages[i];
    if (
      mouseX > d.x && mouseX < d.x + d.w &&
      mouseY > d.y && mouseY < d.y + d.h
    ) {
      selectedImage = d;
      offsetX = mouseX - d.x;
      offsetY = mouseY - d.y;
      draggableImages.push(draggableImages.splice(i,1)[0]);
      loop();
      break;
    }
  }
}

function mouseDragged() {
  if (!selectedImage) return;

  selectedImage.x = mouseX - offsetX;
  selectedImage.y = mouseY - offsetY;

  if (floorImages.includes(selectedImage.img))
    selectedImage.y = constrain(selectedImage.y, dividerY + 1, height - selectedImage.h);

  if (wallpaperImages.includes(selectedImage.img))
    selectedImage.y = constrain(selectedImage.y, 1, dividerY - selectedImage.h);

  redraw();
}

function mouseReleased() {
  selectedImage = null;
  noLoop();
}

function keyPressed() {
  if (!selectedImage) return;

  if (key === 'R' || key === 'r') selectedImage.rotation += PI / 8;
  if (key === 'L' || key === 'l') {
    selectedImage.w *= 1.1;
    selectedImage.h = selectedImage.w * selectedImage.aspect;
  }
  if (key === 'S' || key === 's') {
    selectedImage.w *= 0.9;
    selectedImage.h = selectedImage.w * selectedImage.aspect;
  }

  redraw();
}

// ---------- WIX ----------
window.addEventListener('message', e => {
  if (!e.data || !e.data.type) return;

  const type = e.data.type;

  if (type === "RESET") resetSketch();
  if (type === "DOWNLOAD") saveCanvas('room-design', 'png');

  if (["FLOOR", "WALLPAPER", "FURNITURE", "BED", "WINDOW"].includes(type)) {
    revealByCategory(type);
  }
});

function revealByCategory(category) {
  let pool = [];

  if (category === "FLOOR") pool = floorImages;
  if (category === "WALLPAPER") pool = wallpaperImages;
  if (category === "FURNITURE") pool = furnitureImages.concat(frameImages);
  if (category === "BED") pool = bedImages;
  if (category === "WINDOW") pool = otherImages.windows;

  // Remove already used images
  pool = pool.filter(img => !draggableImages.some(d => d.img === img));

  if (pool.length === 0) return;

  const img = random(pool);
  const aspect = img.height / img.width;
  const w = 120;
  const h = w * aspect;

  let y =
    floorImages.includes(img) ? random(dividerY + 5, height - h) :
    wallpaperImages.includes(img) ? random(5, dividerY - h) :
    random(5, height - h);

  draggableImages.push({
    img,
    x: random(50, width - w),
    y,
    w,
    h,
    aspect,
    rotation: 0
  });

  redraw();
}

function resetSketch() {
  draggableImages = [];
  selectedImage = null;
  redraw();
}

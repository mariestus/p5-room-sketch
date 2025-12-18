let floorImages = [];
let wallpaperImages = [];
let frameImages = [];
let furnitureImages = [];
let bedImages = [];

let otherImages = { windows: [] };
let draggableImages = [];

let activeWallpaper = null;

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

  // room
  otherImages.plainWall  = loadImg('images/plainWall.png');
  otherImages.plainFloor = loadImg('images/plainFloor.png');

  // Floors 1–12
  for (let i = 1; i <= 12; i++) {
    floorImages.push(
      loadImg(`images/floorImage${nf(i, 2)}.png`)
    );
  }

  // Wallpapers 1–13
 // Wallpapers (Wix-hosted URLs)
const wallpaperURLs = [
  "https://static.wixstatic.com/media/a983c6_586000c420b14b88aa302b7d62293637~mv2.png",
  "https://static.wixstatic.com/media/a983c6_07a9f01c00784370a81c809ebecf91be~mv2.png",
  "https://static.wixstatic.com/media/a983c6_69a4e780cb7c45b5870c733ec740c366~mv2.png",
  "https://static.wixstatic.com/media/a983c6_2609dc4b77fc490387bbcc857dc4cf1b~mv2.png",
  "https://static.wixstatic.com/media/a983c6_f46b91bd529745d39305e38ed8274aed~mv2.png",
  "https://static.wixstatic.com/media/a983c6_9519adbdc9e146438fd3c94a22c3fb1f~mv2.png",
  "https://static.wixstatic.com/media/a983c6_065d370f16f740d09290f0af8f60c447~mv2.png",
  "https://static.wixstatic.com/media/a983c6_eaed3cf28d9246b6861b2cc0eed58477~mv2.png",
  "https://static.wixstatic.com/media/a983c6_b4199c014f23481fb8e4fb229fcd812c~mv2.png",
  "https://static.wixstatic.com/media/a983c6_27444dc769cd4c2a8a7fac2e8d232c92~mv2.png",
  "https://static.wixstatic.com/media/a983c6_4d2fde74e97a43ab94b6e084e62f7020~mv2.png",
  "https://static.wixstatic.com/media/a983c6_c5ee332863ec42db852d23b2acbcc903~mv2.png",
  "https://static.wixstatic.com/media/a983c6_7bae6cd02a42482aad2c274a9dd192ac~mv2.png"
];

for (let url of wallpaperURLs) {
  wallpaperImages.push(loadImg(url));
}

  // Frames 1–9
  for (let i = 1; i <= 9; i++) {
    frameImages.push(
      loadImg(`images/frame${nf(i, 2)}.png`)
    );
  }

  // Furniture 1–17
  for (let i = 1; i <= 17; i++) {
    furnitureImages.push(
      loadImg(`images/furniture${nf(i, 2)}.png`)
    );
  }

  // Beds 1–5
  for (let i = 1; i <= 5; i++) {
    bedImages.push(
      loadImg(`images/bed${nf(i, 2)}.png`)
    );
  }

  // Windows 1–5
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
  console.log("Wallpaper count:", wallpaperImages.length);

}

function draw() {
  drawBaseScene();
}

function drawBaseScene() {
  background(220);

 if (activeWallpaper) {
  image(activeWallpaper, 0, 0, width, dividerY);
} else if (otherImages.plainWall) {
  image(otherImages.plainWall, 0, 0, width, dividerY);
}


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

function createDraggable(img) {
  const aspect = img.height / img.width;
  let w = 120;
  let h = w * aspect;

  // wall space
  if (wallpaperImages.includes(img) && h > dividerY - 10) {
    h = dividerY - 10;
    w = h / aspect;
  }

  // floor space
  if (floorImages.includes(img) && h > height - dividerY - 10) {
    h = height - dividerY - 10;
    w = h / aspect;
  }

  let y =
    floorImages.includes(img)
      ? random(dividerY + 5, height - h)
      : wallpaperImages.includes(img)
      ? random(5, dividerY - h)
      : random(5, height - h);

  return {
    img,
    x: random(50, width - w),
    y,
    w,
    h,
    aspect,
    rotation: 0
  };
}


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

// mouse functions
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

// wix interactions
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
  let count = 1;

  if (category === "FLOOR") {
    pool = floorImages;
    count = 3;
  }

  if (category === "WALLPAPER") {
  let available = wallpaperImages.filter(
    img => img !== activeWallpaper
  );

  if (available.length === 0) return;

  activeWallpaper = random(available);
  redraw();
  return;
}


  if (category === "FURNITURE") pool = furnitureImages.concat(frameImages);
  if (category === "BED") pool = bedImages;
  if (category === "WINDOW") pool = otherImages.windows;

  for (let i = 0; i < count; i++) {
    let available = pool.filter(
      img => !draggableImages.some(d => d.img === img)
    );

    // one bed max
    if (
      category === "BED" &&
      draggableImages.some(d => bedImages.includes(d.img))
    ) {
      return;
    }

    if (available.length === 0) return;

    const img = random(available);
    draggableImages.push(createDraggable(img));
  }

  redraw();
}



function resetSketch() {
  draggableImages = [];
  selectedImage = null;
  activeWallpaper = null;
  redraw();

}

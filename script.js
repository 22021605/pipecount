let imgElement = null;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let srcMat = null;

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    imgElement = new Image();
    imgElement.onload = () => {
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      ctx.drawImage(imgElement, 0, 0);
    };
    imgElement.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

function detectCircles() {
  if (!imgElement) {
    alert("Upload an image first!");
    return;
  }
  if (typeof cv === "undefined") {
    alert("OpenCV is still loading. Try again in a few seconds.");
    return;
  }

  // Load image into OpenCV
  let src = cv.imread(imgElement);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  cv.medianBlur(gray, gray, 5);

  let circles = new cv.Mat();
  cv.HoughCircles(
    gray,
    circles,
    cv.HOUGH_GRADIENT,
    1,          // dp
    30,         // minDist between circles
    100,        // param1: Canny high threshold
    30,         // param2: center detection threshold
    10,         // minRadius
    100         // maxRadius
  );

  ctx.drawImage(imgElement, 0, 0);
  let circleCount = 0;

  for (let i = 0; i < circles.cols; ++i) {
    let x = circles.data32F[i * 3];
    let y = circles.data32F[i * 3 + 1];
    let r = circles.data32F[i * 3 + 2];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.stroke();
    circleCount++;
  }

  document.getElementById("count").innerText = "Detected pipes: " + circleCount;

  src.delete();
  gray.delete();
  circles.delete();
}

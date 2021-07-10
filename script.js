var imgOrig = null;   
var imgModif = null;
var imgCurr = null;   /* currently displayed image (It could be imgOrig or imgModif) */
var cnv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
//
var imgCurrWidthOut = document.getElementById("imgWidthOut");
var imgCurrHeightOut = document.getElementById("imgHeightOut");
var canvasWidthOut = document.getElementById("canvasWidthOut");
var blurIntensOut = document.getElementById("blurIntensOut");
var blurRadiusOut = document.getElementById("blurRadiusOut");

const _def_canvas_width = 300;
const _def_blur_intens = 70;
const _def_blur_radius = 6;
const _def_brightness = 35;
const _def_contrast = 35;

document.getElementById("inputCanvasWidth").value = _def_canvas_width;
resizeCanvas(_def_canvas_width);
//
document.getElementById("inputBlurIntensity").value = _def_blur_intens;
changeBlurIntensity(_def_blur_intens);
//
document.getElementById("inputBlurRadius").value = _def_blur_radius;
changeBlurRadius(_def_blur_radius);


document.getElementById("inputBrightnessIntensity").value = _def_brightness;
changeBrightnessIntensity(_def_brightness);

document.getElementById("inputContrastIntensity").value = _def_contrast;
changeContrastIntensity(_def_brightness);

function resizeCanvas(newWidth) {
  cnv.style.width = newWidth + 'px';
  outCanvasSize();
}

function outCanvasSize() {
  canvasWidthOut.value = cnv.style.width;
}

function changeBlurIntensity(newIntens) {
  blurIntensOut.value = newIntens;  
}
function changeBlurRadius(newRadius) {
  blurRadiusOut.value = newRadius;
}

function changeBrightnessIntensity(newBrightness){
	brightnessIntensOut.value = newBrightness;
}

function changeContrastIntensity(newContrast){
	contrastIntensOut.value = newContrast;
}

function upload(finput) {  
  imgOrig = new SimpleImage(finput);
  resetToOriginal();  
}

function resetToOriginal() {
  imgModif = null;
  drawOnCanvas(imgOrig);
  makeModifCopy();  
}

//drawing on canvas
function drawOnCanvas(image) {
  clearCanvas();  
  if (image == null) {
    return; //###!!!
  }
  image.drawTo(canvas);  
  imgCurr = image;  
  outImageSize();
}

function makeModifCopy() {
  if (imgOrig == null) {
    return;
  }
  if (imgOrig.complete()) {
    imgModif = new SimpleImage(imgOrig);
  } else {
    /* Try again after 200ms. */
    setTimeout(makeModifCopy, 200);
  }  
}

//clearing the canvas
function clearCanvas() {
  imgCurr = null; 
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  outImageSize();
}



function outImageSize() {
  if (imgCurr == null) {
    imgCurrWidthOut.innerHTML = null;
    imgCurrHeightOut.innerHTML = null;  
    return;     //###!!!
  }
  if (imgCurr.complete()) {
    imgCurrWidthOut.innerHTML = imgCurr.getWidth();
    imgCurrHeightOut.innerHTML = imgCurr.getHeight();    
  } else {  /* The image is not ready yet. */
    imgCurrWidthOut.innerHTML = null;
    imgCurrHeightOut.innerHTML = null;
    /* Try again after 200ms. */
    setTimeout(outImageSize, 200);
  }
}

//showing the original image
function showOriginal() {
  drawOnCanvas(imgOrig);
}

//showing the modified image
function showModif() {
  drawOnCanvas(imgModif);  
}

function checkReady() {
  if (imgOrig == null) {
    alert("No image selected! Do it.");
    return false;
  }
  if ((imgModif == null) || (!imgModif.complete())) {
    alert("The image is not ready yet. Try later.");
    return false;
  }
  return true;
}


//gray scale algorithm
function makeGray() {
  if (!checkReady()) {
    return;
  }
  for (var pix of imgModif.values()) {    
    var avg = (pix.getRed() + pix.getGreen() + pix.getBlue()) / 3;      
    pix.setRed(avg);
    pix.setGreen(avg);
    pix.setBlue(avg);
  }
  drawOnCanvas(imgModif);  
}


//appling color filter
function colorFilter(color) {
  if (!checkReady()) {
    return;
  }
  var cRed = (color >>> 16) & 0xFF;
  var cGreen = (color >>> 8) & 0xFF;
  var cBlue = color & 0xFF;
  //
  //Normalize to the highest possible color value
  var cMax = cRed;
  if (cGreen > cMax) {
    cMax = cGreen;
  }
  if (cBlue > cMax) {
    cMax = cBlue;
  }  
  cRed = Math.round(255 * cRed / cMax);  
  cGreen = Math.round(255 * cGreen / cMax);
  cBlue = Math.round(255 * cBlue / cMax);
  // 
  //image modification
  for (var pix of imgModif.values()) {    
    var avg = (pix.getRed() + pix.getGreen() + pix.getBlue()) / 3;    
    var factor = avg / 255;    
    pix.setRed(Math.round(cRed * factor));
    pix.setGreen(Math.round(cGreen * factor));
    pix.setBlue(Math.round(cBlue * factor));
  }  
  drawOnCanvas(imgModif);  
}


//converting hex color code to integer
function colorHexStrToInt(colorStr) {
  //Remove # character
  var re = /^#?/;
  colorStr = colorStr.replace(re, '');
  //Convert
  var colorInt = parseInt(colorStr, 16);
  return colorInt;  
}


//for color filter
function applyColor() {
  var colorStr = document.getElementById("inputColor").value; 
  var colorInt = colorHexStrToInt(colorStr);  
  colorFilter(colorInt);
}


//blur tht image
function blurFilter() {
  if (!checkReady()) {
    return;
  }
  var blurR = blurRadiusOut.value;  
  var intens = blurIntensOut.value / 100;
  
  var W = imgModif.getWidth();
  var H = imgModif.getHeight();
  
  var imgB = new SimpleImage(W, H);  
  for (var pix of imgModif.values()) {
    var x = pix.getX();
    var y = pix.getY();
    if (Math.random() > intens) {
      imgB.setPixel(x, y, pix);
    } else
    {  //scramble      
      var srcX = x + blurR * Math.round((Math.random() - 0.5) / 0.5);    
      var srcY = y + blurR * Math.round((Math.random() - 0.5) / 0.5);
      if ((srcX >= 0) && (srcX < W) && (srcY >= 0) && (srcY < H)) {
        imgB.setPixel(x, y, imgModif.getPixel(srcX, srcY));
      } else {  //out of range, copy original
        imgB.setPixel(x, y, pix);        
      }
    }
  }  
  imgModif = imgB;
  drawOnCanvas(imgModif);
}


//for brightness
function brightnessFilter(){
	if(!checkReady())
		return;
	var brightness = (brightnessIntensOut.value)%255;
	for (var pix of imgModif.values()) {
		var newRed = Truncate(pix.getRed()+brightness);
		var newGreen = Truncate(pix.getGreen() + brightness);
		var newBlue = Truncate(pix.getBlue() + brightness);
		pix.setRed(newRed);
		pix.setGreen(newGreen);
		pix.setBlue(newBlue);
	}
	drawOnCanvas(imgModif);
}

//contrast
function contrast(){
	if(!checkReady())
		return;
	var contrast = (contrastIntensOut.value)%255;
	var factor = (259 * (contrast + 255))/(255* (259 - contrast));
	for (var pix of imgModif.values()) {
	 	var newRed = Truncate((factor*pix.getRed()-128)+128);
	 	var newGreen = Truncate((factor*pix.getGreen()-128)+128);
	 	var newBlue = Truncate((factor*pix.getBlue()-128)+128);
	 	pix.setRed(newRed);
	 	pix.setGreen(newGreen);
	 	pix.setBlue(newBlue);
	}
	drawOnCanvas(imgModif);
}

//truncate function for brightness and contrast
function Truncate(value){
	if(value < 0) 
		value = 0

	if(value > 255)
		value = 255

	return value
}


//generating the negative image
function makeInverse () {
  if (!checkReady()) {
    return;
  }
  for (var pix of imgModif.values()) {
    pix.setRed((~pix.getRed()) & 0xFF);  
    pix.setGreen((~pix.getGreen()) & 0xFF);  
    pix.setBlue((~pix.getBlue()) & 0xFF);    
  }  
  drawOnCanvas(imgModif);  
}

//for swaping the pixels
function swapPixels(pix1, pix2) {
  var r = pix2.getRed();
  var g = pix2.getGreen();
  var b = pix2.getBlue();
  var a = pix2.getAlpha();
  pix2.setAllFrom(pix1);
  pix1.setRed(r);
  pix1.setGreen(g);
  pix1.setBlue(b);
  pix1.setAlpha(a);
}


//generating the mirror image
function makeMirror() {
  if (!checkReady()) {
    return;
  }  
  var W = imgModif.getWidth();
  var H = imgModif.getHeight();
  var halfW = Math.floor(W / 2);    
  //
  for (var y = 0; y < H; y++) {
    for (var x = 0; x < halfW; x++) {
      var pixL = imgModif.getPixel(x, y);
      var pixR = imgModif.getPixel(W - x - 1, y);
      swapPixels(pixL, pixR);
    }
  }  
  drawOnCanvas(imgModif);  
}


//flipping the image 
function upsideDown() {
  if (!checkReady()) {
    return;
  }  
  var W = imgModif.getWidth();
  var H = imgModif.getHeight();
  var halfH =  Math.floor(H / 2);
  //
  for (var x = 0; x < W; x++) {
    for (var y = 0; y < halfH; y++) {
      var pixT = imgModif.getPixel(x, y);
      var pixB = imgModif.getPixel(x, H - y - 1);
      swapPixels(pixT, pixB);      
    }
  }
  drawOnCanvas(imgModif);  
}







//GREEN SCREEN FILTER
var fgImage = null;
var bgImage = null;
var fgCanvas;
var bgCanvas;

function gsloadForegroundImage() {
  var file = document.getElementById("gsfgfile");
  fgImage = new SimpleImage(file);
  fgCanvas = document.getElementById("gsfgcan");
  fgImage.drawTo(fgCanvas);
}

function gsloadBackgroundImage() {
  var file = document.getElementById("gsbgfile");
  bgImage = new SimpleImage(file);
  bgCanvas = document.getElementById("gsbgcan");
  bgImage.drawTo(bgCanvas);
}

function gscreateComposite() {
  // this function creates a new image with the dimensions of the foreground image and returns the composite green screen image
  var output = new SimpleImage(fgImage.getWidth(),fgImage.getHeight());
  var greenThreshold = 240;
  for (var pixel of fgImage.values()) {
    var x = pixel.getX();
    var y = pixel.getY();
    if (pixel.getGreen() > pixel.getRed()+pixel.getBlue()) {
      //pixel is green, use background
      var bgPixel = bgImage.getPixel(x,y);
      output.setPixel(x,y,bgPixel);
    }
    else {
      //pixel is not green, use foreground
      output.setPixel(x,y,pixel);
    }
  }
  return output;
}

function gsdoGreenScreen() {
  //check that images are loaded
  if (fgImage == null  || ! fgImage.complete()) {
    alert("Foreground image not loaded");
  }
  if (bgImage == null || ! bgImage.complete()) {
    alert("Background image not loaded");
  }
  // clear canvases
  gsclearCanvas();
  // call createComposite, which does green screen algorithm and returns a composite image
  var finalImage = gscreateComposite();
  finalImage.drawTo(fgCanvas);
}

function gsclearCanvas() {
  gsdoClear(fgCanvas);
  gsdoClear(bgCanvas);
}

function gsdoClear(canvas) {
  var context = canvas.getContext("2d");
  context.clearRect(0,0,canvas.width,canvas.height);
}


//////


var start = null;
var hide = null;
var stfgCanvas;
var stbgCanvas;
var steganographImg = null;


function stloadForegroundImage() {
  var file = document.getElementById("stfgfile");
  start = new SimpleImage(file);
  stfgCanvas = document.getElementById("stfgcan");
  start.drawTo(stfgCanvas);
}

function stloadBackgroundImage() {
  var file = document.getElementById("stbgfile");
  hide = new SimpleImage(file);
  stbgCanvas = document.getElementById("stbgcan");
  hide.drawTo(stbgCanvas);
}

function stclearCanvas() {
  stdoClear(stfgCanvas);
  stdoClear(stbgCanvas);
}

function stdoClear(canvas) {
  var context = canvas.getContext("2d");
  context.clearRect(0,0,canvas.width,canvas.height);
}

function crop(image,width,height){
	var answer = new SimpleImage(width,height);
	for(var pix of answer.values()){
		var x = pix.getX();
		var y = pix.getY();
		var imagePixel = image.getPixel(x,y);
		pix.setRed(imagePixel.getRed());
		pix.setGreen(imagePixel.getGreen());
		pix.setBlue(imagePixel.getBlue());
	}
	return answer;
}

function doHiding(){
  
   //check that images are loaded
  if (start == null  || ! start.complete()) {
    alert("Foreground image not loaded");
  }
  if (hide == null || ! hide.complete()) {
    alert("Background image not loaded");
  }
  // clear canvases
  stclearCanvas();
  
  var x = hide.getWidth();
  if(x>start.getWidth())
	  x = start.getWidth();
  var y = hide.getHeight();
  if(y>start.getHeight())
	  y = start.getHeight();
  
  hide = crop(hide,x,y)
  start = crop(start,x,y);
  start = chop2hide(start);
  //start.drawTo(fgCanvas);
  hide = shift(hide);
 
  //hide.drawTo(bgCanvas);
  var stego = combine(start,hide);
  steganographImg = stego;
  stego.drawTo(stfgCanvas);
}


function shift(image){
  for(var pix of image.values()){
    pix.setRed(Math.floor(pix.getRed()/16));
   pix.setGreen(Math.floor(pix.getGreen()/16));
    pix.setBlue(Math.floor(pix.getBlue()/16));
  }
  return image;
}

function chop2hide(image){
  for(var pix of image.values()){
    pix.setRed(Math.floor(pix.getRed()/16)*16);
   pix.setGreen(Math.floor(pix.getGreen()/16)*16);
    pix.setBlue(Math.floor(pix.getBlue()/16)*16);
  }
  return image;
}

function combine(show,hide){
  var answer = new SimpleImage(show.getWidth(),show.getHeight());
  for(var px of answer.values()){
	  var x = px.getX();
	  var y = px.getY();
	  var showPixel = show.getPixel(x,y);
	  var hidePixel = hide.getPixel(x,y);
		px.setRed(showPixel.getRed()+hidePixel.getRed());
		px.setGreen(showPixel.getGreen()+hidePixel.getGreen());
		px.setBlue(showPixel.getBlue()+hidePixel.getBlue());
  }
  return answer;
}

function doExtraction(){
  for(pix of steganographImg.values()){
    pix.setRed((pix.getRed()%16)*16);
    pix.setGreen((pix.getGreen()%16)*16);
    pix.setBlue((pix.getBlue()%16)*16);
  }
  
  
  steganographImg.drawTo(extractedcan);
}
// variabelen die worden gebruikt om de instellingen van het canvas en de animatie bij te houden.
var opts = {
  width: 400,
  height: 400,
  bg: 'rgb(240, 248, 255);',
  fps: 30,
  cellSize: 4,
};
var ticks = 0;
var particles = null;


// functie die een qr-code genereert op basis van de gegeven data en de deeltjes aanmaakt voor de animatie.
function generateQRCode(data) {
  var qr = qrcode(0, 'L');
  qr.addData(data);
  qr.make();
  // create particles.
  ticks = -10;
  particles = [];
  var moduleCount = particles.moduleCount = qr.getModuleCount();
  for (var r = 0; r < moduleCount; r += 1) {
    for (var c = 0; c < moduleCount; c += 1) {
      if (qr.isDark(r, c) ) {
        particles.push({x: c, y: r, rnd: Math.random() });
      }
    }
  }
}

// dit is de functie die wordt gebruikt om het canvas te initialiseren en de eerste qr-code te genereren.
function setup() {
  const cnv = createCanvas(opts.width, opts.height);
  cnv.parent('canvas-holder');          // hiermee wordt het canvas aan de juiste div in de HTML gekoppeld
  frameRate(opts.fps);
  noStroke();
  fill(opts.bg);
  rect(0, 0, opts.width,opts.height);
  // Genereer een lege QR-code bij het opstarten, zodat er meteen een canvas is om op te tekenen. De gebruiker kan later een QR-code genereren door de invoervelden te gebruiken.
//   generateQRCode('');
}

// dit is de functie die wordt gebruikt om de animatie van de qr-code te tekenen.
function draw() {

  if (particles && ticks < 0) {

    ticks += 5 / opts.fps;
    if (ticks > 0) {
      ticks = 0;
    }

    clear();

    fill(opts.bg);
    rect(0, 0, opts.width,opts.height);

    // met deze code worden de deeltjes getekend die de qr-code vormen. De deeltjes bewegen zich in een spiraalvormige beweging naar hun uiteindelijke positie toe, waarbij ze groter worden en van kleur veranderen naarmate ze dichter bij hun doel komen.
    var qrSize = opts.cellSize * particles.moduleCount;
    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      var x = p.x * opts.cellSize;
      var y = p.y * opts.cellSize;
      var t = p.rnd * Math.PI * 2;
      var r = 10 * ticks * ticks;
      var s = ticks * ticks * 0.2 + 1;
      var a = 1 / s;
      push();
      translate(opts.width / 2, opts.height / 2);
      rotate(-ticks);
      translate(-qrSize / 2, -qrSize / 2);
      translate(opts.cellSize / 2, opts.cellSize / 2);
      translate(x + Math.cos(t) * r, y + Math.sin(t) * r);
      rotate(ticks);
      scale(s);
      translate(-opts.cellSize / 2, -opts.cellSize / 2);
      fill('hsla(' + ~~(p.rnd * 360) + ',' + (100 - 50 * a) + '%,50%,' + a + ')');
      rect(0, 0, opts.cellSize, opts.cellSize);
      pop();
    }
  }
}

 // Deze functie wordt aangeroepen als iemand een qr code probeert te genereren zonder dat ze iets hebben ingevoerd in de url of tekst velden, 
 // of als ze proberen een qr code te genereren zonder een bestand te selecteren. 
 // In dat geval krijgen ze een alert te zien die hen vraagt om eerst iets in te voeren of een bestand te selecteren voordat ze een qr code kunnen genereren.
function generateQR(type) {
  if (type === 'url') {
    var val = document.getElementById('urlInput').value.trim();
    if (val === '') {
      alert('Typ een URL in om een QR-code te genereren.');
      return;
    }
    generateQRCode(val);
  } else if (type === 'text') {

    var val = document.getElementById('textInput').value.trim();
    if (val === '') {
      alert('Typ wat tekst in om een QR-code te genereren.');
      return;
    }
    generateQRCode(val);

  } else if (type === 'file') {
    var fileElem = document.getElementById('fileInput');
    if (fileElem.files.length === 0) {
      alert('Selecteer eerst een bestand.');
      return;
    }
    var file = fileElem.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      generateQRCode(e.target.result);
    };
    reader.readAsDataURL(file);
  }
  }
  document.getElementById('downloadBtn').addEventListener('click', function() {
   const link = document.createElement('a');

  link.href= 'data:image/png;base64,' + btoa(document.getElementsByTagName('canvas')[0].toDataURL().split(',')[1]);

  link.download = 'qr_code.png';

  link.style.display = 'none';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
   } );
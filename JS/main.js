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
var lastTempPage = null;
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
    var fileElem = document.getElementById('file-input');
    if (!fileElem || fileElem.files.length === 0) {
      alert('Selecteer eerst een bestand.');
      return;
    }
    var file = fileElem.files[0];
    var fileURL = URL.createObjectURL(file);
    var safeName = file.name.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
    var isVideo = file.type.startsWith('video/');
    var previewMarkup = isVideo
      ? '<video controls style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 18px 40px rgba(31,79,224,.18);"><source src="' + fileURL + '" type="' + file.type + '">Je browser ondersteunt dit videoformaat niet.</video>'
      : '<img src="' + fileURL + '" alt="' + safeName + '" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 18px 40px rgba(31,79,224,.18);" />';

    var pageHtml = '<!doctype html><html><head><meta charset="utf-8"><title>Bestand bekijken en downloaden</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family:Arial,sans-serif;background:#f7f8ff;margin:0;padding:24px;display:flex;align-items:center;justify-content:center;min-height:100vh;"><div style="background:#fff;border:1px solid #dce3f5;border-radius:14px;padding:24px;max-width:720px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.12);text-align:center;"><h1 style="margin-top:0;color:#1a234f;font-size:1.6rem;">Bekijk en download je bestand</h1><p style="margin:.4rem 0 1.2rem;color:#475176;">Bestandsnaam: ' + safeName + '</p>' + previewMarkup + '<p style="margin:20px 0 0;color:#667488;">Klik op de knop om het bestand te downloaden.</p><a style="display:inline-block;margin-top:18px;padding:12px 18px;background:#1f4fe0;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;" href="' + fileURL + '" download="' + safeName + '">Download bestand</a></div></body></html>';
    var pageDataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(pageHtml);
    lastTempPage = pageDataUrl;
    var previewLink = document.getElementById('preview-link');
    var previewContainer = document.getElementById('preview-link-container');
    if (previewLink && previewContainer) {
      previewLink.href = pageDataUrl;
      previewLink.textContent = 'Open tijdelijke pagina';
      previewContainer.style.display = 'block';
    }
    generateQRCode(pageDataUrl);
  }
}

// Tab switching functionality
    function switchTab(tabName) {
      const tabs = document.querySelectorAll('.tab-content');
      const buttons = document.querySelectorAll('.tab-btn');
      
      tabs.forEach(tab => tab.classList.remove('active'));
      buttons.forEach(btn => btn.classList.remove('active'));
      
      document.getElementById(tabName + '-tab').classList.add('active');
      event.target.classList.add('active');
    }

    // File input label update
    const fileInput = document.getElementById('file-input');
    const fileLabel = document.querySelector('.file-label');
    
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          fileLabel.textContent = this.files[0].name;
          document.querySelector('.file-input-wrapper').classList.add('active');
        }
      });

      fileInput.addEventListener('dragover', function(e) {
        e.preventDefault();
        document.querySelector('.file-input-wrapper').style.borderColor = '#667eea';
      });

      fileInput.addEventListener('dragleave', function() {
        document.querySelector('.file-input-wrapper').style.borderColor = '#e0e0e0';
      });
    }

    var generateFileButton = document.getElementById('generate-file-qr');
    if (generateFileButton) {
      generateFileButton.addEventListener('click', function () {
        generateQR('file');
      });
    }

    // Download functionality
    document.getElementById('download-btn').addEventListener('click', function() {
      const canvas = document.querySelector('#canvas-holder canvas');
      if (!canvas) {
        alert('Genereer eerst een QR-code.');
        return;
      }
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'qr_code.png';
      link.click();
    });

   
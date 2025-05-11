// Load fonts
const fonts = [
  "Anton", "Bebas Neue", "Oswald", "Impact", "Arial", "Comic Sans MS"
];
fonts.forEach(font => {
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
});

// DOM elements
const imageUpload = document.getElementById("imageUpload");
const uploadContainer = document.getElementById("uploadContainer");
const editorContainer = document.getElementById("editorContainer");
const topTextInput = document.getElementById("topText");
const bottomTextInput = document.getElementById("bottomText");
const fontFamilySelect = document.getElementById("fontFamily");
const fontSizeInput = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const textColorInput = document.getElementById("textColor");
const strokeColorInput = document.getElementById("strokeColor");
const memeCanvas = document.getElementById("memeCanvas");
const ctx = memeCanvas.getContext("2d");

// Social sharing and gallery elements
const shareBtn = document.getElementById('share-btn');
const galleryBtn = document.getElementById('gallery-btn');
const galleryContainer = document.getElementById('gallery-container');
const memeGallery = document.getElementById('meme-gallery');
const socialSharePanel = document.getElementById('social-share-panel');
const closeShare = document.getElementById('close-share');

// Social sharing buttons
const shareFacebook = document.getElementById('share-facebook');
const shareTwitter = document.getElementById('share-twitter');
const shareInstagram = document.getElementById('share-instagram');

// Global variables
let currentImage = null;
let currentMeme = null;
let memes = loadMemesFromStorage();

// Initialize gallery
renderGallery();

// Event listeners
// Image upload handling
uploadContainer.addEventListener("click", () => imageUpload.click());

uploadContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadContainer.classList.add("dragover");
});

uploadContainer.addEventListener("dragleave", () => {
  uploadContainer.classList.remove("dragover");
});

uploadContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadContainer.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) loadImage(file);
});

imageUpload.addEventListener("change", () => {
  const file = imageUpload.files[0];
  if (file) loadImage(file);
});

// Form input event listeners
[topTextInput, bottomTextInput, fontFamilySelect, fontSizeInput, textColorInput, strokeColorInput].forEach(input => {
  input.addEventListener("input", drawMeme);
});

fontSizeInput.addEventListener("input", () => {
  fontSizeValue.textContent = `${fontSizeInput.value}px`;
});

textColorInput.addEventListener("input", () => {
  document.getElementById("colorPreview").style.backgroundColor = textColorInput.value;
});

strokeColorInput.addEventListener("input", () => {
  document.getElementById("strokePreview").style.backgroundColor = strokeColorInput.value;
});

// Reset and download buttons
document.getElementById("resetBtn").addEventListener("click", resetMeme);
document.getElementById("downloadBtn").addEventListener("click", downloadMeme);

// Gallery and sharing buttons
if (shareBtn) {
  shareBtn.addEventListener("click", openSharePanel);
}

if (galleryBtn) {
  galleryBtn.addEventListener("click", toggleGallery);
}

if (closeShare) {
  closeShare.addEventListener("click", closeSharePanel);
}

// Save button (if exists)
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
  saveBtn.addEventListener('click', saveMeme);
}

// Social sharing buttons
if (shareFacebook) {
  shareFacebook.addEventListener('click', () => shareMeme('facebook'));
}

if (shareTwitter) {
  shareTwitter.addEventListener('click', () => shareMeme('twitter'));
}

if (shareInstagram) {
  shareInstagram.addEventListener('click', () => shareMeme('instagram'));
}

// Add event listeners for social buttons in panel
document.querySelectorAll('.social-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const platform = this.classList[1]; // Get platform name from class
    shareMeme(platform);
  });
});

// Functions
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      memeCanvas.width = img.width;
      memeCanvas.height = img.height;
      currentImage = img;
      
      // Create currentMeme object
      currentMeme = {
        id: Date.now().toString(),
        image: event.target.result,
        topText: topTextInput.value,
        bottomText: bottomTextInput.value,
        timestamp: new Date().toISOString()
      };
      
      drawMeme();
      uploadContainer.classList.add("hidden");
      editorContainer.classList.remove("hidden");
      
      // Enable share button now that we have an image
      if (shareBtn) {
        shareBtn.disabled = false;
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function drawMeme() {
  if (!currentImage) return;
  ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
  ctx.drawImage(currentImage, 0, 0);

  const fontSize = parseInt(fontSizeInput.value);
  const font = fontFamilySelect.value;
  const textColor = textColorInput.value;
  const strokeColor = strokeColorInput.value;

  ctx.font = `${fontSize}px "${font}"`;
  ctx.fillStyle = textColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = fontSize * 0.08;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Update currentMeme if it exists
  if (currentMeme) {
    currentMeme.topText = topTextInput.value;
    currentMeme.bottomText = bottomTextInput.value;
    // Update the image data in currentMeme after drawing is complete
    setTimeout(() => {
      currentMeme.image = memeCanvas.toDataURL('image/png');
    }, 0);
  }

  // Top Text
  if (topTextInput.value) {
    ctx.fillText(topTextInput.value.toUpperCase(), memeCanvas.width / 2, 10);
    ctx.strokeText(topTextInput.value.toUpperCase(), memeCanvas.width / 2, 10);
  }

  // Bottom Text
  if (bottomTextInput.value) {
    ctx.textBaseline = "bottom";
    ctx.fillText(
      bottomTextInput.value.toUpperCase(),
      memeCanvas.width / 2,
      memeCanvas.height - 10
    );
    ctx.strokeText(
      bottomTextInput.value.toUpperCase(),
      memeCanvas.width / 2,
      memeCanvas.height - 10
    );
  }
}

function resetMeme() {
  editorContainer.classList.add("hidden");
  uploadContainer.classList.remove("hidden");
  imageUpload.value = "";
  currentImage = null;
  currentMeme = null;
  memeCanvas.width = memeCanvas.height = 0;
  topTextInput.value = "";
  bottomTextInput.value = "";
  fontSizeInput.value = 48;
  fontSizeValue.textContent = "48px";
  fontFamilySelect.value = "Impact";
  textColorInput.value = "#ffffff";
  strokeColorInput.value = "#000000";
  
  // Disable share button when resetting
  if (shareBtn) {
    shareBtn.disabled = true;
  }
}

// function downloadMeme() {
//   if (!currentImage) {
//     alert('Veuillez d\'abord télécharger une image.');
//     return;
//   }
  
//   const link = document.createElement("a");
//   link.download = "meme.png";
//   link.href = memeCanvas.toDataURL("image/png");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

function downloadMeme() {
  if (!currentImage) {
    alert("Veuillez d'abord télécharger une image.");
    return;
  }

  // 1. Convert canvas to Blob
  memeCanvas.toBlob(function (blob) {
    // 2. Prepare form data
    const formData = new FormData();
    formData.append("meme", blob, "meme.png");

    // 3. Send via AJAX
    $.ajax({
      url: "upload.php",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        console.log("Mème stocké avec succès :", response);
        alert("Mème enregistré sur le serveur !");
      },
      error: function () {
        console.error("Erreur lors de l'upload.");
        alert("Échec de l'enregistrement sur le serveur.");
      }
    });

    // 4. Continue with local download
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, "image/png");
}

// Gallery functions
function toggleGallery() {
  if (galleryContainer) {
    galleryContainer.classList.toggle('hidden');
    galleryContainer.classList.toggle('active');
  }
  $.ajax({
    url: 'get_memes.php',
    type: 'GET',
    dataType: 'json',
    success: function (images) {
      $(".gallery-container").empty(); // vide l'ancien contenu

      if (images.length === 0) {
        $(".gallery-container").append('<p>hello.</p>');
        return;
      }

      images.forEach(function (src) {
        const img = $('<img>').attr('src', src).css({
          width: '200px',
          height: 'auto',
          borderRadius: '10px'
        });
        $(".gallery-container").append(img);
      });
    },
    error: function () {
      alert("Erreur lors du chargement de la galerie.");
    }
  });
}

function loadMemesFromStorage() {
  const saved = localStorage.getItem('memes');
  return saved ? JSON.parse(saved) : [];
}

function saveMemesToStorage() {
  localStorage.setItem('memes', JSON.stringify(memes));
}

function renderGallery() {
  if (!memeGallery) return;
  
  memeGallery.innerHTML = '';
  
  if (memes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-gallery';
    emptyMsg.textContent = 'Aucun mème sauvegardé';
    memeGallery.appendChild(emptyMsg);
    return;
  }
  
  memes.forEach(meme => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = meme.image;
    img.alt = 'Mème';
    
    const actions = document.createElement('div');
    actions.className = 'gallery-actions';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
    downloadBtn.title = 'Télécharger';
    downloadBtn.addEventListener('click', () => downloadGalleryMeme(meme));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Supprimer';
    deleteBtn.addEventListener('click', () => deleteMeme(meme.id));
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Modifier';
    editBtn.addEventListener('click', () => editMeme(meme));
    
    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '<i class="fas fa-share"></i>';
    shareBtn.title = 'Partager';
    shareBtn.addEventListener('click', () => openShareModal(meme));
    
    actions.appendChild(downloadBtn);
    actions.appendChild(editBtn);
    actions.appendChild(shareBtn);
    actions.appendChild(deleteBtn);
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(actions);
    
    memeGallery.appendChild(galleryItem);
  });
}

function saveMeme() {
  if (!currentImage) {
    alert('Veuillez d\'abord télécharger une image.');
    return;
  }
  
  // Create meme object
  const meme = {
    id: Date.now().toString(),
    image: memeCanvas.toDataURL('image/png'),
    topText: topTextInput.value,
    bottomText: bottomTextInput.value,
    timestamp: new Date().toISOString()
  };
  
  // Add meme to the list
  memes.unshift(meme);
  
  // Save to localStorage
  saveMemesToStorage();
  
  // Update gallery
  renderGallery();
  
  alert('Mème sauvegardé dans la galerie!');
}

function downloadGalleryMeme(meme) {
  const link = document.createElement('a');
  link.download = `meme-${meme.id}.png`;
  link.href = meme.image;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function deleteMeme(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce mème?')) {
    memes = memes.filter(meme => meme.id !== id);
    saveMemesToStorage();
    renderGallery();
  }
}

function editMeme(meme) {
  // Update preview with selected meme
  currentMeme = { ...meme };
  
  // Load the image
  const img = new Image();
  img.onload = function() {
    // Set canvas dimensions
    memeCanvas.width = img.width;
    memeCanvas.height = img.height;
    
    // Set the current image
    currentImage = img;
    
    // Update form fields
    topTextInput.value = meme.topText || '';
    bottomTextInput.value = meme.bottomText || '';
    
    // Draw the meme
    drawMeme();
    
    // Show editor
    uploadContainer.classList.add("hidden");
    editorContainer.classList.remove("hidden");
    
    // Close gallery
    if (galleryContainer) {
      galleryContainer.classList.remove('active');
      galleryContainer.classList.add('hidden');
    }
    
    // Enable share button
    if (shareBtn) {
      shareBtn.disabled = false;
    }
  };
  img.src = meme.image;
}

// Social sharing functions
function openSharePanel() {
  if (!currentImage) {
    alert('Veuillez d\'abord télécharger une image.');
    return;
  }
  
  if (socialSharePanel) {
    socialSharePanel.classList.remove('hidden');
    socialSharePanel.classList.add('active');
  }
}

function closeSharePanel() {
  if (socialSharePanel) {
    socialSharePanel.classList.remove('active');
    socialSharePanel.classList.add('hidden');
  }
}

function openShareModal(meme) {
  // First, set the currentMeme to the one we want to share
  currentMeme = { ...meme };
  
  // Load the meme on canvas
  const img = new Image();
  img.onload = function() {
    memeCanvas.width = img.width;
    memeCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Now open the share panel
    openSharePanel();
  };
  img.src = meme.image;
}

function shareMeme(platform) {
  if (!currentImage) {
    alert('Veuillez d\'abord télécharger une image.');
    return;
  }
  
  // Ensure the image is current
  const imageUrl = memeCanvas.toDataURL('image/png');
  
  // In a real application, you'd use specific social media APIs
  // For this demo, we'll simulate sharing
  let shareUrl = '';
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=Mon%20mème%20génial&url=${encodeURIComponent(window.location.href)}`;
      break;
    case 'instagram':
      // Instagram requires a different approach as it doesn't have direct URL sharing
      alert('Pour Instagram: Téléchargez l\'image puis partagez-la via l\'application Instagram.');
      downloadMeme();
      break;
    case 'pinterest':
      shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(imageUrl)}&description=Mon%20mème%20créé%20avec%20le%20générateur%20de%20mèmes!`;
      break;
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=Mon%20mème%20créé%20avec%20le%20générateur%20de%20mèmes!%20${encodeURIComponent(window.location.href)}`;
      break;
    default:
      alert('Platform de partage non supportée.');
      return;
  }
  
  // Open sharing window
  if (shareUrl) {
    window.open(shareUrl, '_blank');
  }
  
  // Close sharing panel if it exists
  closeSharePanel();
}
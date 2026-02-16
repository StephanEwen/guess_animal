// Game State
let animals = [];
let translations = null;
let currentAnimal = null;
let revealedProperties = [];
let remainingProperties = [];
let gameMode = 'computer'; // 'computer' or 'player'

// Property to image mapping
const propertyImageMapping = {
  active_time: {
    daywalker: 'active_daywalker.png',
    nocturnal: 'active_nocturnal.png'
  },
  habitat: {
    'fields/savanna': 'habitat_field_savanna.png',
    sea: 'habitat_sea.png',
    forrest: 'habitat_forest_jungle.png',
    mountains: 'habitat_mointains.png',
    lake: 'habitat_lake_or_field.png',
    ice: 'habitat_polar.png',
    dessert: 'habitat_desert.png',
    farm: 'habitat_farm.png'
  },
  movement: {
    walk: 'movement_walk.png',
    swim: 'movement_swim.png',
    fly: 'movement_fly.png',
    crouch: 'movement_crouch.png',
    dig: 'movement_dig.png'
  },
  legs: {
    '0': 'legs_0.png',
    '2': 'legs_2.png',
    '4': 'legs_4.png',
    many: 'legs_many.png'
  },
  skin_type: {
    fur: 'skin_fur.png',
    skin: 'skin_skin.png',
    scales: 'skin_scales.png',
    feathers: 'skin_feathers.png',
    spikes: 'skin_spikes.png',
    hardened: 'skin_hardened.png'
  },
  skin_pattern: {
    plain: 'pattern_plain.png',
    striped: 'pattern_striped.png',
    spotted: 'pattern_spotted.png',
    multicolored: 'pattern_multicolored.png'
  },
  speed: {
    slow: 'speed_slow.png',
    moderate: 'speed_normal.png',
    fast: 'speed_fast.png'
  },
  aggressiveness: {
    calm: 'aggressiveness_calm.png',
    aggressive: 'aggressiveness_aggressive.png'
  },
  food: {
    herbivore: 'diet_herbivore.png',
    carnivore: 'diet_carnivore.png',
    omnivore: 'diet_omnivore.png'
  },
  head: {
    plain: 'head_plain.png',
    horns: 'head_horns.png',
    beak: 'head_beak.png',
    cephalopod: 'head_cephalopod.png',
    proboscis: 'head_noses_feelers.png'
  },
  size: {
    small: 'size_small.png',
    moderate: 'size_moderate.png',
    tall: 'size_tall.png'
  }
};

// Animal to image mapping
const animalImageMapping = {
  Rhinoceros: 'rhino.png',
  Fish: 'fish.png',
  Songbird: 'bird.png',
  'Bird of Prey': 'bird_of_prey.png',
  Monkey: 'monkey.png',
  'Brown Bear': 'brown_bear.png',
  'Polar Bear': 'polar_bear.png',
  'Wild boar': 'boar.png',
  Scorpion: 'scorpion.png',
  'Mountain Goat': 'mountain_goat.png'
};

function getAnimalImage(animalName) {
  if (animalImageMapping[animalName]) {
    return animalImageMapping[animalName];
  }
  return animalName.toLowerCase().replace(/ /g, '_') + '.png';
}

// DOM Elements
let propertiesContainer;
let guessBtn;
let nextBtn;
let animalModal;
let animalGrid;
let resultOverlay;
let resultEmoji;
let resultText;
let fireworksCanvas;
let correctAnimalDiv;
let correctAnimalImg;
let correctAnimalName;
let modeComputerBtn;
let modePlayerBtn;
let selectAnimalModal;
let selectAnimalGrid;

// Initialize game
async function init() {
  propertiesContainer = document.getElementById('properties-container');
  guessBtn = document.getElementById('guess-btn');
  nextBtn = document.getElementById('next-btn');
  animalModal = document.getElementById('animal-modal');
  animalGrid = document.getElementById('animal-grid');
  resultOverlay = document.getElementById('result-overlay');
  resultEmoji = document.getElementById('result-emoji');
  resultText = document.getElementById('result-text');
  fireworksCanvas = document.getElementById('fireworks-canvas');
  correctAnimalDiv = document.getElementById('correct-animal');
  correctAnimalImg = document.getElementById('correct-animal-img');
  correctAnimalName = document.getElementById('correct-animal-name');
  modeComputerBtn = document.getElementById('mode-computer-btn');
  modePlayerBtn = document.getElementById('mode-player-btn');
  selectAnimalModal = document.getElementById('select-animal-modal');
  selectAnimalGrid = document.getElementById('select-animal-grid');

  try {
    const [animalsRes, translationsRes] = await Promise.all([
      fetch('data/animals.json'),
      fetch('data/translations.json')
    ]);
    animals = await animalsRes.json();
    translations = await translationsRes.json();

    setupEventListeners();
    startNewGame();
  } catch (error) {
    console.error('Failed to load game data:', error);
  }
}

function setupEventListeners() {
  guessBtn.addEventListener('click', openGuessPopup);
  nextBtn.addEventListener('click', showNextProperty);
  resultOverlay.addEventListener('click', function() {
    resultOverlay.classList.add('hidden');
    stopFireworks();
    startNewGame();
  });
  animalModal.addEventListener('click', function(e) {
    if (e.target === animalModal) {
      animalModal.classList.add('hidden');
    }
  });

  // Mode selection buttons
  modeComputerBtn.addEventListener('click', function() {
    if (gameMode !== 'computer') {
      gameMode = 'computer';
      modeComputerBtn.classList.add('active');
      modePlayerBtn.classList.remove('active');
      startNewGame();
    }
  });

  modePlayerBtn.addEventListener('click', function() {
    if (gameMode !== 'player') {
      gameMode = 'player';
      modePlayerBtn.classList.add('active');
      modeComputerBtn.classList.remove('active');
      startNewGame();
    }
  });

  // Don't allow closing player select modal by clicking outside
  // Player must select an animal to continue
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startNewGame() {
  // Clear display
  propertiesContainer.innerHTML = '';
  currentAnimal = null;
  revealedProperties = [];
  remainingProperties = [];

  // Hide buttons initially
  guessBtn.classList.add('hidden');
  nextBtn.classList.add('hidden');

  if (gameMode === 'computer') {
    // Computer picks random animal
    currentAnimal = animals[Math.floor(Math.random() * animals.length)];
    startGameWithAnimal();
  } else {
    // Player mode - show selection for Player 1
    openPlayerSelectPopup();
  }
}

function startGameWithAnimal() {
  // Get all properties and shuffle
  const allProperties = Object.keys(currentAnimal.properties);
  remainingProperties = shuffleArray(allProperties);
  revealedProperties = [];

  // Show buttons
  guessBtn.classList.remove('hidden');
  nextBtn.classList.remove('hidden');

  // Show first property
  showNextProperty();
}

function openPlayerSelectPopup() {
  selectAnimalGrid.innerHTML = '';

  // Sort animals alphabetically by German name
  const sortedAnimals = [...animals].sort(function(a, b) {
    const nameA = translations.animals[a.animal] || a.animal;
    const nameB = translations.animals[b.animal] || b.animal;
    return nameA.localeCompare(nameB, 'de');
  });

  sortedAnimals.forEach(function(animal) {
    const option = document.createElement('div');
    option.className = 'animal-option';
    option.addEventListener('click', function() {
      handlePlayerSelect(animal);
    });

    const animalName = translations.animals[animal.animal] || animal.animal;

    const img = document.createElement('img');
    img.src = 'img/animals/' + getAnimalImage(animal.animal);
    img.alt = animalName;
    img.onerror = function() {
      // Replace image with text placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'animal-image-placeholder';
      placeholder.textContent = animalName;
      img.replaceWith(placeholder);
    };
    option.appendChild(img);

    const name = document.createElement('div');
    name.className = 'animal-name';
    name.textContent = animalName;
    option.appendChild(name);

    selectAnimalGrid.appendChild(option);
  });

  selectAnimalModal.classList.remove('hidden');
}

function handlePlayerSelect(animal) {
  currentAnimal = animal;
  selectAnimalModal.classList.add('hidden');
  startGameWithAnimal();
}

function showNextProperty() {
  if (remainingProperties.length === 0) return;

  const property = remainingProperties.shift();
  revealedProperties.push(property);

  renderProperty(property);

  // Hide next button if all properties revealed
  if (remainingProperties.length === 0) {
    nextBtn.classList.add('hidden');
  }
}

function renderProperty(property) {
  const row = document.createElement('div');
  row.className = 'property-row';

  // Label
  const label = document.createElement('div');
  label.className = 'property-label';
  label.textContent = translations.properties[property] || property;
  row.appendChild(label);

  // Images container
  const imagesContainer = document.createElement('div');
  imagesContainer.className = 'property-images';

  // Get all possible values for this property
  const possibleValues = Object.keys(propertyImageMapping[property] || {});
  const correctValue = currentAnimal.properties[property];

  // Check if value matches (handles both single values and arrays)
  function isCorrectValue(value) {
    if (Array.isArray(correctValue)) {
      return correctValue.includes(value);
    }
    return value === correctValue;
  }

  // Create image for each possible value
  possibleValues.forEach(function(value) {
    const container = document.createElement('div');
    container.className = 'property-image-container';

    if (isCorrectValue(value)) {
      container.classList.add('highlighted');
    }

    const img = document.createElement('img');
    img.className = 'property-image';
    img.src = 'img/features/' + propertyImageMapping[property][value];
    img.alt = translations.values[value] || value;
    container.appendChild(img);

    const valueLabel = document.createElement('div');
    valueLabel.className = 'property-value-label';
    // Check for property-specific translation first (e.g., head_plain)
    const specificKey = property + '_' + value;
    valueLabel.textContent = translations.values[specificKey] || translations.values[value] || value;
    container.appendChild(valueLabel);

    imagesContainer.appendChild(container);
  });

  row.appendChild(imagesContainer);
  propertiesContainer.appendChild(row);
}

function openGuessPopup() {
  animalGrid.innerHTML = '';

  // Sort animals alphabetically by German name
  const sortedAnimals = [...animals].sort(function(a, b) {
    const nameA = translations.animals[a.animal] || a.animal;
    const nameB = translations.animals[b.animal] || b.animal;
    return nameA.localeCompare(nameB, 'de');
  });

  sortedAnimals.forEach(function(animal) {
    const option = document.createElement('div');
    option.className = 'animal-option';
    option.addEventListener('click', function() {
      handleGuess(animal.animal);
    });

    const animalName = translations.animals[animal.animal] || animal.animal;

    const img = document.createElement('img');
    img.src = 'img/animals/' + getAnimalImage(animal.animal);
    img.alt = animalName;
    img.onerror = function() {
      // Replace image with text placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'animal-image-placeholder';
      placeholder.textContent = animalName;
      img.replaceWith(placeholder);
    };
    option.appendChild(img);

    const name = document.createElement('div');
    name.className = 'animal-name';
    name.textContent = animalName;
    option.appendChild(name);

    animalGrid.appendChild(option);
  });

  animalModal.classList.remove('hidden');
}

function handleGuess(guessedAnimal) {
  animalModal.classList.add('hidden');

  const isCorrect = guessedAnimal === currentAnimal.animal;
  const animalName = translations.animals[currentAnimal.animal] || currentAnimal.animal;

  // Reset the correct animal display
  correctAnimalImg.style.display = 'block';
  var existingPlaceholder = correctAnimalDiv.querySelector('.result-animal-placeholder');
  if (existingPlaceholder) {
    existingPlaceholder.remove();
  }

  // Set up image with fallback
  correctAnimalImg.src = 'img/animals/' + getAnimalImage(currentAnimal.animal);
  correctAnimalImg.alt = animalName;
  correctAnimalImg.onerror = function() {
    correctAnimalImg.style.display = 'none';
    var placeholder = document.createElement('div');
    placeholder.className = 'result-animal-placeholder';
    placeholder.textContent = animalName;
    correctAnimalImg.parentNode.insertBefore(placeholder, correctAnimalImg);
  };
  correctAnimalName.textContent = animalName;

  if (isCorrect) {
    resultEmoji.textContent = '';
    resultText.textContent = translations.ui.correct;
    correctAnimalDiv.classList.remove('hidden');
    resultOverlay.classList.remove('hidden');
    showFireworks();
  } else {
    resultEmoji.textContent = '\uD83D\uDE22';
    resultText.textContent = translations.ui.wrong;
    correctAnimalDiv.classList.remove('hidden');
    resultOverlay.classList.remove('hidden');
  }
}

// Fireworks Animation
let particles = [];
let animationId = null;

function showFireworks() {
  const ctx = fireworksCanvas.getContext('2d');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  particles = [];

  // Create multiple firework bursts
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];

  function createBurst(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        life: 100 + Math.random() * 50,
        maxLife: 150
      });
    }
  }

  // Create initial bursts
  for (let i = 0; i < 5; i++) {
    setTimeout(function() {
      createBurst(
        Math.random() * fireworksCanvas.width,
        Math.random() * fireworksCanvas.height * 0.6
      );
    }, i * 300);
  }

  function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    particles = particles.filter(function(p) { return p.life > 0; });

    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life--;

      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    if (!resultOverlay.classList.contains('hidden')) {
      // Keep creating new bursts while overlay is visible
      if (Math.random() < 0.02) {
        createBurst(
          Math.random() * fireworksCanvas.width,
          Math.random() * fireworksCanvas.height * 0.6
        );
      }
      animationId = requestAnimationFrame(animate);
    } else {
      stopFireworks();
    }
  }

  animate();
}

function stopFireworks() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  particles = [];
  const ctx = fireworksCanvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', init);

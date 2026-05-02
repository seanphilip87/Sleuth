// --- GAME STATE ---
const config = {
    gridSize: 3,
    hasWeapon: false,
    jeopardyTimer: -1, // -1 means inactive
    murderRoomIndex: -1,
    currentRoomIndex: 0,
    isGathered: false,
    gameOver: false
};

const roomNames = [
    "Grand Hall", "Library", "Kitchen", "Conservatory", 
    "Dining Room", "Billiard Room", "Lounge", "Study", "Bed Room"
];

const suspects = [
    { name: "Col. Mustard", annoyance: 0, isMurderer: false, roomIndex: -1, alibi: "" },
    { name: "Miss Scarlet", annoyance: 0, isMurderer: false, roomIndex: -1, alibi: "" },
    { name: "Mr. Green", annoyance: 0, isMurderer: false, roomIndex: -1, alibi: "" },
    { name: "Mrs. Peacock", annoyance: 0, isMurderer: false, roomIndex: -1, alibi: "" }
];

const items = [
    { name: "Candlestick", isWeapon: false, roomIndex: -1 },
    { name: "Knife", isWeapon: false, roomIndex: -1 },
    { name: "Lead Pipe", isWeapon: false, roomIndex: -1 },
    { name: "Wrench", isWeapon: false, roomIndex: -1 }
];

let map = [];

// --- INITIALIZATION & RANDOMIZATION ---
function initGame() {
    // 1. Randomize Map Layout
    let shuffledNames = roomNames.sort(() => 0.5 - Math.random());
    for (let i = 0; i < 9; i++) {
        map.push({ name: shuffledNames[i], visited: false, index: i });
    }
    
    // Set starting room
    config.currentRoomIndex = Math.floor(Math.random() * 9);
    map[config.currentRoomIndex].visited = true;

    // 2. Randomize Murderer & Weapon & Scene
    const murderer = suspects[Math.floor(Math.random() * suspects.length)];
    murderer.isMurderer = true;
    
    const weapon = items[Math.floor(Math.random() * items.length)];
    weapon.isWeapon = true;

    config.murderRoomIndex = Math.floor(Math.random() * 9);

    // 3. Scatter People and Items
    suspects.forEach(s => s.roomIndex = Math.floor(Math.random() * 9));
    items.forEach(i => i.roomIndex = Math.floor(Math.random() * 9));

    // Generate Alibis based on original locations
    suspects.forEach(s => {
        if (s.isMurderer) {
            // Murderer claims a random false room
            let falseRoom = Math.floor(Math.random() * 9);
            s.alibi = `I was in the ${map[falseRoom].name} all night.`;
        } else {
            // Innocent tells the truth
            s.alibi = `I was in the ${map[s.roomIndex].name}.`;
        }
    });

    renderMap();
    printText("Welcome to SLEUTH. A murder has occurred.");
    lookRoom();
    renderBaseControls();
}

// --- UTILITIES ---
function printText(text) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML += `\n${text}\n`;
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function advanceTime() {
    if (config.gameOver) return;

    // Move suspects randomly (20% chance per action)
    suspects.forEach(s => {
        if (Math.random() < 0.2 && !config.isGathered) {
            s.roomIndex = Math.floor(Math.random() * 9);
        }
    });

    // Handle Jeopardy Timer
    if (config.hasWeapon) {
        config.jeopardyTimer--;
        if (config.jeopardyTimer === 3) printText("!!! You hear footsteps rushing toward you! !!!");
        if (config.jeopardyTimer <= 0) {
            printText("\n*** THE MURDERER HAS FOUND YOU. YOU HAVE BEEN KILLED. GAME OVER. ***");
            config.gameOver = true;
            document.getElementById('controls').innerHTML = ''; // Lock controls
        }
    }
}

// --- VISUAL RENDERING ---
function renderMap() {
    const minimap = document.getElementById('minimap');
    minimap.innerHTML = '';
    map.forEach((room, index) => {
        const div = document.createElement('div');
        div.className = `map-room ${room.visited ? 'visited' : ''} ${index === config.currentRoomIndex ? 'active' : ''}`;
        div.innerText = room.visited ? room.name : '?';
        minimap.appendChild(div);
    });
}

function lookRoom() {
    const room = map[config.currentRoomIndex];
    room.visited = true;
    renderMap();

    printText(`\n--- ${room.name} ---`);
    if (config.currentRoomIndex === config.murderRoomIndex) {
        printText("There are dark bloodstains on the floor here... This is where the murder happened!");
    }
    
    const peopleHere = suspects.filter(s => s.roomIndex === config.currentRoomIndex);
    if (peopleHere.length > 0) printText(`You see: ${peopleHere.map(s => s.name).join(", ")}`);

    const itemsHere = items.filter(i => i.roomIndex === config.currentRoomIndex);
    if (itemsHere.length > 0) printText(`Items: ${itemsHere.map(i => i.name).join(", ")}`);
}

// --- UI CONTROLS ---
const controlsDiv = document.getElementById('controls');

function createButton(text, onClick) {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.onclick = () => {
        if (!config.gameOver) {
            onClick();
            advanceTime();
        }
    };
    controlsDiv.appendChild(btn);
}

function renderBaseControls() {
    if (config.gameOver) return;
    controlsDiv.innerHTML = '';
    createButton('Look Around', lookRoom);
    createButton('Move', renderMoveControls);
    
    // If gathered, change options
    if (config.isGathered) {
        createButton('Accuse', renderAccuseControls);
    } else {
        createButton('Examine/Take', renderItemControls);
        createButton('Question', renderQuestionControls);
        if (config.hasWeapon) createButton('Gather All', gatherSuspects);
    }
}

// --- MOVEMENT ---
function renderMoveControls() {
    controlsDiv.innerHTML = '';
    const idx = config.currentRoomIndex;
    const row = Math.floor(idx / 3);
    const col = idx % 3;

    if (row > 0) createButton('North', () => move(idx - 3));
    if (row < 2) createButton('South', () => move(idx + 3));
    if (col < 2) createButton('East', () => move(idx + 1));
    if (col > 0) createButton('West', () => move(idx - 1));
    createButton('[ CANCEL ]', renderBaseControls);
}

function move(newIndex) {
    config.currentRoomIndex = newIndex;
    config.isGathered = false; // Breaking the gathering if you leave
    lookRoom();
    renderBaseControls();
}

// --- INVESTIGATION ---
function renderItemControls() {
    controlsDiv.innerHTML = '';
    const itemsHere = items.filter(i => i.roomIndex === config.currentRoomIndex);
    
    if (itemsHere.length === 0) {
        printText("\n> Nothing of interest here.");
        renderBaseControls();
        return;
    }

    itemsHere.forEach(item => {
        createButton(item.name, () => {
            if (item.isWeapon) {
                printText(`\n> You pick up the ${item.name}. It is covered in blood! THE MURDERER KNOWS YOU HAVE IT. HURRY!`);
                config.hasWeapon = true;
                config.jeopardyTimer = Math.floor(Math.random() * 5) + 6; // 6 to 10 moves to live
                item.roomIndex = -99; // Remove from room
            } else {
                printText(`\n> You examine the ${item.name}. It's clean.`);
            }
            renderBaseControls();
        });
    });
    createButton('[ CANCEL ]', renderBaseControls);
}

function renderQuestionControls() {
    controlsDiv.innerHTML = '';
    const peopleHere = suspects.filter(s => s.roomIndex === config.currentRoomIndex);
    
    if (peopleHere.length === 0) {
        printText("\n> No one is here.");
        renderBaseControls();
        return;
    }

    peopleHere.forEach(suspect => {
        createButton(suspect.name, () => {
            suspect.annoyance++;
            printText(`\n> You question ${suspect.name}.`);
            
            if (suspect.annoyance > 3) {
                printText(`"${suspect.name}: I've had enough of your questions! Leave me alone!"`);
            } else if (suspect.annoyance > 2) {
                printText(`"${suspect.name}: I already told you! ${suspect.alibi}"`);
            } else {
                printText(`"${suspect.name}: ${suspect.alibi}"`);
            }
            renderBaseControls();
        });
    });
    createButton('[ CANCEL ]', renderBaseControls);
}

// --- CLIMAX MECHANICS ---
function gatherSuspects() {
    printText("\n> You command everyone to gather in this room.");
    suspects.forEach(s => s.roomIndex = config.currentRoomIndex);
    config.isGathered = true;
    lookRoom();
    renderBaseControls();
}

function renderAccuseControls() {
    controlsDiv.innerHTML = '';
    suspects.forEach(suspect => {
        createButton(suspect.name, () => {
            printText(`\n> YOU ACCUSE ${suspect.name.toUpperCase()}!`);
            
            if (config.currentRoomIndex !== config.murderRoomIndex) {
                printText("You idiot! This isn't even where the murder took place! The murderer strikes while you are confused. GAME OVER.");
                config.gameOver = true;
            } else if (suspect.isMurderer) {
                printText("*** YOU SOLVED THE CASE! ***");
                printText(`${suspect.name} breaks down and confesses to the crime! YOU WIN!`);
                config.gameOver = true;
            } else {
                printText(`Wrong! ${suspect.name} is innocent! The real murderer escapes. GAME OVER.`);
                config.gameOver = true;
            }
            controlsDiv.innerHTML = ''; // End game UI
        });
    });
    createButton('[ CANCEL ]', renderBaseControls);
}

// Start
initGame();
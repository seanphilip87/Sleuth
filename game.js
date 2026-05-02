// --- GAME STATE ---
const rooms = {
    hall: { name: "The Grand Hall", description: "A vast entrance hall. There are doors to the North and East.", north: "library", east: "kitchen" },
    library: { name: "The Library", description: "Shelves of dusty books. The Hall is South.", south: "hall" },
    kitchen: { name: "The Kitchen", description: "Smells of old food. The Hall is West.", west: "hall" }
};

const suspects = [
    { name: "Colonel Mustard", room: "library", isMurderer: false, alibi: "I was reading alone." },
    { name: "Miss Scarlet", room: "kitchen", isMurderer: false, alibi: "I was cooking." },
    { name: "Mr. Green", room: "hall", isMurderer: false, alibi: "I just arrived." }
];

const items = [
    { name: "candlestick", room: "hall", isWeapon: false },
    { name: "knife", room: "kitchen", isWeapon: false },
    { name: "pipe", room: "library", isWeapon: false }
];

let currentRoom = "hall";

// --- INITIALIZATION ---
function initGame() {
    const murdererIndex = Math.floor(Math.random() * suspects.length);
    suspects[murdererIndex].isMurderer = true;
    suspects[murdererIndex].alibi = "I was definitely NOT in the house!"; 

    const weaponIndex = Math.floor(Math.random() * items.length);
    items[weaponIndex].isWeapon = true;

    printText("Welcome to SLEUTH.\nA murder has been committed.");
    lookRoom();
    renderBaseControls(); // Load the main menu buttons
}

function printText(text) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML += `\n${text}\n`;
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function lookRoom() {
    const room = rooms[currentRoom];
    printText(`\n--- ${room.name} ---`);
    printText(room.description);
    
    const peopleHere = suspects.filter(s => s.room === currentRoom);
    if (peopleHere.length > 0) printText(`You see: ${peopleHere.map(s => s.name).join(", ")}`);

    const itemsHere = items.filter(i => i.room === currentRoom);
    if (itemsHere.length > 0) printText(`Items: ${itemsHere.map(i => i.name).join(", ")}`);
}

// --- DYNAMIC UI CONTROLS ---
const controlsDiv = document.getElementById('controls');

// Helper function to create buttons
function createButton(text, onClickFunction) {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.onclick = onClickFunction;
    controlsDiv.appendChild(btn);
}

// 1. The Main Menu
function renderBaseControls() {
    controlsDiv.innerHTML = ''; // Clear current buttons
    createButton('Look Around', () => { printText("\n> LOOK"); lookRoom(); });
    createButton('Move', renderMoveControls);
    createButton('Examine', renderExamineControls);
    createButton('Question', renderQuestionControls);
}

// 2. The Movement Menu
function renderMoveControls() {
    controlsDiv.innerHTML = '';
    const room = rooms[currentRoom];
    const directions = ['north', 'south', 'east', 'west'];
    
    directions.forEach(dir => {
        if (room[dir]) {
            createButton(`Go ${dir}`, () => {
                currentRoom = room[dir];
                printText(`\n> GO ${dir.toUpperCase()}`);
                lookRoom();
                renderBaseControls(); // Go back to main menu after moving
            });
        }
    });
    createButton('[ CANCEL ]', renderBaseControls);
}

// 3. The Examine Menu
function renderExamineControls() {
    controlsDiv.innerHTML = '';
    const itemsHere = items.filter(i => i.room === currentRoom);
    
    if (itemsHere.length === 0) {
        printText("\n> There is nothing to examine here.");
        renderBaseControls();
        return;
    }

    itemsHere.forEach(item => {
        createButton(item.name, () => {
            printText(`\n> EXAMINE ${item.name.toUpperCase()}`);
            if (item.isWeapon) {
                printText("Wait... there are BLOOD STAINS on it! This is the murder weapon!");
            } else {
                printText("It's just a normal object. Nothing suspicious.");
            }
            renderBaseControls();
        });
    });
    createButton('[ CANCEL ]', renderBaseControls);
}

// 4. The Questioning Menu
function renderQuestionControls() {
    controlsDiv.innerHTML = '';
    const peopleHere = suspects.filter(s => s.room === currentRoom);
    
    if (peopleHere.length === 0) {
        printText("\n> There is no one here to question.");
        renderBaseControls();
        return;
    }

    peopleHere.forEach(suspect => {
        createButton(suspect.name, () => {
            printText(`\n> QUESTION ${suspect.name.toUpperCase()}`);
            printText(`"${suspect.alibi}"`);
            renderBaseControls();
        });
    });
    createButton('[ CANCEL ]', renderBaseControls);
}

// Start the game
initGame();
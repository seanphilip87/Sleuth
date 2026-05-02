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
    // Randomize murderer
    const murdererIndex = Math.floor(Math.random() * suspects.length);
    suspects[murdererIndex].isMurderer = true;
    // The murderer lies (simplified for now)
    suspects[murdererIndex].alibi = "I was definitely NOT in the house!"; 

    // Randomize weapon
    const weaponIndex = Math.floor(Math.random() * items.length);
    items[weaponIndex].isWeapon = true;

    printText("Welcome to SLEUTH. A murder has been committed.");
    lookRoom();
}

// --- CORE FUNCTIONS ---
function printText(text) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML += `\n${text}`;
    outputDiv.scrollTop = outputDiv.scrollHeight; // Scroll to bottom
}

function lookRoom() {
    const room = rooms[currentRoom];
    printText(`\n--- ${room.name} ---`);
    printText(room.description);
    
    // Who is here?
    const peopleHere = suspects.filter(s => s.room === currentRoom);
    if (peopleHere.length > 0) {
        printText(`You see: ${peopleHere.map(s => s.name).join(", ")}`);
    }

    // What is here?
    const itemsHere = items.filter(i => i.room === currentRoom);
    if (itemsHere.length > 0) {
        printText(`Items: ${itemsHere.map(i => i.name).join(", ")}`);
    }
}

// --- PARSER ---
function processCommand(input) {
    const args = input.toLowerCase().trim().split(" ");
    const command = args[0];
    const target = args.slice(1).join(" ");

    printText(`\n> ${input}`);

    if (command === "go") {
        const room = rooms[currentRoom];
        if (room[target]) {
            currentRoom = room[target];
            lookRoom();
        } else {
            printText("You can't go that way.");
        }
    } else if (command === "look") {
        lookRoom();
    } else if (command === "examine") {
        const item = items.find(i => i.name === target && i.room === currentRoom);
        if (item) {
            if (item.isWeapon) {
                printText(`You examine the ${item.name}... wait, there are BLOOD STAINS on it! This is the murder weapon!`);
            } else {
                printText(`It's just a normal ${item.name}. Nothing suspicious.`);
            }
        } else {
            printText("You don't see that here.");
        }
    } else if (command === "question") {
        const suspect = suspects.find(s => s.name.toLowerCase().includes(target) && s.room === currentRoom);
        if (suspect) {
            printText(`"${suspect.alibi}"`);
        } else {
            printText("They aren't here.");
        }
    } else {
        printText("I don't understand that command. Try 'go [direction]', 'look', 'examine [item]', or 'question [name]'.");
    }
}

// --- EVENT LISTENERS ---
document.getElementById('command').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        processCommand(this.value);
        this.value = ''; // Clear input
    }
});

// Start game
initGame();

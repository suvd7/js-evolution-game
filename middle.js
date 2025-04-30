import { levels, evolutions } from "./evolutions.js";

// this is for the game-data
let url = new URL(location.href);
const PLAYER_NAME = url.searchParams.get("name");
const PLAYER_LEVEL = url.searchParams.get("level");

const name =  document.querySelector("#playernamedisplayer");
name.innerHTML = "Name: " + PLAYER_NAME;

const level =  document.querySelector("#playerleveldisplayer");
level.innerHTML = "Difficulty: " + PLAYER_LEVEL;

const timer = document.querySelector("#timerdisplay");
timer.innerHTML = "Time: 00:00";

// scoring 
let score = 0;
const completionCount = {
    // "Styling Technologies":0,
}
evolutions.forEach((evo) => {
    completionCount[evo["name"]] = 0;
})


const scoreDiv = document.querySelector("#scoring-table");
for (const evo of evolutions) {
    const evoDiv = document.createElement("div");
    evoDiv.innerHTML = `${evo["name"]} * ${evo["points"]} = 0`;
    evoDiv.id = `score-${evo["name"].replaceAll(" ", "-")}`;
    scoreDiv.appendChild(evoDiv);
}

const updateScoreTable = () => {
    for (const evo of evolutions) {
       const evoDiv = document.querySelector(`#score-${evo["name"].replaceAll(" ", "-")}`);
       evoDiv.innerHTML = `${evo["name"]} * ${evo["points"]} =  ${completionCount[evo["name"]] * evo["points"]}`;
    }
}
updateScoreTable();

const scoreDisplay = document.querySelector("#score-display");
function updateScore() {
    scoreDisplay.innerHTML = `Score: ${score}`;
}
updateScore()

// time limit 
const timeLimit = {
    easy: 10*60,  medium: 15*60, hard: 20*60
}; 

const MAX_TIME  = timeLimit[PLAYER_LEVEL]; 

let timeLeft = MAX_TIME; 
const timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const sec = (timeLeft % 60).toString().padStart(2, "0");
    timer.innerHTML = `Time: ${minutes}:${sec}`;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
    }
}, 1000);



// giving random pictires on my table 
const settings =levels[PLAYER_LEVEL];
const matrix = [];
for (let row=0; row < settings.rows; row++) {
    matrix.push(Array(settings.cols).fill(0));
}

let success = 0;
while (success < settings.rows) {
    const row = Math.floor(Math.random() * (settings.rows - 1));
    const col = Math.floor(Math.random() * (settings.cols - 1));
    const tech = Math.floor(Math.random() * 9);
    if (matrix[row][col] === 0) {
        matrix[row][col] = {
            name: evolutions[tech]["name"],
            description: evolutions[tech]["description"],
            tooltip: evolutions[tech]["tooltip"],
            step: evolutions[tech]["steps"][0]
        };
        success++;
        // console.log(row,col, evolutions[tech]["steps"][0].img);  
    }
}


let selectedRow = -1;
let selectedCol = -1;

const onImageClick = (rowIndex, colIndex) => {

    if (matrix[rowIndex][colIndex] === 0) {
        const tech = Math.floor(Math.random() * (evolutions.length - 1));
        matrix[rowIndex][colIndex] = {
            name: evolutions[tech]["name"],
            description: evolutions[tech]["description"],
            tooltip: evolutions[tech]["tooltip"],
            step: evolutions[tech]["steps"][0]

        };
       const img = document.querySelector(`#r${rowIndex}-${colIndex}`);
       img.src = `logos/${evolutions[tech].steps[0].img}`
        img.style.background = "white";

        selectedCol = -1;
        selectedRow = -1;
        return;
    }

    if(matrix[rowIndex][colIndex]["step"]["step"] === 6) {
        const currDiv = document.querySelector(`#r${rowIndex}-${colIndex}`);
        currDiv.src = "";
        currDiv.style.backgroundColor = "black";
        const points = (evolutions.find((evo) => evo["name"] === matrix[rowIndex][colIndex]["name"]))["points"]; 
        score += points;
        completionCount[matrix[rowIndex][colIndex]["name"]] += 1;


        matrix[rowIndex][colIndex] = 0;
        console.debug(completionCount);
        console.log(score)
        selectedCol = -1;
        selectedRow = -1;
        updateScoreTable();
        updateScore()
        return;
    }


    if (selectedRow === -1 && selectedCol === -1) {
        selectedCol = colIndex;
        selectedRow = rowIndex;
        const currDiv = document.querySelector(`#r${rowIndex}-${colIndex}`);
       currDiv.style.border = "red solid 5px";
       currDiv.style.boxSizing = "border-box";
    } else {
         const curr = matrix[rowIndex][colIndex];
         const prev = matrix[selectedRow][selectedCol];

         if (rowIndex === selectedRow && colIndex === selectedCol) {
        selectedCol = -1;
        selectedRow = -1;
        const currDiv = document.querySelector(`#r${rowIndex}-${colIndex}`);
        currDiv.style.border = "";
    }else if (curr["name"] === prev["name"] && curr["step"]["step"] === prev["step"]["step"]) {
        console.debug("matched!");
        const tech = evolutions.findIndex(({name}) => name ===curr["name"] );
        matrix[rowIndex][colIndex] = {
            name: evolutions[tech]["name"],
            description: evolutions[tech]["description"],
            tooltip: evolutions[tech]["tooltip"],
            step: evolutions[tech]["steps"][curr["step"]["step"] ]
        }
        const currDiv = document.querySelector(`#r${rowIndex}-${colIndex}`);
        currDiv.src = "logos/"+ evolutions[tech]["steps"][curr["step"]["step"]].img;
         
        const tech2 = Math.floor(Math.random() * evolutions.length);
        matrix[selectedRow][selectedCol] = {
            name: evolutions[tech2]["name"],
            description: evolutions[tech2]["description"],
            tooltip: evolutions[tech2]["tooltip"],
            step: evolutions[tech2]["steps"][0],
        };
        const prevDiv = document.querySelector(`#r${selectedRow}-${selectedCol}`);
        prevDiv.src = `logos/${evolutions[tech2].steps[0].img}`
        prevDiv.style.border = "";
        selectedCol = -1;
        selectedRow = -1;
    } else {
        const currDiv = document.querySelector(`#r${selectedRow}-${selectedCol}`);
        currDiv.style.border = "";
        selectedCol = -1;
        selectedRow = -1;

    }
}}

const hPercent = 100 / settings.cols;
const matrixDisplay = document.querySelector("#matrix");
matrix.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
        const div = document.createElement("div");
        div.style = `user-select: none; -webkit-user-select: none; -ms-user-select: none; -moz-user-select: none; box-sizing: border-box; background-color: black; width: ${hPercent}%; height: ${hPercent}%; border: solid #2bbbd4 2px; border-radius: 10px`;        
        const img = document.createElement("img");
        img.style = " width: 100%; height: 100%; use-select: none;";
        img.id = `r${rowIndex}-${colIndex}`;
        div.appendChild(img);

             // tooltip
             let tooltipTimer;
             img.addEventListener("mouseenter", () => {
                 tooltipTimer = setTimeout(() => {
                     showTooltip(img, matrix[rowIndex][colIndex]);
                 }, 3000); 
             });
             img.addEventListener("mouseleave", () => {
                 clearTimeout(tooltipTimer);
                 hideTooltip();
             });

             img.addEventListener("click", () => {
               onImageClick(rowIndex,colIndex)
             })
        if (col !== 0) {
            img.src = `logos/${col.step.img}`; 
            img.style.backgroundColor = "white";
        }
        matrixDisplay.appendChild(div);
    });
});

// game ending pop up 
function gameOver() {
    const endScreen = document.querySelector("#end-screen");
    endScreen.style.display = "flex"; 
}

document.querySelector("#back").addEventListener("click", () => {
    location.href = "index.html";
});

document.querySelector("#restart").addEventListener("click", () => {
    location.reload();
});

// tooltip
function showTooltip(target, cellData) { 
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.top = (target.getBoundingClientRect().top + window.scrollY - 50) + "px";
    tooltip.style.left = (target.getBoundingClientRect().left + window.scrollX) + "px";
    tooltip.innerHTML = `
    <strong>${cellData.step.name}<br></strong>
    <strong>Description:</strong> ${cellData.step.description}<br>
    <img src="starter_pack/assets/evolutions/${cellData.tooltip}" style="width: 80%; height: 50%; margin-top: 2px;">`;
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.remove();
    }
}

// draw buttton
function isMatrixFull() {
    return matrix.every(row => row.every(cell => cell !== 0));
}

function generateNew() {
    if (isMatrixFull()) {
        console.log("bad");
        return; 
    }

    let placed = false;
    let attempts = 0;
    const maxAttempts = 100; 
    while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * settings.rows);
        const col = Math.floor(Math.random() * settings.cols);

        if (matrix[row][col] === 0) {
            const tech = Math.floor(Math.random() * (evolutions.length - 1));
            matrix[row][col] = {
                name: evolutions[tech]["name"],
                description: evolutions[tech]["description"],
                tooltip: evolutions[tech]["tooltip"],
                step: evolutions[tech]["steps"][0]
            };
            const img = document.querySelector(`#r${row}-${col}`);
            img.src = `logos/${evolutions[tech].steps[0].img}`;
            img.style.backgroundColor = "white";
            placed = true;
        }

        attempts++;
    }

    if (attempts >= maxAttempts) {
        console.log("><")
    }
}

document.querySelector("#draw-button").addEventListener("click", () => {
    generateNew();
});



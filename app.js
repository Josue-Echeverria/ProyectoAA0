//VARIABLES GLOBALES
let IMAGEN = null;
let CANVAS = null;
let CONTEXT = null;
let SIZE = {width:0,height:0};
let TAMAÑO = 3;
let PIEZAS = [];
let PIEZA_SELECCIONADA = null;
let EMPTYPOS = {x: -1, y: -1}
let MATRIZ_LOGICA
let MATRIZ_OBJETIVO
let dictObjetivo = {}


document.getElementById("suffle").addEventListener("click", function(evt){
    shuffle();
});

document.getElementById("getSolution").addEventListener("click", function(evt){
    calcularSolucionConAEstrella(MATRIZ_LOGICA, MATRIZ_OBJETIVO, calcularMovimientosParaVacio, calcularHeuristica)
    //calcularSolucionConBacktracking()
});

document.getElementById("solve").addEventListener("click", function(evt){
    calcularSolucionConBacktracking();
});


/**Funcion principal que se ejecuta siempre que se cargue la pagina 
 * @summary:
 * Define variables globales:
 *  -IMAGEN = La imagen que utilizara para el puzzle 
 *  -CANVAS = El canvas en donde se encontrara la imagen y los parametros de ancho y largo 
 *  -CONTEXT = Los valores de renderizado en un canvas 
 *  -SIZE = Los valores de ancho y largo de cada pieza 
 * 
 * Llama a las funciones necesarias para generar el puzzle
 */
function main(){
    IMAGEN = document.getElementById("imagen");
    CANVAS = document.getElementById('myCanvas');
    CONTEXT = CANVAS.getContext('2d');//Se utilizara el renderizado en 2d (para imagenes, formas, texto)

    let resizer = Math.min(
        900/IMAGEN.width,
        600/IMAGEN.height
    );
    
    CANVAS.width = resizer*IMAGEN.width-100;
    CANVAS.height = resizer*IMAGEN.height-100;
    SIZE.width = resizer*IMAGEN.width-100;
    SIZE.height = resizer*IMAGEN.height-100;
    cargarPiezas();
    updateCanva();
    CANVAS.addEventListener("click",onclick);
}

function updateCanva(){
    CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height)
    CONTEXT.globalAlpha = 0.1;
    CONTEXT.drawImage(IMAGEN,0,0,SIZE.width,SIZE.height);
    CONTEXT.globalAlpha = 1;
    for(let i = 0; i<PIEZAS.length; i++){
        PIEZAS[i].draw(CONTEXT)
    }
}

function generateNotInList(lista, top){
    for(let i = 0; i<top; i++){
        for(let j = 0; j<top; j++){
            if(!lista.some(([x, y]) => x === i && y === j))
                return[i,j]
        }
    }
}

function generateRandomNotInList(lista, top){
    let randomX = 0;
    let randomY = 0;
    do{
        randomX = Math.floor(Math.random() * top-1)+1;
        randomY = Math.floor(Math.random() * top-1)+1;
    }while(lista.some(([x, y]) => x === randomX && y === randomY));
    return [randomX,randomY]
}

function shuffle(){
    let tempList = [];
    let randomX = 0;
    let randomY = 0;
    let randomPos = [];
    for(let i = 0; i<PIEZAS.length; i++){
        randomPos = generateRandomNotInList(tempList,TAMAÑO);
        tempList.push(randomPos);
        randomX = randomPos[0];
        randomY = randomPos[1];
        let loc = {
            x:(SIZE.width*randomX/TAMAÑO),
            y:(SIZE.height*randomY/TAMAÑO)
        }
        PIEZAS[i].x=loc.x;
        PIEZAS[i].y=loc.y;
        MATRIZ_LOGICA[randomY][randomX] = PIEZAS[i].numero
    }
    updateCanva();
    const pos = generateNotInList(tempList, TAMAÑO)
    EMPTYPOS.x = pos[0];
    EMPTYPOS.y = pos[1];
    MATRIZ_LOGICA[pos[1]][pos[0]] = 0
}

function cargarPiezas(){
    PIEZAS = [];
    MATRIZ_LOGICA = []
    MATRIZ_OBJETIVO = []
    counter = 1
    for(let i = 0; i<TAMAÑO; i++){
        MATRIZ_LOGICA.push([])
        MATRIZ_OBJETIVO.push([])
        for(let j = 0; j<TAMAÑO; j++){
            PIEZAS.push(new Pieza(i,j,counter))
            MATRIZ_OBJETIVO[i][j] = counter
            MATRIZ_LOGICA[i][j] = 0
            dictObjetivo[counter] = [i,j]
            counter++;
        }
    }
    MATRIZ_OBJETIVO[MATRIZ_LOGICA.length-1][MATRIZ_OBJETIVO[0].length-1] = 0;
    delete dictObjetivo[counter-1]
    PIEZAS.pop()
}


function confirmMovement(pieza){
    const posX = SIZE.width*EMPTYPOS.x/TAMAÑO
    const posY = SIZE.height*EMPTYPOS.y/TAMAÑO

    if(pieza.x+SIZE.width/TAMAÑO === posX && pieza.y === posY){
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero
        EMPTYPOS.x = pieza.x/(SIZE.width/TAMAÑO);
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0
        pieza.x = pieza.x+SIZE.width/TAMAÑO;
    }
    if(pieza.x-SIZE.width/TAMAÑO === posX && pieza.y === posY){
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero
        EMPTYPOS.x = pieza.x/(SIZE.width/TAMAÑO);
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0        
        pieza.x = pieza.x-SIZE.width/TAMAÑO
    }
    if(pieza.y+SIZE.height/TAMAÑO === posY && pieza.x === posX){
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero
        EMPTYPOS.y = pieza.y/(SIZE.height/TAMAÑO);    
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0      
        pieza.y = pieza.y+SIZE.height/TAMAÑO
    }
    if(pieza.y-SIZE.height/TAMAÑO === posY && pieza.x === posX){
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero
        EMPTYPOS.y = pieza.y/(SIZE.height/TAMAÑO);
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0  
        pieza.y = pieza.y-SIZE.height/TAMAÑO
    }
    updateCanva();
}


function getPiezaSeleccionada(loc){
    const rect = CANVAS.getBoundingClientRect();
    for(let i = 0; i<PIEZAS.length;i++){
        if(loc.x - rect.x > PIEZAS[i].x
        && loc.x - rect.x < PIEZAS[i].x+PIEZAS[i].width 
        && loc.y - rect.y > PIEZAS[i].y
        && loc.y - rect.y < PIEZAS[i].y+PIEZAS[i].height)
        {
            return PIEZAS[i];
        }
    }
    return null
}


function onclick(evt){
    PIEZA_SELECCIONADA = getPiezaSeleccionada(evt);
    if(PIEZA_SELECCIONADA != null){
        confirmMovement(PIEZA_SELECCIONADA)
    }
}
class Pieza{
    constructor(fila, columna, numero){
        this.fila = fila;
        this.columna = columna;
        this.x = SIZE.width*this.columna/TAMAÑO;
        this.y = SIZE.height*this.fila/TAMAÑO;
        this.width = SIZE.width/TAMAÑO;
        this.height = SIZE.height/TAMAÑO;
        this.numero = numero
    }
    draw(context){
        context.beginPath();
        context.drawImage(IMAGEN
            , this.columna*IMAGEN.width/TAMAÑO
            , this.fila*IMAGEN.height/TAMAÑO
            , IMAGEN.width/TAMAÑO
            , IMAGEN.height/TAMAÑO
            , this.x
            , this.y
            , this.width
            , this.height
            );
        context.rect(this.x,this.y,this.width,this.height);
        context.stroke();
    }
}

class MatrixStorage {
    constructor(){
        this.testedMatrices = new Set();
    }

    serializeMatrix(matrix){
        return JSON.stringify(matrix);
    }

    addTestedMatrix(matrix){
        const key = this.serializeMatrix(matrix);
        this.testedMatrices.add(key);
    }

    isTestedMatrix(matrix){
        const key = this.serializeMatrix(matrix);
        return this.testedMatrices.has(key);
    }
    createCopy() {
        let nuwStorageMatrix = new MatrixStorage();
        nuwStorageMatrix.testedMatrices = new Set(this.testedMatrices);
        return nuwStorageMatrix;
    }
}

function backtracking(estado, posVacia, estadosProbados, caminos, solucion, profundidad, iteraciones){
    //document.write("Avanzando <br> Profundidad:", profundidad)
    //printMatrix(caminos)
    //console.log(estado)
    //document.write("Estado actual <br>")
    //printMatrix(estado)
    //printMatrix(solucion)
    if(JSON.stringify(estado) === JSON.stringify(solucion)){
        //document.write("Suuuuuu <br>")
        return caminos;
    }

    if(profundidad < 1){
        return -1;
    }
    //iteraciones[0] += 1
    let posiblesCaminos = [];
    let posiblesEstados = [];
    generarPosiblesSoluciones(estado, posVacia, posiblesCaminos, posiblesEstados);
    
    //document.write("Posibles caminos <br>")
    //printMatrix(posiblesCaminos);
    //document.write("Posibles estados <br>")
    //printMatrix(posiblesEstados);
    
    for(let i = 0; i < posiblesEstados.length; i++){
        let nuevoEstado = posiblesEstados[i];
        let nuevoCamino = posiblesCaminos[i];

        if (!estadosProbados.isTestedMatrix(nuevoEstado)) {
            let nuevosCaminos = deepCopyArray(caminos);
            //let nuevosEstados = estadosProbados.createCopy();
            nuevosCaminos.push(nuevoCamino);
            //nuevosEstados.addTestedMatrix(nuevoEstado);
            estadosProbados.addTestedMatrix(nuevoEstado);
            let resultado = backtracking(nuevoEstado, nuevoCamino, estadosProbados, nuevosCaminos, solucion, profundidad - 1, iteraciones);
            //document.write("Retrocediendo <br> Profundidad:", profundidad)
            //printMatrix(caminos)
            if(resultado != -1){
                return resultado 
            }
        }
    } 

    return -1
}

function generarPosiblesSoluciones(estado, posVacia, posiblesCaminos, posiblesEstados){
    const fila = posVacia[0];
    const columna = posVacia[1];
    const n = estado.length;
    let temp = estado

    if (fila > 0){              //pasar el vacio para arriba
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila - 1][columna];
        posibleEstado[fila - 1][columna] = temp;
        //printMatrix(estado);
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila - 1, columna]);
    }

    if (fila < n - 1){          //pasar el vacio para abajo
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila + 1][columna];
        posibleEstado[fila + 1][columna] = temp;
        //printMatrix(estado);
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila + 1, columna]);
    }

    if (columna > 0){           //pasar el vacio para la izquierda
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila][columna - 1];
        posibleEstado[fila][columna - 1] = temp;
        //printMatrix(estado);
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila, columna - 1]);
    }

    if (columna < n - 1){       //pasar el vacio para la derecha
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila][columna + 1];
        posibleEstado[fila][columna + 1] = temp;
        //printMatrix(estado);
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila, columna + 1]);
    }
}

function deepCopyArray(arr) {
    return arr.map(item => Array.isArray(item) ? deepCopyArray(item) : item);
}

function buscarPieza(fil, col){
    x = SIZE.width*col/TAMAÑO;
    y = SIZE.height*fil/TAMAÑO;

    for(let i = 0; i<PIEZAS.length;i++){
        if(PIEZAS[i].x === x && PIEZAS[i].y === y){
            return PIEZAS[i]
        }
    }
}

function colocarSolucion(resultado, posVacia, matrizRand){    
    let fil = posVacia[0];
    let col = posVacia[1];

    for (const movimiento of resultado) {
        const filSig = movimiento[0];
        const colSig = movimiento[1];
        let pieza = buscarPieza(filSig, colSig);

        pieza.x = SIZE.width*col/TAMAÑO;
        pieza.y = SIZE.height*fil/TAMAÑO;        
        updateCanva();

        [MATRIZ_LOGICA[fil][col], MATRIZ_LOGICA[filSig][colSig]] = [MATRIZ_LOGICA[filSig][colSig], MATRIZ_LOGICA[fil][col]];

        fil = filSig;
        col = colSig;
    }
}

function calcularSolucionConBacktracking(){
    let matrizBase = deepCopyArray(MATRIZ_OBJETIVO)
    
    let matrizRand = deepCopyArray(MATRIZ_LOGICA)
    console.log(matrizRand)
    let posVacia = [];
    posVacia.push(EMPTYPOS.y);
    posVacia.push(EMPTYPOS.x);

    let estadosProbados = new MatrixStorage();
    estadosProbados.addTestedMatrix(matrizRand);
    
    let profundidad = 200 //calcularCantidadMovimientosNecesarios(matrizRand);

    resultado = backtracking(matrizRand, posVacia, estadosProbados, [], matrizBase, profundidad);
    console.log(resultado)
    const divElement = document.getElementById('textArea');
    if (resultado != -1) {
        colocarSolucion(resultado, posVacia, matrizRand);
        return;
    }
    else{
        console.log("No hay solucion posible o la profundidad no es suficiente");
    }
}

function calcularSolucionConAEstrella(){
    let matrizObjetivo = []
    let posObjetivo = []
    for(let i = 0; i < PIEZAS.length; i++){
        posObjetivo = dictObjetivo[i+1]
        heuristica = Math.abs(posObjetivo[1] - PIEZAS[i].x/(SIZE.width/TAMAÑO)) + Math.abs(posObjetivo[0] - PIEZAS[i].y/(SIZE.height/TAMAÑO))
        console.log("NUMBER"+ PIEZAS[i].numero)
        console.log(heuristica)
    }
}


function PriorityQueue() {
    this.elements = [];
}

PriorityQueue.prototype.enqueue = function (e) {
    this.elements.push(e);
    this.elements.sort((a, b) => a.priority - b.priority);
};

PriorityQueue.prototype.dequeue = function () {
    return this.elements.shift();
};

PriorityQueue.prototype.isEmpty = function () {
    return !this.elements.length;
};

function Node(state, parent, action, pathCost, heuristicCost) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.pathCost = pathCost;
    this.priority = pathCost + heuristicCost;
}


function calcularSolucionConAEstrella(startState, objetivo, calcularPosiblesMovimientos, calcularHeuristica) {
    let frontier = new PriorityQueue();
    frontier.enqueue(new Node(startState, null, null, 0, calcularHeuristica(startState)));
    let explored = new Set();
    counter = 20 
    while (!frontier.isEmpty()) {
//    while (counter>0) {
        let node = frontier.dequeue();
        printMatriz(node.state)
        if (arraysEqual(node.state, objetivo)) {
            return node;
        }
        explored.add(node.state.toString());
        let movimientos = calcularPosiblesMovimientos(node.state);
        
        for (let movimiento of movimientos) {
            if(movimiento.length !== 0){
                let copiaEstado = JSON.parse(JSON.stringify(node.state))
                let childNode = new Node(realizarMovimiento(copiaEstado,movimiento[0],movimiento[1]), node, movimiento, node.pathCost + 1, calcularHeuristica(movimiento, objetivo));
                if (!explored.has(childNode.state.toString())) {
                    frontier.enqueue(childNode);
                }
            }
        }
        counter--
    }
    return false;
}

function printMatriz(matriz){
    for(let i = 0; i < matriz.length; i++){
        console.log(matriz[i])
    }
    console.log(" ");
}

function posicionVacia(estado){
    for(let i = 0; i < estado.length; i++){
        for(let j = 0; j < estado.length; j++){
            if(estado[j][i] === 0) return [j,i]
        }
    }
}


function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
}

function calcularHeuristica(estadoActual){
    let sumatoriaCaminos = 0;
    for(let i = 0; i < estadoActual.length; i++){
        for(let j = 0; j < estadoActual.length; j++){
            
            let numActual = estadoActual[i][j]

            let posObjetivoNumActual = dictObjetivo[numActual]
            if(posObjetivoNumActual === undefined) continue

            let distancia = Math.abs(i-posObjetivoNumActual[0])+Math.abs(j-posObjetivoNumActual[1])

            sumatoriaCaminos += distancia
        }
    }
    return sumatoriaCaminos/(TAMAÑO**2)
}

function calcularMovimientosParaVacio(estadoActual){
    let posVacia = posicionVacia(estadoActual)
    let moverDerecha = 0
    let moverIzquierda = 0
    let moverArriba = 0
    let moverAbajo = 0

    if(posVacia[0]+1 < TAMAÑO)
        moverAbajo = 1
    else
        moverAbajo = 10000

    if(posVacia[0]-1 >= 0)
        moverArriba = 1
    else
        moverArriba = 10000

    if(posVacia[1]-1 >= 0)
        moverIzquierda = 1
    else
        moverIzquierda = 10000

    if(posVacia[1]+1 < TAMAÑO)
        moverDerecha = 1
    else
        moverDerecha = 10000

    let posiblesMovimientos = []
    
    if(10000 !== moverDerecha) 
        posiblesMovimientos.push([posVacia, [posVacia[0],posVacia[1]+1]])
    if(10000 !== moverIzquierda) 
        posiblesMovimientos.push([posVacia, [posVacia[0],posVacia[1]-1]])
    if(10000 !== moverArriba) 
        posiblesMovimientos.push([posVacia, [posVacia[0]-1,posVacia[1]]])
    if(10000 !== moverAbajo)
        posiblesMovimientos.push([posVacia, [posVacia[0]+1,posVacia[1]]])
    return posiblesMovimientos;
}


function realizarMovimiento(estadoActual, posicionInicial, posicionFinal){
    estadoActual[posicionInicial[0]][posicionInicial[1]] = estadoActual[posicionFinal[0]][posicionFinal[1]]
    estadoActual[posicionFinal[0]][posicionFinal[1]] = 0;
    return estadoActual;
}
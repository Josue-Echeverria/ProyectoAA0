//VARIABLES GLOBALES
let IMAGEN = null;
let CANVAS = null;
let CONTEXT = null;
let SIZE = {width:0,height:0};
let TAMAÑO = 4;
let PIEZAS = [];
let PIEZA_SELECCIONADA = null;
let EMPTYPOS = {x: -1, y: -1}

document.getElementById("suffle").addEventListener("click", function(evt){
    shuffle();
});


/**Funcion principal que se ejecuta siempre que se cargue la pagina 
 * @summary:
 * Define variables globales:
 *  -IMAGEN = La imagen que utilizara para el puzzle 
 *  -CANVAS = El canvas en donde se encontrara la imagen y los parametros de ancho y largo 
 *  -CONTEXT = Los valores de
 *  -SIZE = Los valores de ancho y largo de cada pieza 
 * 
 * Llama a las funciones necesarias para generar el puzzle
 */
function main(){
    IMAGEN = document.getElementById("imagen");
    CANVAS = document.getElementById('myCanvas');
    CONTEXT = CANVAS.getContext('2d');//

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
    }
    updateCanva();
    const pos = generateNotInList(tempList, TAMAÑO)
    EMPTYPOS.x = pos[0];
    EMPTYPOS.y = pos[1];
}

function cargarPiezas(){
    PIEZAS = [];
    for(let i = 0; i<TAMAÑO; i++){
        for(let j = 0; j<TAMAÑO; j++){
            PIEZAS.push(new Pieza(i,j))
        }
    }
    PIEZAS.pop()
}


function confirmMovement(pieza){
    const posX = SIZE.width*EMPTYPOS.x/TAMAÑO
    const posY = SIZE.height*EMPTYPOS.y/TAMAÑO
    console.log(EMPTYPOS)
    if(pieza.x+SIZE.width/TAMAÑO === posX && pieza.y === posY){
        EMPTYPOS.x = pieza.x/(SIZE.width/TAMAÑO);
        pieza.x = pieza.x+SIZE.width/TAMAÑO;
        console.log("MOver derecha")
    }
    if(pieza.x-SIZE.width/TAMAÑO === posX && pieza.y === posY){
        EMPTYPOS.x = pieza.x/(SIZE.width/TAMAÑO);        
        pieza.x = pieza.x-SIZE.width/TAMAÑO
        console.log("MOver izquierda")
    }
    if(pieza.y+SIZE.height/TAMAÑO === posY && pieza.x === posX){
        EMPTYPOS.y = pieza.y/(SIZE.height/TAMAÑO);        
        pieza.y = pieza.y+SIZE.height/TAMAÑO
        console.log("MOver abajo")
    }
    if(pieza.y-SIZE.height/TAMAÑO === posY && pieza.x === posX){
        EMPTYPOS.y = pieza.y/(SIZE.height/TAMAÑO);        
        pieza.y = pieza.y-SIZE.height/TAMAÑO
        console.log("MOver arriba")
    }
    console.log(EMPTYPOS)
    updateCanva();
}


function getPiezaSeleccionada(loc){
    const rect = CANVAS.getBoundingClientRect();
    for(let i = 0; i<PIEZAS.length;i++){
        if(loc.x - rect.top + window.scrollX > PIEZAS[i].x
        && loc.x - rect.top + window.scrollX < PIEZAS[i].x+PIEZAS[i].width 
        && loc.y - rect.top + window.scrollY > PIEZAS[i].y
        && loc.y - rect.top + window.scrollY < PIEZAS[i].y+PIEZAS[i].height)
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
    constructor(fila, columna){
        this.fila = fila;
        this.columna = columna;
        this.x = SIZE.width*this.columna/TAMAÑO;
        this.y = SIZE.height*this.fila/TAMAÑO;
        this.width = SIZE.width/TAMAÑO;
        this.height = SIZE.height/TAMAÑO;
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
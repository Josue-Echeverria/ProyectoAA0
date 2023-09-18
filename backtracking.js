//TODAVIA NO ESTA COMPLETO, CON RESPECTO A LA VERSION DE PYTHON

function backtracking(estado, posVacia, estadoAnterior, caminos, solucion, profundidad){
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

        if (JSON.stringify(nuevoEstado) !== JSON.stringify(estadoAnterior)) {
            let nuevosCaminos = deepCopyArray(caminos);
            nuevosCaminos.push(nuevoCamino);
            let resultado = backtracking(nuevoEstado, nuevoCamino, estado, nuevosCaminos, solucion, profundidad - 1);
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

function calcularCantidadMovimientosNecesarios(matrizRand){
    let arrayRand = [];
    let movimientosTotales = 0;
    
    for (const filaActual of matrizRand) {
        for (let elemento of filaActual) { 
            if (elemento == 0){
                elemento = matrizRand.length * matrizRand.length;
            } 
            arrayRand.push(elemento);
        }
    }

    let flag = true;
    while (flag){
        flag = false;
        for (let i = 0; i < arrayRand.length; i++){
            movimientosTotales += 1;
            //document.write(arrayRand, "<br>")
            if (arrayRand[i] > arrayRand[i+1]){
                const temp = arrayRand[i];
                arrayRand[i] = arrayRand[i+1]
                arrayRand[i+1] = temp;
                flag = true;
                
            }
        }
    }
    
    return movimientosTotales;
}

function enter(){
    document.write("<br>");
}

function printMatrix(matrix) {
    document.write("<table border='1'>"); // Start an HTML table
    
    for (let i = 0; i < matrix.length; i++) {
        document.write("<tr>"); // Start a table row
        for (let j = 0; j < matrix[i].length; j++) {
            document.write("<td>" + matrix[i][j] + "</td>"); // Add a table cell with the matrix element
        }
        document.write("</tr>"); // End the table row
    }
    document.write("</table>"); // End the HTML table
    document.write("<br>")
}


let matrizBase = [[1, 2, 3], 
                   [4, 5, 6], 
                   [7, 8, 0]];

let matrizRand = [[1, 2, 3], 
                   [4, 5, 6], 
                   [7, 0, 8]];

let posVacia = [2, 1];
// Convert matriz_rand to a set containing a single deep copy
let estadosProbados = new Set([matrizRand.map(row => [...row])]);

let profundidad = 15//calcularCantidadMovimientosNecesarios(matrizRand);
document.write(profundidad)
enter();

resultado = backtracking(matrizRand, posVacia, [], [], matrizBase, profundidad);
enter();


if (resultado != -1){
    document.write("Posible camino encontrado: <br>")
    //document.write("[", resultado[i], "]", "<br>");
    document.write("Vizualizacion del camino de la solucion <br>");
    let fila = posVacia[0];
    let columna = posVacia[1];

    for (const movimiento of resultado) {
        const filaSig = movimiento[0];
        const columnaSig = movimiento[1];

        // Swap elements in matrizRand
        [matrizRand[fila][columna], matrizRand[filaSig][columnaSig]] = [matrizRand[filaSig][columnaSig], matrizRand[fila][columna]];

        fila = filaSig;
        columna = columnaSig;

        // Print the matrizRand
        printMatrix(matrizRand);
    }
    
}
else{
    document.write("No se encontró solución para la profundidad usada")
}
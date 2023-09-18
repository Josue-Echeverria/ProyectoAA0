let iteraciones = [0]

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
}

encontrarSolucion8Puzzle(3)

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
    iteraciones[0] += 1
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
            nuevosCaminos.push(nuevoCamino);
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

function encontrarSolucion8Puzzle(n){
    let matrizBase = [[1, 2, 3], 
                   [4, 5, 6], 
                   [7, 8, 0]];

    let matrizRand = [[6, 5, 1],
                    [7, 4, 0],
                    [3, 8, 2]];

    let posVacia = [1, 2];
    // Convert matriz_rand to a set containing a single deep copy
    let estadosProbados = new MatrixStorage();
    estadosProbados.addTestedMatrix(matrizRand);

    let profundidad = 35//calcularCantidadMovimientosNecesarios(matrizRand);

    resultado = backtracking(matrizRand, posVacia, estadosProbados, [], matrizBase, profundidad, iteraciones);
    enter();
    mostrarSolucion(resultado, posVacia, matrizRand)

    return resultado;
}

function mostrarSolucion(resultado, posVacia, matrizRand){
    document.write("Cantidad de iteraciones:", iteraciones[0])
    enter();
    if (resultado != -1){
        document.write("Matriz de que se parte: ")
        printMatrix(matrizRand);
        document.write("Posible camino encontrado: <br>")
        
        for (const camino of resultado){
            document.write("[", camino, "]")
        }
        enter()
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
}

function deepCopyArray(arr) {
    return arr.map(item => Array.isArray(item) ? deepCopyArray(item) : item);
  }

function calcularCantidadMovimientosNecesarios(matrizRand){
    //FUNCION IMPORTANTE A IMPLEMENTAR PARA MEJORAR LA EFICIENCIA
    return 0;
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
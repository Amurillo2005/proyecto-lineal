import { useState, useCallback } from 'react';

const HungarianMethod = () => {
    const [size, setSize] = useState(4);
    const [matrix, setMatrix] = useState([
        [15, 19, 21, 18],
        [17, 18, 20, 17],
        [14, 17, 17, 16],
        [19, 21, 23, 21]
    ]);
    const [objective, setObjective] = useState('minimize');
    const [steps, setSteps] = useState([]);
    const [isCalculated, setIsCalculated] = useState(false);

    const initializeMatrix = (newSize) => {
        const newMatrix = Array(newSize).fill(null).map(() =>
            Array(newSize).fill(0)
        );
        setMatrix(newMatrix);
        setSteps([]);
        setIsCalculated(false);
    };

    const handleSizeChange = (newSize) => {
        setSize(newSize);
        if (newSize === 4) {
            // Ejemplo de minimizar por defecto
            setMatrix([
                [15, 19, 21, 18],
                [17, 18, 20, 17],
                [14, 17, 17, 16],
                [19, 21, 23, 21]
            ]);
        } else {
            initializeMatrix(newSize);
        }
        setSteps([]);
        setIsCalculated(false);
    };

    const handleMatrixChange = (i, j, value) => {
        const newMatrix = [...matrix];
        newMatrix[i][j] = parseInt(value) || 0;
        setMatrix(newMatrix);
        setIsCalculated(false);
        setSteps([]);
    };

    const deepCopy = (arr) => arr.map(row => [...row]);

    const loadMaximizeExample = () => {
        setSize(4);
        setMatrix([
            [185, 215, 210, 220],
            [200, 220, 240, 225],
            [210, 225, 215, 230],
            [190, 230, 235, 240]
        ]);
        setObjective('maximize');
        setSteps([]);
        setIsCalculated(false);
    };

    const loadMinimizeExample = () => {
        setSize(4);
        setMatrix([
            [15, 19, 21, 18],
            [17, 18, 20, 17],
            [14, 17, 17, 16],
            [19, 21, 23, 21]
        ]);
        setObjective('minimize');
        setSteps([]);
        setIsCalculated(false);
    };

    const hungarianAlgorithm = useCallback(() => {
        let workMatrix = deepCopy(matrix);
        const n = matrix.length;
        const newSteps = [];

        // Paso inicial
        newSteps.push({
            title: "Matriz inicial",
            description: `Matriz de ${objective === 'minimize' ? 'costos' : 'utilidades'} original`,
            matrix: deepCopy(workMatrix),
            type: "initial"
        });

        // Si es maximización, convertir a minimización
        if (objective === 'maximize') {
            const maxValue = Math.max(...matrix.flat());
            workMatrix = workMatrix.map(row =>
                row.map(val => maxValue - val)
            );
            newSteps.push({
                title: "Paso 1: Conversión para maximización",
                description: `Convertimos restando cada elemento del valor máximo (${maxValue}). Nueva matriz para minimizar:`,
                matrix: deepCopy(workMatrix),
                type: "conversion"
            });
        }

        // Paso 1 (o 2 si hay conversión): Restar el mínimo de cada fila
        const rowMins = [];
        for (let i = 0; i < n; i++) {
            const minRow = Math.min(...workMatrix[i]);
            rowMins.push(minRow);
            for (let j = 0; j < n; j++) {
                workMatrix[i][j] -= minRow;
            }
        }

        newSteps.push({
            title: objective === 'maximize' ? "Paso 2: Reducción por filas" : "Paso 1: Reducción por filas",
            description: `Restamos el elemento mínimo de cada fila: [${rowMins.join(', ')}]`,
            matrix: deepCopy(workMatrix),
            type: "row-reduction"
        });

        // Paso 2 (o 3): Restar el mínimo de cada columna
        const colMins = [];
        for (let j = 0; j < n; j++) {
            const minCol = Math.min(...workMatrix.map(row => row[j]));
            colMins.push(minCol);
            for (let i = 0; i < n; i++) {
                workMatrix[i][j] -= minCol;
            }
        }

        newSteps.push({
            title: objective === 'maximize' ? "Paso 3: Reducción por columnas" : "Paso 2: Reducción por columnas",
            description: `Restamos el elemento mínimo de cada columna: [${colMins.join(', ')}]`,
            matrix: deepCopy(workMatrix),
            type: "col-reduction"
        });

        // Algoritmo de asignación iterativo
        let iteration = 0;
        const maxIterations = 10;

        while (iteration < maxIterations) {
            iteration++;

            // Encontrar asignación con ceros
            const assignment = findOptimalAssignmentGreedy(workMatrix);

            if (assignment.length === n) {
                // Solución encontrada
                const totalCost = calculateTotalCost(matrix, assignment, objective);

                // Mostrar ceros seleccionados en matriz reducida
                newSteps.push({
                    title: "Ceros seleccionados para la asignación",
                    description: "Matriz reducida final con los ceros seleccionados (destacados en rojo) y sus filas/columnas completas:",
                    matrix: deepCopy(workMatrix),
                    assignment: assignment,
                    type: "selected-zeros",
                    showFullRowsCols: true
                });

                // Solución final
                newSteps.push({
                    title: "Solución final",
                    description: `Asignación óptima encontrada. ${objective === 'minimize' ? 'Costo' : 'Utilidad'} total: ${totalCost}`,
                    matrix: deepCopy(matrix),
                    assignment: assignment,
                    totalCost: totalCost,
                    type: "solution"
                });
                break;
            }

            // Si no se puede asignar, necesitamos más líneas de cobertura
            const { lines, coveredZeros } = findMinimumLinesCoverage(workMatrix);

            newSteps.push({
                title: `Iteración ${iteration}: Cobertura de ceros`,
                description: `Se necesitan ${lines.length} líneas para cubrir todos los ceros. Se requieren ${n} líneas para la solución óptima.`,
                matrix: deepCopy(workMatrix),
                lines: lines,
                type: "line-cover"
            });

            if (lines.length >= n) {
                break;
            }

            // Encontrar el menor elemento no cubierto
            const uncoveredElements = [];
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const rowCovered = lines.some(line => line.type === 'row' && line.index === i);
                    const colCovered = lines.some(line => line.type === 'col' && line.index === j);
                    if (!rowCovered && !colCovered) {
                        uncoveredElements.push(workMatrix[i][j]);
                    }
                }
            }

            if (uncoveredElements.length === 0) break;

            const minUncovered = Math.min(...uncoveredElements);

            // Aplicar transformación
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const rowCovered = lines.some(line => line.type === 'row' && line.index === i);
                    const colCovered = lines.some(line => line.type === 'col' && line.index === j);

                    if (!rowCovered && !colCovered) {
                        workMatrix[i][j] -= minUncovered;
                    } else if (rowCovered && colCovered) {
                        workMatrix[i][j] += minUncovered;
                    }
                }
            }

            newSteps.push({
                title: `Iteración ${iteration}: Ajuste de matriz`,
                description: `Restamos ${minUncovered} de elementos no cubiertos y sumamos a intersecciones de líneas`,
                matrix: deepCopy(workMatrix),
                type: "adjustment"
            });
        }

        setSteps(newSteps);
        setIsCalculated(true);
    }, [matrix, objective]);

    const findOptimalAssignmentGreedy = (matrix) => {
        const n = matrix.length;
        const assignment = [];
        const usedRows = new Set();
        const usedCols = new Set();

        // Primero, intentar asignaciones únicas (filas o columnas con un solo cero)
        let changed = true;
        while (changed) {
            changed = false;

            // Buscar filas con un solo cero disponible
            for (let i = 0; i < n; i++) {
                if (usedRows.has(i)) continue;

                const availableZeros = [];
                for (let j = 0; j < n; j++) {
                    if (matrix[i][j] === 0 && !usedCols.has(j)) {
                        availableZeros.push(j);
                    }
                }

                if (availableZeros.length === 1) {
                    const j = availableZeros[0];
                    assignment.push([i, j]);
                    usedRows.add(i);
                    usedCols.add(j);
                    changed = true;
                }
            }

            // Buscar columnas con un solo cero disponible
            for (let j = 0; j < n; j++) {
                if (usedCols.has(j)) continue;

                const availableZeros = [];
                for (let i = 0; i < n; i++) {
                    if (matrix[i][j] === 0 && !usedRows.has(i)) {
                        availableZeros.push(i);
                    }
                }

                if (availableZeros.length === 1) {
                    const i = availableZeros[0];
                    assignment.push([i, j]);
                    usedRows.add(i);
                    usedCols.add(j);
                    changed = true;
                }
            }
        }

        // Si aún no está completo, asignar los primeros ceros disponibles
        for (let i = 0; i < n && assignment.length < n; i++) {
            if (usedRows.has(i)) continue;
            for (let j = 0; j < n; j++) {
                if (matrix[i][j] === 0 && !usedCols.has(j)) {
                    assignment.push([i, j]);
                    usedRows.add(i);
                    usedCols.add(j);
                    break;
                }
            }
        }

        return assignment;
    };

    const findMinimumLinesCoverage = (matrix) => {
        const n = matrix.length;
        const zeros = [];

        // Encontrar todas las posiciones con cero
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (matrix[i][j] === 0) {
                    zeros.push([i, j]);
                }
            }
        }

        // Algoritmo greedy para encontrar cobertura mínima
        const lines = [];
        const coveredZeros = new Set();

        // Contar ceros por fila y columna
        const rowZeroCount = Array(n).fill(0);
        const colZeroCount = Array(n).fill(0);

        zeros.forEach(([i, j]) => {
            if (!coveredZeros.has(`${i},${j}`)) {
                rowZeroCount[i]++;
                colZeroCount[j]++;
            }
        });

        while (coveredZeros.size < zeros.length) {
            // Encontrar fila o columna con más ceros no cubiertos
            let maxZeros = 0;
            let bestLine = null;

            for (let i = 0; i < n; i++) {
                const uncoveredInRow = zeros.filter(([r, c]) =>
                    r === i && !coveredZeros.has(`${r},${c}`)
                ).length;

                if (uncoveredInRow > maxZeros) {
                    maxZeros = uncoveredInRow;
                    bestLine = { type: 'row', index: i };
                }
            }

            for (let j = 0; j < n; j++) {
                const uncoveredInCol = zeros.filter(([r, c]) =>
                    c === j && !coveredZeros.has(`${r},${c}`)
                ).length;

                if (uncoveredInCol > maxZeros) {
                    maxZeros = uncoveredInCol;
                    bestLine = { type: 'col', index: j };
                }
            }

            if (!bestLine || maxZeros === 0) break;

            lines.push(bestLine);

            // Marcar ceros cubiertos por esta línea
            zeros.forEach(([i, j]) => {
                if (bestLine.type === 'row' && i === bestLine.index) {
                    coveredZeros.add(`${i},${j}`);
                } else if (bestLine.type === 'col' && j === bestLine.index) {
                    coveredZeros.add(`${i},${j}`);
                }
            });
        }

        return { lines, coveredZeros };
    };

    const calculateTotalCost = (originalMatrix, assignment) => {
        return assignment.reduce((total, [i, j]) => total + originalMatrix[i][j], 0);
    };

    const renderMatrix = (matrixData, step) => {
        const n = matrixData.length;

        return (
            
            <div style={{
                display: 'inline-block',
                border: '2px solid #333',
                borderRadius: '8px',
                overflow: 'hidden',
                margin: '10px 0'
            }}>
                {matrixData.map((row, i) => (
                    <div key={i} style={{ display: 'flex' }}>
                        {row.map((cell, j) => {
                            let cellStyle = {
                                width: '55px',
                                height: '45px',
                                border: '1px solid #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '500',
                                backgroundColor: 'white'
                            };

                            // Colorear según el tipo de paso
                            if (step.type === 'selected-zeros' && step.assignment) {
                                const isAssigned = step.assignment.some(([ai, aj]) => ai === i && aj === j);

                                if (step.showFullRowsCols && step.assignment) {
                                    // Marcar filas y columnas completas de los ceros seleccionados
                                    const isInSelectedRow = step.assignment.some(([ai, aj]) => ai === i);
                                    const isInSelectedCol = step.assignment.some(([ai, aj]) => aj === j);

                                    if (isAssigned) {
                                        cellStyle.backgroundColor = '#FF5722';
                                        cellStyle.color = 'white';
                                        cellStyle.fontWeight = 'bold';
                                    } else if (isInSelectedRow || isInSelectedCol) {
                                        cellStyle.backgroundColor = '#FFE0B2';
                                        cellStyle.fontWeight = 'bold';
                                    }
                                } else if (isAssigned) {
                                    cellStyle.backgroundColor = '#FF5722';
                                    cellStyle.color = 'white';
                                    cellStyle.fontWeight = 'bold';
                                }
                            } else if (step.type === 'solution' && step.assignment) {
                                const isAssigned = step.assignment.some(([ai, aj]) => ai === i && aj === j);
                                if (isAssigned) {
                                    cellStyle.backgroundColor = '#4CAF50';
                                    cellStyle.color = 'white';
                                    cellStyle.fontWeight = 'bold';
                                }
                            } else if (step.lines) {
                                const rowCovered = step.lines.some(line => line.type === 'row' && line.index === i);
                                const colCovered = step.lines.some(line => line.type === 'col' && line.index === j);
                                if (rowCovered && colCovered) {
                                    cellStyle.backgroundColor = '#FF9800';
                                    cellStyle.color = 'white';
                                } else if (rowCovered || colCovered) {
                                    cellStyle.backgroundColor = '#FFC107';
                                }
                            }

                            if (cell === 0 && step.type !== 'initial' && step.type !== 'solution') {
                                if (!cellStyle.backgroundColor || cellStyle.backgroundColor === 'white') {
                                    cellStyle.backgroundColor = '#E3F2FD';
                                }
                                cellStyle.fontWeight = 'bold';
                            }

                            return (
                                <div key={j} style={cellStyle}>
                                    {cell}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{
                textAlign: 'center',
                color: '#333',
                marginBottom: '30px',
                fontSize: '28px'
            }}>
                Método Húngaro - Problema de Asignación - Andrés Murillo - Javier Herazo
            </h1>

            {/* Controles */}
            <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px'
            }}>
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={loadMinimizeExample}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Cargar Ejemplo Minimizar
                    </button>
                    <button
                        onClick={loadMaximizeExample}
                        style={{
                            backgroundColor: '#9C27B0',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Cargar Ejemplo Maximizar
                    </button>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                        Tamaño de la matriz:
                    </label>
                    <select
                        value={size}
                        onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                        style={{
                            padding: '5px 10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value={3}>3x3</option>
                        <option value={4}>4x4</option>
                        <option value={5}>5x5</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                        Objetivo:
                    </label>
                    <select
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        style={{
                            padding: '5px 10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value="minimize">Minimizar</option>
                        <option value="maximize">Maximizar</option>
                    </select>
                </div>

                <h3 style={{ marginBottom: '10px' }}>
                    Matriz de {objective === 'minimize' ? 'costos' : 'utilidades'}:
                </h3>
                <div style={{ marginBottom: '20px' }}>
                    {matrix.map((row, i) => (
                        <div key={i} style={{ display: 'flex', marginBottom: '5px' }}>
                            {row.map((cell, j) => (
                                <input
                                    key={j}
                                    type="number"
                                    value={cell}
                                    onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                                    style={{
                                        width: '55px',
                                        height: '35px',
                                        margin: '2px',
                                        textAlign: 'center',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <button
                    onClick={hungarianAlgorithm}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                    Resolver usando Método Húngaro
                </button>
            </div>

            {/* Resultados */}
            {isCalculated && steps.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #ddd'
                }}>
                    <h2 style={{
                        color: '#333',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        Solución paso a paso
                    </h2>

                    {steps.map((step, index) => (
                        <div key={index} style={{
                            marginBottom: '30px',
                            padding: '15px',
                            backgroundColor: step.type === 'solution' ? '#E8F5E8' :
                                step.type === 'selected-zeros' ? '#FFF3E0' : '#fafafa',
                            borderRadius: '8px',
                            border: step.type === 'solution' ? '2px solid #4CAF50' :
                                step.type === 'selected-zeros' ? '2px solid #FF5722' : '1px solid #eee'
                        }}>
                            <h3 style={{
                                color: step.type === 'solution' ? '#2E7D32' :
                                    step.type === 'selected-zeros' ? '#D84315' : '#333',
                                marginBottom: '10px'
                            }}>
                                {step.title}
                            </h3>
                            <p style={{
                                marginBottom: '15px',
                                color: '#666',
                                lineHeight: '1.5'
                            }}>
                                {step.description}
                            </p>

                            <div style={{ textAlign: 'center' }}>
                                {renderMatrix(step.matrix, step)}
                            </div>

                            {step.type === 'solution' && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '5px',
                                    border: '1px solid #4CAF50'
                                }}>
                                    <h4 style={{ color: '#2E7D32', marginBottom: '10px' }}>
                                        Asignación óptima:
                                    </h4>
                                    {step.assignment.map(([i, j], idx) => (
                                        <div key={idx} style={{ marginBottom: '5px' }}>
                                            {objective === 'minimize' ? `Persona ${i + 1}` :
                                                ['Frank', 'Willy', 'Rosa', 'Mary'][i] || `Persona ${i + 1}`} → {' '}
                                            {objective === 'minimize' ?
                                                ['Acabado', 'Empaque', 'Producción', 'Materia Prima'][j] || `Tarea ${j + 1}` :
                                                ['Zona A', 'Zona B', 'Zona N', 'Zona S'][j] || `Zona ${j + 1}`} {' '}
                                            ({objective === 'minimize' ? 'Costo' : 'Utilidad'}: ${matrix[i][j]})
                                        </div>
                                    ))}
                                    <div style={{
                                        marginTop: '10px',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        color: '#2E7D32'
                                    }}>
                                        {objective === 'minimize' ? 'Costo' : 'Utilidad'} total: ${step.totalCost}
                                    </div>
                                </div>
                            )}

                            {step.type === 'selected-zeros' && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '5px',
                                    border: '1px solid #FF5722'
                                }}>
                                    <h4 style={{ color: '#D84315', marginBottom: '10px' }}>
                                        Ceros seleccionados y sus filas/columnas:
                                    </h4>
                                    {step.assignment.map(([i, j], idx) => (
                                        <div key={idx} style={{ marginBottom: '5px' }}>
                                            Fila {i + 1}, Columna {j + 1} - Cero seleccionado (rojo)
                                        </div>
                                    ))}
                                    <div style={{
                                        marginTop: '10px',
                                        fontStyle: 'italic',
                                        color: '#666'
                                    }}>
                                        Las filas y columnas completas están resaltadas (naranja claro) para mostrar el contexto completo de cada asignación.
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Leyenda */}
            <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                fontSize: '14px'
            }}>
                <h4 style={{ marginBottom: '10px' }}>Leyenda de colores:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#E3F2FD',
                            border: '1px solid #ccc',
                            marginRight: '8px'
                        }}></div>
                        Ceros en la matriz
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFC107',
                            border: '1px solid #ccc',
                            marginRight: '8px'
                        }}></div>
                        Elementos cubiertos por líneas
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFE0B2',
                            border: '1px solid #ccc',
                            marginRight: '8px'
                        }}></div>
                        Filas/columnas con ceros seleccionados
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FF5722',
                            border: '1px solid #ccc',
                            marginRight: '8px'
                        }}></div>
                        Ceros seleccionados para asignación
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#4CAF50',
                            border: '1px solid #ccc',
                            marginRight: '8px'
                        }}></div>
                        Asignación final en matriz original
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HungarianMethod;
import React, { useState, useCallback } from 'react';

const VogelMethod = () => {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [supply, setSupply] = useState([100, 150, 200]);
    const [demand, setDemand] = useState([120, 180, 150]);
    const [costs, setCosts] = useState([
        [2, 3, 1],
        [5, 4, 8],
        [5, 6, 7]
    ]);
    const [objective, setObjective] = useState('minimize');
    const [solution, setSolution] = useState(null);
    const [steps, setSteps] = useState([]);

    const initializeMatrix = useCallback(() => {
        const newSupply = Array(rows).fill(0).map((_, i) => supply[i] || 0);
        const newDemand = Array(cols).fill(0).map((_, i) => demand[i] || 0);
        const newCosts = Array(rows).fill(0).map((_, i) =>
            Array(cols).fill(0).map((_, j) => costs[i]?.[j] || 0)
        );

        setSupply(newSupply);
        setDemand(newDemand);
        setCosts(newCosts);
    }, [rows, cols, supply, demand, costs]);

    React.useEffect(() => {
        initializeMatrix();
    }, [rows, cols]);

    const calculatePenalties = (matrix, supply, demand, isActive) => {
        const penalties = { rows: [], cols: [] };

        // Calcular penalizaciones por fila
        for (let i = 0; i < matrix.length; i++) {
            if (!isActive.rows[i]) {
                penalties.rows[i] = -1;
                continue;
            }

            const activeCosts = matrix[i].filter((_, j) => isActive.cols[j]);
            if (activeCosts.length < 2) {
                penalties.rows[i] = 0;
            } else {
                const sorted = [...activeCosts].sort((a, b) => a - b);
                penalties.rows[i] = sorted[1] - sorted[0];
            }
        }

        // Calcular penalizaciones por columna
        for (let j = 0; j < matrix[0].length; j++) {
            if (!isActive.cols[j]) {
                penalties.cols[j] = -1;
                continue;
            }

            const activeCosts = matrix.filter((_, i) => isActive.rows[i]).map(row => row[j]);
            if (activeCosts.length < 2) {
                penalties.cols[j] = 0;
            } else {
                const sorted = [...activeCosts].sort((a, b) => a - b);
                penalties.cols[j] = sorted[1] - sorted[0];
            }
        }

        return penalties;
    };

    const findBestCell = (matrix, penalties, isActive) => {
        let maxPenalty = -1;
        let bestCell = null;
        let isRow = true;

        // Buscar mayor penalización en filas
        for (let i = 0; i < penalties.rows.length; i++) {
            if (penalties.rows[i] > maxPenalty) {
                maxPenalty = penalties.rows[i];
                bestCell = i;
                isRow = true;
            }
        }

        // Buscar mayor penalización en columnas
        for (let j = 0; j < penalties.cols.length; j++) {
            if (penalties.cols[j] > maxPenalty) {
                maxPenalty = penalties.cols[j];
                bestCell = j;
                isRow = false;
            }
        }

        // Encontrar la celda con menor costo en la fila/columna seleccionada
        if (isRow) {
            let minCost = Infinity;
            let bestCol = -1;
            for (let j = 0; j < matrix[bestCell].length; j++) {
                if (isActive.cols[j] && matrix[bestCell][j] < minCost) {
                    minCost = matrix[bestCell][j];
                    bestCol = j;
                }
            }
            return { row: bestCell, col: bestCol };
        } else {
            let minCost = Infinity;
            let bestRow = -1;
            for (let i = 0; i < matrix.length; i++) {
                if (isActive.rows[i] && matrix[i][bestCell] < minCost) {
                    minCost = matrix[i][bestCell];
                    bestRow = i;
                }
            }
            return { row: bestRow, col: bestCell };
        }
    };

    const solveVogel = () => {
        let workingMatrix = objective === 'maximize'
            ? costs.map(row => row.map(cost => -cost))
            : costs.map(row => [...row]);

        let currentSupply = [...supply];
        let currentDemand = [...demand];
        let allocation = Array(rows).fill(0).map(() => Array(cols).fill(0));
        let isActive = {
            rows: Array(rows).fill(true),
            cols: Array(cols).fill(true)
        };

        const stepHistory = [];
        let stepNumber = 1;

        // Verificar si el problema está balanceado
        const totalSupply = currentSupply.reduce((a, b) => a + b, 0);
        const totalDemand = currentDemand.reduce((a, b) => a + b, 0);

        if (totalSupply !== totalDemand) {
            alert(`El problema no está balanceado. Oferta total: ${totalSupply}, Demanda total: ${totalDemand}`);
            return;
        }

        while (isActive.rows.some(Boolean) && isActive.cols.some(Boolean)) {
            const penalties = calculatePenalties(workingMatrix, currentSupply, currentDemand, isActive);
            const bestCell = findBestCell(workingMatrix, penalties, isActive);

            if (!bestCell) break;

            const { row, col } = bestCell;
            const allocated = Math.min(currentSupply[row], currentDemand[col]);

            allocation[row][col] = allocated;
            currentSupply[row] -= allocated;
            currentDemand[col] -= allocated;

            if (currentSupply[row] === 0) {
                isActive.rows[row] = false;
            }
            if (currentDemand[col] === 0) {
                isActive.cols[col] = false;
            }

            stepHistory.push({
                step: stepNumber++,
                penalties: JSON.parse(JSON.stringify(penalties)),
                allocation: allocation.map(row => [...row]),
                supply: [...currentSupply],
                demand: [...currentDemand],
                selectedCell: { row, col },
                allocated,
                isActive: JSON.parse(JSON.stringify(isActive))
            });
        }

        // Calcular costo total
        let totalCost = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                totalCost += allocation[i][j] * costs[i][j];
            }
        }

        setSteps(stepHistory);
        setSolution({
            allocation,
            totalCost,
            objective
        });
    };

    const resetSolution = () => {
        setSolution(null);
        setSteps([]);
    };

    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <h1 style={{
                textAlign: 'center',
                color: '#2c3e50',
                marginBottom: '30px',
                fontSize: '28px',
                fontWeight: 'bold'
            }}>
                Método de Vogel - Programación Lineal
            </h1>

            <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: '#34495e', marginBottom: '20px' }}>Configuración del Problema</h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Número de Orígenes:
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="6"
                            value={rows}
                            onChange={(e) => setRows(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid #bdc3c7',
                                borderRadius: '6px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Número de Destinos:
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="6"
                            value={cols}
                            onChange={(e) => setCols(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid #bdc3c7',
                                borderRadius: '6px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Objetivo:
                        </label>
                        <select
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid #bdc3c7',
                                borderRadius: '6px',
                                fontSize: '16px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="minimize">Minimizar Costos</option>
                            <option value="maximize">Maximizar Utilidades</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                        <h3 style={{ color: '#2980b9', marginBottom: '15px' }}>Oferta (Supply)</h3>
                        {supply.map((val, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>
                                    Origen {i + 1}:
                                </label>
                                <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => {
                                        const newSupply = [...supply];
                                        newSupply[i] = parseInt(e.target.value) || 0;
                                        setSupply(newSupply);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #bdc3c7',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Demanda (Demand)</h3>
                        {demand.map((val, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>
                                    Destino {i + 1}:
                                </label>
                                <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => {
                                        const newDemand = [...demand];
                                        newDemand[i] = parseInt(e.target.value) || 0;
                                        setDemand(newDemand);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #bdc3c7',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <h3 style={{ color: '#16a085', margin: '25px 0 15px 0' }}>
                    Matriz de {objective === 'minimize' ? 'Costos' : 'Utilidades'}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <thead>
                            <tr>
                                <th style={{
                                    padding: '12px',
                                    backgroundColor: '#ecf0f1',
                                    border: '1px solid #bdc3c7',
                                    fontWeight: 'bold'
                                }}>
                                    Origen/Destino
                                </th>
                                {Array(cols).fill(0).map((_, j) => (
                                    <th key={j} style={{
                                        padding: '12px',
                                        backgroundColor: '#ecf0f1',
                                        border: '1px solid #bdc3c7',
                                        fontWeight: 'bold'
                                    }}>
                                        Destino {j + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array(rows).fill(0).map((_, i) => (
                                <tr key={i}>
                                    <td style={{
                                        padding: '12px',
                                        backgroundColor: '#ecf0f1',
                                        border: '1px solid #bdc3c7',
                                        fontWeight: 'bold'
                                    }}>
                                        Origen {i + 1}
                                    </td>
                                    {Array(cols).fill(0).map((_, j) => (
                                        <td key={j} style={{
                                            padding: '8px',
                                            border: '1px solid #bdc3c7'
                                        }}>
                                            <input
                                                type="number"
                                                value={costs[i]?.[j] || 0}
                                                onChange={(e) => {
                                                    const newCosts = [...costs];
                                                    if (!newCosts[i]) newCosts[i] = [];
                                                    newCosts[i][j] = parseInt(e.target.value) || 0;
                                                    setCosts(newCosts);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px',
                                                    border: '1px solid #bdc3c7',
                                                    borderRadius: '4px',
                                                    textAlign: 'center'
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    marginTop: '25px',
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={solveVogel}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2ecc71'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                    >
                        Resolver con Método de Vogel
                    </button>

                    {solution && (
                        <button
                            onClick={resetSolution}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                        >
                            Limpiar Solución
                        </button>
                    )}
                </div>
            </div>

            {steps.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>Proceso de Solución - Pasos del Método de Vogel</h2>

                    {steps.map((step, index) => (
                        <div key={index} style={{
                            marginBottom: '30px',
                            padding: '20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '2px solid #e9ecef'
                        }}>
                            <h3 style={{
                                color: '#495057',
                                marginBottom: '15px',
                                fontSize: '18px'
                            }}>
                                Paso {step.step}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <h4 style={{ color: '#6c757d', marginBottom: '10px' }}>Penalizaciones por Fila:</h4>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {step.penalties.rows.map((penalty, i) => (
                                            <span key={i} style={{
                                                padding: '5px 10px',
                                                backgroundColor: penalty === -1 ? '#dee2e6' : '#17a2b8',
                                                color: penalty === -1 ? '#6c757d' : 'white',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}>
                                                F{i + 1}: {penalty === -1 ? 'X' : penalty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#6c757d', marginBottom: '10px' }}>Penalizaciones por Columna:</h4>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {step.penalties.cols.map((penalty, j) => (
                                            <span key={j} style={{
                                                padding: '5px 10px',
                                                backgroundColor: penalty === -1 ? '#dee2e6' : '#fd7e14',
                                                color: penalty === -1 ? '#6c757d' : 'white',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}>
                                                C{j + 1}: {penalty === -1 ? 'X' : penalty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                marginBottom: '15px',
                                padding: '10px',
                                backgroundColor: '#d4edda',
                                borderRadius: '4px',
                                border: '1px solid #c3e6cb',
                                color: '#155724'
                            }}>
                                <strong>Celda seleccionada:</strong> ({step.selectedCell.row + 1}, {step.selectedCell.col + 1}) -
                                <strong> Asignación:</strong> {step.allocated} unidades
                            </p>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '14px'
                                }}>
                                    <thead>
                                        <tr>
                                            <th style={{
                                                padding: '8px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: '1px solid #495057'
                                            }}>
                                                O/D
                                            </th>
                                            {Array(cols).fill(0).map((_, j) => (
                                                <th key={j} style={{
                                                    padding: '8px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: '1px solid #495057'
                                                }}>
                                                    D{j + 1}
                                                </th>
                                            ))}
                                            <th style={{
                                                padding: '8px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: '1px solid #495057'
                                            }}>
                                                Oferta
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array(rows).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td style={{
                                                    padding: '8px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: '1px solid #495057',
                                                    fontWeight: 'bold'
                                                }}>
                                                    O{i + 1}
                                                </td>
                                                {Array(cols).fill(0).map((_, j) => (
                                                    <td key={j} style={{
                                                        padding: '8px',
                                                        border: '1px solid #dee2e6',
                                                        backgroundColor: step.selectedCell.row === i && step.selectedCell.col === j
                                                            ? '#fff3cd' : 'white',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                                            {costs[i][j]}
                                                        </div>
                                                        <div style={{
                                                            fontWeight: 'bold',
                                                            color: step.allocation[i][j] > 0 ? '#28a745' : '#6c757d'
                                                        }}>
                                                            {step.allocation[i][j] || '-'}
                                                        </div>
                                                    </td>
                                                ))}
                                                <td style={{
                                                    padding: '8px',
                                                    border: '1px solid #dee2e6',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f8f9fa',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {step.supply[i]}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td style={{
                                                padding: '8px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: '1px solid #495057',
                                                fontWeight: 'bold'
                                            }}>
                                                Demanda
                                            </td>
                                            {step.demand.map((dem, j) => (
                                                <td key={j} style={{
                                                    padding: '8px',
                                                    border: '1px solid #dee2e6',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f8f9fa',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {dem}
                                                </td>
                                            ))}
                                            <td style={{
                                                padding: '8px',
                                                border: '1px solid #dee2e6',
                                                backgroundColor: '#f8f9fa'
                                            }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {solution && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>Solución Óptima</h2>

                    <div style={{
                        padding: '15px',
                        backgroundColor: solution.objective === 'minimize' ? '#d1ecf1' : '#d4edda',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            color: solution.objective === 'minimize' ? '#0c5460' : '#155724',
                            fontSize: '24px',
                            margin: 0
                        }}>
                            {solution.objective === 'minimize' ? 'Costo Mínimo' : 'Utilidad Máxima'}: {solution.totalCost}
                        </h3>
                    </div>

                    <h3 style={{ color: '#495057', marginBottom: '15px' }}>Asignaciones Finales:</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '16px'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        padding: '12px',
                                        backgroundColor: '#343a40',
                                        color: 'white',
                                        border: '1px solid #495057'
                                    }}>
                                        Origen/Destino
                                    </th>
                                    {Array(cols).fill(0).map((_, j) => (
                                        <th key={j} style={{
                                            padding: '12px',
                                            backgroundColor: '#343a40',
                                            color: 'white',
                                            border: '1px solid #495057'
                                        }}>
                                            Destino {j + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array(rows).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td style={{
                                            padding: '12px',
                                            backgroundColor: '#343a40',
                                            color: 'white',
                                            border: '1px solid #495057',
                                            fontWeight: 'bold'
                                        }}>
                                            Origen {i + 1}
                                        </td>
                                        {Array(cols).fill(0).map((_, j) => (
                                            <td key={j} style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'center',
                                                backgroundColor: solution.allocation[i][j] > 0 ? '#d4edda' : 'white',
                                                fontWeight: solution.allocation[i][j] > 0 ? 'bold' : 'normal'
                                            }}>
                                                {solution.allocation[i][j] || 0}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ color: '#495057', marginBottom: '15px' }}>Detalle de Asignaciones:</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '15px'
                        }}>
                            {solution.allocation.map((row, i) =>
                                row.map((allocation, j) => {
                                    if (allocation > 0) {
                                        return (
                                            <div key={`${i}-${j}`} style={{
                                                padding: '15px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '8px',
                                                border: '1px solid #dee2e6'
                                            }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                                    Origen {i + 1} → Destino {j + 1}
                                                </div>
                                                <div>Cantidad: <span style={{ color: '#28a745', fontWeight: 'bold' }}>{allocation}</span></div>
                                                <div>Costo unitario: <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{costs[i][j]}</span></div>
                                                <div>Costo total: <span style={{ color: '#007bff', fontWeight: 'bold' }}>{allocation * costs[i][j]}</span></div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VogelMethod;
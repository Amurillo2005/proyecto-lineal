import React, { useState, useCallback } from 'react';

const MinimumCostMethod = () => {
    const [supplies, setSupplies] = useState([20, 30, 25]);
    const [demands, setDemands] = useState([15, 25, 35]);
    const [costs, setCosts] = useState([
        [8, 6, 10],
        [9, 12, 13],
        [14, 9, 16]
    ]);
    const [objective, setObjective] = useState('minimize');
    const [solution, setSolution] = useState(null);
    const [iterations, setIterations] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);

    const deepCopy = (arr) => JSON.parse(JSON.stringify(arr));

    const findMinimumCostSolution = useCallback(() => {
        setIsCalculating(true);
        const iterationSteps = [];

        // Crear copia de los datos
        let currentSupplies = [...supplies];
        let currentDemands = [...demands];
        let currentCosts = deepCopy(costs);
        let allocation = Array(supplies.length).fill().map(() => Array(demands.length).fill(0));
        let totalCost = 0;

        // Si es maximización, convertir a minimización
        if (objective === 'maximize') {
            const maxCost = Math.max(...costs.flat());
            currentCosts = costs.map(row => row.map(cost => maxCost - cost));
        }

        // Método de costo mínimo
        while (currentSupplies.some(s => s > 0) && currentDemands.some(d => d > 0)) {
            // Encontrar el costo mínimo disponible
            let minCost = Infinity;
            let minI = -1, minJ = -1;

            for (let i = 0; i < currentSupplies.length; i++) {
                for (let j = 0; j < currentDemands.length; j++) {
                    if (currentSupplies[i] > 0 && currentDemands[j] > 0 && currentCosts[i][j] < minCost) {
                        minCost = currentCosts[i][j];
                        minI = i;
                        minJ = j;
                    }
                }
            }

            if (minI === -1 || minJ === -1) break;

            // Asignar la cantidad mínima
            const assignAmount = Math.min(currentSupplies[minI], currentDemands[minJ]);
            allocation[minI][minJ] = assignAmount;

            // Calcular costo usando los costos originales
            totalCost += assignAmount * costs[minI][minJ];

            // Actualizar oferta y demanda
            currentSupplies[minI] -= assignAmount;
            currentDemands[minJ] -= assignAmount;

            // Guardar iteración
            iterationSteps.push({
                step: iterationSteps.length + 1,
                selectedCell: { i: minI, j: minJ },
                allocation: deepCopy(allocation),
                supplies: [...currentSupplies],
                demands: [...currentDemands],
                cost: totalCost,
                assignedAmount: assignAmount
            });
        }

        setIterations(iterationSteps);
        setSolution({
            allocation,
            totalCost,
            objective
        });
        setIsCalculating(false);
    }, [supplies, demands, costs, objective]);

    const addSupply = () => {
        setSupplies([...supplies, 10]);
        setCosts([...costs, Array(demands.length).fill(5)]);
    };

    const addDemand = () => {
        setDemands([...demands, 10]);
        setCosts(costs.map(row => [...row, 5]));
    };

    const removeSupply = (index) => {
        if (supplies.length > 2) {
            setSupplies(supplies.filter((_, i) => i !== index));
            setCosts(costs.filter((_, i) => i !== index));
        }
    };

    const removeDemand = (index) => {
        if (demands.length > 2) {
            setDemands(demands.filter((_, i) => i !== index));
            setCosts(costs.map(row => row.filter((_, i) => i !== index)));
        }
    };

    const updateSupply = (index, value) => {
        const newSupplies = [...supplies];
        newSupplies[index] = parseInt(value) || 0;
        setSupplies(newSupplies);
    };

    const updateDemand = (index, value) => {
        const newDemands = [...demands];
        newDemands[index] = parseInt(value) || 0;
        setDemands(newDemands);
    };

    const updateCost = (i, j, value) => {
        const newCosts = deepCopy(costs);
        newCosts[i][j] = parseInt(value) || 0;
        setCosts(newCosts);
    };

    const reset = () => {
        setSolution(null);
        setIterations([]);
    };

    const isBalanced = supplies.reduce((a, b) => a + b, 0) === demands.reduce((a, b) => a + b, 0);

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: '#2c3e50',
                    marginBottom: '30px',
                    fontSize: '2.5em',
                    fontWeight: 'bold'
                }}>
                    Método de Costo Mínimo
                </h1>

                {/* Configuración del problema */}
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#34495e', marginBottom: '20px' }}>Configuración del Problema</h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', marginRight: '15px' }}>Objetivo:</label>
                        <select
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '5px',
                                border: '2px solid #ddd',
                                fontSize: '16px'
                            }}
                        >
                            <option value="minimize">Minimizar Costos</option>
                            <option value="maximize">Maximizar Utilidades</option>
                        </select>
                    </div>

                    {/* Ofertas */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#2980b9', marginBottom: '10px' }}>Ofertas (Suministros)</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                            {supplies.map((supply, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <label>S{index + 1}:</label>
                                    <input
                                        type="number"
                                        value={supply}
                                        onChange={(e) => updateSupply(index, e.target.value)}
                                        style={{
                                            width: '60px',
                                            padding: '5px',
                                            borderRadius: '3px',
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                    <button
                                        onClick={() => removeSupply(index)}
                                        style={{
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            padding: '3px 6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSupply}
                                style={{
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                + Añadir Oferta
                            </button>
                        </div>
                    </div>

                    {/* Demandas */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#2980b9', marginBottom: '10px' }}>Demandas</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                            {demands.map((demand, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <label>D{index + 1}:</label>
                                    <input
                                        type="number"
                                        value={demand}
                                        onChange={(e) => updateDemand(index, e.target.value)}
                                        style={{
                                            width: '60px',
                                            padding: '5px',
                                            borderRadius: '3px',
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                    <button
                                        onClick={() => removeDemand(index)}
                                        style={{
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            padding: '3px 6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addDemand}
                                style={{
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                + Añadir Demanda
                            </button>
                        </div>
                    </div>

                    {/* Matriz de costos */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#2980b9', marginBottom: '10px' }}>
                            Matriz de {objective === 'minimize' ? 'Costos' : 'Utilidades'}
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                borderCollapse: 'collapse',
                                border: '2px solid #34495e',
                                backgroundColor: 'white'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            border: '1px solid #34495e',
                                            padding: '10px',
                                            backgroundColor: '#ecf0f1',
                                            fontWeight: 'bold'
                                        }}>
                                            Desde/Hacia
                                        </th>
                                        {demands.map((_, j) => (
                                            <th key={j} style={{
                                                border: '1px solid #34495e',
                                                padding: '10px',
                                                backgroundColor: '#ecf0f1',
                                                fontWeight: 'bold'
                                            }}>
                                                D{j + 1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplies.map((_, i) => (
                                        <tr key={i}>
                                            <td style={{
                                                border: '1px solid #34495e',
                                                padding: '10px',
                                                backgroundColor: '#ecf0f1',
                                                fontWeight: 'bold'
                                            }}>
                                                S{i + 1}
                                            </td>
                                            {demands.map((_, j) => (
                                                <td key={j} style={{ border: '1px solid #34495e', padding: '5px' }}>
                                                    <input
                                                        type="number"
                                                        value={costs[i][j]}
                                                        onChange={(e) => updateCost(i, j, e.target.value)}
                                                        style={{
                                                            width: '60px',
                                                            padding: '5px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '3px',
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
                    </div>

                    {/* Estado del problema */}
                    <div style={{
                        padding: '15px',
                        backgroundColor: isBalanced ? '#d5f4e6' : '#ffeaa7',
                        borderRadius: '5px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                            Total Oferta: {supplies.reduce((a, b) => a + b, 0)} |
                            Total Demanda: {demands.reduce((a, b) => a + b, 0)} |
                            Estado: {isBalanced ? '✓ Balanceado' : '⚠ No Balanceado'}
                        </p>
                    </div>

                    {/* Botones de control */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={findMinimumCostSolution}
                            disabled={isCalculating || !isBalanced}
                            style={{
                                backgroundColor: !isBalanced ? '#95a5a6' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '12px 24px',
                                fontSize: '16px',
                                cursor: !isBalanced ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {isCalculating ? 'Calculando...' : 'Resolver'}
                        </button>
                        <button
                            onClick={reset}
                            style={{
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '12px 24px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Mostrar iteraciones */}
                {iterations.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h2 style={{ color: '#34495e', marginBottom: '20px' }}>Proceso de Solución</h2>
                        {iterations.map((iteration, index) => (
                            <div key={index} style={{
                                marginBottom: '25px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <h3 style={{ color: '#2980b9', marginBottom: '15px' }}>
                                    Iteración {iteration.step} - Asignación: {iteration.assignedAmount} unidades
                                    en celda ({iteration.selectedCell.i + 1}, {iteration.selectedCell.j + 1})
                                </h3>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{
                                        borderCollapse: 'collapse',
                                        border: '2px solid #34495e',
                                        backgroundColor: 'white',
                                        width: '100%'
                                    }}>
                                        <thead>
                                            <tr>
                                                <th style={{
                                                    border: '1px solid #34495e',
                                                    padding: '8px',
                                                    backgroundColor: '#ecf0f1'
                                                }}>
                                                    Desde/Hacia
                                                </th>
                                                {demands.map((_, j) => (
                                                    <th key={j} style={{
                                                        border: '1px solid #34495e',
                                                        padding: '8px',
                                                        backgroundColor: '#ecf0f1'
                                                    }}>
                                                        D{j + 1}
                                                    </th>
                                                ))}
                                                <th style={{
                                                    border: '1px solid #34495e',
                                                    padding: '8px',
                                                    backgroundColor: '#e8f4f8'
                                                }}>
                                                    Oferta Rest.
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supplies.map((_, i) => (
                                                <tr key={i}>
                                                    <td style={{
                                                        border: '1px solid #34495e',
                                                        padding: '8px',
                                                        backgroundColor: '#ecf0f1',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        S{i + 1}
                                                    </td>
                                                    {demands.map((_, j) => (
                                                        <td key={j} style={{
                                                            border: '1px solid #34495e',
                                                            padding: '8px',
                                                            backgroundColor:
                                                                iteration.selectedCell.i === i && iteration.selectedCell.j === j ? '#fff3cd' :
                                                                    iteration.allocation[i][j] > 0 ? '#d1ecf1' : 'white',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>{costs[i][j]}</div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                                                {iteration.allocation[i][j] || ''}
                                                            </div>
                                                        </td>
                                                    ))}
                                                    <td style={{
                                                        border: '1px solid #34495e',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        backgroundColor: '#e8f4f8',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {iteration.supplies[i]}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td style={{
                                                    border: '1px solid #34495e',
                                                    padding: '8px',
                                                    backgroundColor: '#e8f4f8',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Demanda Rest.
                                                </td>
                                                {iteration.demands.map((demand, j) => (
                                                    <td key={j} style={{
                                                        border: '1px solid #34495e',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        backgroundColor: '#e8f4f8',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {demand}
                                                    </td>
                                                ))}
                                                <td style={{
                                                    border: '1px solid #34495e',
                                                    padding: '8px',
                                                    backgroundColor: '#e8f4f8'
                                                }}></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <p style={{
                                    marginTop: '10px',
                                    fontWeight: 'bold',
                                    color: '#27ae60'
                                }}>
                                    Costo acumulado: {iteration.cost}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Solución final */}
                {solution && (
                    <div style={{
                        marginTop: '30px',
                        padding: '25px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '10px',
                        border: '2px solid #27ae60'
                    }}>
                        <h2 style={{ color: '#27ae60', marginBottom: '20px', textAlign: 'center' }}>
                            🎯 Solución Óptima
                        </h2>

                        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                            <table style={{
                                borderCollapse: 'collapse',
                                border: '2px solid #27ae60',
                                backgroundColor: 'white',
                                width: '100%'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            border: '1px solid #27ae60',
                                            padding: '12px',
                                            backgroundColor: '#d5f4e6'
                                        }}>
                                            Desde/Hacia
                                        </th>
                                        {demands.map((demand, j) => (
                                            <th key={j} style={{
                                                border: '1px solid #27ae60',
                                                padding: '12px',
                                                backgroundColor: '#d5f4e6'
                                            }}>
                                                D{j + 1} ({demand})
                                            </th>
                                        ))}
                                        <th style={{
                                            border: '1px solid #27ae60',
                                            padding: '12px',
                                            backgroundColor: '#d5f4e6'
                                        }}>
                                            Oferta
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplies.map((supply, i) => (
                                        <tr key={i}>
                                            <td style={{
                                                border: '1px solid #27ae60',
                                                padding: '12px',
                                                backgroundColor: '#d5f4e6',
                                                fontWeight: 'bold'
                                            }}>
                                                S{i + 1} ({supply})
                                            </td>
                                            {demands.map((_, j) => (
                                                <td key={j} style={{
                                                    border: '1px solid #27ae60',
                                                    padding: '12px',
                                                    backgroundColor: solution.allocation[i][j] > 0 ? '#b8e6b8' : 'white',
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        Costo: {costs[i][j]}
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#27ae60' }}>
                                                        {solution.allocation[i][j] || 0}
                                                    </div>
                                                </td>
                                            ))}
                                            <td style={{
                                                border: '1px solid #27ae60',
                                                padding: '12px',
                                                textAlign: 'center',
                                                backgroundColor: '#d5f4e6',
                                                fontWeight: 'bold'
                                            }}>
                                                {supply}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{
                            textAlign: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#27ae60',
                            padding: '15px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '2px solid #27ae60'
                        }}>
                            {objective === 'minimize' ? 'Costo Mínimo' : 'Utilidad Máxima'}: {solution.totalCost}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinimumCostMethod;
import React, { useState } from 'react';

const NorthwestCornerMethod = () => {
    const [suppliers, setSuppliers] = useState([20, 30, 25]);
    const [demands, setDemands] = useState([15, 25, 35]);
    const [costs, setCosts] = useState([
        [2, 3, 1],
        [5, 4, 8],
        [3, 6, 2]
    ]);
    const [steps, setSteps] = useState([]);
    const [finalResult, setFinalResult] = useState(null);

    const addSupplier = () => {
        setSuppliers([...suppliers, 0]);
        setCosts([...costs.map(row => [...row, 0]), new Array(demands.length).fill(0)]);
    };

    const addDemand = () => {
        setDemands([...demands, 0]);
        setCosts(costs.map(row => [...row, 0]));
    };

    const removeSupplier = (index) => {
        if (suppliers.length > 1) {
            setSuppliers(suppliers.filter((_, i) => i !== index));
            setCosts(costs.filter((_, i) => i !== index));
        }
    };

    const removeDemand = (index) => {
        if (demands.length > 1) {
            setDemands(demands.filter((_, i) => i !== index));
            setCosts(costs.map(row => row.filter((_, i) => i !== index)));
        }
    };

    const updateSupplier = (index, value) => {
        const newSuppliers = [...suppliers];
        newSuppliers[index] = parseInt(value) || 0;
        setSuppliers(newSuppliers);
    };

    const updateDemand = (index, value) => {
        const newDemands = [...demands];
        newDemands[index] = parseInt(value) || 0;
        setDemands(newDemands);
    };

    const updateCost = (i, j, value) => {
        const newCosts = [...costs];
        newCosts[i][j] = parseInt(value) || 0;
        setCosts(newCosts);
    };

    const solveNorthwestCorner = () => {
        // Verificar si la oferta total es igual a la demanda total
        const totalSupply = suppliers.reduce((sum, s) => sum + s, 0);
        const totalDemand = demands.reduce((sum, d) => sum + d, 0);

        if (totalSupply !== totalDemand) {
            alert(`Error: La oferta total (${totalSupply}) debe ser igual a la demanda total (${totalDemand})`);
            return;
        }

        let supply = [...suppliers];
        let demand = [...demands];
        let allocation = Array(suppliers.length).fill(null).map(() => Array(demands.length).fill(0));
        let stepHistory = [];
        let totalCost = 0;

        let i = 0, j = 0;

        while (i < supply.length && j < demand.length) {
            // Crear snapshot del estado actual
            const currentStep = {
                stepNumber: stepHistory.length + 1,
                supply: [...supply],
                demand: [...demand],
                allocation: allocation.map(row => [...row]),
                currentCell: [i, j],
                action: '',
                allocated: 0
            };

            // Determinar la cantidad a asignar
            const allocation_amount = Math.min(supply[i], demand[j]);
            allocation[i][j] = allocation_amount;
            totalCost += allocation_amount * costs[i][j];

            currentStep.allocated = allocation_amount;
            currentStep.action = `Asignar ${allocation_amount} unidades a la celda (${i + 1}, ${j + 1})`;

            // Actualizar oferta y demanda
            supply[i] -= allocation_amount;
            demand[j] -= allocation_amount;

            // Decidir el siguiente movimiento
            if (supply[i] === 0 && demand[j] === 0) {
                // Caso especial: tanto oferta como demanda se agotan
                if (i < supply.length - 1) {
                    i++;
                } else {
                    j++;
                }
            } else if (supply[i] === 0) {
                i++;
            } else {
                j++;
            }

            stepHistory.push(currentStep);
        }

        setSteps(stepHistory);
        setFinalResult({
            allocation,
            totalCost,
            supply: suppliers,
            demand: demands
        });
    };

    const resetSolution = () => {
        setSteps([]);
        setFinalResult(null);
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '30px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>
                    Método de la Esquina Noroeste
                </h1>
                <p style={{ margin: 0, fontSize: '1.1em', opacity: '0.9' }}>
                    Solución de problemas de transporte en programación lineal
                </p>
            </div>

            {/* Input Section */}
            <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '25px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ color: '#333', marginBottom: '20px' }}>Configuración del Problema</h2>

                {/* Suppliers */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#555', marginBottom: '10px' }}>Ofertas (Proveedores)</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {suppliers.map((supplier, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>S{index + 1}:</span>
                                <input
                                    type="number"
                                    value={supplier}
                                    onChange={(e) => updateSupplier(index, e.target.value)}
                                    style={{
                                        width: '60px',
                                        padding: '5px',
                                        border: '2px solid #ddd',
                                        borderRadius: '5px',
                                        textAlign: 'center'
                                    }}
                                />
                                {suppliers.length > 1 && (
                                    <button
                                        onClick={() => removeSupplier(index)}
                                        style={{
                                            background: '#ff4757',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            padding: '2px 6px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addSupplier}
                            style={{
                                background: '#2ecc71',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                cursor: 'pointer'
                            }}
                        >
                            + Proveedor
                        </button>
                    </div>
                </div>

                {/* Demands */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#555', marginBottom: '10px' }}>Demandas (Destinos)</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {demands.map((demand, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>D{index + 1}:</span>
                                <input
                                    type="number"
                                    value={demand}
                                    onChange={(e) => updateDemand(index, e.target.value)}
                                    style={{
                                        width: '60px',
                                        padding: '5px',
                                        border: '2px solid #ddd',
                                        borderRadius: '5px',
                                        textAlign: 'center'
                                    }}
                                />
                                {demands.length > 1 && (
                                    <button
                                        onClick={() => removeDemand(index)}
                                        style={{
                                            background: '#ff4757',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            padding: '2px 6px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addDemand}
                            style={{
                                background: '#3742fa',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                cursor: 'pointer'
                            }}
                        >
                            + Destino
                        </button>
                    </div>
                </div>

                {/* Cost Matrix */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#555', marginBottom: '10px' }}>Matriz de Costos</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            borderCollapse: 'collapse',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        padding: '12px',
                                        backgroundColor: '#f1f2f6',
                                        border: '1px solid #ddd',
                                        fontWeight: 'bold'
                                    }}></th>
                                    {demands.map((_, j) => (
                                        <th key={j} style={{
                                            padding: '12px',
                                            backgroundColor: '#f1f2f6',
                                            border: '1px solid #ddd',
                                            fontWeight: 'bold'
                                        }}>
                                            D{j + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((_, i) => (
                                    <tr key={i}>
                                        <th style={{
                                            padding: '12px',
                                            backgroundColor: '#f1f2f6',
                                            border: '1px solid #ddd',
                                            fontWeight: 'bold'
                                        }}>
                                            S{i + 1}
                                        </th>
                                        {demands.map((_, j) => (
                                            <td key={j} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                <input
                                                    type="number"
                                                    value={costs[i][j]}
                                                    onChange={(e) => updateCost(i, j, e.target.value)}
                                                    style={{
                                                        width: '50px',
                                                        padding: '5px',
                                                        border: '1px solid #ccc',
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

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={solveNorthwestCorner}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        Resolver Problema
                    </button>
                    {(steps.length > 0 || finalResult) && (
                        <button
                            onClick={resetSolution}
                            style={{
                                background: '#ff4757',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Limpiar Solución
                        </button>
                    )}
                </div>
            </div>

            {/* Steps Display */}
            {steps.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    marginBottom: '25px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>Pasos de la Solución</h2>
                    {steps.map((step) => (
                        <div key={step.stepNumber} style={{
                            marginBottom: '25px',
                            padding: '20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                        }}>
                            <h3 style={{
                                color: '#495057',
                                marginBottom: '15px',
                                background: '#e3f2fd',
                                padding: '10px',
                                borderRadius: '5px',
                                margin: '0 0 15px 0'
                            }}>
                                Paso {step.stepNumber}: {step.action}
                            </h3>

                            <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
                                <table style={{
                                    borderCollapse: 'collapse',
                                    backgroundColor: 'white',
                                    width: '100%',
                                    minWidth: '400px'
                                }}>
                                    <thead>
                                        <tr>
                                            <th style={{
                                                padding: '10px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: '1px solid #495057'
                                            }}></th>
                                            {step.demand.map((demand, j) => (
                                                <th key={j} style={{
                                                    padding: '10px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: '1px solid #495057'
                                                }}>
                                                    D{j + 1}<br />({demand})
                                                </th>
                                            ))}
                                            <th style={{
                                                padding: '10px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: '1px solid #1e7e34'
                                            }}>
                                                Oferta
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {step.supply.map((supply, i) => (
                                            <tr key={i}>
                                                <th style={{
                                                    padding: '10px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: '1px solid #495057'
                                                }}>
                                                    S{i + 1}<br />({supply})
                                                </th>
                                                {step.allocation[i].map((allocation, j) => (
                                                    <td key={j} style={{
                                                        padding: '10px',
                                                        border: '1px solid #ddd',
                                                        textAlign: 'center',
                                                        backgroundColor: step.currentCell[0] === i && step.currentCell[1] === j
                                                            ? '#fff3cd' : allocation > 0 ? '#d1ecf1' : 'white',
                                                        fontWeight: allocation > 0 ? 'bold' : 'normal'
                                                    }}>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>{costs[i][j]}</div>
                                                        <div style={{ fontSize: '16px', color: allocation > 0 ? '#0056b3' : '#999' }}>
                                                            {allocation || '-'}
                                                        </div>
                                                    </td>
                                                ))}
                                                <td style={{
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                    backgroundColor: '#e8f5e8',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {suppliers[i]}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <th style={{
                                                padding: '10px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: '1px solid #c82333'
                                            }}>
                                                Demanda
                                            </th>
                                            {demands.map((demand, j) => (
                                                <td key={j} style={{
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                    backgroundColor: '#f8d7da',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {demand}
                                                </td>
                                            ))}
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Final Result */}
            {finalResult && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    border: '3px solid #28a745'
                }}>
                    <h2 style={{
                        color: '#28a745',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '1.8em'
                    }}>
                        🎯 Solución Final
                    </h2>

                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                        <table style={{
                            borderCollapse: 'collapse',
                            backgroundColor: 'white',
                            width: '100%',
                            minWidth: '400px'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        padding: '12px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: '1px solid #1e7e34'
                                    }}></th>
                                    {finalResult.demand.map((_, j) => (
                                        <th key={j} style={{
                                            padding: '12px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: '1px solid #1e7e34'
                                        }}>
                                            D{j + 1}
                                        </th>
                                    ))}
                                    <th style={{
                                        padding: '12px',
                                        backgroundColor: '#17a2b8',
                                        color: 'white',
                                        border: '1px solid #117a8b'
                                    }}>
                                        Oferta
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalResult.supply.map((supply, i) => (
                                    <tr key={i}>
                                        <th style={{
                                            padding: '12px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: '1px solid #1e7e34'
                                        }}>
                                            S{i + 1}
                                        </th>
                                        {finalResult.allocation[i].map((allocation, j) => (
                                            <td key={j} style={{
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                textAlign: 'center',
                                                backgroundColor: allocation > 0 ? '#d4edda' : '#f8f9fa',
                                                fontWeight: allocation > 0 ? 'bold' : 'normal',
                                                fontSize: '16px'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                                    {costs[i][j]}
                                                </div>
                                                <div style={{
                                                    color: allocation > 0 ? '#155724' : '#999',
                                                    fontSize: '18px'
                                                }}>
                                                    {allocation || '0'}
                                                </div>
                                            </td>
                                        ))}
                                        <td style={{
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            backgroundColor: '#bee5eb',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            {supply}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th style={{
                                        padding: '12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: '1px solid #c82333'
                                    }}>
                                        Demanda
                                    </th>
                                    {finalResult.demand.map((demand, j) => (
                                        <td key={j} style={{
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            backgroundColor: '#f5c6cb',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            {demand}
                                        </td>
                                    ))}
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.5em',
                        fontWeight: 'bold'
                    }}>
                        💰 Costo Total Mínimo: ${finalResult.totalCost}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NorthwestCornerMethod;
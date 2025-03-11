import React, { useState, useEffect } from 'react';

const GameOfLifeWithLogicGates = () => {
  const rows = 25;
  const cols = 40;
  
  // Create empty grid
  const emptyGrid = () => {
    return Array(rows).fill().map(() => Array(cols).fill(false));
  };
  
  // Create random grid
  const randomGrid = () => {
    return Array(rows).fill().map(() => 
      Array(cols).fill().map(() => Math.random() > 0.7)
    );
  };
  
  const [grid, setGrid] = useState(emptyGrid);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  
  // Create reference to running state for use in useEffect
  const runningRef = React.useRef(running);
  runningRef.current = running;
  
  // Run simulation
  const runSimulation = React.useCallback(() => {
    if (!runningRef.current) return;
    
    setGrid(g => {
      return produce(g, gridCopy => {
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            // Count neighbors
            let neighbors = 0;
            for (let di = -1; di <= 1; di++) {
              for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                const newI = i + di;
                const newJ = j + dj;
                if (newI >= 0 && newI < rows && newJ >= 0 && newJ < cols) {
                  if (g[newI][newJ]) {
                    neighbors++;
                  }
                }
              }
            }
            
            // Apply Game of Life rules
            if (g[i][j] && (neighbors < 2 || neighbors > 3)) {
              gridCopy[i][j] = false;
            } else if (!g[i][j] && neighbors === 3) {
              gridCopy[i][j] = true;
            }
          }
        }
      });
    });
    
    setGeneration(gen => gen + 1);
    setTimeout(runSimulation, 200);
  }, []);
  
  // Implementation of produce function (similar to Immer)
  const produce = (currentGrid, producer) => {
    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    producer(newGrid);
    return newGrid;
  };
  
  useEffect(() => {
    if (running) {
      runSimulation();
    }
  }, [running, runSimulation]);
  
  const handleToggleCell = (i, j) => {
    const newGrid = produce(grid, gridCopy => {
      gridCopy[i][j] = !grid[i][j];
    });
    setGrid(newGrid);
  };
  
  // Logic gate patterns
  const logicGates = {
    // Basic glider pattern 
    glider: [
      [0, 2], [1, 0], [1, 2], [2, 1], [2, 2]
    ],
    // Oscillator
    blinker: [
      [1, 0], [1, 1], [1, 2]
    ],
    // NOT Gate (Eater + Glider)
    notGate: [
      // Eater (stable pattern)
      [1, 0], [1, 1], [2, 0], [2, 2], [3, 0], [4, 0], [4, 1],
      // Glider
      [3, 10], [4, 10], [5, 10], [5, 9], [4, 8]
    ],
    // AND Gate
    andGate: [
      // Input A
      [2, 5], [3, 5], [4, 5],
      // Input B
      [10, 5], [11, 5], [12, 5],
      // Logic structure (simplified)
      [6, 7], [6, 8], [7, 6], [7, 9], [8, 7], [8, 8],
      [5, 12], [6, 11], [6, 13], [7, 11], [7, 13], [8, 12]
    ],
    // OR Gate
    orGate: [
      // Input A
      [2, 3], [2, 4], [2, 5],
      // Input B
      [6, 3], [6, 4], [6, 5],
      // Logic structure (simplified)
      [4, 7], [4, 8], [5, 7], [5, 8],
      [3, 10], [4, 10], [5, 10], [6, 10], [7, 10],
      [3, 15], [4, 14], [4, 16], [5, 13], [5, 17], [6, 14], [6, 16], [7, 15]
    ],
    // XOR Gate 
    xorGate: [
      // Input signals and structure (simplified representation)
      [10, 10], [10, 11], [10, 12],
      [15, 10], [15, 11], [15, 12],
      [12, 14], [13, 14], [14, 14],
      [12, 8], [13, 8], [14, 8],
      [16, 15], [17, 15], [18, 15],
      [16, 7], [17, 7], [18, 7],
      [20, 10], [20, 11], [20, 12]
    ],
    // Gosper's Glider Gun
    gliderGun: [
      [5, 1], [5, 2], [6, 1], [6, 2], // First block
      [3, 13], [3, 14], [4, 12], [4, 16], [5, 11], [5, 17], [6, 11], [6, 15], [6, 17], [6, 18], [7, 11], [7, 17], [8, 12], [8, 16], [9, 13], [9, 14], // Left structure
      [1, 25], [2, 23], [2, 25], [3, 21], [3, 22], [4, 21], [4, 22], [5, 21], [5, 22], [6, 23], [6, 25], [7, 25], // Right structure
      [3, 35], [3, 36], [4, 35], [4, 36] // Second block
    ]
  };
  
  const loadPattern = (patternName) => {
    const newGrid = emptyGrid();
    if (logicGates[patternName]) {
      logicGates[patternName].forEach(([i, j]) => {
        if (i < rows && j < cols) {
          newGrid[i][j] = true;
        }
      });
    }
    setGrid(newGrid);
    setGeneration(0);
  };
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Conway's Game of Life with Logic Gates</h2>
      
      <div className="flex mb-3 space-x-2">
        <button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              runSimulation();
            }
          }}
          className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={() => {
            setGrid(emptyGrid());
            setGeneration(0);
          }}
          className="px-2 py-1 bg-red-500 text-white rounded-md text-sm"
        >
          Clear
        </button>
        <button
          onClick={() => {
            setGrid(randomGrid());
            setGeneration(0);
          }}
          className="px-2 py-1 bg-green-500 text-white rounded-md text-sm"
        >
          Random
        </button>
        <button
          onClick={() => {
            const newGrid = produce(grid, gridCopy => {
              for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                  let neighbors = 0;
                  for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                      if (di === 0 && dj === 0) continue;
                      const newI = i + di;
                      const newJ = j + dj;
                      if (newI >= 0 && newI < rows && newJ >= 0 && newJ < cols) {
                        if (grid[newI][newJ]) {
                          neighbors++;
                        }
                      }
                    }
                  }
                  
                  if (grid[i][j] && (neighbors < 2 || neighbors > 3)) {
                    gridCopy[i][j] = false;
                  } else if (!grid[i][j] && neighbors === 3) {
                    gridCopy[i][j] = true;
                  }
                }
              }
            });
            setGrid(newGrid);
            setGeneration(gen => gen + 1);
          }}
          className="px-2 py-1 bg-purple-500 text-white rounded-md text-sm"
        >
          Step
        </button>
      </div>
      
      <div className="mb-3 flex flex-wrap gap-2 justify-center">
        <button onClick={() => loadPattern('glider')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          Glider
        </button>
        <button onClick={() => loadPattern('blinker')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          Blinker
        </button>
        <button onClick={() => loadPattern('notGate')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          NOT Gate
        </button>
        <button onClick={() => loadPattern('andGate')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          AND Gate
        </button>
        <button onClick={() => loadPattern('orGate')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          OR Gate
        </button>
        <button onClick={() => loadPattern('xorGate')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          XOR Gate
        </button>
        <button onClick={() => loadPattern('gliderGun')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-sm">
          Glider Gun
        </button>
      </div>
      
      <div className="mb-2">Generation: {generation}</div>
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 16px)`
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => handleToggleCell(i, j)}
              className={`w-4 h-4 border border-gray-300 ${
                grid[i][j] ? 'bg-black' : 'bg-white'
              }`}
            />
          ))
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Logic Gates in Game of Life:</strong> These patterns represent simplified versions of logic circuit elements.</p>
        <p><strong>NOT Gate:</strong> Inverts an input signal (glider)</p>
        <p><strong>AND Gate:</strong> Output is "on" only when both inputs are "on"</p>
        <p><strong>OR Gate:</strong> Output is "on" when either input is "on"</p>
        <p><strong>XOR Gate:</strong> Output is "on" when inputs differ</p>
        <p><strong>Glider Gun:</strong> Continuously produces gliders (demonstrates signal generation)</p>
      </div>
    </div>
  );
};

export default GameOfLifeWithLogicGates;

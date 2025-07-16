const boardEl = document.getElementById('sudoku-board');
const timerEl = document.getElementById('timer');
let seconds = 0, timerId = null;
let currentPuzzle = [];
let solution = [];

const pad = n => String(n).padStart(2, '0');

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
            if (grid[r][c] === num) return false;
        }
    }
    return true;
}

function hasUniqueSolution(puzzle) {
    let count = 0;
    function backtrack(grid) {
        if (count > 1) return;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    for (let n = 1; n <= 9; n++) {
                        if (isValid(grid, r, c, n)) {
                            grid[r][c] = n;
                            backtrack(grid);
                            grid[r][c] = 0;
                        }
                    }
                    return;
                }
            }
        }
        count++;
    }
    const clone = puzzle.map(row => row.slice());
    backtrack(clone);
    return count === 1;
}

function generateFullGrid() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    function fillCell(idx) {
        if (idx === 81) return true;
        const r = Math.floor(idx / 9), c = idx % 9;
        if (grid[r][c] !== 0) return fillCell(idx + 1);
        shuffle(nums);
        for (const n of nums) {
            if (isValid(grid, r, c, n)) {
                grid[r][c] = n;
                if (fillCell(idx + 1)) return true;
                grid[r][c] = 0;
            }
        }
        return false;
    }
    fillCell(0);
    return grid;
}

function generatePuzzle(level = 'hard') {
    const clueCount = { easy: 40, medium: 32, hard: 26 }[level] || 40;
    const grid = generateFullGrid();
    const puzzle = grid.map(r => r.slice());
    const positions = shuffle([...Array(81).keys()]);

    for (const pos of positions) {
        const r = Math.floor(pos / 9), c = pos % 9;
        const temp = puzzle[r][c];
        puzzle[r][c] = 0;
        if (!hasUniqueSolution(puzzle)) puzzle[r][c] = temp;
        if (puzzle.flat().filter(v => v !== 0).length <= clueCount) break;
    }

    solution = grid;
    return puzzle;
}

function startTimer() {
    clearInterval(timerId);
    seconds = 0;
    timerEl.textContent = "00:00:00";
    timerId = setInterval(() => {
        seconds++;
        timerEl.textContent = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
    }, 1000);
}

function renderBoard(puzzle) {
    boardEl.innerHTML = "";
    currentPuzzle = puzzle.map(r => r.slice());

    for (let i = 0; i < 81; i++) {
        const r = Math.floor(i / 9), c = i % 9;
        const cell = document.createElement("div");
        cell.classList.add("cell");

        // Border tebal antar 3x3
        const top = r % 3 === 0 ? "3px solid #000" : "1px solid #bbb";
        const bottom = (r + 1) % 3 === 0 ? "3px solid #000" : "1px solid #bbb";
        const left = c % 3 === 0 ? "3px solid #000" : "1px solid #bbb";
        const right = (c + 1) % 3 === 0 ? "3px solid #000" : "1px solid #bbb";
        cell.style.borderTop = top;
        cell.style.borderBottom = bottom;
        cell.style.borderLeft = left;
        cell.style.borderRight = right;

        if (puzzle[r][c] !== 0) {
            cell.textContent = puzzle[r][c];
            cell.classList.add("prefilled");
        } else {
            cell.contentEditable = "true";
            cell.addEventListener("input", e => {
                const val = e.target.textContent.trim();
                if (/^[1-9]$/.test(val)) {
                    currentPuzzle[r][c] = parseInt(val);
                } else {
                    currentPuzzle[r][c] = 0;
                    e.target.textContent = "";
                }
            });
        }

        boardEl.appendChild(cell);
    }
}

/* Cek semua baris, kolom, blok — mengembalikan true jika PENUH & VALID */
function isCompleteAndValid(grid) {
  // Fungsi kecil: true jika array persis berisi 1‑9 tanpa duplikat
  const uniqueNine = arr => {
    if (arr.length !== 9) return false;
    const set = new Set(arr);
    return set.size === 9 && [...set].every(n => n >= 1 && n <= 9);
  };

  // 1) Baris
  for (let r = 0; r < 9; r++) {
    if (!uniqueNine(grid[r])) return false;
  }

  // 2) Kolom
  for (let c = 0; c < 9; c++) {
    const col = grid.map(row => row[c]);
    if (!uniqueNine(col)) return false;
  }

  // 3) Blok 3×3
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const block = [];
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          block.push(grid[r][c]);
        }
      }
      if (!uniqueNine(block)) return false;
    }
  }
  return true; // semua lolos
}

/* -------------------------------- checkPuzzle baru ------------------------------- */
function checkPuzzle() {
  // Bangun ulang grid dari currentPuzzle (atau langsung dari DOM jika mau)
  const grid = currentPuzzle.map(row => row.slice());

  // Pastikan tidak ada 0 (sel kosong)
  if (grid.flat().includes(0)) {
    alert("Masih ada sel kosong!");
    return;
  }

  // Validasi aturan Sudoku
  if (isCompleteAndValid(grid)) {
    clearInterval(timerId);

    const name = prompt("Sudoku Telah Selesai dengan Benar! Masukkan nama Anda:");
    if (!name) return;

    const time = timerEl.textContent;
    const dificulty = "Genius";
    
    fetch('php/simpanSkor.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, time, dificulty })
    })
    .then(response => response.json())
    .then(data => {
      alert(`Skor tersimpan!\nNama: ${name}\nWaktu: ${time}`);
    })
    .catch(err => {
      console.error("Gagal menyimpan skor:", err);
      alert("Terjadi kesalahan saat menyimpan skor.");
    });
  } else {
    alert("Ada angka yang duplikat / salah penempatan!");
  }
}

function newGame(level = 'hard') {
    const puzzle = generatePuzzle(level);
    renderBoard(puzzle);
    startTimer();
}

newGame('hard');
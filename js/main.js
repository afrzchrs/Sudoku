
let leaderboardData = [];

const timeToSeconds = timeStr => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
};

function displayData(data) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    // Urutkan data berdasarkan waktu
    const sorted = [...data].sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));

    // Tampilkan data
    sorted.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.time}</td>
            <td>${item.dificulty}</td>
            <td>${item.timestamp}</td>
        `;
        tbody.appendChild(row);
    });
}

function applyFilter() {
    const selectedDifficulty = document.getElementById('difficultySelect').value;

    if (selectedDifficulty === 'All') {
        displayData(leaderboardData);
    } else {
        const filteredData = leaderboardData.filter(
            item => item.dificulty === selectedDifficulty
        );
        displayData(filteredData);
    }
}

// Load data dari JSON
fetch('db/skor.json')
    .then(res => res.json())
    .then(data => {
        leaderboardData = data;
        const filteredData = leaderboardData.filter(
            item => item.dificulty === "Easy"
        );
        displayData(filteredData);

        document.getElementById('difficultySelect').addEventListener('change', applyFilter);
    })
    .catch(err => {
        console.error('Gagal memuat skor:', err);
        const tbody = document.getElementById('leaderboard-body');
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center text-danger">Gagal memuat data skor.</td>`;
        tbody.appendChild(row);
    });
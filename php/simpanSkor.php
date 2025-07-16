<?php
header('Content-Type: application/json');

// Ambil data POST
$data = json_decode(file_get_contents('php://input'), true);

// Validasi sederhana
if (!isset($data['name']) || !isset($data['time']) || !isset($data['dificulty'])) {
  echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
  exit;
}

// File tempat menyimpan skor
$file = __DIR__ . '/../db/skor.json';;
$skor = [];

// Baca skor yang sudah ada
if (file_exists($file)) {
  $skor = json_decode(file_get_contents($file), true);
}

// Tambahkan skor baru
$skor[] = [
  'name' => $data['name'],
  'time' => $data['time'],
  'dificulty' => $data['dificulty'],
  'timestamp' => date('Y-m-d H:i:s')
];

// Simpan kembali ke file
file_put_contents($file, json_encode($skor, JSON_PRETTY_PRINT));

echo json_encode(['success' => true, 'message' => 'Skor berhasil disimpan']);
?>

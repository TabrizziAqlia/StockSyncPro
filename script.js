// --- DATABASE MOCKUP ---
let pantryItems = [
    // Contoh Data Awal untuk Pitch: Menunjukkan semua status warna
    { name: "Bayam Segar", expDate: "2025-12-03", qty: 1, estimatedPrice: 5000 },    // Merah
    { name: "Susu UHT Kotak", expDate: "2025-12-08", qty: 2, estimatedPrice: 24000 }, // Merah
    { name: "Keju Cheddar", expDate: "2025-12-18", qty: 1, estimatedPrice: 15000 },   // Kuning
    { name: "Beras 5kg", expDate: "2026-06-15", qty: 1, estimatedPrice: 65000 }      // Hijau
];

let itemsSaved = 0; // Metrik untuk Impact
const ITEM_PRICE_AVG = 15000; // Harga rata-rata item yang diselamatkan

// --- LOGIKA PERHITUNGAN & STATUS ---

function calculateDaysRemaining(expDate) {
    const today = new Date();
    // Reset waktu hari ini ke tengah malam untuk perhitungan akurat
    today.setHours(0, 0, 0, 0); 
    const expiry = new Date(expDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
}

function getStatusClass(days) {
    if (days <= 0) { // Sudah Kedaluwarsa
        return 'status-merah'; 
    } else if (days <= 7) {
        return 'status-merah'; // Kedaluwarsa dalam 7 hari atau kurang
    } else if (days <= 14) {
        return 'status-kuning'; // Kedaluwarsa antara 8 hingga 14 hari
    } else {
        return 'status-hijau'; // Kedaluwarsa lebih dari 14 hari
    }
}

// --- LOGIKA UTAMA: SMART SORTING & VISUALISASI ---

function renderPantry() {
    const sortBy = document.getElementById('sort-by').value;

    // 1. Algoritma Smart Sorting (NON-AI NOVELTY)
    if (sortBy === 'exp-asc') {
        // Urutkan berdasarkan tanggal kedaluwarsa terdekat (asc)
        pantryItems.sort((a, b) => new Date(a.expDate) - new Date(b.expDate));
    } else if (sortBy === 'name-asc') {
        pantryItems.sort((a, b) => a.name.localeCompare(b.name));
    }

    const listContainer = document.getElementById('item-list');
    listContainer.innerHTML = '';

    pantryItems.forEach((item, index) => {
        const daysLeft = calculateDaysRemaining(item.expDate);
        const statusClass = getStatusClass(daysLeft);
        const daysText = daysLeft <= 0 ? 'KEDALUWARSA!' : `Sisa Hari: ${daysLeft}`;

        const itemCard = document.createElement('div');
        itemCard.className = `item-card ${statusClass}`;
        itemCard.setAttribute('data-index', index); // Untuk identifikasi di masa depan
        
        itemCard.innerHTML = `
            <strong>${item.name}</strong> (${item.qty})<br>
            <small>ED: ${item.expDate}</small><br>
            <span class="days-left">${daysText}</span>
        `;
        listContainer.appendChild(itemCard);
    });
    
    updateImpactMetrics();
}

// --- LOGIKA PENAMBAHAN ITEM (NON-AI) ---

document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const date = document.getElementById('exp-date').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const category = document.getElementById('item-category').value;
    
    // Asumsi harga acak untuk simulasi, idealnya dari database
    const estimatedPrice = Math.floor(Math.random() * 50000) + 5000; 

    if (name && date && qty > 0 && category) {
        pantryItems.push({ 
            name: name, 
            expDate: date, 
            qty: qty,
            estimatedPrice: estimatedPrice
        });
        renderPantry();
        this.reset();
    } else {
        alert("Mohon isi semua data dengan benar.");
    }
});

// --- LOGIKA DAMPAK SAYA (IMPACT METRICS) ---

function updateImpactMetrics() {
    // 1. Total Uang Dihemat (Simulasi)
    // Di dunia nyata: hitung nilai item yang telah ditandai 'Cooked' dari stok Merah/Kuning
    // Untuk Pitch: hitung nilai total item yang telah diselamatkan (itemsSaved)
    const totalSavedValue = itemsSaved * ITEM_PRICE_AVG;
    document.getElementById('total-saved').textContent = `Rp ${totalSavedValue.toLocaleString('id-ID')}`;
    
    // 2. Item Makanan Diselamatkan
    document.getElementById('items-saved').textContent = itemsSaved;
}

// Tambahkan Event Listener ke Tombol 'Masak Resep Ini' (Simulasi)
document.querySelector('#recipe-suggestion .action-button').addEventListener('click', () => {
    // Di dunia nyata: hapus/kurangi stok item dari array
    // Untuk Pitch: tambahkan ke metrik Impact
    itemsSaved += 2; // Asumsi 2 item berhasil diselamatkan
    alert("Hebat! Anda berhasil menyelamatkan 2 item dari pemborosan. Cek Dampak Saya!");
    renderPantry(); // Update metrics
});


// Jalankan render pertama kali saat website dimuat
document.addEventListener('DOMContentLoaded', renderPantry);

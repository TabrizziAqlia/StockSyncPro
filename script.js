// --- DATABASE MOCKUP ---
let pantryItems = [
    // Contoh Data Awal (Simulasi dari database Anda)
    { name: "Susu UHT Kotak", expDate: "2025-12-05", qty: 2 }, // Merah (Hampir Habis)
    { name: "Bayam Segar", expDate: "2025-12-02", qty: 1 },    // Merah (Paling Mendesak)
    { name: "Beras 5kg", expDate: "2026-06-15", qty: 1 },     // Hijau (Aman)
    { name: "Keju Cheddar", expDate: "2025-12-18", qty: 1 }    // Kuning (Perlu Perhatian)
];

// --- LOGIKA UTAMA: SMART SORTING & VISUALISASI ---

function calculateDaysRemaining(expDate) {
    const today = new Date();
    const expiry = new Date(expDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
}

function getStatusClass(days) {
    if (days <= 7) {
        return 'status-merah'; // Kedaluwarsa dalam 7 hari atau kurang
    } else if (days <= 14) {
        return 'status-kuning'; // Kedaluwarsa antara 8 hingga 14 hari
    } else {
        return 'status-hijau'; // Kedaluwarsa lebih dari 14 hari
    }
}

function renderPantry() {
    // 1. Algoritma Smart Sorting (Non-AI Novelty)
    // Mengurutkan item berdasarkan tanggal kedaluwarsa terdekat (asc)
    pantryItems.sort((a, b) => new Date(a.expDate) - new Date(b.expDate));

    const listContainer = document.getElementById('item-list');
    listContainer.innerHTML = '';

    pantryItems.forEach(item => {
        const daysLeft = calculateDaysRemaining(item.expDate);
        const statusClass = getStatusClass(daysLeft);

        const itemCard = document.createElement('div');
        itemCard.className = `item-card ${statusClass}`;
        itemCard.innerHTML = `
            <strong>${item.name}</strong> (${item.qty})<br>
            <small>ED: ${item.expDate}</small><br>
            <span style="font-weight: bold;">Sisa Hari: ${daysLeft}</span>
        `;
        listContainer.appendChild(itemCard);
    });
}

// --- LOGIKA PENAMBAHAN ITEM ---

document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const date = document.getElementById('exp-date').value;
    const qty = parseInt(document.getElementById('quantity').value);

    // Validasi dasar
    if (name && date && qty > 0) {
        pantryItems.push({ 
            name: name, 
            expDate: date, 
            qty: qty 
        });
        renderPantry();
        // Clear form
        this.reset();
    } else {
        alert("Mohon isi semua data dengan benar.");
    }
});

// Jalankan render pertama kali saat website dimuat
document.addEventListener('DOMContentLoaded', renderPantry);

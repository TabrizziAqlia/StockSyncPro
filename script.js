// --- DATABASE MOCKUP ---
let pantryItems = [
    // Contoh Data Awal untuk Pitch: Menunjukkan semua status warna
    { name: "Bayam Segar", expDate: "2025-12-03", qty: 1, estimatedPrice: 5000 },    // Merah
    { name: "Telur Ayam", expDate: "2025-12-08", qty: 10, estimatedPrice: 24000 }, // Kuning
    { name: "Susu UHT Kotak", expDate: "2025-12-05", qty: 2, estimatedPrice: 15000 }, // Merah
    { name: "Keju Cheddar", expDate: "2025-12-18", qty: 1, estimatedPrice: 15000 },   // Kuning
    { name: "Beras 5kg", expDate: "2026-06-15", qty: 1, estimatedPrice: 65000 }      // Hijau
];

let itemsSaved = 0; // Metrik untuk Impact
const ITEM_PRICE_AVG = 15000; // Harga rata-rata item yang diselamatkan (simulasi)

// DATABASE RESEP DUMMY dengan TAGGING (NON-AI)
const recipeDatabase = [
    { name: "Omelet Bumbu Dasar", ingredients: ["Telur Ayam", "Bayam Segar"], tags: ["quick", "kost"] },
    { name: "Nasi Goreng Sederhana", ingredients: ["Nasi", "Telur Ayam", "Bumbu Instan"], tags: ["quick", "kost"] },
    { name: "Susu Keju Panggang", ingredients: ["Susu UHT Kotak", "Keju Cheddar"], tags: ["kost"] },
    { name: "Tumis Kangkung Pedas", ingredients: ["Kangkung", "Bawang"], tags: ["quick"] },
    { name: "Nasi Gila Anak Kost", ingredients: ["Nasi", "Sosis", "Telur Ayam", "Saus"], tags: ["kost", "quick"] },
    { name: "Sup Ayam Rempah", ingredients: ["Ayam", "Wortel", "Beras 5kg"], tags: ["all"] },
    { name: "Salad Sayur Segar", ingredients: ["Bayam Segar", "Minyak Zaitun"], tags: ["all"] },
];

let currentFilter = 'all'; // Default filter

// --- LOGIKA PERHITUNGAN & STATUS ---

function calculateDaysRemaining(expDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const expiry = new Date(expDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
}

function getStatusClass(days) {
    if (days <= 0) { 
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
        itemCard.setAttribute('data-index', index);
        
        itemCard.innerHTML = `
            <strong>${item.name} (${item.qty})</strong><br>
            <small>ED: ${item.expDate}</small><br>
            <span class="days-left">${daysText}</span>
        `;
        listContainer.appendChild(itemCard);
    });
    
    renderRecipes(); 
    updateImpactMetrics();
}

// --- LOGIKA PENAMBAHAN ITEM (NON-AI) ---

document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const date = document.getElementById('exp-date').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const category = document.getElementById('item-category').value;
    
    // Asumsi harga acak
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

// --- LOGIKA FILTERING RESEP BARU (NON-AI) ---

function renderRecipes() {
    const outputContainer = document.getElementById('recipe-output');
    outputContainer.innerHTML = '';
    
    // 1. Tentukan bahan yang paling mendesak (Stok Merah dan Kuning)
    const urgentItems = pantryItems.filter(item => {
        const status = getStatusClass(calculateDaysRemaining(item.expDate));
        return status === 'status-merah' || status === 'status-kuning';
    });
    const urgentNames = urgentItems.map(item => item.name);
    
    // 2. Filter resep berdasarkan kategori (Menu Anak Kost, Quick, All)
    const filteredRecipes = recipeDatabase.filter(recipe => {
        if (currentFilter === 'all') return true;
        return recipe.tags.includes(currentFilter);
    });

    // 3. Terapkan Logika Smart Matching: Resep yang menggunakan bahan stok Merah/Kuning
    const matchedRecipes = filteredRecipes.filter(recipe => {
        // Cek apakah minimal 1 bahan dari resep ada di daftar stok mendesak
        return recipe.ingredients.some(ing => urgentNames.includes(ing));
    });
    
    // Render Output
    const gridContainer = document.createElement('div');
    gridContainer.className = 'recipe-output-grid';

    if (matchedRecipes.length > 0) {
        matchedRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            const savedIngredients = recipe.ingredients.filter(ing => urgentNames.includes(ing)).join(', ');

            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <p><strong>Bahan Mendesak:</strong> ${savedIngredients}</p>
                <p><small>Tags: ${recipe.tags.join(', ')}</small></p>
                <button class="action-button" onclick="handleRecipeCooked('${recipe.name}')">Masak Resep Ini</button>
            `;
            gridContainer.appendChild(recipeCard);
        });
        outputContainer.appendChild(gridContainer);
    } else {
        outputContainer.innerHTML = `<div class="recipe-card span-full"><p>Tidak ada resep yang cocok dengan stok mendesak Anda di kategori ${currentFilter}. Coba kategori lain!</p></div>`;
    }
}

// Handler untuk tombol filter
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        renderRecipes(); 
    });
});

// Handler untuk simulasi memasak (mengurangi stok dan update impact)
function handleRecipeCooked(recipeName) {
    // Di dunia nyata: Kurangi item yang digunakan dari pantryItems
    // Untuk Pitch: Tambahkan ke metrik Impact
    
    // Asumsi: Setiap resep menyelamatkan 2 item dan menghemat 20.000 Rupiah
    const savedAmount = 20000;
    const savedItemsCount = 2;

    itemsSaved += savedItemsCount; 
    
    // Update simulasi harga rata-rata
    // ITEM_PRICE_AVG harusnya dihitung dari data user, ini hanya simulasi
    
    alert(`Sukses! Anda memasak ${recipeName} dan menyelamatkan ${savedItemsCount} item dari pemborosan. Total hemat Anda bertambah!`);
    
    renderPantry();
}


// --- LOGIKA DAMPAK SAYA (IMPACT METRICS) ---

function updateImpactMetrics() {
    // Hitung total uang yang diselamatkan (simulasi)
    const totalSavedValue = itemsSaved * (ITEM_PRICE_AVG / 2); // Nilai yang diselamatkan (misal setengah harga rata-rata)
    
    document.getElementById('total-saved').textContent = `Rp ${totalSavedValue.toLocaleString('id-ID')}`;
    document.getElementById('items-saved').textContent = itemsSaved;
}


// Jalankan render pertama kali saat website dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderPantry();
    // renderRecipes(); // Dipanggil di dalam renderPantry
});

// --- DATABASE MOCKUP ---
let pantryItems = [
    // Data stok awal untuk demo (Bayam & Susu Merah, Telur Kuning)
    { name: "Bayam Segar", expDate: "2025-12-03", qty: 1, estimatedPrice: 5000 },    
    { name: "Telur Ayam", expDate: "2025-12-08", qty: 10, estimatedPrice: 24000 }, 
    { name: "Susu UHT Kotak", expDate: "2025-12-05", qty: 2, estimatedPrice: 15000 }, 
    { name: "Keju Cheddar", expDate: "2025-12-18", qty: 1, estimatedPrice: 15000 },   
    { name: "Beras 5kg", expDate: "2026-06-15", qty: 1, estimatedPrice: 65000 }      
];

let itemsSaved = 0; 
const ITEM_PRICE_AVG = 15000; 

// DATABASE RESEP DUMMY dengan TAGGING DAN LINK COOKPAD
// PASTIKAN SEMUA BAHAN DALAM RESEP INI ADA DI PANTRY ITEMS (atau diasumsikan ada)
const recipeDatabase = [
    { 
        name: "Omelet Sayur Bumbu Dasar", 
        ingredients: ["Telur Ayam", "Bayam Segar"], 
        tags: ["quick", "kost"], 
        cookpadLink: "https://cookpad.com/id/resep/23940635" // Link Contoh
    },
    { 
        name: "Nasi Goreng Sederhana", 
        ingredients: ["Telur Ayam", "Beras 5kg"], // Diubah agar cocok dengan stok yang ada
        tags: ["quick", "kost"], 
        cookpadLink: "https://cookpad.com/id/resep/25185952" 
    },
    { 
        name: "Susu Keju Panggang", 
        ingredients: ["Susu UHT Kotak", "Keju Cheddar"], 
        tags: ["kost"], 
        cookpadLink: "https://cookpad.com/id/resep/24736305" 
    },
    { 
        name: "Tumis Kangkung Pedas", 
        ingredients: ["Kangkung", "Bayam Segar"], // Diubah agar ada bahan yang mendesak
        tags: ["quick"], 
        cookpadLink: "https://cookpad.com/id/resep/11223344" 
    },
    { 
        name: "Nasi Gila Anak Kost", 
        ingredients: ["Telur Ayam", "Beras 5kg", "Keju Cheddar"], // Diubah agar cocok
        tags: ["kost", "quick"], 
        cookpadLink: "https://cookpad.com/id/resep/15656236" 
    },
    { 
        name: "Sup Ayam Rempah", 
        ingredients: ["Keju Cheddar", "Beras 5kg"], // Diubah agar bahan tersedia (walau tidak mendesak)
        tags: ["all"], 
        cookpadLink: "https://cookpad.com/id/resep/55667788" 
    },
    { 
        name: "Salad Sayur Segar", 
        ingredients: ["Bayam Segar", "Keju Cheddar"], // Diubah agar ada bahan mendesak & tersedia
        tags: ["all"], 
        cookpadLink: "https://cookpad.com/id/resep/25176969" 
    },
];

let currentFilter = 'all'; // Default filter

// --- LOGIKA PERHITUNGAN & STATUS (Sama seperti sebelumnya) ---

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
        return 'status-merah'; // 7 hari atau kurang
    } else if (days <= 14) {
        return 'status-kuning'; // 8 hingga 14 hari
    } else {
        return 'status-hijau'; // Lebih dari 14 hari
    }
}

// --- LOGIKA UTAMA: SMART SORTING & VISUALISASI PANTRY (Sama) ---

function renderPantry() {
    const sortBy = document.getElementById('sort-by').value;

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

// --- LOGIKA PENAMBAHAN ITEM (Sama) ---

document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const date = document.getElementById('exp-date').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const category = document.getElementById('item-category').value;
    
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

// --- FUNGSI UTAMA: LOGIKA FILTERING RESEP YANG DIPERBAIKI (FIX) ---

function renderRecipes() {
    const outputContainer = document.getElementById('recipe-output');
    outputContainer.innerHTML = '';
    
    // 1. Tentukan bahan yang mendesak (Stok Merah dan Kuning)
    const urgentItems = pantryItems.filter(item => {
        const status = getStatusClass(calculateDaysRemaining(item.expDate));
        return status === 'status-merah' || status === 'status-kuning';
    });
    const urgentNames = urgentItems.map(item => item.name);
    
    // 2. Daftar semua bahan yang dimiliki pengguna
    const allPantryNames = pantryItems.map(item => item.name);

    // 3. Filter Awal: Resep harus memiliki SEMUA bahan yang tersedia di pantry.
    let filteredRecipes = recipeDatabase.filter(recipe => {
        // Cek apakah SEMUA bahan resep ada di daftar stok (allPantryNames)
        return recipe.ingredients.every(ing => allPantryNames.includes(ing));
    });

    // 4. Terapkan Filter Kategori dan Prioritas
    if (currentFilter !== 'all') {
        // Jika filter BUKAN 'all' (yaitu 'kost' atau 'quick'), kita filter ketat:
        filteredRecipes = filteredRecipes.filter(recipe => {
            // A. Harus cocok dengan TAG yang dipilih
            const matchesTag = recipe.tags.includes(currentFilter);
            // B. Harus menggunakan minimal 1 Stok Mendesak (Merah/Kuning)
            const usesUrgentItem = recipe.ingredients.some(ing => urgentNames.includes(ing));
            
            return matchesTag && usesUrgentItem;
        });
    }

    // 5. Urutkan (Hanya jika kita memiliki stok mendesak)
    if (urgentNames.length > 0) {
        filteredRecipes.sort((a, b) => {
             // Cek apakah resep A dan B menggunakan barang mendesak
             const aUrgent = a.ingredients.some(ing => urgentNames.includes(ing));
             const bUrgent = b.ingredients.some(ing => urgentNames.includes(ing));
             
             // Urutkan resep mendesak (true) di atas resep tidak mendesak (false)
             return (bUrgent === aUrgent) ? 0 : (bUrgent ? 1 : -1); 
        });
    }

    // 6. Rendering Hasil
    const gridContainer = document.createElement('div');
    gridContainer.className = 'recipe-output-grid';

    if (filteredRecipes.length > 0) {
        filteredRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            const savedIngredients = recipe.ingredients.filter(ing => urgentNames.includes(ing)).join(', ');
            const urgentText = savedIngredients ? 
                                `<strong>Bahan Mendesak:</strong> ${savedIngredients}` : 
                                `<em>Bahan Tersedia: Stok Aman</em>`;

            // Menggunakan tautan <a> sebagai tombol link Cookpad
            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <p>${urgentText}</p>
                <p><small>Tags: ${recipe.tags.join(', ')}</small></p>
                <a href="${recipe.cookpadLink}" target="_blank" class="action-button">Masak Resep Ini</a>
            `;
            gridContainer.appendChild(recipeCard);
        });
        outputContainer.appendChild(gridContainer);
    } else {
        // Pesan jika tidak ada resep yang cocok
        const filterName = currentFilter === 'all' ? 'Semua Kategori' : `Kategori ${currentFilter}`;
        outputContainer.innerHTML = `<div class="recipe-card span-full"><p>Tidak ada resep yang semua bahannya tersedia di Pantry Anda pada ${filterName}, atau tidak ada yang menggunakan stok mendesak.</p></div>`;
    }
}

// Handler untuk tombol filter (Sama)
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        renderRecipes(); 
    });
});

// --- LOGIKA DAMPAK SAYA (IMPACT METRICS) ---

function updateImpactMetrics() {
    const totalSavedValue = itemsSaved * (ITEM_PRICE_AVG / 2); 
    
    document.getElementById('total-saved').textContent = `Rp ${totalSavedValue.toLocaleString('id-ID')}`;
    document.getElementById('items-saved').textContent = itemsSaved;
}

// Logika simulasi impact saat link Cookpad diklik
function simulateCookingAndImpact() {
    itemsSaved += 2; // Asumsi 2 item diselamatkan per resep
    updateImpactMetrics(); 
}

// Event listener untuk memanggil simulateCookingAndImpact saat tombol (link Cookpad) diklik
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('action-button')) {
        simulateCookingAndImpact();
    }
});

// Jalankan render pertama kali saat website dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderPantry();
});

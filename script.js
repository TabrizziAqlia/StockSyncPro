// --- DATABASE MOCKUP ---
let pantryItems = [
    { name: "Bayam Segar", expDate: "2025-12-03", qty: 1, estimatedPrice: 5000 },    
    { name: "Telur Ayam", expDate: "2025-12-08", qty: 10, estimatedPrice: 24000 }, 
    { name: "Susu UHT Kotak", expDate: "2025-12-05", qty: 2, estimatedPrice: 15000 }, 
    { name: "Keju Cheddar", expDate: "2025-12-18", qty: 1, estimatedPrice: 15000 },   
    { name: "Beras 5kg", expDate: "2026-06-15", qty: 1, estimatedPrice: 65000 }      
];

let itemsSaved = 0; 
const ITEM_PRICE_AVG = 15000; 

// NEW: DATABASE RESEP DUMMY dengan TAGGING DAN LINK COOKPAD
// PENTING: Anda harus mengganti link-link ini dengan link Cookpad yang sebenarnya!
const recipeDatabase = [
    { 
        name: "Omelet Sayur Bumbu Dasar", 
        ingredients: ["Telur Ayam", "Bayam Segar"], 
        tags: ["quick", "kost"], 
        cookpadLink: "https://cookpad.com/id/resep/23940635" 
    },
    { 
        name: "Nasi Goreng Sederhana", 
        ingredients: ["Nasi", "Telur Ayam", "Bumbu Instan"], 
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
        ingredients: ["Kangkung", "Bawang"], 
        tags: ["quick"], 
        cookpadLink: "https://cookpad.com/id/resep/11223344" 
    },
    { 
        name: "Nasi Gila Anak Kost", 
        ingredients: ["Nasi", "Sosis", "Telur Ayam", "Saus Pedas"], 
        tags: ["kost", "quick"], 
        cookpadLink: "https://cookpad.com/id/resep/15656236 " 
    },
    { 
        name: "Sup Ayam Rempah", 
        ingredients: ["Ayam", "Wortel", "Beras"], 
        tags: ["all"], 
        cookpadLink: "https://cookpad.com/id/resep/55667788" 
    },
    { 
        name: "Salad Sayur Segar", 
        ingredients: ["Timun", "Wortel", "Selada", "Tomat", "Minyak Zaitun"], 
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
        return 'status-merah'; 
    } else if (days <= 14) {
        return 'status-kuning'; 
    } else {
        return 'status-hijau'; 
    }
}

// --- LOGIKA UTAMA: SMART SORTING & VISUALISASI PANTRY ---

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

// --- LOGIKA PENAMBAHAN ITEM (Sama seperti sebelumnya) ---

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

// --- LOGIKA FILTERING & RENDERING RESEP DENGAN LINK COOKPAD ---

function renderRecipes() {
    const outputContainer = document.getElementById('recipe-output');
    outputContainer.innerHTML = '';
    
    const urgentItems = pantryItems.filter(item => {
        const status = getStatusClass(calculateDaysRemaining(item.expDate));
        return status === 'status-merah' || status === 'status-kuning';
    });
    const urgentNames = urgentItems.map(item => item.name);
    
    const filteredRecipes = recipeDatabase.filter(recipe => {
        if (currentFilter === 'all') return true;
        return recipe.tags.includes(currentFilter);
    });

    const matchedRecipes = filteredRecipes.filter(recipe => {
        return recipe.ingredients.some(ing => urgentNames.includes(ing));
    });
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'recipe-output-grid';

    if (matchedRecipes.length > 0) {
        matchedRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            const savedIngredients = recipe.ingredients.filter(ing => urgentNames.includes(ing)).join(', ');

            // Tombol diubah menjadi elemen <a> (tautan) dengan class action-button
            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <p><strong>Bahan Mendesak:</strong> ${savedIngredients}</p>
                <p><small>Tags: ${recipe.tags.join(', ')}</small></p>
                <a href="${recipe.cookpadLink}" target="_blank" class="action-button">Masak Resep Ini</a>
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

// --- LOGIKA DAMPAK SAYA (IMPACT METRICS) ---

function updateImpactMetrics() {
    const totalSavedValue = itemsSaved * (ITEM_PRICE_AVG / 2); 
    
    document.getElementById('total-saved').textContent = `Rp ${totalSavedValue.toLocaleString('id-ID')}`;
    document.getElementById('items-saved').textContent = itemsSaved;
}

// Simulasi untuk menunjukkan bahwa "Masak Resep Ini" berkontribusi ke Impact
// Di dunia nyata, ini akan terhubung dengan pengurangan stok aktual
// dan mungkin konfirmasi dari user bahwa resep sudah dimasak.
// Untuk tujuan demo, kita bisa menambahkan fungsi ini.
function simulateCookingAndImpact() {
    itemsSaved += 2; // Asumsi 2 item diselamatkan per resep
    // alert("Sukses! Anda berhasil memasak dan mengurangi pemborosan. Cek Dampak Saya!");
    updateImpactMetrics(); // Langsung update metrics tanpa alert
}

// Tambahkan event listener ke setiap link resep (setelah mereka dirender)
// Ini adalah fitur yang akan dipanggil ketika link Cookpad diklik
// Dengan adanya link Cookpad, tombol "Masak Resep Ini" tidak perlu memanggil alert,
// tapi bisa langsung menambahkan ke impact metrics.
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('action-button')) {
        simulateCookingAndImpact(); // Panggil fungsi simulasi dampak
    }
});

// Jalankan render pertama kali saat website dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderPantry();
});

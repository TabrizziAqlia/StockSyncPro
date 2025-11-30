// --- DATABASE MOCKUP ---
// FIX: Memastikan array pantryItems kosong saat pertama kali dimuat
let pantryItems = []; 

let itemsSaved = 0; 
const ITEM_PRICE_AVG = 15000; 

// DATABASE RESEP DUMMY (Tidak Berubah)
const recipeDatabase = [
    { 
        name: "Omelet Sayur Bumbu Dasar", 
        ingredients: ["Telur Ayam", "Bayam Segar"], 
        tags: ["quick", "kost", "local"], 
        cookpadLink: "https://cookpad.com/id/resep/23940635"
    },
    { 
        name: "Nasi Goreng Sederhana", 
        ingredients: ["Telur Ayam", "Beras 5kg"], 
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
        ingredients: ["Kangkung", "Bayam Segar"], 
        tags: ["quick", "local"], 
        cookpadLink: "https://cookpad.com/id/resep/11223344" 
    },
    { 
        name: "Nasi Gila Anak Kost", 
        ingredients: ["Telur Ayam", "Beras 5kg", "Keju Cheddar"], 
        tags: ["kost", "quick"], 
        cookpadLink: "https://cookpad.com/id/resep/15656236" 
    },
    { 
        name: "Sup Ayam Rempah", 
        ingredients: ["Keju Cheddar", "Beras 5kg"], 
        tags: ["all"], 
        cookpadLink: "https://cookpad.com/id/resep/55667788" 
    },
    { 
        name: "Salad Sayur Segar", 
        ingredients: ["Bayam Segar", "Keju Cheddar"], 
        tags: ["all", "local"], 
        cookpadLink: "https://cookpad.com/id/resep/25176969" 
    },
];

let currentFilter = 'all'; 

// --- DATA LOKASI REKOMENDASI (Tidak Berubah) ---
const recommendedLocations = [
    { name: "Toko Delapan 8", address: "Ruko Margo Raya, Jl. Margorejo Indah No.115 H, Sidosermo, Kec. Wonocolo, Surabaya, Jawa Timur 60238", hours: "Senin-Jumat: 08.00–18.00, Sabtu-Minggu: 08.00–04.00", rating: "4.3", map_url: "https://maps.google.com/?cid=8299258670296500936&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ" },
    { name: "Toko Kelontong PELANGI JAYA", address: "Jl. Jambangan Tama No.15, RT.007/RW.003, Jambangan, Kec. Jambangan, Surabaya, Jawa Timur 60232", hours: "Buka 24 jam", rating: "5.0", map_url: "https://maps.google.com/?cid=11486811832961227679&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ" },
    { name: "Toko bahan Kue Rame Sawana (RSW)", address: "Jl. Wonokromo No.62, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243", hours: "Senin-Sabtu: 08.00–17.00, Minggu: Tutup", rating: "4.6", map_url: "https://maps.google.com/?cid=10417453649697719281&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ" },
    { name: "Sinar Jaya", address: "Jl. Ngagel Rejo Kidul No.65, Ngagelrejo, Kec. Wonokromo, Surabaya, Jawa Timur 60245", hours: "Senin-Sabtu: 08.00–17.00, Minggu: Tutup", rating: "4.4", map_url: "https://maps.google.com/?cid=11285820683726956858&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ" },
    { name: "Toko Indra Jaya", address: "No, Jl. Raya Wiyung Jl. Raya Menganti No.2, Wiyung, Surabaya, East Java 60229", hours: "Senin-Sabtu: 07.00–17.00, Minggu: Tutup", rating: "4.5", map_url: "https://maps.google.com/?cid=15821971197267745864&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ" }
];


// --- LOGIKA PERHITUNGAN & STATUS (Tidak Berubah) ---

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

// --- LOGIKA UTAMA: SMART SORTING & VISUALISASI PANTRY (Perbaikan Logika Empty State) ---

function renderPantry() {
    const sortBy = document.getElementById('sort-by').value;

    if (sortBy === 'exp-asc') {
        pantryItems.sort((a, b) => new Date(a.expDate) - new Date(b.expDate));
    } else if (sortBy === 'name-asc') {
        pantryItems.sort((a, b) => a.name.localeCompare(b.name));
    }

    const listContainer = document.getElementById('item-list');
    listContainer.innerHTML = '';
    
    // FIX: Tampilkan pesan jika stok kosong
    if (pantryItems.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-message">
                <h3>Pantry Digital Anda Kosong 🗑️</h3>
                <p>Ayo input data stok baru Anda di atas untuk mulai membuat resep minimum-waste!</p>
            </div>
        `;
        renderRecipes(); 
        updateImpactMetrics();
        return; // Hentikan fungsi rendering item
    }

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

// --- LOGIKA PENAMBAHAN ITEM (Perbaikan Pengambilan Kategori) ---

document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    // FIX: Mengambil nilai dari ID tunggal 'item-category'
    const category = document.getElementById('item-category').value; 
    const date = document.getElementById('exp-date').value;
    const qty = parseInt(document.getElementById('quantity').value);
    
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

// --- FUNGSI UTAMA: LOGIKA FILTERING RESEP (Perbaikan Logika Empty State) ---

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
        // Jika filter BUKAN 'all', kita filter ketat:
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
                                `<strong class="urgent-bahan">Bahan Mendesak:</strong> ${savedIngredients}` : 
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
        // FIX: Pesan jika tidak ada resep yang cocok
        const filterName = currentFilter === 'all' ? 'Semua Kategori' : `Kategori ${currentFilter}`;
        outputContainer.innerHTML = `
            <div class="empty-message-recipe span-full">
                <h3>Tidak Ada Resep yang Cocok 🍲</h3>
                <p>Untuk menampilkan resep di ${filterName}, pastikan Anda sudah menambahkan stok bahan di Pantry Digital.</p>
            </div>
        `;
    }
}


// --- FUNGSI RENDERING LOKASI & IMPACT (Tidak Berubah) ---

function renderLocations() {
    const outputContainer = document.getElementById('location-output');
    outputContainer.innerHTML = '';

    recommendedLocations.forEach(location => {
        const locationCard = document.createElement('div');
        locationCard.className = 'recipe-card'; 
        
        const isOpen24Hours = location.hours.includes("24 jam");
        const statusText = isOpen24Hours ? 
                            `<span style="color: var(--color-primary); font-weight: bold;">Buka 24 Jam</span>` : 
                            `Jam Buka: ${location.hours}`;

        locationCard.innerHTML = `
            <h3>${location.name} <span style="font-size: 0.8em; color: var(--color-accent);">${location.rating} ★</span></h3>
            <p><small>${location.address}</small></p>
            <p>${statusText}</p>
            <a href="${location.map_url}" target="_blank" class="action-button" style="background-color: #3498db;">Lihat di Maps</a>
        `;
        outputContainer.appendChild(locationCard);
    });
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


function updateImpactMetrics() {
    const totalSavedValue = itemsSaved * (ITEM_PRICE_AVG / 2); 
    
    document.getElementById('total-saved').textContent = `Rp ${totalSavedValue.toLocaleString('id-ID')}`;
    document.getElementById('items-saved').textContent = itemsSaved;
}

function simulateCookingAndImpact() {
    itemsSaved += 2; // Asumsi 2 item diselamatkan per resep
    updateImpactMetrics(); 
}

document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('action-button')) {
        if (e.target.style.backgroundColor !== 'rgb(52, 152, 219)') { 
            simulateCookingAndImpact();
        }
    }
});

// Jalankan render pertama kali saat website dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderPantry();
    renderLocations(); 
});

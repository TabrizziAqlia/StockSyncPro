document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Bagian 1: Navigasi Halaman
    // ----------------------------------------------------
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.content-section');

    // Default: Tampilkan Dashboard saat dimuat
    document.getElementById('recipes').classList.add('hidden');
    document.getElementById('shopping').classList.add('hidden');
    
    // Panggil generator resep agar data siap
    generateRecipes(); 

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);

            // Ganti status aktif di navigasi
            navLinks.forEach(nav => nav.classList.remove('active'));
            e.target.classList.add('active');

            // Tampilkan/Sembunyikan bagian
            sections.forEach(section => {
                section.classList.add('hidden');
                if (section.id === targetId) {
                    section.classList.remove('hidden');
                }
            });
        });
    });

    // ----------------------------------------------------
    // Bagian 2: Simulasi AI Recipe Generator Logic
    // ----------------------------------------------------

    // Item yang hampir kedaluwarsa (Data diambil dari simulasi HTML)
    const expiringItems = [
        { name: 'Susu UHT', days: 3, unit: 'Kotak' },
        { name: 'Telur Ayam', days: 5, unit: 'Butir' },
        { name: 'Daging Giling', days: 6, unit: 'gram' }
    ];

    // Database Resep Sederhana (Simulasi Logic Matching)
    const recipeDB = [
        { 
            title: 'Omelet Daging Cincang', 
            ingredients: ['Telur Ayam', 'Daging Giling', 'Bawang'],
            img: 'https://via.placeholder.com/350x200/FFC107/333?text=Omelet+Daging' // Placeholder image
        },
        { 
            title: 'Susu Hangat Berempah', 
            ingredients: ['Susu UHT', 'Gula', 'Jahe'],
            img: 'https://via.placeholder.com/350x200/007BFF/FFF?text=Susu+Berempah' 
        },
        { 
            title: 'Sup Krim Telur', 
            ingredients: ['Telur Ayam', 'Susu UHT', 'Sayuran'],
            img: 'https://via.placeholder.com/350x200/28A745/FFF?text=Sup+Krim' 
        },
        { 
            title: 'Nasi Goreng Sederhana',
            ingredients: ['Beras', 'Kecap'], // Tidak mengandung item yang expiring, jadi tidak akan ditampilkan
            img: 'https://via.placeholder.com/350x200/555/FFF?text=Nasi+Goreng' 
        }
    ];

    function generateRecipes() {
        const recipeListDiv = document.getElementById('recipe-list');
        recipeListDiv.innerHTML = ''; // Kosongkan daftar resep

        // Logika AI/ML Sederhana: Mencari resep yang menggunakan minimal 1 bahan yang akan kedaluwarsa
        const matchingRecipes = recipeDB.filter(recipe => {
            return recipe.ingredients.some(ing => 
                expiringItems.some(expItem => expItem.name === ing)
            );
        });

        if (matchingRecipes.length === 0) {
            recipeListDiv.innerHTML = '<p>🎉 Stok Anda aman! Tidak ada item yang perlu segera dihabiskan.</p>';
            return;
        }

        matchingRecipes.forEach(recipe => {
            // Tentukan bahan yang sudah tersedia dan harus dihabiskan
            const availableIngredients = recipe.ingredients.filter(ing => 
                expiringItems.some(expItem => expItem.name === ing)
            );

            // Tentukan bahan yang harus dibeli (Simulasi Shopping List Link)
            const missingIngredients = recipe.ingredients.filter(ing => 
                !expiringItems.some(expItem => expItem.name === ing)
            );
            
            // Generate link affiliate untuk bahan yang kurang (Simulasi Monetisasi)
            const affiliateLink = missingIngredients.length > 0 ? 
                `https://partner-e-groceries.com/search?q=${missingIngredients.join('+')}` :
                '#'; // Jika tidak ada bahan yang kurang

            const cardHTML = `
                <div class="recipe-card">
                    <img src="${recipe.img}" alt="${recipe.title}">
                    <div class="recipe-info">
                        <h4>${recipe.title}</h4>
                        <p class="bahan-diperlukan">Memanfaatkan Stok: ${availableIngredients.join(', ')}</p>
                        ${missingIngredients.length > 0 ? `<p class="text-secondary">Bahan Kurang: ${missingIngredients.join(', ')}</p>` : '<p class="text-success">Semua bahan tersedia!</p>'}
                        
                        <a href="${affiliateLink}" target="_blank" class="btn-cook">
                            ${missingIngredients.length > 0 ? 'Beli Bahan Tambahan (Affiliate Link)' : 'Mulai Masak!'}
                        </a>
                    </div>
                </div>
            `;
            recipeListDiv.innerHTML += cardHTML;
        });
    }
});

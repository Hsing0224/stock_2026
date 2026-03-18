document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if stockData exists
    if (typeof stockData === 'undefined') {
        console.error("stockData not loaded. Make sure data.js is generated and linked.");
        document.getElementById('stock-list').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">資料載入失敗，請確認 data.js 是否存在。</td></tr>';
        return;
    }

    const LOCAL_STORAGE_KEY = 'stockTracker_checkedItems';
    
    // Load checked states from localStorage
    let checkedItems = new Set(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'));
    
    const tableBody = document.getElementById('stock-list');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const toast = document.getElementById('toast');
    
    let currentFilter = 'all'; // 'all', 'checked', 'unchecked'
    let searchQuery = '';

    // Main render function
    function renderTable() {
        tableBody.innerHTML = '';
        
        let filteredData = stockData.filter(item => {
            const matchesSearch = item.code.includes(searchQuery) || item.name.includes(searchQuery);
            const isChecked = checkedItems.has(item.id);
            
            if (!matchesSearch) return false;
            
            if (currentFilter === 'checked' && !isChecked) return false;
            if (currentFilter === 'unchecked' && isChecked) return false;
            
            return true;
        });

        filteredData.forEach((item, index) => {
            const isChecked = checkedItems.has(item.id);
            const tr = document.createElement('tr');
            tr.className = isChecked ? 'checked' : '';
            tr.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
            
            tr.innerHTML = `
                <td class="checkbox-container">
                    <input type="checkbox" id="check-${item.id}" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="stock-tag">${item.code}</span>
                        <span class="stock-name">${item.name}</span>
                    </div>
                </td>
                <td>${item.buyDate || '-'}</td>
                <td>${item.s2026 || '-'}</td>
                <td>${item.s2025 || '-'}</td>
            `;

            tableBody.appendChild(tr);
        });

        updateStats();
        attachCheckboxListeners();
    }

    function attachCheckboxListeners() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const tr = e.target.closest('tr');
                
                if (e.target.checked) {
                    checkedItems.add(id);
                    tr.classList.add('checked');
                } else {
                    checkedItems.delete(id);
                    tr.classList.remove('checked');
                }
                
                saveToLocalStorage();
                updateStats();
                showToast();
                
                // If filtering is active, we might need to re-render to remove/add items, 
                // but for better UX, we just let the animation play and keep it there until next filter
            });
        });
    }

    function updateStats() {
        document.getElementById('total-count').innerText = stockData.length;
        document.getElementById('collected-count').innerText = checkedItems.size;
        document.getElementById('remaining-count').innerText = stockData.length - checkedItems.size;
    }

    function saveToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...checkedItems]));
    }

    // Toast notification
    let toastTimeout;
    function showToast() {
        toast.classList.remove('hidden');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }

    // Event Listeners for Filters and Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderTable();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTable();
        });
    });

    // Initial render
    renderTable();
});

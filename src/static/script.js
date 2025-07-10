// Global variables
let currentUser = null;
let currentItems = [];
let currentPage = 0;
let itemsPerPage = 12;
let totalItems = 0;

// DOM elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const authStatus = document.getElementById('authStatus');
const authBtn = document.getElementById('authBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const userInfoCard = document.getElementById('userInfoCard');
const statsGrid = document.getElementById('statsGrid');
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const myItemsBtn = document.getElementById('myItemsBtn');
const sortSelect = document.getElementById('sortSelect');
const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const sectionTitle = document.getElementById('sectionTitle');
const paginationInfo = document.getElementById('paginationInfo');
const pagination = document.getElementById('pagination');

// API base URL
const API_BASE = '/api/ml';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    loginBtn.addEventListener('click', handleLogin);
    authBtn.addEventListener('click', handleAuthButton);
    logoutBtn.addEventListener('click', handleLogout);
    searchBtn.addEventListener('click', handleSearch);
    myItemsBtn.addEventListener('click', loadMyItems);
    modalClose.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeModal();
        }
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = { id: data.user_id };
            showDashboard();
            loadUserInfo();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLogin();
    }
}

// Handle login
async function handleLogin() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/auth`);
        const data = await response.json();
        
        if (data.auth_url) {
            window.location.href = data.auth_url;
        } else {
            throw new Error('URL de autenticação não recebida');
        }
    } catch (error) {
        hideLoading();
        showError('Erro ao iniciar autenticação: ' + error.message);
    }
}

// Handle auth button click
function handleAuthButton() {
    if (currentUser) {
        handleLogout();
    } else {
        handleLogin();
    }
}

// Handle logout
async function handleLogout() {
    showLoading();
    try {
        await fetch(`${API_BASE}/logout`, { method: 'POST' });
        currentUser = null;
        showLogin();
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        hideLoading();
    }
}

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch(`${API_BASE}/user-info`);
        const userData = await response.json();
        
        if (response.ok) {
            updateUserInfo(userData);
        } else {
            throw new Error(userData.error || 'Erro ao carregar informações do usuário');
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        showError('Erro ao carregar informações do usuário: ' + error.message);
    }
}

// Update user info display
function updateUserInfo(userData) {
    document.getElementById('userName').textContent = userData.first_name + ' ' + userData.last_name;
    document.getElementById('userEmail').textContent = userData.email || 'Email não disponível';
    document.getElementById('userId').textContent = `ID: ${userData.id}`;
    
    // Update auth status
    authStatus.querySelector('.status-text').textContent = 'Autenticado';
    authBtn.textContent = 'Sair';
    authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
}

// Load my items
async function loadMyItems() {
    showLoading();
    sectionTitle.textContent = 'Meus Produtos';
    
    try {
        const response = await fetch(`${API_BASE}/my-items?offset=${currentPage * itemsPerPage}&limit=${itemsPerPage}`);
        const data = await response.json();
        
        if (response.ok) {
            currentItems = data.items;
            totalItems = data.total;
            displayItems(data.items);
            updateStats(data.items);
            updatePagination();
            statsGrid.style.display = 'grid';
        } else {
            throw new Error(data.error || 'Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showError('Erro ao carregar produtos: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Handle search
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        loadMyItems();
        return;
    }
    
    showLoading();
    sectionTitle.textContent = `Resultados para: "${query}"`;
    
    try {
        const params = new URLSearchParams({
            q: query,
            sort: sortSelect.value,
            offset: currentPage * itemsPerPage,
            limit: itemsPerPage
        });
        
        const response = await fetch(`${API_BASE}/search?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            currentItems = data.results;
            totalItems = data.paging.total;
            displaySearchResults(data.results);
            updatePagination();
            statsGrid.style.display = 'none';
        } else {
            throw new Error(data.error || 'Erro na busca');
        }
    } catch (error) {
        console.error('Error searching:', error);
        showError('Erro na busca: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Display items
function displayItems(items) {
    productsGrid.innerHTML = '';
    
    if (items.length === 0) {
        productsGrid.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Nenhum produto encontrado</h3>
                <p style="color: #666;">Você ainda não possui produtos cadastrados.</p>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const productCard = createProductCard(item);
        productsGrid.appendChild(productCard);
    });
}

// Display search results
function displaySearchResults(items) {
    productsGrid.innerHTML = '';
    
    if (items.length === 0) {
        productsGrid.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Nenhum resultado encontrado</h3>
                <p style="color: #666;">Tente usar termos diferentes para sua busca.</p>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const productCard = createSearchProductCard(item);
        productsGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(item) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetails(item.id);
    
    const statusClass = getStatusClass(item.status);
    const price = formatPrice(item.price, item.currency_id);
    
    card.innerHTML = `
        <div class="product-image">
            ${item.thumbnail ? 
                `<img src="${item.thumbnail}" alt="${item.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <i class="fas fa-image" style="display: none;"></i>` :
                `<i class="fas fa-image"></i>`
            }
        </div>
        <h3 class="product-title">${item.title}</h3>
        <div class="product-price">${price}</div>
        <div class="product-details">
            <span>Disponível: ${item.available_quantity}</span>
            <span>Vendidos: ${item.sold_quantity}</span>
        </div>
        <div class="product-details" style="margin-top: 10px;">
            <span class="product-status ${statusClass}">${getStatusText(item.status)}</span>
            <span style="font-size: 0.8rem; color: #999;">${formatDate(item.date_created)}</span>
        </div>
    `;
    
    return card;
}

// Create search product card
function createSearchProductCard(item) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetails(item.id);
    
    const price = formatPrice(item.price, item.currency_id);
    
    card.innerHTML = `
        <div class="product-image">
            ${item.thumbnail ? 
                `<img src="${item.thumbnail}" alt="${item.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <i class="fas fa-image" style="display: none;"></i>` :
                `<i class="fas fa-image"></i>`
            }
        </div>
        <h3 class="product-title">${item.title}</h3>
        <div class="product-price">${price}</div>
        <div class="product-details">
            <span>Disponível: ${item.available_quantity || 0}</span>
            <span>Vendidos: ${item.sold_quantity || 0}</span>
        </div>
        <div class="product-details" style="margin-top: 10px;">
            <span class="product-status status-active">${item.condition}</span>
            <span style="font-size: 0.8rem; color: #999;">
                <i class="fas fa-external-link-alt"></i> Ver no ML
            </span>
        </div>
    `;
    
    return card;
}

// Show product details
async function showProductDetails(itemId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/item/${itemId}`);
        const item = await response.json();
        
        if (response.ok) {
            displayProductModal(item);
        } else {
            throw new Error(item.error || 'Erro ao carregar detalhes do produto');
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Erro ao carregar detalhes: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Display product modal
function displayProductModal(item) {
    const price = formatPrice(item.price, item.currency_id);
    const statusClass = getStatusClass(item.status);
    
    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px;">
            <div>
                <div class="product-image" style="height: 300px; margin-bottom: 20px;">
                    ${item.pictures && item.pictures.length > 0 ? 
                        `<img src="${item.pictures[0].url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                ${item.pictures && item.pictures.length > 1 ? `
                    <div style="display: flex; gap: 10px; overflow-x: auto;">
                        ${item.pictures.slice(1, 5).map(pic => `
                            <img src="${pic.url}" alt="${item.title}" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer;"
                                 onclick="document.querySelector('.product-image img').src = '${pic.url}'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div>
                <h2 style="margin-bottom: 15px; color: #333;">${item.title}</h2>
                <div style="font-size: 1.5rem; font-weight: 700; color: #667eea; margin-bottom: 20px;">${price}</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <strong>Disponível:</strong><br>
                        <span style="font-size: 1.2rem; color: #28a745;">${item.available_quantity}</span>
                    </div>
                    <div>
                        <strong>Vendidos:</strong><br>
                        <span style="font-size: 1.2rem; color: #667eea;">${item.sold_quantity}</span>
                    </div>
                    <div>
                        <strong>Condição:</strong><br>
                        <span>${item.condition === 'new' ? 'Novo' : 'Usado'}</span>
                    </div>
                    <div>
                        <strong>Status:</strong><br>
                        <span class="product-status ${statusClass}">${getStatusText(item.status)}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>ID do Produto:</strong> ${item.id}<br>
                    <strong>Categoria:</strong> ${item.category_id}<br>
                    <strong>Tipo de Listagem:</strong> ${item.listing_type_id}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>Criado em:</strong> ${formatDate(item.date_created)}<br>
                    <strong>Última atualização:</strong> ${formatDate(item.last_updated)}
                </div>
                
                ${item.permalink ? `
                    <a href="${item.permalink}" target="_blank" class="btn btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-external-link-alt"></i>
                        Ver no Mercado Livre
                    </a>
                ` : ''}
            </div>
        </div>
        
        ${item.description && item.description.plain_text ? `
            <div style="border-top: 2px solid #f0f0f0; padding-top: 20px;">
                <h3 style="margin-bottom: 15px;">Descrição</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.6;">
                    ${item.description.plain_text.replace(/\n/g, '<br>')}
                </div>
            </div>
        ` : ''}
        
        ${item.attributes && item.attributes.length > 0 ? `
            <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 20px;">
                <h3 style="margin-bottom: 15px;">Atributos</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    ${item.attributes.map(attr => `
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
                            <strong>${attr.name}:</strong><br>
                            <span>${attr.value_name || attr.value_struct?.number || attr.values?.[0]?.name || 'N/A'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    productModal.style.display = 'flex';
}

// Close modal
function closeModal() {
    productModal.style.display = 'none';
}

// Update stats
function updateStats(items) {
    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const totalSold = items.reduce((sum, item) => sum + (item.sold_quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.available_quantity), 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('activeItems').textContent = activeItems;
    document.getElementById('soldItems').textContent = totalSold;
    document.getElementById('totalValue').textContent = formatPrice(totalValue, 'BRL');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage * itemsPerPage) + 1;
    const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);
    
    paginationInfo.textContent = `${startItem}-${endItem} de ${totalItems} produtos`;
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i + 1;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

// Change page
function changePage(page) {
    currentPage = page;
    
    if (searchInput.value.trim()) {
        handleSearch();
    } else {
        loadMyItems();
    }
}

// Utility functions
function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    authStatus.querySelector('.status-text').textContent = 'Não autenticado';
    authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Fazer Login';
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
}

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showError(message) {
    alert('Erro: ' + message);
}

function formatPrice(price, currency) {
    if (!price) return 'R$ 0,00';
    
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency === 'BRL' ? 'BRL' : 'BRL'
    });
    
    return formatter.format(price);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'paused': return 'status-paused';
        case 'closed': return 'status-closed';
        default: return 'status-paused';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'active': return 'Ativo';
        case 'paused': return 'Pausado';
        case 'closed': return 'Finalizado';
        default: return status;
    }
}


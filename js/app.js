import { fetchProducts } from './api.js';
import { loadCartFromStorage } from './storage.js';
import { CartManager } from './cart.js';
import './components/product-list.js';
import './components/shopping-cart.js';

class App {
  constructor() {
    this.catalog = [];
    this.filteredCatalog = [];
    this.cartManager = new CartManager();

    this.initDOM();
    this.initEvents();
    this.init();
  }

  initDOM() {
    this.productListEl = document.querySelector('product-list');
    this.shoppingCartEl = document.querySelector('shopping-cart');
    this.cartBadgeEl = document.getElementById('cart-badge');
    this.statusContainerEl = document.getElementById('status-container');

    this.searchInput = document.getElementById('search-input');
    this.categorySelect = document.getElementById('category-select');
    this.onlyAvailableCheck = document.getElementById('only-available-check');
    this.sortSelect = document.getElementById('sort-select');
    this.clearFiltersBtn = document.getElementById('clear-filters-btn');
  }

  initEvents() {
    // Filtros de búsqueda
    this.searchInput.addEventListener('input', () => this.applyFilters());
    this.categorySelect.addEventListener('change', () => this.applyFilters());
    this.onlyAvailableCheck.addEventListener('change', () => this.applyFilters());
    this.sortSelect.addEventListener('change', () => this.applyFilters());
    this.clearFiltersBtn.addEventListener('click', () => this.resetFilters());

    // Eventos personalizados desde Web Components
    document.addEventListener('add-to-cart', (e) => {
      const { productId } = e.detail;
      const result = this.cartManager.addItem(productId);
      if (!result.success) {
        alert(result.message);
      }
      this.updateUI();
    });

    document.addEventListener('update-cart-item', (e) => {
      const { productId, newQuantity } = e.detail;
      const result = this.cartManager.updateQuantity(productId, newQuantity);
      if (result && !result.success) {
        alert(result.message);
      }
      this.updateUI();
    });

    document.addEventListener('clear-cart-requested', () => {
      this.cartManager.clearCart();
      this.updateUI();
    });

    document.addEventListener('confirm-order-requested', () => {
      this.handleConfirmOrder();
    });
  }

  async init() {
    this.showStatus('Cargando catálogo de productos...', 'info');
    try {
      this.catalog = await fetchProducts();
      this.cartManager.setCatalog(this.catalog);

      // Cargar carrito previo validando contra el catálogo actual
      const savedItems = loadCartFromStorage(this.catalog);
      this.cartManager.setItems(savedItems);

      this.populateCategorySelect();
      this.applyFilters();
      this.hideStatus();
    } catch (error) {
      this.showStatus(
        'Error al cargar los productos. Por favor verifique la disponibilidad del archivo JSON.',
        'error'
      );
    }
  }

  showStatus(message, type = 'info') {
    this.statusContainerEl.innerHTML = `
      <div class="alert-message alert-${type}">
        ${message}
      </div>
    `;
  }

  hideStatus() {
    this.statusContainerEl.innerHTML = '';
  }

  populateCategorySelect() {
    const categories = [...new Set(this.catalog.map((p) => p.category))];
    this.categorySelect.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      this.categorySelect.appendChild(opt);
    });
  }

  applyFilters() {
    const searchTerm = this.searchInput.value.trim().toLowerCase();
    const selectedCategory = this.categorySelect.value;
    const onlyAvailable = this.onlyAvailableCheck.checked;
    const sortOrder = this.sortSelect.value;

    let result = this.catalog.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      const matchesAvailability = !onlyAvailable || (product.active && product.stock > 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    this.filteredCatalog = result;
    this.productListEl.setProducts(this.filteredCatalog);
  }

  resetFilters() {
    this.searchInput.value = '';
    this.categorySelect.value = '';
    this.onlyAvailableCheck.checked = false;
    this.sortSelect.value = '';
    this.applyFilters();
  }

  updateUI() {
    this.cartBadgeEl.textContent = `${this.cartManager.getTotalUnits()} unidades`;
    this.shoppingCartEl.setCartManager(this.cartManager);
  }

  handleConfirmOrder() {
    if (this.cartManager.items.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    // Re-validación previa a confirmar el pedido
    for (const item of this.cartManager.items) {
      const prod = this.catalog.find((p) => p.id === item.id);
      if (!prod || !prod.active || item.quantity > prod.stock) {
        alert(
          `Atención: El producto "${item.name}" ya no cuenta con el stock solicitado. Por favor revise el carrito.`
        );
        return;
      }
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const totalFormatted = this.cartManager.formatCOP(this.cartManager.getTotal());

    alert(
      `¡Pedido confirmado con éxito!\n\nNúmero de Pedido: ${orderId}\nTotal a pagar: ${totalFormatted}\n\nGracias por su compra en TecnoStock.`
    );

    this.cartManager.clearCart();
    this.updateUI();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
import { fetchProducts } from "./api.js";
import { loadCartFromStorage } from "./storage.js";
import { CartManager } from "./cart.js";
import './components/product-list.js';
import './components/shopping-cart.js';

class App {
    constructor(){
        this.catalog = [];
        this.filteredCatalog = [];
        this.cartManager = new CartManager();

        this.initDOM();
        this.initEvents();
        this.init();
    }

    initDOM(){
        this.productListEl = document.querySelector('product-list');
        this.shoppingCartEl = document.querySelector('shopping-cart');
        this.cartManager = document.getElementById('cart-badge');
        this.statusContainerEl = document.getElementById('status-container');

        this.searchInput = document.getElementById('search-input');
        this.categorySelect = document.getElementById('category-select');
        this.onlyAvailableCheck = document.getElementById('only-available-check');
        this.sortSelect = document.getElementById('sort-select');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');
    }

    initEvents(){
        //filtros busqueda
        this.searchInput.addEventListener('input', () => this.applyFilters());
        this.categorySelect.addEventListener('change', () => this.applyFilters());
        this.onlyAvailableCheck.addEventListener('change', () => this.applyFilters());
        this.sortSelect.addEventListener('change', () => this.applyFilters());
        this.clearFiltersBtn.addEventListener('click', () => this.resetFilters());

        document.addEventListener('add-to-cart', (e) => {
            const { productId } = e.detail;
            const result = this.cartManager.updateQuantity(productId, newQuantity);
            if (result && !result.success) {
                alert(result.message);
            }
            this.updateUI();
        });
    }
}
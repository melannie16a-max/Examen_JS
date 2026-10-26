import { saveCartToStorage } from './storage.js';

export class CartManager {
  constructor(catalog = []) {
    this.catalog = catalog;
    this.items = [];
  }

  setCatalog(catalog) {
    this.catalog = catalog;
  }

  setItems(items) {
    this.items = items;
    saveCartToStorage(this.items);
  }

  addItem(productId) {
    const product = this.catalog.find((p) => p.id === productId);
    if (!product || !product.active || product.stock <= 0) {
      return { success: false, message: 'Producto no disponible o sin stock' };
    }

    const existingItem = this.items.find((item) => item.id === productId);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > product.stock) {
      return { success: false, message: 'La cantidad supera el inventario disponible' };
    }

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    saveCartToStorage(this.items);
    return { success: true };
  }

  updateQuantity(productId, newQty) {
    const product = this.catalog.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }

    if (newQty > product.stock) {
      return { success: false, message: 'La cantidad supera el inventario disponible' };
    }

    const item = this.items.find((i) => i.id === productId);
    if (item) {
      item.quantity = newQty;
      saveCartToStorage(this.items);
    }
    return { success: true };
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    saveCartToStorage(this.items);
  }

  clearCart() {
    this.items = [];
    saveCartToStorage(this.items);
  }

  getTotalUnits() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getDiscount() {
    const subtotal = this.getSubtotal();
    return subtotal >= 300000 ? subtotal * 0.1 : 0;
  }

  getTotal() {
    return this.getSubtotal() - this.getDiscount();
  }

  formatCOP(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}thi
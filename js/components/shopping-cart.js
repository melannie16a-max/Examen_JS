export class ShoppingCart extends HTMLElement {
  constructor() {
    super();
    this.cartManager = null;
  }

  setCartManager(manager) {
    this.cartManager = manager;
    this.render();
  }

  render() {
    if (!this.cartManager) return;

    const items = this.cartManager.items;
    this.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'cart-container';

    const title = document.createElement('h2');
    title.textContent = 'Carrito de Compras';
    title.style.marginBottom = '1rem';
    container.appendChild(title);

    if (items.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'El carrito está vacío.';
      emptyMsg.style.color = 'var(--secondary-color)';
      container.appendChild(emptyMsg);
      this.appendChild(container);
      return;
    }

    const list = document.createElement('div');
    items.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      const itemSubtotal = this.cartManager.formatCOP(item.price * item.quantity);

      itemEl.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div>${this.cartManager.formatCOP(item.price)} x ${item.quantity} = ${itemSubtotal}</div>
        </div>
        <div class="cart-item-controls">
          <button class="btn-decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="btn-increase" data-id="${item.id}">+</button>
          <button class="btn-remove" data-id="${item.id}" style="color: red;">&times;</button>
        </div>
      `;
      list.appendChild(itemEl);
    });
    container.appendChild(list);

    // Resumen de la orden
    const subtotal = this.cartManager.getSubtotal();
    const discount = this.cartManager.getDiscount();
    const total = this.cartManager.getTotal();

    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.innerHTML = `
      <div class="summary-line">
        <span>Subtotal:</span>
        <span>${this.cartManager.formatCOP(subtotal)}</span>
      </div>
      ${
        discount > 0
          ? `<div class="summary-line discount-text">
              <span>Descuento (10%):</span>
              <span>-${this.cartManager.formatCOP(discount)}</span>
            </div>`
          : ''
      }
      <div class="summary-line total">
        <span>Total:</span>
        <span>${this.cartManager.formatCOP(total)}</span>
      </div>
      <button class="btn-danger btn-clear" style="margin-top: 1rem; width: 100%;">Vaciar Carrito</button>
      <button class="btn-success btn-checkout">Confirmar Pedido</button>
    `;
    container.appendChild(summary);

    this.appendChild(container);

    this.attachEvents();
  }

  attachEvents() {
    this.querySelectorAll('.btn-increase').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const item = this.cartManager.items.find((i) => i.id === id);
        this.emitCartUpdate(id, item.quantity + 1);
      });
    });

    this.querySelectorAll('.btn-decrease').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const item = this.cartManager.items.find((i) => i.id === id);
        this.emitCartUpdate(id, item.quantity - 1);
      });
    });

    this.querySelectorAll('.btn-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.emitCartUpdate(id, 0);
      });
    });

    const clearBtn = this.querySelector('.btn-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('clear-cart-requested', {
            bubbles: true,
            composed: true,
          })
        );
      });
    }

    const checkoutBtn = this.querySelector('.btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('confirm-order-requested', {
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }

  emitCartUpdate(productId, newQuantity) {
    this.dispatchEvent(
      new CustomEvent('update-cart-item', {
        detail: { productId, newQuantity },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('shopping-cart', ShoppingCart);
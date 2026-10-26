export class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.product = null;
  }

  setProduct(product) {
    this.product = product;
    this.render();
  }

  render() {
    if (!this.product) return;

    const isAvailable = this.product.active && this.product.stock > 0;
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(this.product.price);

    this.innerHTML = `
      <div class="product-card">
        <div>
          <h3>${this.product.name}</h3>
          <p style="font-size: 0.85rem; color: #6c757d;">${this.product.category}</p>
          <p style="margin: 0.5rem 0;">${this.product.description}</p>
          <div class="price">${formattedPrice}</div>
          <div class="stock">${
            isAvailable ? `Disponible: ${this.product.stock} un.` : 'Agotado / Inactivo'
          }</div>
        </div>
        <button class="btn-primary" ${!isAvailable ? 'disabled' : ''}>
          ${isAvailable ? 'Agregar al carrito' : 'No disponible'}
        </button>
      </div>
    `;

    const button = this.querySelector('button');
    if (button && isAvailable) {
      button.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('add-to-cart', {
            detail: { productId: this.product.id },
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }
}

customElements.define('product-card', ProductCard);
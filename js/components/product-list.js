import './product-card.js';

export class ProductList extends HTMLElement {
  constructor() {
    super();
    this.products = [];
  }

  setProducts(products) {
    this.products = products;
    this.render();
  }

  render() {
    this.innerHTML = '';

    if (this.products.length === 0) {
      this.innerHTML = `
        <div class="alert-message alert-info">
          No se encontraron productos que coincidan con los filtros aplicados.
        </div>
      `;
      return;
    }

    const container = document.createElement('div');
    container.className = 'products-grid';

    this.products.forEach((product) => {
      const card = document.createElement('product-card');
      card.setProduct(product);
      container.appendChild(card);
    });

    this.appendChild(container);
  }
}

customElements.define('product-list', ProductList);
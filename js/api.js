export async function fetchProducts() {
    try {
        const response = await fetch('./data/products.json');

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Formato de datos invalido');
        }

        const validProducts = data.filter(
            (p) =>
                p &&
                typeof p.id === 'number' &&
                typeof p.name === 'string' &&
                typeof p.price === 'number' &&
                p.price >= 0 &&
                typeof p.stock === 'number' &&
                p.stock >= 0 &&
                typeof p.active === 'boolean'
        );

        return validProducts;
    } catch (error) {
        console.error('Error al cargar catalogo:', error);
        throw error;
    }
}
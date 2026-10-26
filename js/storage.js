const CART_KEY = 'tecnostock_cart';

export function saveCartToStorage(cart) {
    try{
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    catch (error) {
        console.error('Error al guardar en localStorage:', error)
    }
}

export function loadCartFromStorage(catalog){
    try{
        const data = localStorage.getItem(CART_KEY);
        if (!data) return [];

        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter ((item) => {
            const originalProduct = catalog.find((p) => p.id === item.id);
            if (!originalProduct || !originalProduct.active || originalProduct.stock <= 0) {
                return false;
            }

            if (item.quantity > originalProduct.stock) {
                item.quantity = originalProduct.stock;
            }

            return item.quantity > 0;
        });

    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        return [];
    }
}
const allProducts = JSON.parse(await (await fetch('/assets/data/products.json')).text());

export function getProductByID(productID) {
    return allProducts.find(product => product.id == productID) || {}
}

export function getProductsByCategory(category , products = allProducts) {
    if (!category) return products;
    if (typeof category == 'string') return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
    if (Array.isArray(category)) {
        const lowerCategories = category.map(cat => cat.toLowerCase());
        return products.filter(product => lowerCategories.includes(product.category.toLowerCase()));
    }
}

export function getAllProducts() {
    return allProducts;
}

export function searchProducts(keyword = '' , products = allProducts) {
    const lowerKeyword = keyword.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowerKeyword) || 
        product.category.toLowerCase().includes(lowerKeyword)
    );
}

export function getProductsByPriceRange(minPrice=0, maxPrice=Infinity , products = allProducts) {
    return products.filter(product => {
        const price = parseFloat(product.price.replace(/[^0-9.-]+/g,""));
        return price >= minPrice && price <= maxPrice;
    });
}

export function getFeaturedProducts() {
    return (allProducts.filter(product => product.featured));
}

export function getPrice(price) {
    return parseFloat((price.toString()).replace(/[^0-9.-]+/g,""));
}
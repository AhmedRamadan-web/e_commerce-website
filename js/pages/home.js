import { getFeaturedProducts } from "/js/utils/product.js";
import { loader } from "/js/utils/loader.js";
import { createProductCard } from "/js/utils/productcard.js";


await loader("nav");
await loader("footer");

const productsContainer = document.querySelector(".featured-content");
const featuredProducts = getFeaturedProducts();
featuredProducts.forEach(product => {
    const productCard = createProductCard(product.id);
    productsContainer.appendChild(productCard);
});
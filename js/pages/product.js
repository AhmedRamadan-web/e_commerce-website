import { loader } from "/js/utils/loader.js";
import { getProductByID, getProductsByCategory } from "/js/utils/product.js";
import { addToCart } from "/js/utils/cart.js";
import { createProductCard } from "/js/utils/productcard.js";
await loader("nav");
await loader("footer");

async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productID = Number(params.get("id"));
  const product = getProductByID(productID);

  if (!product || !product.id) {
    console.error("Product not found");
    return;
  }

  displayProductDetails(product);

  const addToCartBtn = document.querySelector(".btn-add-cart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const selectedColorDiv = document.querySelector(
        ".product-colors .color.selected",
      );
      const selectedVariation = selectedColorDiv
        ? selectedColorDiv.dataset.index
        : undefined;

      addToCart(
        product.id,
        document.querySelector(".add-to-cart input").value,
        selectedVariation,
      );
      alert(`${product.name} added to cart`);
    });
  }
  document.querySelector(".product-description").innerText =
    product.description;
  document.querySelectorAll(".category-link").forEach((link) => {
    link.href = `/pages/shop.html?category=${product.category}`;
    link.innerText = product.category;
  });
  document.querySelector("span.current").innerText = product.name;
  setupRelatedProductsListeners(product.category);
}

function displayProductDetails(product) {
  document.querySelector(".product-title").textContent = product.name;
  document.querySelector(".product-price").innerHTML =
    `$${product.price} <span class="shipping-note">+ Free Shipping</span>`;
  document.querySelector(".mainImge img").src = product.images?.[0] || "";

  const thumbnailsContainer = document.querySelector(
    ".product-image-thumbnails",
  );
  thumbnailsContainer.innerHTML = "";
  product.images?.forEach((imgSrc, index) => {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.addEventListener("mouseover", () => {
      document.querySelector(".mainImge img").src = imgSrc;
    });
    // img.addEventListener("mouseout", () => {
    //   document.querySelector(".mainImge img").src = product.images?.[0] || "";
    // });
    thumbnailsContainer.appendChild(img);
  });

  const colorsContainer = document.querySelector(".product-colors");
  colorsContainer.innerHTML = "";
  product.variations?.forEach((variation, index) => {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");
    colorDiv.style.backgroundColor = variation.color;
    colorDiv.dataset.index = index; // نخزن الـ index لسهولة الوصول

    colorDiv.addEventListener("click", () => {
      document
        .querySelectorAll(".color")
        .forEach((c) => c.classList.remove("ring-2", "ring-brand", "ring-offset-2"));
      colorDiv.classList.add("ring-2", "ring-brand", "ring-offset-2");
      document.querySelector(".mainImge img").src = variation.image;
      document.querySelector(".product-price").textContent =
        `$${variation.price}`;
    });
    colorsContainer.appendChild(colorDiv);
  });
  const mainImageContainer = document.querySelector(".mainImge");
  const mainImage = mainImageContainer.querySelector("img");

  mainImageContainer.addEventListener("mousemove", (e) => {
    const rect = mainImageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const originX = (x / rect.width) * 100;
    const originY = (y / rect.height) * 100;

    mainImage.style.transformOrigin = `${originX}% ${originY}%`;
    mainImage.style.transform = "scale(2)";
  });

  mainImageContainer.addEventListener("mouseleave", () => {
    mainImage.style.transform = "scale(1)";
    mainImage.style.transformOrigin = "center center";
  });
}

function setupRelatedProductsListeners(category) {
  const relatedProductsContainer = document.querySelector(".products-list");
  const relatedProducts = getProductsByCategory(category).slice(0, 4);
  relatedProducts.forEach((product) => {
    const productCard = createProductCard(product.id);
    relatedProductsContainer.appendChild(productCard);
  });
}

initProductPage();

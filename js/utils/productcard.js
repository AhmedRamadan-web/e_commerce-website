import { getPrice } from "/js/utils/product.js";

const productCardTemplate = await (
  await fetch("/assets/elements/productcard.html")
).text();
import { addToCart } from "/js/utils/cart.js";
import { getProductByID } from "/js/utils/product.js";
export function createProductCard(productID) {
  let variationIndex;
  const product = getProductByID(productID);
  const template = document.createElement("template");
  template.innerHTML = productCardTemplate.trim();
  const card = template.content.firstChild.cloneNode(true);

  const img = card.querySelector("img");
  img.src = product.images[0];
  img.alt = product.name;
  img.addEventListener("click", () => {
    window.location.href = `/pages/product.html?id=${product.id}`;
  });
  const addToCartBtn = card.querySelector(".icon-btn");
  addToCartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addToCart(product.id, 1,variationIndex);
    document.getElementById("cart-sidebar").classList.remove('hide');
  });
  const title = card.querySelector(".product-title");
  title.textContent = product.name;
  title.addEventListener("click", () => {
    window.location.href = `/pages/product.html?id=${product.id}`;
  });
  const category = card.querySelector(".category");
  category.textContent = product.category;

  const original_price = card.querySelector(".original-price");
  original_price.textContent = Math.floor(getPrice(product.price) *1.25).toFixed(2) + " $";
  const current_price = card.querySelector(".current-price");
  current_price.textContent = getPrice(product.price).toFixed(2) + " $";
  if (product.type === "variable") {
    const colorsContainer = card.querySelector(".colors");
    product.variations.forEach((variation, index) => {
      const colorDiv = document.createElement("span");
      colorDiv.classList.add("color-dot");
      colorDiv.style.backgroundColor = variation.color;
      colorDiv.addEventListener("click", () => {
        variationIndex = index;
        img.src = variation.image;
      });
      colorsContainer.appendChild(colorDiv);
    });
  }
  card.href = `/pages/product.html?id=${product.id}`;

  if (product.rating) {
    const ratingContainer = card.querySelector(".rating");
    const ratingValue = Math.round(product.rating <= 5 ? product.rating : 5);
    for (let i = 0; i < ratingValue; i++) {
      const starIcon = ratingContainer.children[i];
      starIcon.classList.remove("fa-regular");
      starIcon.classList.add("fa-solid");
    }
  }

  return card;
}

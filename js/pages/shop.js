import { loader } from "/js/utils/loader.js";
import {
  getAllProducts,
  getProductsByPriceRange,
  getPrice,
  getFeaturedProducts,
} from "/js/utils/product.js";
import { createProductCard } from "/js/utils/productcard.js";

await loader("nav");
await loader("footer");

const rangeInput = document.querySelectorAll(".range-slider input"),
  priceInput = document.querySelectorAll(".price-input input"),
  progress = document.querySelector(".range-slider .progress"),
  productsContainer = document.querySelector(".products-items"),
  shownItemSelect = document.getElementById("shown-item"),
  sortItemSelect = document.getElementById("sort-item"),
  searchInput = document.querySelector(".search-box input"),
  searchBtn = document.querySelector(".search-box button");

let priceGap = 50;
let allProducts = getAllProducts();
let currentLimit = 12; // Default from HTML
let currentSort = "featured";
let currentCategory =
  new URLSearchParams(window.location.search).get("category") || null;
let onlyBestSellers = false;
let searchQuery = "";
let currentPage = 1;

function renderProducts(products) {
  productsContainer.innerHTML = "";
  if (products.length === 0) {
    productsContainer.innerHTML =
      "<p class='no-results'>No products found matching your search.</p>";
    return;
  }
  products.forEach((product) => {
    const card = createProductCard(product.id);
    productsContainer.appendChild(card);
  });
}

function renderPagination(totalItems, limit) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  if (limit === "all" || totalItems <= limit) {
    paginationContainer.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(totalItems / limit);
  let paginationHTML = "";

  // Previous Button
  paginationHTML += `
    <button class="pagination-btn prev-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }

  // Next Button
  paginationHTML += `
    <button class="pagination-btn next-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  paginationContainer.innerHTML = paginationHTML;

  // Add event listeners to page buttons
  paginationContainer.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      updateView();
    });
  });
}

function updateView() {
  let minVal = parseInt(rangeInput[0].value);
  let maxVal = parseInt(rangeInput[1].value);

  let filteredProducts = getProductsByPriceRange(minVal, maxVal, allProducts);

  if (currentCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === currentCategory.toLowerCase(),
    );
  }

  if (onlyBestSellers) {
    filteredProducts = filteredProducts.filter((p) => p.featured);
  }

  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );
  }

  if (currentSort === "price-low-to-high") {
    filteredProducts.sort((a, b) => getPrice(a.price) - getPrice(b.price));
  } else if (currentSort === "price-high to low") {
    filteredProducts.sort((a, b) => getPrice(b.price) - getPrice(a.price));
  } else if (currentSort === "newest") {
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  const totalFilteredCount = filteredProducts.length;

  if (currentLimit !== "all") {
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = startIndex + parseInt(currentLimit);
    filteredProducts = filteredProducts.slice(startIndex, endIndex);
  }

  renderProducts(filteredProducts);
  renderPagination(totalFilteredCount, currentLimit);
}

updateView();

// Search logic
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    updateView();
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    updateView();
  });
}

// Category Filtering logic
const categoryLinks = document.querySelectorAll(".ul-category-box a");
categoryLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const categoryText = link.querySelector(".title").textContent.trim();

    // Toggle logic: if clicking the same category, clear filter
    if (currentCategory?.toLowerCase() === categoryText.toLowerCase()) {
      currentCategory = null;
      categoryLinks.forEach((l) =>
        l.parentElement.classList.remove("border-brand", "text-brand", "font-bold")
      );
    } else {
      currentCategory = categoryText;
      categoryLinks.forEach((l) =>
        l.parentElement.classList.remove("border-brand", "text-brand", "font-bold"),
      );
      link.parentElement.classList.add("border-brand", "text-brand", "font-bold");
    }
    updateView();
  });
});

// Best Sellers Title Click Filter
const bestSellersTitle = document.querySelector(".our-best-sellers-title");
if (bestSellersTitle) {
  bestSellersTitle.style.cursor = "pointer";
  bestSellersTitle.addEventListener("click", () => {
    onlyBestSellers = !onlyBestSellers;
    bestSellersTitle.classList.toggle("text-brand", onlyBestSellers);
    bestSellersTitle.classList.toggle("underline", onlyBestSellers);
    updateView();
  });
}

// Update Category Counts in Sidebar
function updateCategoryCounts() {
  const counts = {
    Accessories: 0,
    Men: 0,
    Women: 0,
  };

  allProducts.forEach((p) => {
    if (counts[p.category] !== undefined) {
      counts[p.category]++;
    }
  });

  const categoryItems = document.querySelectorAll(".ul-category-box li");
  categoryItems.forEach((li) => {
    const title = li.querySelector(".title").textContent.trim();
    const countSpan = li.querySelector(".count");
    if (counts[title] !== undefined) {
      countSpan.textContent = `(${counts[title]})`;
    }
  });
}

updateCategoryCounts();

shownItemSelect.addEventListener("change", (e) => {
  currentLimit =
    e.target.value === "all" ? "all" : parseInt(e.target.value.match(/\d+/)[0]); // Extract number from "12 item"
  currentPage = 1;
  updateView();
});

sortItemSelect.addEventListener("change", (e) => {
  currentSort = e.target.value;
  currentPage = 1;
  updateView();
});

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minVal = parseInt(rangeInput[0].value),
      maxVal = parseInt(rangeInput[1].value);

    if (maxVal - minVal < priceGap) {
      if (e.target.className === "range-min") {
        rangeInput[0].value = maxVal - priceGap;
      } else {
        rangeInput[1].value = minVal + priceGap;
      }
    } else {
      priceInput[0].value = minVal;
      priceInput[1].value = maxVal;
      progress.style.left = (minVal / rangeInput[0].max) * 100 + "%";
      progress.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";

      currentPage = 1;
      updateView();
    }
  });
});

const sidebar = document.querySelector(".side-bar");
const openBtn = document.querySelector(".filter-open-btn");
const closeBtn = document.querySelector(".hide-button");
const filterBtn = document.getElementById("filter-btn");

filterBtn.addEventListener("click", function () {
  sidebar.classList.remove("-translate-x-full");
  sidebar.classList.add("translate-x-0");
});

// close sidebar
closeBtn.addEventListener("click", function () {
  sidebar.classList.remove("translate-x-0");
  sidebar.classList.add("-translate-x-full");
});

// Best Sellers Sidebar Rendering
function renderBestSellers() {
  const bestSellersContainer = document.querySelector(".our-best-sellers-list");
  if (!bestSellersContainer) return;

  const featured = getFeaturedProducts().slice(0, 5); // Show top 5
  bestSellersContainer.innerHTML = "";

  featured.forEach((product) => {
    const li = document.createElement("li");
    li.className = "best-seller-item";

    // Calculate rating stars
    let ratingStars = "";
    const rating = Math.round(product.rating || 5);
    for (let i = 1; i <= 5; i++) {
      ratingStars += `<i class="fa-${i <= rating ? "solid" : "regular"} fa-star star"></i>`;
    }

    li.innerHTML = `
      <a href="/pages/product.html?id=${product.id}" class="product-img">
          <img width="64" height="64" src="${product.images[0]}" alt="${product.name}" />
      </a>

      <div class="best-seller-info">
          <a href="/pages/product.html?id=${product.id}">
              <h3 class="product-name">${product.name}</h3>
          </a>

          <div class="rating">
              ${ratingStars}
          </div>

          <div class="price">
              <span class="current-price">${product.price}</span>
          </div>
      </div>
    `;
    bestSellersContainer.appendChild(li);
  });
}

renderBestSellers();

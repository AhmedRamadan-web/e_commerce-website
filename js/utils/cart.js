import { getPrice } from "/js/utils/product.js";
import { getProductByID } from "/js/utils/product.js";
import { updateCheckOutTotal } from "/js/pages/checkout.js";
export function getUserCart() {
  let id = localStorage.getItem("userId") || "guest";
  if (id == "guest")
    return JSON.parse(
      sessionStorage.getItem("cart") || '{"userId":"guest","items":[]}',
    );
  let carts = JSON.parse(localStorage.getItem("carts") || "[]");
  let cart = carts.find((cart) => cart?.userId == id);
  return cart || { userId: id, items: [] };
}

export function addToCart(productId, quantity = 1, variation = undefined) {
  if (!productId) return;
  let cart = getUserCart();
  let addedItem = false;
  quantity = Number(quantity) || 1;
  cart.items.forEach((item) => {
    if (item.productId == productId && item.variation == variation) {
      if (item.quantity < 0) item.quantity = 0;
      item.quantity += quantity;
      addedItem = true;
    }
  });

  if (!addedItem) {
    cart.items.push({
      productId: productId,
      quantity: quantity,
      variation: variation,
    });
  }

  // الجزء الخاص بالضيف سليم
  if (cart.userId == "guest") {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    reloadCart();
    return;
  }

  // --- التصحيح هنا للمستخدمين المسجلين ---
  let carts = JSON.parse(localStorage.getItem("carts") || "[]");
  // البحث عن مكان السلة الحالية في المصفوفة
  let cartIndex = carts.findIndex((c) => c.userId == cart.userId);

  if (cartIndex !== -1) {
    carts[cartIndex] = cart; // تحديث السلة الموجودة
  } else {
    carts.push(cart); // إضافة سلة جديدة
  }

  localStorage.setItem("carts", JSON.stringify(carts));
  reloadCart();
}

export function removeFromCart(productId, variation = undefined) {
  if (!productId) return;
  let cart = getUserCart();
  cart.items.forEach((item, index) => {
    if (item.productId == productId && item.variation == variation) {
      item.quantity -= 1;
      if (item.quantity <= 0) cart.items.splice(index, 1);
    }
  });
  if (cart.userId == "guest") {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    reloadCart();
    return;
  }
  let carts = JSON.parse(localStorage.getItem("carts") || "[]");
  let found = false;
  carts.forEach((e , i) => {
    if (e.userId == cart.userId) {
      found = true;
      carts[i] =cart
    }
  });
  if (!found) carts.push(cart);
  localStorage.setItem("carts", JSON.stringify(carts));
  reloadCart();
}

export function removeItemFromCart(productId, variation = undefined) {
  if (!productId) return;
  let cart = getUserCart();
  cart.items.forEach((item, index) => {
    if (item.productId == productId && item.variation == variation) {
      cart.items.splice(index, 1);
    }
  });
  if (cart.userId == "guest") {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    reloadCart();
    return;
  }
  let carts = JSON.parse(localStorage.getItem("carts") || "[]");
  let found = false;
  carts.forEach((e , i) => {
    if (e.userId == cart.userId) {
      found = true;
      carts[i] =cart
    }
  });
  if (!found) carts.push(cart);
  localStorage.setItem("carts", JSON.stringify(carts));
  reloadCart();
}

export function clearCart() {
  let cart = getUserCart();
  cart.items = [];
  if (cart.userId == "guest") {
    sessionStorage.setItem("cart", JSON.stringify(cart));
    reloadCart();
    return;
  }
  let carts = JSON.parse(localStorage.getItem("carts") || "[]");
  carts.forEach((e) => {
    if (e.userId == cart.userId) {
      e = cart;
    }
  });
  localStorage.setItem("carts", JSON.stringify(carts));
  reloadCart();
}

const cartItemTemplate = await (
  await fetch("/assets/elements/cartitem.html")
).text();

function createCartItemElement(productId, quantity, variation) {
  const product = getProductByID(productId);
  if (!product.id) return removeItemFromCart(productId);
  const itemElement = document.createElement("div");
  itemElement.innerHTML = cartItemTemplate;
  const cartItem = itemElement.querySelector(".cart-item").cloneNode(true);
  cartItem.querySelector("img").src =
    variation !== undefined && variation !== null
      ? product.images[variation]
      : product.images[0];
  const h3Element = cartItem.querySelector("h3");
  h3Element.innerText = product.name;
  h3Element.addEventListener("click", () => {
    window.location.href = `/pages/product.html?id=${product.id}`;
  });

  cartItem.querySelector(".price").innerText = (
    (variation !== undefined && variation !== null
      ? getPrice(product.variations[variation].price)
      : getPrice(product.price)) * quantity
  ).toFixed(2);
  cartItem.querySelector(".plus").addEventListener("click", () => {
    addToCart(product.id, 1, variation);
  });
  cartItem.querySelector(".minus").addEventListener("click", () => {
    removeFromCart(product.id, variation);
  });
  cartItem.querySelector(".remove").addEventListener("click", () => {
    removeItemFromCart(product.id, variation);
  });
  const quantityInput = cartItem.querySelector("input[name='quantity']");
  quantityInput.value = quantity;

  return cartItem;
}

export function reloadCart() {
  let cart = getUserCart();
  let cartItemsContainer = document.querySelector(".cart-items");
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = "";
  cart.items.forEach((item) => {
    let cartItemElement = createCartItemElement(
      item.productId,
      item.quantity,
      item.variation,
    );
    if (cartItemElement) {
      cartItemsContainer.appendChild(cartItemElement);
      const divider = document.createElement("hr");
      divider.className = "divider";
      cartItemsContainer.appendChild(divider);
    }
  });
  updateCartMetadata();
  updateCartSummary();
}

function updateCartMetadata() {
  const cart = getUserCart();
  let totalItems = 0;
  cart.items.forEach((item) => {
    totalItems += item.quantity;
  });
  let totalPrice = getCartTotal();
  document.querySelectorAll("span.amount").forEach((el) => {
    el.innerText = totalItems;
  });
  document.querySelectorAll(".subtotal .num").forEach((el) => {
    el.innerText = `$${totalPrice.toFixed(2)}`;
  });
  const checkout_btn = document.querySelector(".go-checkout button");
  checkout_btn.onclick = () => {
    window.location.href = "/pages/checkout.html";
  };
  checkout_btn.disabled = totalItems == 0;
  if (totalItems) {
  }
}

function updateCartSummary() {
  const itemsContainer = document.querySelector(".cart-view .items");
  if (!itemsContainer) return;
  itemsContainer.innerHTML = "";
  const cart = getUserCart();
  cart.items.forEach((item) => {
    const product = getProductByID(item.productId);
    if (!product.id) return;
    const img =
      item.variation !== undefined && item.variation !== null
        ? product.variations[item.variation].image
        : product.images[0];
    const price =
      (item.variation !== undefined && item.variation !== null
        ? getPrice(product.variations[item.variation].price)
        : getPrice(product.price)) * item.quantity;
    const itemElement = document.createElement("div");
    itemElement.className = "item";
    itemElement.innerHTML = `<div class="item-wrapper">
        <div class="image-wrapper">
          <img
            src="${img}"
            alt="${product.name}">
          </img>
          <div class="count">${item.quantity}</div>
        </div>
        <div class="item-name">${product.name}</div>
      </div>
      <div class="price">$ ${price.toFixed(2)}</div>`;
    itemsContainer.appendChild(itemElement);
  });
  if (cart.items.length == 0) {
    itemsContainer.innerHTML = `<h2 class="empty" style="text-align: center;">Your cart is empty</h2>`;
  }
  updateCheckOutTotal();
}

export function getCartTotal() {
  const cart = getUserCart();
  let totalPrice = 0;
  cart.items.forEach((item) => {
    const product = getProductByID(item.productId);
    if (product.id) {
      const price =
        item.variation !== undefined && item.variation !== null
          ? getPrice(product.variations[item.variation].price)
          : getPrice(product.price);
      totalPrice += price * item.quantity;
    }
  });
  return totalPrice;
}

import { reloadCart } from "/js/utils/cart.js";

var navToggle = document.getElementById("nav-toggle");
var navMainLinks = document.getElementById("nav-main-links");
navToggle.onclick = () => {
  navMainLinks.classList.toggle("hidden");
  navMainLinks.classList.toggle("flex");
};

var navCartBtn = document.getElementById("nav-cart-btn");
var closeCart = document.getElementById("close-cart");
var cartSidebar = document.getElementById("cart-sidebar");
var cartSidebarOverlay = document.getElementById("cart-sidebar-overlay");

navCartBtn.onclick = () => {
  cartSidebarOverlay.classList.remove("hidden");
  setTimeout(() => {
    cartSidebar.classList.remove("translate-x-full");
    cartSidebar.classList.add("translate-x-0");
  }, 10);
};

closeCart.onclick = () => {
  cartSidebar.classList.remove("translate-x-0");
  cartSidebar.classList.add("translate-x-full");
  setTimeout(() => {
    cartSidebarOverlay.classList.add("hidden");
  }, 500);
};

// reload cart
reloadCart();

// navbar during scroll
var navbar = document.getElementById("navbar");
var navbarContent = document.getElementById("navbar-content");

var handleScroll = () => {
  if (window.scrollY > 102) {
    navbar.classList.add("bg-gradient-to-br", "from-gray-900", "via-[#001127]", "to-[#001a3a]", "shadow-2xl", "border-white/5");
    navbar.classList.remove("backdrop-blur-md", "bg-white/5", "dark:bg-black/20", "border-white/10");
    navbarContent?.classList.replace("h-[102px]", "h-[85px]");
  } else {
    navbar.classList.remove("bg-gradient-to-br", "from-gray-900", "via-[#001127]", "to-[#001a3a]", "shadow-2xl", "border-white/5");
    navbar.classList.add("backdrop-blur-md", "bg-white/5", "dark:bg-black/20", "border-white/10");
    navbarContent?.classList.replace("h-[85px]", "h-[102px]");
  }
};

if (
  document.location.pathname === "/index.html" ||
  document.location.pathname === "/"
) {
  window.addEventListener("scroll", handleScroll);
  handleScroll();
} else {
  navbar.classList.add("bg-gradient-to-br", "from-gray-900", "via-[#001127]", "to-[#001a3a]", "shadow-2xl", "border-white/5");
  navbar.classList.remove("backdrop-blur-md", "bg-white/5", "dark:bg-black/20", "border-white/10");
  navbarContent?.classList.replace("h-[102px]", "h-[85px]");
  navbar.style.position = "relative";
  window.addEventListener("scroll", () => {
    if (window.scrollY < 11) {
      if (window.scrollY > 0) {
        navbar.style.transform = "translateY(5%)";
        navbar.style.position = "fixed";
        setTimeout(() => {
          navbar.style.transform = "translateY(0%)";
          navbar.style.transform = "none";
        }, 200);
        return;
      }
      navbar.style.position = "relative";
    }
  });
}


// dark mode
const body = document.querySelector('body');
const modeBtn = document.querySelector('.mode-btn');
const modeIcon = document.querySelector('.mode-icon');
const indicator = document.querySelector('.indicator');

function store(value) {
  localStorage.setItem('darkmode', value);
}

function load() {
  const darkmode = localStorage.getItem('darkmode');

  if (!darkmode) {
    store(false);
    modeIcon.classList.add('fa-sun');
  } else if (darkmode == 'true') {
    body.classList.add('dark');
    modeIcon.classList.add('fa-moon');
    indicator.style.transform = 'translateX(25px)';
  } else if (darkmode == 'false') {
    modeIcon.classList.add('fa-sun');
    indicator.style.transform = 'translateX(0px)';
  }
}

load();

modeBtn.addEventListener('click', () => {

  body.classList.toggle('dark');
  modeIcon.classList.add('animated');
  const isDark = body.classList.contains('dark');

  store(isDark);

  if (isDark) {
    indicator.style.transform = 'translateX(25px)';
    modeIcon.classList.replace('fa-sun', 'fa-moon');
  } else {
    indicator.style.transform = 'translateX(0px)';
    modeIcon.classList.replace('fa-moon', 'fa-sun');
  }

  setTimeout(() => {
    modeIcon.classList.remove('animated');
  }, 500);
});
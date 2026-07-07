export async function loader(element = "nav") {
  switch (element) {
    case "nav": 
      let navbar = document.getElementById("nav");
      navbar.innerHTML = await (
        await fetch("/assets/elements/navbar.html")
      ).text();
      let script = document.createElement("script")
      script.type = "module"
      script.src = "/js/utils/navbar.js"
      document.body.appendChild(script);
      return navbar;
      break;
    case "footer":
      let foooter = document.getElementById("footer");
      foooter.innerHTML = await (
        await fetch("/assets/elements/footer.html")
      ).text();
      return foooter;
      break;
    case "cart":
      let cart = document.getElementById("cart");
      cart.innerHTML = await (await fetch("/assets/elements/cart.html")).text();
      return cart
      break;
    default:
      break;
  }
}

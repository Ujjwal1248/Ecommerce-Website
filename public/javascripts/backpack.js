document.addEventListener("DOMContentLoaded", () => {
  const cartItems = document.getElementById("cart-items");
  const totalAmount = document.getElementById("total-amount");
  const cart = {};
  let total = 0;

  const updateServerCart = async (cartData) => {
    try {
      const response = await fetch("/api/update-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  document.querySelector(".show-cart-btn").addEventListener("click", () => {
    const cartElement = document.getElementById("cart");
    cartElement.style.display =
      cartElement.style.display === "none" ? "block" : "none";
  });

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const card = button.closest(".card");
      const itemId = card.dataset.id;
      const itemName = card.querySelector(".card-title").textContent;
      const itemPrice = parseFloat(
        card.querySelector(".price").textContent.replace("$", "")
      );

      if (cart[itemName]) {
        cart[itemName].quantity += 1;
        cart[itemName].element.querySelector(
          ".item-text"
        ).textContent = `${itemName} - $${itemPrice.toFixed(2)} x ${
          cart[itemName].quantity
        }`;
      } else {
        const itemElement = document.createElement("li");
        const itemText = document.createElement("span");
        itemText.className = "item-text";
        itemText.textContent = `${itemName} - $${itemPrice.toFixed(2)} x 1`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "-";
        removeButton.className = "remove-item";
        removeButton.addEventListener("click", () => {
          cart[itemName].quantity -= 1;
          total -= itemPrice;

          if (cart[itemName].quantity === 0) {
            cartItems.removeChild(cart[itemName].element);
            delete cart[itemName];
          } else {
            cart[itemName].element.querySelector(
              ".item-text"
            ).textContent = `${itemName} - $${itemPrice.toFixed(2)} x ${
              cart[itemName].quantity
            }`;
          }

          totalAmount.textContent = `Total: $${total.toFixed(2)}`;
          updateServerCart(cart);
        });

        itemElement.appendChild(itemText);
        itemElement.appendChild(removeButton);

        cart[itemName] = {
          id: itemId,
          price: itemPrice,
          quantity: 1,
          element: itemElement,
        };

        cartItems.appendChild(itemElement);
      }

      total += itemPrice;
      totalAmount.textContent = `Total: $${total.toFixed(2)}`;
      updateServerCart(cart);
    });
  });
});

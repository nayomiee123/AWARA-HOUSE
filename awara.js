// querySelector/getElementById find a single element in the page
// and store a reference to it in a variable, so we can work with it.
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');

// addEventListener waits for something to happen (here, a 'click')
// and then runs the function we give it.
hamburgerBtn.addEventListener('click', function () {
  // classList.toggle adds a class if it's missing, or removes it if
  // it's already there. That's perfect for an on/off menu.
  navMenu.classList.toggle('is-open');
  hamburgerBtn.classList.toggle('is-open');

  // This checks whether the class was just added, and updates the
  // aria-expanded attribute so screen readers know the menu's state.
  const isOpen = navMenu.classList.contains('is-open');
  hamburgerBtn.setAttribute('aria-expanded', isOpen);
});

// Close the mobile menu automatically when a link inside it is clicked,
// so the menu doesn't stay open after the user has already navigated.
const navLinks = navMenu.querySelectorAll('a');
navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    navMenu.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', false);
  });
});


const orderNowButtons = [
  document.getElementById('orderNowNavBtn'),
  document.getElementById('heroOrderBtn'),
  document.getElementById('featuredOrderBtn'),
];

orderNowButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  });
});


const filterButtons = document.querySelectorAll('.filter-btn');
const foodCards = document.querySelectorAll('.food-card');

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    // dataset.filter reads the data-filter="..." attribute from the button
    const selectedCategory = button.dataset.filter;

    // Update which button looks "active"
    filterButtons.forEach(function (btn) {
      btn.classList.remove('is-active');
    });
    button.classList.add('is-active');

    // Show or hide each card depending on whether it matches
    foodCards.forEach(function (card) {
      const cardCategory = card.dataset.category;
      const matchesFilter = selectedCategory === 'all' || cardCategory === selectedCategory;

      if (matchesFilter) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  });
});



// This array is our "database" of what's currently in the cart.
// Each item is an object with a name, a price, and a quantity.
// Example item: { name: "Classic Awara", price: 1500, quantity: 2 }
let cartItems = [];

// Grab references to the cart elements once, so we don't have to
// look them up again every time the cart changes.
const cartListEl = document.getElementById('cartList');
const cartEmptyMessageEl = document.getElementById('cartEmptyMessage');
const cartTotalEl = document.getElementById('cartTotal');
const orderSuccessMessageEl = document.getElementById('orderSuccessMessage');

// Turns a number like 4800 into the string "₦4,800" for display.
function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}

// This function completely redraws the cart based on the current
// cartItems array. Instead of trying to update the page bit by bit
// as things change, it's often simpler as a beginner to just
// "re-render everything" every time the data changes.
function renderCart() {
  // Clear out whatever is currently shown
  cartListEl.innerHTML = '';

  if (cartItems.length === 0) {
    // Show the "your cart is empty" message again
    cartListEl.appendChild(cartEmptyMessageEl);
    cartTotalEl.textContent = formatNaira(0);
    return; // stop here, there's nothing else to render
  }

  let total = 0;

  cartItems.forEach(function (item, index) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    // Build one cart row using a template string, then insert it.
    // This is a quick way to create HTML from JavaScript, though as
    // you learn more you'll also see createElement used for this.
    const cartItemEl = document.createElement('li');
    cartItemEl.classList.add('cart-item');
    cartItemEl.innerHTML = `
      <span class="cart-item__name">${item.name}</span>
      <div class="cart-item__qty">
        <button class="qty-btn" data-index="${index}" data-action="decrease">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
      </div>
      <span class="cart-item__price">${formatNaira(itemTotal)}</span>
      <button class="cart-item__remove" data-index="${index}">Remove</button>
    `;

    cartListEl.appendChild(cartItemEl);
  });

  cartTotalEl.textContent = formatNaira(total);
}

// Adds a product to the cart, or increases its quantity if it's
// already there.
function addToCart(name, price) {
  // .find looks through the array and returns the first item that
  // matches our condition, or undefined if nothing matches.
  const existingItem = cartItems.find(function (item) {
    return item.name === name;
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ name: name, price: price, quantity: 1 });
  }

  renderCart();

  // Scroll down so the user can see their item was added
  document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
}

// Listen for clicks on every "Add to Order" button in the menu
const addToOrderButtons = document.querySelectorAll('.add-to-order-btn');
addToOrderButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const name = button.dataset.name;
    const price = Number(button.dataset.price); // dataset values are strings, so convert to a number
    addToCart(name, price);
  });
});

// One listener on the whole cart list handles increase, decrease and
// remove clicks. This pattern is called "event delegation" — instead
// of adding a listener to every single button (which would be tricky
// since rows are created and destroyed as the cart changes), we let
// clicks "bubble up" to a parent element we know will always exist.
cartListEl.addEventListener('click', function (event) {
  const clickedButton = event.target;
  const index = Number(clickedButton.dataset.index);

  if (clickedButton.classList.contains('cart-item__remove')) {
    cartItems.splice(index, 1); // remove 1 item at this position
  } else if (clickedButton.dataset.action === 'increase') {
    cartItems[index].quantity += 1;
  } else if (clickedButton.dataset.action === 'decrease') {
    cartItems[index].quantity -= 1;
    // If quantity drops to 0, remove the item entirely
    if (cartItems[index].quantity <= 0) {
      cartItems.splice(index, 1);
    }
  }

  renderCart();
});

// The business's WhatsApp number, in international format with NO
// leading zero, NO "+", and NO spaces or dashes.
// Example: a Nigerian number 0803 000 0000 becomes 2348030000000
const WHATSAPP_NUMBER = '2349071536706'; // <-- replace with your real number

// Turns the cartItems array into a readable multi-line message, e.g:
//   New order from Awara House website:
//   - Classic Awara x2 = ₦3,000
//   - Pepper Awara x1 = ₦1,800
//   Total: ₦4,800
function buildWhatsAppMessage() {
  let message = 'New order from Awara House website:\n';

  cartItems.forEach(function (item) {
    const lineTotal = item.price * item.quantity;
    message += `- ${item.name} x${item.quantity} = ${formatNaira(lineTotal)}\n`;
  });

  const total = cartItems.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  message += `Total: ${formatNaira(total)}`;
  return message;
}

// "Place Order" button
const placeOrderBtn = document.getElementById('placeOrderBtn');
placeOrderBtn.addEventListener('click', function () {
  if (cartItems.length === 0) {
    orderSuccessMessageEl.textContent = 'Add something to your order first!';
    return;
  }

  const message = buildWhatsAppMessage();

  // encodeURIComponent turns spaces, line breaks and symbols like ₦
  // into a format safe to put inside a URL (e.g. spaces become %20).
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Opens WhatsApp (the app on mobile, WhatsApp Web on desktop) in a
  // new tab, with the message already typed into the chat box.
  window.open(whatsappURL, '_blank');

  orderSuccessMessageEl.textContent = 'Opening WhatsApp — just hit send to complete your order!';

  // Empty the cart since the order has been handed off to WhatsApp
  cartItems = [];
  renderCart();

  // Clear the message after a few seconds so it doesn't sit there forever
  setTimeout(function () {
    orderSuccessMessageEl.textContent = '';
  }, 4000);
});


const contactForm = document.getElementById('contactForm');
const contactSuccessMessageEl = document.getElementById('contactSuccessMessage');

contactForm.addEventListener('submit', function (event) {
  // Forms reload the page by default when submitted. This stops
  // that, since we're only building a frontend demo with no
  // backend to actually send the message to.
  event.preventDefault();

  contactSuccessMessageEl.textContent = 'Thanks! We\'ve received your message and will be in touch soon.';
  contactForm.reset(); // clears all the input fields

  setTimeout(function () {
    contactSuccessMessageEl.textContent = '';
  }, 4000);
});


const processSteps = document.querySelectorAll('.process-step');

const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // Stop watching this element once it's revealed, since we
      // don't need to animate it again.
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.2, // trigger once 20% of the step is visible
});

processSteps.forEach(function (step) {
  revealObserver.observe(step);
});


renderCart();
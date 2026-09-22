/* ============ STATE ============ */
let activeCategory = 'all';
let searchTerm = '';
let spinner = document.getElementById("spinner")

/* ============ ELEMENTS ============ */
const menuGrid = document.getElementById('menuGrid');
const noResults = document.getElementById('noResults');
const categories = document.getElementById('categories');
const searchInput = document.getElementById('searchInput');
const heroSearch = document.getElementById('heroSearch');

const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const DELIVERY_FEE = 2.99;

// const checkoutBtn = document.getElementById('checkoutBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalDone = document.getElementById('modalDone');

const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
const toast = document.getElementById('toast');
const newsletterForm = document.getElementById('newsletterForm');

/* ============ CART DRAWER TOGGLE ============ */
function openCart() {
  cartDrawer.classList.add('active');
  overlay.classList.add('active');
  Loadcart()
}

function closeCartDrawer() {
  cartDrawer.classList.remove('active');
  overlay.classList.remove('active');
}

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartDrawer);
overlay.addEventListener('click', () => {
  closeCartDrawer();
  closeModalFn();
});


function closeModalFn() {
  modalOverlay.classList.remove('active');
}

closeModal.addEventListener('click', closeModalFn);

/* ============ MOBILE NAV ============ */
hamburger.addEventListener('click', () => {
  mainNav.classList.toggle('active');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('active')));

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ============ NEWSLETTER ============ */
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast("You're on the list! 🍊");
  newsletterForm.reset();
});

/* ============ INIT ============ */
// loadMenu();
Loadcart();
Apicall()


// -----------spinner animation -----------

function Showspinner(){
    spinner.style.display = "block";
}

function Hidespinner(){
    spinner.style.display = "none";
}
// --------------- api call for images ----------------

async function Apicall() {

    Showspinner()

    try {

        const response = await fetch("/api/products");
        const res = await response.json();


        if (res.status === "success") {
            Hidespinner()
            // Clear products first
            menuGrid.innerHTML = "";

            res.data.forEach((a) => {

                menuGrid.innerHTML += `
                <div class="food-card">
                
                <a href="/product?id=${a.id}">
                
                <div>
                    <img 
                            src="${a.image}" 
                            height="200px" 
                            width="200px"
                        />
        
                    <h2> ${a.name} </h2>
                </a>
                    </div>

                    <div>
                        <h2>&#8377; ${a.price} </h2>


                        <button 
                            class="add-cart" 
                            data-id="${a.id}">
                            Add
                        </button>

                    </div>
                </div>
                `;
                
            });    

    /* ============ SEARCH ============ */
    heroSearch.addEventListener('submit', (e) => e.preventDefault());
    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderMenu();
        if (searchTerm) document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });

    });
    
/* ============ RENDER MENU ============ */
function renderMenu() {
  const filtered = res.data.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                           item.description.toLowerCase().includes(searchTerm) ||
                           item.category.toLowerCase().includes(searchTerm)
    return matchesCat && matchesSearch;
  });

  menuGrid.innerHTML = filtered.map(item => `
    <article class="food-card" data-id="${item.id}">
    <a href="/product?id=${item.id}">
      <div class="food-card-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
    </a>
      <div class="food-card-body">
        <h3>${item.name}</h3>
        <div class="food-card-footer">
          <span class="food-price">&#8377;${item.price}</span>
          <button class="add-cart" data-id="${item.id}" aria-label="Add ${item.name} to cart">+</button>
        </div>
      </div>
    </article>
  `).join('');

  noResults.hidden = filtered.length !== 0;

  menuGrid.querySelectorAll('[data-add]').forEach(btn => {
  });
}


    // -----------------search filter -------------
    categories.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-pill');
    if (!btn) return;

    categories.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    const filteredProducts = res.data.filter(product=>{
        if(btn.dataset.cat == "all"){
            return product
        }
        return product.category == btn.dataset.cat
    })
    
    menuGrid.innerHTML = ""
    filteredProducts.forEach(item => {
        menuGrid.innerHTML += `
                <div class="food-card">
                
                <a href="/product?id=${item.id}">
                
                <div>
                    <img 
                            src="${item.image}" 
                            height="200px" 
                            width="200px"
                        />
        
                    <h2> ${item.name} </h2>
                    </a>
                    </div>
                    <h2> &#8377; ${item.price} </h2>

                    <div>
                        <button 
                            class="add-cart" 
                            data-id="${item.id}">
                            Add
                        </button>

                    </div>
                </div>
                `;
    });
  noResults.hidden = filteredProducts.length !== 0;
    })

    

    
            // Load existing cart AFTER products are loaded

            await Loadcart();
            await LoadcartCount()

        } else {

          }

    } catch (error) {


    } finally {
        Hidespinner()
    }
   
}

let csrfElement = document.querySelector(
    '[name="csrfmiddlewaretoken"]'
);

let csrf = csrfElement.value;

menuGrid.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("add-cart")) {
        return;
    }

    const productid =
        e.target.dataset.id;

    try {

        const response = await fetch(
            "/api/cart",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "X-CSRFToken": csrf
                },

                body: JSON.stringify({
                    product: productid,
                    quantity: 1
                })
            }
        );

        const result =
            await response.json();

        showToast(result.message);


        if (response.ok) {

            await LoadcartCount();
        }else{
            setTimeout(()=>{
                window.location.href = "/signin"
            },2000)
        }

    } catch (error) {
            console.log(error);
    }
});

// ----------load cart ---------------------

async function Loadcart() {

    try {

        const response = await fetch("/api/cart");

        const result = await response.json();


        if (!response.ok) {
            return;
        }

        cartItemsEl.innerHTML = "";
        if (result.data.length === 0) {

            cartItemsEl.innerHTML = `
                <p>Your cart is empty</p>
            `;

            return;
        }

        result.data.forEach((item) => {

            cartItemsEl.innerHTML += `

                <div class="cart-item">

                    <img
                        src="${item.image}"
                        height="100"
                        width="200"
                    >

                    <h3>
                        ${item.product_name}
                    </h3>

                    <button
                        class="delete-item"
                        data-id="${item.id}">
                        -
                    </button>

                    <span class="quantity">
                        ${item.quantity}
                    </span>

                    <button
                        class="add-item"
                        data-id="${item.id}">
                        +
                    </button>

                </div>
            `;
            CartTotal()
        });


    } catch (error) {


    }
}



async function CartTotal(){
    let data = await fetch("/api/cart")
    let response = await data.json()
    cartTotal.innerHTML =  ` &#8377; ${response.cart_total}`
    cartSubtotal.innerHTML = ""
    response.data.forEach(item => {
         cartSubtotal.innerHTML += `
         <div>
         <p>${item.product_name} </p> X
         <p>${item.quantity} <p> = <p> ${item.amount} </p>
         </div>
    `
    }) 

    
}


async function LoadcartCount(){
    
    let data = await fetch("api/cart")
    
    let response = await data.json()



    cartCount.innerText = response.count || 0
}


// --------------- increase / decrease cart ----------------

cartItemsEl.addEventListener("click", async (e) => {

    let change = 0;

    // PLUS
    if (e.target.classList.contains("add-item")) {

        change = 1;
        
    }

    // MINUS
    else if (e.target.classList.contains("delete-item")) {
        change = -1;
        
    }

    else {
        return;
    }

    const cartId = e.target.dataset.id;


    try {

        const response = await fetch("/api/cart", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrf
            },

            body: JSON.stringify({
                id: cartId,
                change: change
            })
        });

        const result = await response.json();


        if (!response.ok) {

            showToast(result.message);

            return;
        }

        const cartItem = e.target.closest(".cart-item");

        // ------------------------------------------
        // Quantity became 0
        // ------------------------------------------

        if (result.message === "Product removed from cart") {

            cartItem.remove();

            showToast(result.message);
            await LoadcartCount()
            await CartTotal()
            return;
        }

        // ------------------------------------------
        // Update quantity
        // ------------------------------------------

        await LoadcartCount()
        await CartTotal()

        cartItem.querySelector(".quantity").innerText =
            result.data.quantity;


    } catch (error) {


    }

});


// ------------------payment modal--------------

function PaymentModal(){
    modalOverlay.classList.add("active")
}

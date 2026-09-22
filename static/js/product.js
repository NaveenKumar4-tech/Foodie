const params = new URLSearchParams(window.location.search)

const productId = params.get("id")



let spinner = document.querySelector(".spinner")

function Showspinner(){
    spinner.style.display = "block";
}

function Hidespinner(){
    spinner.style.display = "none";   
}


/* ============ TOAST ============ */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}


// ------------cart functions --------------
Loadcart();
LoadcartCount()

/* ============ CART DRAWER TOGGLE ============ */

const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const DELIVERY_FEE = 2.99;

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

            
        });

    } catch (error) {


    }
}



async function LoadcartCount(){
    
    let data = await fetch("api/cart")
    
    let response = await data.json()


    cartCount.innerText = response.count || 0
}


let csrfElement = document.querySelector(
    '[name="csrfmiddlewaretoken"]'
);

let csrf = csrfElement.value;

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

            return;
        }

        // ------------------------------------------
        // Update quantity
        // ------------------------------------------

        await LoadcartCount()

        cartItem.querySelector(".quantity").innerText =
            result.data.quantity;


    } catch (error) {


    }

});
const menuGrid = document.querySelector('.product-box');


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
        }

    } catch (error) {

        console.log(
            "ADD CART ERROR:",
            error
        );
    }
});


async function Loadcart() {

    try {

        const response = await fetch("/api/cart");

        const result = await response.json();

        console.log("CART RESPONSE:", result);

        if (!response.ok) {
            console.log(result.message);
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

        console.log("CART ERROR:", error);

    }
}



async function CartTotal(){
    let data = await fetch("/api/cart")
    let response = await data.json()
    cartTotal.innerHTML =  ` &#8377; ${response.cart_total}`
    cartSubtotal.innerHTML = ""
    response.data.forEach(item => {
        console.log(item)
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

    console.log( "loadcartcount :", response.count)


    cartCount.innerText = response.count || 0
}


// ----------------increase or decrease quantity 


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



// ------------product --------------

async function LoadProduct() {
    let url = await fetch( `api/products/${productId}` )
    const response = await url.json()
    console.log(response.data)
    
    
    let productbox = document.querySelector(".product-box");
    
    document.title = response.data.name
    try{
        Showspinner()

        if(response.message == "success"){
        
            productbox.innerHTML = ""

        
        productbox.innerHTML += `
        <div>
           <img src="${response.data.image}" class="pro-img" alt="${response.data.name}"/>
        
        <div class="img-box">
           <img src="${response.data.image}" class="ref-img highlight" alt="${response.data.name}"/>
           <img src="${response.data.image1}" class="ref-img" alt="${response.data.name}"/>
           <img src="${response.data.image2}" class="ref-img" alt="${response.data.name}"/>
           <img src="${response.data.image3}" class="ref-img" alt="${response.data.name}"/>
        </div>

        </div>
        <div>
           <h1> ${response.data.name} </h1>
           <p> ${response.data.description} </p>
           <h1> &#8377; ${response.data.price} </h1>
          <h2 id="rating"> </h2>
           <button class="add-cart" data-id="${productId}"> Add to Cart </button>
            
        
<div id="feedbackModal">

    <div class="modal-content">

        <p>Rate this food</p>

        <div class="stars">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
        </div>

        <textarea
        id="feedbackComment"
        placeholder="Write your feedback"></textarea>

        <button id="submitFeedback">
            Submit
        </button>

    </div>

</div>

        </div>

        `
        // ---submit feedback

        Feedback()
        ShowFeedback()

        let refimg = document.querySelectorAll(".ref-img")
        let proimg = document.querySelector(".pro-img")
        console.log(refimg)

        refimg.forEach((item) => {
            item.addEventListener("click",() => {
                refimg.forEach((img) => {
                    img.classList.remove("highlight")
                     proimg.src = item.src
                })
                item.classList.add("highlight")
            })
        })

        }
        else{
            console.log("error")
        }
    } 
    catch(e){
        console.log("error",e)
    }
    finally{
        Hidespinner()
    }

}

LoadProduct()

// ------------feedback ------------------

function Feedback(){

const stars = document.querySelectorAll(".star");

const submitBtn = document.getElementById("submitFeedback");

let selectedRating = 0;


/* ------------------ */
/* Star selection     */
/* ------------------ */

stars.forEach(star => {

    star.addEventListener("click", function(){

        selectedRating = Number(this.dataset.value);

        stars.forEach(s => s.classList.remove("active"));

        for(let i=0;i<selectedRating;i++){

            stars[i].classList.add("active");

        }

    });

});


submitBtn.addEventListener("click",()=>{

    if(selectedRating===0){

        showToast("Select Rating");

        return;

    }

     fetch(`/submit-feedback/${productId}`,{

        method:"POST",

        headers:{

            "Content-Type":"application/json",

            "X-CSRFToken":csrf

        },

        body:JSON.stringify({

            rating:selectedRating,

            comment:document.getElementById("feedbackComment").value,

            product:productId

        })

    })

    .then(res=>res.json())

    .then(data=>{

        if(data.status == "success"){
            showToast(data.message)
            window.location.reload()
            
        }
        else{
            showToast(data.message)
        }

    })
    .catch(e =>
        console.log(e)
    )

});

}


/* ============ MOBILE NAV ============ */
hamburger.addEventListener('click', () => {
  mainNav.classList.toggle('active');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('active')));


// -------- showing feedback --------

async function ShowFeedback() {
    let url = await fetch(`/submit-feedback/${productId}`)
    let response = await url.json()
    let feedback = document.querySelector(".feedback")
    let review = document.querySelector(".review")
    let rating = document.getElementById("rating")
     

    response.data.forEach(item => {
        review.style.display = "block"
        feedback.innerHTML += `
            <div class="comment">
            <h2> ${item.username} </h2>
            <h2> ${item.rating} ★ </h2>
            <p>${item.comment} </p>
            </div>
        `
    })
    rating.innerHTML = `${response.avg.toFixed(1) || 0} ★`

}

// -------------payment modal -------
const modalOverlay = document.getElementById('modalOverlay');


function PaymentModal(){
    modalOverlay.classList.add("active")
}

function closeModalFn() {
  modalOverlay.classList.remove('active');
}


closeModal.addEventListener('click', closeModalFn);


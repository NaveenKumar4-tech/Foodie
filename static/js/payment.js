const payBtn = document.getElementById("pay-btn")
// async function createOrder() {
//     payBtn.disabled = true;
//     payBtn.innerText = "Creating Order...";

//     try {

//         const response = await fetch("/api/order/create/", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-CSRFToken": csrf
//             },
//             body: JSON.stringify({
//                 // your order data here
//             })
//         });

//         const result = await response.json();

//         console.log("CREATE ORDER RESULT:", result);

//         if (!response.ok) {
//             showToast(result.message || "Could not create order");
//             payBtn.disabled = false;
//             payBtn.innerText = "Place Order & Pay";
//             return;
//         }

//         // IMPORTANT:
//         // result is available here

//         const options = {

//             key: result.key,
//             amount: result.amount,
//             currency: result.currency,
//             name: "Foodie",
//             description: "Food Order",

//             order_id: result.razorpay_order_id,

//             handler: async function (response) {

//                 console.log(
//                     "RAZORPAY PAYMENT SUCCESS",
//                     response
//                 );

//                 payBtn.innerText = "Verifying Payment...";

//                 try {

//                     const verifyRes = await fetch(
//                         "/api/order/verify/",
//                         {
//                             method: "POST",

//                             headers: {
//                                 "Content-Type": "application/json",
//                                 "X-CSRFToken": csrf
//                             },

//                             body: JSON.stringify({
//                                 razorpay_order_id:
//                                     response.razorpay_order_id,

//                                 razorpay_payment_id:
//                                     response.razorpay_payment_id,

//                                 razorpay_signature:
//                                     response.razorpay_signature
//                             })
//                         }
//                     );

//                     const verifyResult =
//                         await verifyRes.json();

//                     console.log(
//                         "VERIFY RESULT:",
//                         verifyResult
//                     );

//                     if (!verifyRes.ok) {

//                         showToast(
//                             verifyResult.message ||
//                             "Payment verification failed"
//                         );

//                         payBtn.disabled = false;
//                         payBtn.innerText =
//                             "Place Order & Pay";

//                         return;
//                     }

//                     showToast(
//                         "Payment successful! Order: " +
//                         verifyResult.order_number
//                     );

//                     Loadcart()
//                     // window.location.href =
//                     //     "/order-success/" +
//                     //     verifyResult.order_number +
//                     //     "/";

//                 } catch (err) {

//                     console.log(
//                         "VERIFY REQUEST ERROR:",
//                         err
//                     );

//                     showToast(
//                         "Could not verify payment. Contact support if amount was deducted."
//                     );

//                     payBtn.disabled = false;
//                     payBtn.innerText =
//                         "Place Order & Pay";
//                 }
//             },

//             modal: {
//                 ondismiss: function () {

//                     payBtn.disabled = false;
//                     payBtn.innerText =
//                         "Place Order & Pay";
//                 }
//             }
//         };

//         const razorpay = new Razorpay(options);

//         razorpay.on("payment.failed", function (response) {

//             console.log(
//                 "PAYMENT FAILED:",
//                 response.error
//             );

//             showToast("Payment failed");

//             payBtn.disabled = false;
//             payBtn.innerText =
//                 "Place Order & Pay";
//         });

//         razorpay.open();

//     } catch (err) {

//         console.log("CREATE ORDER ERROR:", err);

//         showToast("Could not create order");

//         payBtn.disabled = false;
//         payBtn.innerText =
//             "Place Order & Pay";
//     }
// }
let isCreatingOrder = false;

async function createOrder() {

    // Prevent multiple requests from double-clicking
    if (isCreatingOrder) return;

    isCreatingOrder = true;

    payBtn.disabled = true;
    payBtn.innerText = "Creating Order...";

    try {

        // 1. Create or retrieve the pending order
        const response = await fetch("/api/order/create/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrf
            },
            credentials: "same-origin"
        });

        const result = await response.json();

        console.log("CREATE ORDER RESULT:", result);

        if (!response.ok) {
            throw new Error(
                result.message || "Could not create order"
            );
        }

        // 2. Configure Razorpay checkout
        const options = {

            key: result.key,

            amount: result.amount,

            currency: result.currency,

            name: "Foodie",

            description: "Food Order",

            order_id: result.razorpay_order_id,

            handler: async function (paymentResponse) {

                payBtn.innerText = "Verifying Payment...";

                try {

                    // 3. Verify payment on Django backend
                    const verifyRes = await fetch(
                        "/api/order/verify/",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRFToken": csrf
                            },

                            credentials: "same-origin",

                            body: JSON.stringify({

                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,

                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,

                                razorpay_signature:
                                    paymentResponse.razorpay_signature

                            })
                        }
                    );

                    const verifyResult = await verifyRes.json();

                    console.log("VERIFY RESULT:", verifyResult);

                    if (!verifyRes.ok) {
                        throw new Error(
                            verifyResult.message ||
                            "Payment verification failed"
                        );
                    }

                    // 4. Payment successful
                    // Refresh cart UI
                    await Loadcart();
                    await LoadcartCount()
                    await CartTotal()
                    await closeCartDrawer()
                    await PaymentModal()


                    // Restore button
                    payBtn.disabled = false;
                    payBtn.innerText = "Place Order & Pay";

                } catch (err) {

                    console.error("VERIFY ERROR:", err);

                    showToast(
                        err.message ||
                        "Payment verification failed"
                    );

                    payBtn.disabled = false;
                    payBtn.innerText = "Place Order & Pay";
                }
            },

            modal: {
                ondismiss: function () {

                    payBtn.disabled = false;
                    payBtn.innerText = "Place Order & Pay";

                }
            }
        };

        // 5. Open Razorpay checkout
        const razorpay = new Razorpay(options);

        razorpay.on("payment.failed", function (response) {

            console.error(
                "PAYMENT FAILED:",
                response.error
            );

            showToast(
                response.error.description || "Payment failed"
            );

            payBtn.disabled = false;
            payBtn.innerText = "Place Order & Pay";

        });

        razorpay.open();

    } catch (err) {

        console.error("CREATE ORDER ERROR:", err);

        showToast(err.message || "Could not create order");

        payBtn.disabled = false;
        payBtn.innerText = "Place Order & Pay";

    } finally {

        isCreatingOrder = false;

    }
}


function closeModalFn() {
  modalOverlay.classList.remove('active');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('active');
  overlay.classList.remove('active');
}


closeModal.addEventListener('click', closeModalFn);



payBtn.addEventListener("click",createOrder)


// ----------load cart ---------------------

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
    console.log("cartsubtotal",response)
    cartTotal.innerText = response.cart_total
    cartSubtotal.innerHTML = ""
    response.data.forEach(item => {
        console.log(item)
         cartSubtotal.innerHTML += `
         <div>
         <p>${item.product_name} </p> X
         <p>${item.quantity} <p> = <p>${item.amount} </p>
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

let orderbox = document.querySelector(".order-box")
let spinner = document.getElementById("spinner")


//  async function Orders(){
    
// try{
//         let data = await fetch("api/order/create/")
        
//         let response = await data.json()
        
//         console.log(response)
//         Showspinner()
//     if(response.status == "success"){
//         Hidespinner()
//         console.log(response.data.order_number)

//     orderbox.innerHTML += `
//         <div class="order-part1">
//             <img src="{% static "images\tick.png" %}" class="checkmark">
//             <div> 
//                 <h2>Order Placed Successfully !</h2> 
//                 <p>Your Food is on the on the way..</p>
//                 <span>
//                 <p><b>Order ID :</b> ${response.data.order_number} </p>
//                 <p>|</p>
//                <p> placed on : ${response.data.created_at} </p>
//                 </span>
//             </div>
//                 <img src="{% static "images\delivery boy.png" %}" class="delivery-boy">
//         </div>

//         <div class="order-part2">
//             <div class="ordera">
//                 <div class="order-status">
//                   <h2>Order Tracking</h2>
//                   <p>You can Track the Live Status of your order</p>

//                   <div>
//                       <span class="line"></span>
//                       <span class="track track1"></span>
//                       <span class="track track2"></span>
//                       <span class="track track3"></span>
//                       <span class="track track4"></span>
//                   </div>

//                   <p>Your Food is being Prepared..</p>
//                 </div>
//                 <div class="order-items">
//                   <h2>Order Items</h2>
//                   <div>
//                     <span>
//                     <img src="" alt="" height="100px" width="100px">
//                     <span>
//                       <h2>  </h2>
//                       <p>  </p>
//                     </span>
//                     </span>

//                     <h1>149</h1>
//                   </div>
                  
//                 </div>
//             </div>

//             <div class="orderb">
//               <h2>Order Summary</h2>
//                 <div class="order-summary">
//                     <span>
//                     <img src="" alt="" height="50px" width="50px">
//                     <span>
//                       <h2>Chicken pizza</h2>
//                       <p>1X149</p>
//                     </span>
//                     </span>

//                     <h1>149</h1>

//                 </div>

//                 <div class="order-total">
//                   <table>
//                       <tr>
//                         <td><h3>Items Total</h3></td>
//                         <td><h3>12</h3></td>
//                       </tr>

//                       <tr>
//                         <td><h3>Delivery Charges</h3></td>
//                         <td><h3>120</h3></td>
//                       </tr>

//                       <tr>
//                         <td><h3>Platform Fee</h3></td>
//                         <td><h3>12</h3></td>
//                       </tr>

//                       <tr>
//                         <td><h1>Total</h1></td>
//                         <td><h1>12</h1></td>
//                       </tr>
                      
//                   </table>
//                 </div>

//             </div>

//         </div>
//     `
//     }
//     }
//     catch(err){
//         console.log(err)
//     }
//     finally{
//         Hidespinner()
//     }
    
// }

async function getOrders() {
    try {
        const response = await fetch("/api/order/create/", {
            method: "GET",
            credentials: "include"
        });

        const res = await response.json();
        Showspinner()
     
        if (res.status === "success") {
            Hidespinner()

          
const order = res.data;

const formattedDate = new Date(order.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
});

// Generate HTML for all products
const itemsHTML = order.items.map(item => `
    <div class="order-item">
        <span>
            <img src="${item.product_image}" 
                 alt="${item.product_name}" 
                 height="100" width="100">

            <span>
                <h2>${item.product_name}</h2>
                <p>${item.quantity} X  &#8377; ${item.price}</p>
            </span>
        </span>

        <h1>  &#8377;${item.subtotal}</h1>
    </div>
`).join("");

// Render the full order UI only once
orderbox.innerHTML = `
    <div class="order-part1">
         <img src="${tickImage}" class="checkmark">

        <div class="order-about">
            <h2>Order Placed Successfully!</h2>
            <p>Your Food is on the way..</p>

            <span class="details">
                <p><b>Order ID:</b> ${order.order_number}</p>
                <p>|</p>
                <p>Placed on: ${formattedDate}</p>
            </span>
        </div>

        <img src="${deliveryImage}" class="delivery-boy">
    </div>

    <div class="order-part2">
        <div class="ordera">

            <div class="order-status">
                <h2>Order Tracking</h2>
                <p>You can Track the Live Status of your order</p>

                <div>
                    <span class="line"></span>
                    <span class="track track1">
                        <i class="fa-solid fa-check"></i>
                    </span>
                    <p class="txt1">Order Placed</p>
                    <span class="track track2">
                        <i class="fa-solid fa-utensils"></i>
                    </span>
                    <p class="txt2">Preparing</p>
                    <span class="track track3">
                        <i class="fa-solid fa-motorcycle"></i>
                    </span>
                    <p class="txt3">Out for Delivery</p>

                    <span class="track track4">
                        <i class="fa-solid fa-house"></i>
                    </span>
                    <p class="txt4">Delivered</p>

                    </div>

                <p>Your Food is being Prepared..</p>
            </div>

            <div class="order-items">
                <h2>Order Items</h2>

                ${itemsHTML}
            </div>

        </div>

        <div class="orderb">
            <h2>Order Summary</h2>

            <div class="order-summary">
                ${itemsHTML}
            </div>

            <div class="order-total">
                <table>
                    <tr>
                        <td><h3>Items Total</h3></td>
                        <td><h3> &#8377; ${order.total_amount}</h3></td>
                    </tr>

                    <tr>
                        <td><h3>Delivery Charges</h3></td>
                        <td><h3> &#8377; 0</h3></td>
                    </tr>

                    <tr>
                        <td><h3>Platform Fee</h3></td>
                        <td><h3> &#8377; 0</h3></td>
                    </tr>

                    <tr>
                        <td><h1>Total</h1></td>
                        <td><h1> &#8377; ${order.total_amount}</h1></td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
`;
        }

        else{
            orderbox.classList.add("txt")
            orderbox.innerHTML = "You Have No orders "
        }

    } catch (error) {
        console.error("Error fetching orders:", error);
    }
    finally{
        Hidespinner()
    }
}

getOrders();



/* ============ MOBILE NAV ============ */
hamburger.addEventListener('click', () => {
  mainNav.classList.toggle('active');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('active')));


//-----------spinner animation -----------

function Showspinner(){
    spinner.style.display = "block";
}

function Hidespinner(){
    spinner.style.display = "none";
}

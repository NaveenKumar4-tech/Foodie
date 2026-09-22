let username = document.getElementById("username")
let password = document.getElementById("password")
let email = document.getElementById("email")
let form = document.getElementById("form")
let btn = document.getElementById("btn")

form.addEventListener("submit",async (e)=>{
    btn.innerText="Creating Account..."
    e.preventDefault()
    let response = await fetch("/api/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            username:username.value,
            password:password.value,
            email:email.value
    })

    })
    
    console.log(response)
    let data = await response.json()

    //  const toast = document.createElement("div")
    // toast.innerText = data.message
    // toast.style = "width:100px;padding:10px;background:green;position:absolute;right:100px"
    console.log(data)
    if(data.status == "success"){
       alert("signup")
       window.location.href = "/signin"
    }

    else{
        btn.innerText = "Signup"
        alert("error")
        // toast.innerText = data.message
    }
    //     document.body.appendChild(toast)
    // setTimeout(()=>{
    //         toast.remove()
    //     },3000)
})

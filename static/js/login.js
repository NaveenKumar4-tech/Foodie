let form = document.getElementById("loginForm");
let username = document.getElementById("name");
let password = document.getElementById("password");
let btn = document.querySelector(".auth-submit")
const toast = document.getElementById('toast');

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const showing = target.type === 'text';
    target.type = showing ? 'password' : 'text';
    btn.textContent = showing ? '👁' : '🙈';
    btn.classList.toggle('showing', !showing);
  });
});


form.addEventListener("submit", async (e) => {
        btn.innerText = "Logging in..."

    e.preventDefault();

   

    let csrfElement = document.querySelector(
        '[name="csrfmiddlewaretoken"]'
    );

    if (!csrfElement) {
        console.log("CSRF token not found");
        return;
    }

    let csrf = csrfElement.value;

    console.log("Username:", username.value);
    console.log("Password:", password.value);
    console.log("CSRF:", csrf);

    try {

        let response = await fetch("api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrf
            },


            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        console.log("Status:", response.status);

        let data = await response.json();

        
        if (response.ok && data.status === "success") {
            btn.innerText = "Log in"
            btn.style.cursor = "progress"
            
            showToast(data.message)
            if (username.value == "admin"){
                window.location.href = "/admin-dashboard";
            }
            else{
            setTimeout(() => {
                window.location.href = "/home";
            }, 3000);
        }

        } else {
            showToast(data.message)
            btn.innerText = "Log in"
        }

    } catch (err) {

        console.error("Fetch error:", err);

    }
    
});


// ------------ api post -----------
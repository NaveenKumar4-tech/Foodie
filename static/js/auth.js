/* ============ SHARED HELPERS ============ */
const toast = document.getElementById('toast');
let username = document.getElementById("name")
let passwordInput = document.getElementById("password")
let email = document.getElementById("email")
let confirmpassword = document.getElementById("confirmPassword")
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + 'Error');
  if (!input) return;
  if (message) {
    input.classList.add('invalid');
    if (errorEl) errorEl.textContent = message;
  } else {
    input.classList.remove('invalid');
    if (errorEl) errorEl.textContent = '';
  }
}

/* ============ PASSWORD VISIBILITY TOGGLE ============ */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const showing = target.type === 'text';
    target.type = showing ? 'password' : 'text';
    btn.textContent = showing ? '👁' : '🙈';
    btn.classList.toggle('showing', !showing);
  });
});



/* ============ SIGNUP FORM ============ */
const form = document.getElementById('signupform');

let btn = document.querySelector(".auth-submit")
let nameerror = document.getElementById("nameError")
let emailerror = document.getElementById("emailError")
let passerror = document.getElementById("passError")
let confirmerror = document.getElementById("confirmPasswordError")

form.addEventListener("submit",async (e)=>{

    e.preventDefault()
    let isvalid = true;

    // Username validation
    if (username.value.trim() === "") {
        username.style.borderColor = "red";
        nameerror.innerText = "Username cannot be empty";
        isvalid = false;
    } else {
        username.style.borderColor = "";
        nameerror.innerText = "";
    }

    // Password validation
    if (passwordInput.value.trim() === "") {
        passwordInput.style.borderColor = "red";
        passerror.innerText = "Password cannot be empty";
        isvalid = false;
    } else {
        passwordInput.style.borderColor = "";
        passerror.innerText = "";
    }

    // Email validation
    if (email.value.trim() === "") {
        email.style.borderColor = "red";
        emailerror.innerText = "Email cannot be empty";
        isvalid = false;
    } else {
        email.style.borderColor = "";
        emailerror.innerText = "";
    }

    if(passwordInput.value.length >6){
      passerror.innerText = "Password must contain 6 characters"
    }

    if(confirmpassword.value != passwordInput.value){
      confirmerror.innerText = "Passwords do not match";
        isvalid = false;
    }
    else{
      confirmerror.innerText = ""
    }
    // Stop if validation failed
    if (!isvalid) {
        return;
    }
  
  btn.innerText="Creating Account..."
    
    let csrfElement = document.querySelector(
        '[name="csrfmiddlewaretoken"]'
    );

    if (!csrfElement) {
        console.log("CSRF token not found");
        return;
    }

    let csrf = csrfElement.value;

    let response = await fetch("/api/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken":csrf
        },
        body:JSON.stringify({
            username:username.value,
            password:passwordInput.value,
            email:email.value
    })

    })
    
    console.log(response)
    let data = await response.json()

    console.log(data)
    if(data.status == "success"){
        showToast(data.message)
        setTimeout(()=>{
          window.location.href = "/signin"
        },3000)
      console.log("sucess")
      btn.innerText = "Create Account"
    }

    else{
      btn.innerText = "Create Account";
      console.log(data.message)
        showToast(data.message)
    }

/* ============ PASSWORD STRENGTH (signup only) ============ */
const pwStrengthEl = document.getElementById('pwStrength');

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-3
}

if (passwordInput && pwStrengthEl) {
  passwordInput.addEventListener('input', () => {
    const score = passwordScore(passwordInput.value);
    pwStrengthEl.classList.remove('weak', 'medium', 'strong');
    if (passwordInput.value.length === 0) return;
    if (score <= 1) pwStrengthEl.classList.add('weak');
    else if (score === 2) pwStrengthEl.classList.add('medium');
    else pwStrengthEl.classList.add('strong');
  });
}

});

/* ============ FORGOT PASSWORD (demo) ============ */
const forgotLink = document.getElementById('forgotLink');
if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset isn\'t wired up in this demo.');
  });
}

/* ============ SOCIAL BUTTONS (demo) ============ */
['googleBtn', 'appleBtn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', () => {
      showToast(`${id === 'googleBtn' ? 'Google' : 'Apple'} sign-in isn't wired up in this demo.`);
    });
  }
});


const box = document.getElementById("product-box");
const form = document.getElementById("product-form");

const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");

const imageInputs = [
    document.getElementById("image"),
    document.getElementById("image1"),
    document.getElementById("image2"),
    document.getElementById("image3")
];

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const formStatus = document.getElementById("formStatus");
const productCount = document.getElementById("productCount");

let editingProductId = null;


// ============================
// CSRF TOKEN
// ============================

function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        cookie = cookie.trim();

        if (cookie.startsWith(name + "=")) {
            return decodeURIComponent(
                cookie.substring(name.length + 1)
            );
        }
    }

    return "";
}


// ============================
// API REQUEST HELPER
// ============================

async function apiRequest(url, options = {}) {
    const headers = new Headers(options.headers || {});

    // Django CSRF protection for POST, PUT, DELETE
    if (options.method &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(
            options.method.toUpperCase()
        )) {
        headers.set("X-CSRFToken", getCookie("csrftoken"));
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "same-origin"
    });

    // Session expired or not logged in
    if (response.redirected) {
        window.location.href = response.url;
        throw new Error("Please login again.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            JSON.stringify(data.errors || data.message || data)
        );
    }

    return data;
}


// ============================
// SAFE HTML TEXT
// ============================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// ============================
// LOAD ALL PRODUCTS
// ============================

async function LoadProducts() {
    box.innerHTML = `
        <tr><td colspan="6">Loading products...</td></tr>
    `;

    try {
        const result = await apiRequest("/api/products/");

        const products = result.data;

        box.innerHTML = "";

        productCount.textContent =
            `Total Products: ${products.length}`;

        if (products.length === 0) {
            box.innerHTML = `
                <tr>
                    <td colspan="6">No products found.</td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            const row = document.createElement("tr");

            const img = product.image
                ? `<img src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}">`
                : "No Image";

            row.innerHTML = `
                <td>${escapeHTML(product.id)}</td>

                <td>${img}</td>

                <td>${escapeHTML(product.name)}</td>

                <td>${escapeHTML(product.category)}</td>

                <td>₹${escapeHTML(product.price)}</td>

                <td>
                    <div class="actions">

                        <button class="edit editbtn"
                            data-id="${escapeHTML(product.id)}">
                            Edit
                        </button>

                        <button class="delete deletebtn"
                            data-id="${escapeHTML(product.id)}">
                            Delete
                        </button>

                    </div>
                </td>
            `;

            box.appendChild(row);
        });

    } catch (error) {
        console.error("Load error:", error);

        box.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load products. ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
    }
}


// ============================
// RESET FORM
// ============================

function ResetForm() {
    form.reset();

    editingProductId = null;

    formTitle.textContent = "Add New Product";
    saveBtn.textContent = "Add Product";

    cancelBtn.hidden = true;

    formStatus.textContent = "";
}


// ============================
// EDIT / DELETE BUTTONS
// ============================

box.addEventListener("click", async (e) => {

    const editBtn = e.target.closest(".editbtn");
    const deleteBtn = e.target.closest(".deletebtn");


    // ========================
    // EDIT PRODUCT
    // ========================

    if (editBtn) {
        const productId = editBtn.dataset.id;

        try {
            const result = await apiRequest(
                `/api/products/${productId}/`
            );

            const product = result.data;

            nameInput.value = product.name || "";
            categoryInput.value = product.category || "";
            priceInput.value = product.price || "";
            descriptionInput.value = product.description || "";

            // Browser cannot pre-fill file inputs
            imageInputs.forEach(input => {
                input.value = "";
            });

            editingProductId = productId;

            formTitle.textContent = "Edit Product";
            saveBtn.textContent = "Update Product";
            cancelBtn.hidden = false;

            formStatus.textContent =
                "Editing: " + product.name;

            form.scrollIntoView({
                behavior: "smooth"
            });

        } catch (error) {
            alert("Unable to load product: " + error.message);
        }
    }


    // ========================
    // DELETE PRODUCT
    // ========================

    if (deleteBtn) {
        const productId = deleteBtn.dataset.id;

        if (!confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            const result = await apiRequest(
                `/api/products/${productId}/`,
                {
                    method: "DELETE"
                }
            );

            alert(result.message || "Product deleted!");

            // If the deleted product was being edited
            if (editingProductId === productId) {
                ResetForm();
            }

            await LoadProducts();

        } catch (error) {
            alert("Delete failed: " + error.message);
        }
    }

});


// ============================
// CREATE / UPDATE PRODUCT
// ============================

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", nameInput.value.trim());
    formData.append("category", categoryInput.value.trim());
    formData.append("price", priceInput.value);
    formData.append("description", descriptionInput.value.trim());

    // Append selected image files only
    imageInputs.forEach((input, index) => {
        if (input.files.length > 0) {
            const field = index === 0 ? "image" : `image${index}`;
            formData.append(field, input.files[0]);
        }
    });

    const isEditing = editingProductId !== null;

    const url = isEditing
        ? `/api/products/${editingProductId}/`
        : "/api/products/";

    const method = isEditing ? "PUT" : "POST";

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = isEditing
            ? "Updating..."
            : "Creating...";

        const result = await apiRequest(url, {
            method: method,
            body: formData
        });

        formStatus.textContent = result.message;

        alert(result.message || "Success!");

        ResetForm();

        await LoadProducts();

    } catch (error) {
        console.error("Save error:", error);

        formStatus.textContent = error.message;
        alert("Operation failed: " + error.message);

    } finally {
        saveBtn.disabled = false;

        saveBtn.textContent = editingProductId
            ? "Update Product"
            : "Add Product";
    }
});


// ============================
// CANCEL EDIT
// ============================

cancelBtn.addEventListener("click", () => {
    ResetForm();
});


// ============================
// INITIAL LOAD
// ============================

LoadProducts();
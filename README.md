# Foodie 🍔

Foodie is a food-ordering web application built with Django REST
Framework (DRF), PostgreSQL, and a vanilla HTML, CSS, and JavaScript
frontend. It includes product browsing, cart management, and Razorpay
payment integration.

## Tech Stack

-   **Backend:** Django, Django REST Framework (DRF)
-   **Frontend:** HTML5, CSS3, JavaScript
-   **Database:** PostgreSQL
-   **Payments:** Razorpay
-   **API communication:** Fetch API / JSON (and `FormData` for file
    uploads, where applicable)

## Features

-   Browse food products
-   User registration and login
-   Add products to the cart
-   Update cart quantities and remove items
-   Create orders from cart items
-   Razorpay payment integration
-   Payment verification through the backend
-   Product management through API endpoints (if enabled for your admin
    interface)

## Project Structure

Your exact folders may differ. A common layout is:

``` text
Foodie/
├── manage.py
├── requirements.txt
├── .env
├── <django_project>/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── <app_name>/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── ...
└── frontend/
    ├── index.html
    ├── css/
    ├── js/
    └── images/
```

## Prerequisites

Install the following before running the project:

-   Python 3.10+ (use the version compatible with your Django
    installation)
-   PostgreSQL
-   pip
-   A Razorpay account with API keys (test keys are suitable for
    development)

## Installation and Setup

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Create and activate a virtual environment

**Windows**

``` bash
python -m venv env
env\Scripts\activate
```

**macOS / Linux**

``` bash
python3 -m venv env
source env/bin/activate
```

### 3. Install dependencies

If `requirements.txt` is available:

``` bash
pip install -r requirements.txt
```

Otherwise, install the core packages:

``` bash
pip install django djangorestframework psycopg2-binary python-dotenv razorpay
```

> Install any additional packages used by your project, such as
> authentication, CORS, or image-processing dependencies.

### 4. Configure environment variables

Create a `.env` file in the project root (keep it private):

``` env
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=foodie_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Update `settings.py` to load these values and configure `DATABASES` to
use PostgreSQL. The variable names above are examples---match them to
the names used in your code.

**Never commit `.env`, Django secret keys, database passwords, or
Razorpay secrets.** Add `.env` to `.gitignore`.

### 5. Create the PostgreSQL database

Create a database named `foodie_db` (or use your preferred name) in
PostgreSQL, then ensure the database credentials in `.env` match your
local setup.

### 6. Run migrations

``` bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create an admin user (optional)

``` bash
python manage.py createsuperuser
```

### 8. Start the Django development server

``` bash
python manage.py runserver
```

By default, Django runs at:

``` text
http://127.0.0.1:8000/
```

Open your frontend using the route or static-file setup configured in
your project.

## Razorpay Test Payments

1.  Add your Razorpay **test** Key ID and Key Secret to `.env`.
2.  Ensure the backend creates the Razorpay order and returns the order
    ID and required checkout details.
3.  Open Razorpay Checkout from the frontend.
4.  Send the payment response to your backend for signature
    verification.
5.  Mark the order as paid only after successful server-side
    verification.

Use Razorpay test mode during development. Do not expose the Key Secret
in frontend JavaScript. Use valid test payment details provided in the
Razorpay Dashboard.

## API Endpoints

The following are example endpoint groups based on the app's
functionality. Confirm the exact paths and HTTP methods in your
`urls.py`.

  Endpoint group                 Purpose
  ------------------------------ ------------------------------------
  `/api/signup/`                 Register a user
  `/api/login/`                  Authenticate a user
  `/api/products/`               List or manage products
  `/api/cart/`                   View and manage the user's cart
  `/api/order/create/`           Create an order / initiate payment
  `/api/order/verify-payment/`   Verify Razorpay payment

## Frontend

The frontend uses HTML, CSS, and JavaScript to render the interface and
communicate with the DRF API. Ensure API base URLs, authentication
headers, CSRF handling (if applicable), and media URLs match your local
Django configuration.

## Security Notes

-   Keep `.env` out of version control.
-   Never expose `RAZORPAY_KEY_SECRET` in browser code.
-   Verify Razorpay payment signatures on the backend.
-   Require authentication for user-specific cart and order operations.
-   Validate uploaded files and user-submitted data.
-   Use `DEBUG=False`, secure settings, and environment-specific
    credentials in production.

## Troubleshooting

-   **Database connection error:** Check that PostgreSQL is running and
    the database name, username, password, host, and port are correct.
-   **Missing table / migration error:** Run
    `python manage.py makemigrations` and `python manage.py migrate`.
-   **Razorpay authentication error:** Confirm the Key ID and Key Secret
    belong to the same Razorpay mode (test or live).
-   **Invalid VPA during testing:** Use a valid Razorpay test payment
    method supported by the test flow; do not use a real UPI ID unless
    the test instructions require it.
-   **CORS or CSRF error:** Check Django's CORS/CSRF configuration and
    the frontend's request headers/origin.

## Future Improvements

-   Add order history and order status tracking
-   Improve product search and category filtering
-   Add automated tests for APIs and payment verification
-   Deploy the frontend, Django API, and PostgreSQL database

## License

Add your preferred license here (for example, MIT) before publishing the
repository.

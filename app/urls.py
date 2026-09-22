from django.urls import path
from .views import *

urlpatterns = [
    path('home',home),
    path('api/signup',SignupView.as_view()),
    path('api/login',LoginView.as_view()),
    path('api/products',ProductData.as_view()),
     path(
        "admin-dashboard/",
        AdminDashboardView,
        name="admin-dashboard"
    ),

    # GET all products / POST new product
    path(
        "api/products/",
        ProductList.as_view(),
        name="product-list"
    ),

    # GET one / PUT update / DELETE
    path(
        "api/products/<int:product_id>/",
        ProductDetailView.as_view(),
        name="product-detail"
    ),
    path('api/cart',CartView.as_view()),
    path('api/products/<int:id>',SingleProduct.as_view()),
    path("submit-feedback", FeedbackView.as_view()),
    path("submit-feedback/<int:product_id>", FeedbackView.as_view(),name="sumit-feedback"),
    
    # -----------page render --------
    # path('',login_page),
    path('signup',signup),
    path('signin',signin),
    path("logout",Logout),
    path('home',home),
    path('product',product),
    path('menu',menu),
    path('why',why),
    path('contact',contact),
    path('my-orders',orders),
    
    path(
        "api/order/create/",
        CreateOrderView.as_view(),
        name="create-order"
    ),
    
    path(
        "api/order/verify/",
        VerifyPaymentView.as_view(),
        name="verify-payment"
    )


]


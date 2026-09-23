from django.shortcuts import render,redirect,get_object_or_404
from .models import *
from django.db.models import Count,Sum
from django.contrib.auth import authenticate,login,logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser

class SignupView(APIView):
    def post(self,request):
        try:
            name = request.data.get("username")
            password = request.data.get("password")
            email = request.data.get("email")

            if User.objects.filter(email=email).exists():
                return Response({
                    "message":"Email already exists"
                    })
                
            else:
                User.objects.create_user(
                    username=name,
                    password=password,
                    email=email
                )
                return Response({
                    "status":"success",
                    "message":"Signup successful"
                })
                          
        except:
            return Response({
                "message":"Error occurred"
                })

class LoginView(APIView):

    def post(self, request):
        try:
            name = request.data.get("username")
            password = request.data.get("password")

            if not name or not password:
                return Response({
                    "status": "error",
                    "message": "Username and password are required"
                }, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(
                request,
                username=name,
                password=password
            )

            if user is not None:
                login(request, user)
                
                return Response({
                    "status": "success",
                    "message": "Login Success"
                }, status=status.HTTP_200_OK)
            
            return Response({
                "status": "error",
                "message": "Invalid username or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
            
            
# ----------- api call for menugrid ---------------
class ProductData(APIView):
    def get(self,request):
        try:
            product = Product.objects.all()
            serializer = ProductSerializer(product,many = True)
            return Response({
                "data":serializer.data,
                "message":"Data fetched",
                "status":"success"
            })
        
        except:
            return Response({
                "message":"error"
            })

# ============================
# ADMIN DASHBOARD PAGE
# ============================

@staff_member_required
def AdminDashboardView(request):
    return render(request, "admin_dashboard.html")


# ============================
# PRODUCT LIST + CREATE
# ============================

@method_decorator(staff_member_required, name="dispatch")
class ProductList(APIView):

    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    # READ ALL PRODUCTS
    def get(self, request):

        products = Product.objects.all().order_by("-id")

        serializer = ProductSerializer(
            products,
            many=True,
            context={"request": request}
        )

        return Response({
            "status": "success",
            "data": serializer.data
        })

    # CREATE PRODUCT
    def post(self, request):

        serializer = ProductSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "status": "success",
                "message": "Product created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================
# GET / UPDATE / DELETE
# SINGLE PRODUCT
# ============================

@method_decorator(staff_member_required, name="dispatch")
class ProductDetailView(APIView):

    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    # GET SINGLE PRODUCT
    def get(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id
        )

        serializer = ProductSerializer(
            product,
            context={"request": request}
        )

        return Response({
            "status": "success",
            "data": serializer.data
        })

    # UPDATE PRODUCT
    def put(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id
        )

        # Partial update allows omitted fields to remain unchanged.
        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "status": "success",
                "message": "Product updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # DELETE PRODUCT
    def delete(self, request, product_id):

        product = get_object_or_404(
            Product,
            id=product_id
        )

        product.delete()

        return Response({
            "status": "success",
            "message": "Product deleted successfully"
        }, status=status.HTTP_200_OK)
        
class SingleProduct(APIView):
    def get(self,request,id):
        try:
            product = Product.objects.get(id=id)
            serializer = ProductSerializer(product)
            
            return Response({
                "data":serializer.data,
                "message":"success"
            })
        
        except Exception as e:
            return Response({
                "message" : "error at get",
                "error": str(e)
            })    


class CartView(APIView):

    # =====================================================
    # ADD PRODUCT TO CART
    # =====================================================

    def post(self, request):

        if not request.user.is_authenticated:
            return Response(
                {
                    "message": "Please login first"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {
                    "message": "Product ID is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # ---------------------------------------------
            # Get product
            # ---------------------------------------------

            product = Product.objects.get(id=product_id)

            # ---------------------------------------------
            # Get or create cart for logged-in user
            # ---------------------------------------------

            cart, created = Cart.objects.get_or_create(
                user=request.user
            )

            # ---------------------------------------------
            # Get or create CartItem
            # ---------------------------------------------

            cart_item, item_created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    "quantity": 1
                }
            )

            # ---------------------------------------------
            # If product already exists,
            # increase quantity
            # ---------------------------------------------

            if not item_created:
                cart_item.quantity += 1
                cart_item.save()

            serializer = CartSerializer(cart_item)

            return Response(
                {
                    "message": "Added to Cart",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Product.DoesNotExist:

            return Response(
                {
                    "message": "Product not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:

            print("ADD CART ERROR:", e)

            return Response(
                {
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


    # =====================================================
    # GET CART
    # =====================================================

    def get(self, request):

        if not request.user.is_authenticated:
            return Response(
                {
                    "message": "Please login first"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:

            # Get user's cart

            cart = Cart.objects.filter(
                user=request.user
            ).first()

            # User doesn't have a cart yet


            items_count = CartItem.objects.filter(
                cart__user=request.user
            ).aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            
            if not cart:
                return Response(
                    {
                        "data": [],
                        "message": "Cart is empty"
                    },
                    status=status.HTTP_200_OK
                )

            # Get CartItems

            cart_items = CartItem.objects.filter(
                cart=cart
            ).select_related("product")

            serializer = CartSerializer(
                cart_items,
                many=True
            )

            cart_total = sum(
                    item.product.price * item.quantity
                for item in cart_items
            )
            
            return Response(
                {
                    "data": serializer.data,
                    "message": "Data fetched",
                    "count" : items_count,
                    "cart_total":cart_total
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            print("GET CART ERROR:", e)

            return Response(
                {
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


    # =====================================================
    # INCREASE / DECREASE QUANTITY
    # =====================================================

    def put(self, request):

        if not request.user.is_authenticated:
            return Response(
                {
                    "message": "Please login first"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:

            cart_id = request.data.get("id")
            change = int(request.data.get("change"))

            if not cart_id:
                return Response(
                    {
                        "message": "Cart item ID is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ---------------------------------------------
            # Get CartItem belonging to user's cart
            # ---------------------------------------------

            cart_item = CartItem.objects.get(
                id=cart_id,
                cart__user=request.user
            )

            print("OLD QUANTITY:", cart_item.quantity)

            # ---------------------------------------------
            # Change quantity
            # ---------------------------------------------

            cart_item.quantity += change

            print("NEW QUANTITY:", cart_item.quantity)

            # ---------------------------------------------
            # Quantity becomes 0
            # Delete item
            # ---------------------------------------------

            if cart_item.quantity <= 0:

                cart_item.delete()

                return Response(
                    {
                        "message": "Product removed from cart"
                    },
                    status=status.HTTP_200_OK
                )

            # ---------------------------------------------
            # Save quantity
            # ---------------------------------------------

            cart_item.save()

            serializer = CartSerializer(cart_item)

            return Response(
                {
                    "message": "Quantity updated",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except CartItem.DoesNotExist:

            return Response(
                {
                    "message": "Cart item not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except (TypeError, ValueError):

            return Response(
                {
                    "message": "Invalid quantity change"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            print("UPDATE CART ERROR:", e)

            return Response(
                {
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

from django.db.models import Sum,Avg

class FeedbackView(APIView):
    
    def post(self, request,product_id):

        if not request.user.is_authenticated:
            return Response({
                "message": "Please login first",
                "status": "error"
            }, status=401)

        try:
    
            rating = int(request.data.get("rating"))
            comment =request.data.get("comment")
            Feedback.objects.update_or_create(
                user=request.user,
                defaults={
                    "rating": rating,
                    "comment": comment
                },
                product_id = product_id

            )

            return Response({
                "message": "Feedback Submitted",
                "status": "success"
            })

        except Exception as e:
            print("ERROR:", e)

            return Response({
                "message": "Comment not saved",
                "status": "error",
                "error": str(e)
            }, status=400)

    def get(self,request,product_id):
        try:
            # feedback = Feedback.objects.all()
            # product_id = request.query_params.get("product")
            feedback = Feedback.objects.filter(product_id=product_id)
            serializer = FeedbackSerializer(feedback,many=True)
            
            average = Feedback.objects.filter(
                product_id = product_id
            ).aggregate(avg=Avg("rating"))["avg"]
            
            return Response({
                "data":serializer.data,
                "message":"data fetched",
                "avg":average,
                "status":"success"
            },status=200)

        except Exception as e:
            return Response({
                "message":str(e),
                "status":"error"
            },status=400)

# ----------------pages ---------------

def signup(request):
    return render(request,"signup.html")

def home(request):
    return render(request,"index.html")

def login_page(request):
    if request.user.is_authenticated:
        return redirect("/home")
    else:
        return render(request,"login.html")

def Logout(request):
    logout(request)
    return redirect("/signin")

def signin(request):
    return render(request,"login.html")

def product(request):
    return render(request,"product.html")

def menu(request):
    return render(request,'index.html')

def why(request):
    return render(request,'index.html')

def contact(request):
    return render(request,'index.html')

def orders(request):
    return render(request,"order.html")
    

# -----------razorpay -------------------

import razorpay
import uuid

from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import F

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Order, OrderItem
from .models import Cart, CartItem

razorpay_client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET
    )
)
import uuid
import logging

from decimal import Decimal
from django.db import transaction


logger = logging.getLogger(__name__)


class CreateOrderView(APIView):

    def post(self, request):

        # 1. Check authentication
        if not request.user.is_authenticated:
            return Response(
                {"message": "Please login first"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            with transaction.atomic():

                # 2. Lock the user's cart while processing
                cart = (
                    Cart.objects
                    .select_for_update()
                    .filter(user=request.user)
                    .first()
                )

                if not cart:
                    return Response(
                        {"message": "Cart is empty"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 3. Get cart items
                cart_items = list(
                    CartItem.objects
                    .filter(cart=cart)
                    .select_related("product")
                )

                if not cart_items:
                    return Response(
                        {"message": "Cart is empty"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 4. Calculate total from database prices
                total_amount = Decimal("0.00")

                for item in cart_items:
                    total_amount += (
                        item.product.price * item.quantity
                    )

                # 5. Check for an existing pending order
                order = (
                    Order.objects
                    .filter(
                        user=request.user,
                        status="PENDING"
                    )
                    .exclude(razorpay_order_id__isnull=True)
                    .exclude(razorpay_order_id="")
                    .order_by("-id")
                    .first()
                )

                # 6. Reuse existing pending order
                if order:

                    logger.info(
                        "Reusing pending order: %s",
                        order.order_number
                    )

                    # Return the existing Razorpay order
                    return Response({
                        "message": "Pending order already exists",
                        "order_id": order.id,
                        "order_number": order.order_number,
                        "razorpay_order_id": order.razorpay_order_id,
                        "amount": int(order.total_amount * 100),
                        "currency": "INR",
                        "key": settings.RAZORPAY_KEY_ID
                    }, status=status.HTTP_200_OK)

                # 7. Create a new local order
                order_number = (
                    "ORD-" + uuid.uuid4().hex[:10].upper()
                )

                order = Order.objects.create(
                    user=request.user,
                    order_number=order_number,
                    total_amount=total_amount,
                    status="PENDING"
                )

                # 8. Create order items ONLY for the new order
                for item in cart_items:

                    price = item.product.price

                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price=price,
                        subtotal=price * item.quantity
                    )

                # 9. Create Razorpay order
                razorpay_amount = int(total_amount * 100)

                razorpay_order = razorpay_client.order.create({
                    "amount": razorpay_amount,
                    "currency": "INR",
                    "receipt": order.order_number,
                    "notes": {
                        "user_id": str(request.user.id),
                        "order_number": order.order_number
                    }
                })

                # 10. Save Razorpay order ID
                order.razorpay_order_id = razorpay_order["id"]

                order.save(
                    update_fields=["razorpay_order_id"]
                )

            # Transaction committed successfully
            return Response({
                "message": "Order created successfully",
                "order_id": order.id,
                "order_number": order.order_number,
                "razorpay_order_id": razorpay_order["id"],
                "amount": razorpay_amount,
                "currency": "INR",
                "key": settings.RAZORPAY_KEY_ID
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Create order failed")

            return Response({
                "message": "Could not create order",
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):

        if not request.user.is_authenticated:
            return Response(
                {"message": "Please login first"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            orders = (
                Order.objects
                .filter(user=request.user)
                .prefetch_related("items__product")
                .last()
            )

            serializer = OrderSerializer(orders)

            return Response({
                "message": "Orders fetched successfully",
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Fetching orders failed")

            return Response({
                "message": "Could not fetch orders",
                "status": "error",
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        
class VerifyPaymentView(APIView):

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"message": "Please login first"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({"message": "Payment details missing"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(
            razorpay_order_id=razorpay_order_id,
            user=request.user
        ).first()

        if not order:
            return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status == "PAID":
            return Response(
                {"message": "Order already paid", "order_number": order.order_number},
                status=status.HTTP_200_OK
            )

        # --- Signature check: isolated so we know exactly why it failed ---
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError as e:
            logger.warning("Signature verification failed for order %s: %s", order.order_number, e)
            return Response({"message": "Invalid payment signature"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Fetch + validate the payment itself ---
        try:
            payment = razorpay_client.payment.fetch(razorpay_payment_id)
        except Exception as e:
            logger.exception("Could not fetch payment %s", razorpay_payment_id)
            return Response({"message": "Could not verify payment with Razorpay"}, status=status.HTTP_400_BAD_REQUEST)

        if payment.get("order_id") != order.razorpay_order_id:
            return Response({"message": "Payment order mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        expected_amount = int(order.total_amount * 100)
        if payment.get("amount") != expected_amount:
            return Response({"message": "Payment amount mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        payment_status = payment.get("status")

        # Authorized-but-not-captured: try to capture it now (safety net for
        # any account/mode where payment_capture:1 on order creation wasn't enough)
        if payment_status == "authorized":
            try:
                payment = razorpay_client.payment.capture(
                    razorpay_payment_id, expected_amount
                )
                payment_status = payment.get("status")
            except Exception as e:
                logger.exception("Manual capture failed for payment %s", razorpay_payment_id)
                return Response(
                    {"message": "Payment authorized but capture failed", "payment_status": "authorized"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if payment_status != "captured":
            return Response(
                {"message": "Payment is not captured yet", "payment_status": payment_status},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.status = "PAID"
            order.razorpay_payment_id = razorpay_payment_id
            order.save(update_fields=["status", "razorpay_payment_id", "updated_at"])
            CartItem.objects.filter(cart__user=request.user).delete()

        return Response({
            "message": "Payment successful",
            "order_number": order.order_number,
            "payment_id": razorpay_payment_id,
            "status": "PAID"
        }, status=status.HTTP_200_OK)


   
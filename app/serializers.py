from .models import *
from rest_framework import serializers

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        
        
class CartSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(
        source="product.image",
        read_only=True
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    amount = serializers.SerializerMethodField()

    def get_amount(self,obj):
        return obj.product.price * obj.quantity
    
    
    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "image",
            "quantity",
            "amount"
        ]

class FeedbackSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username",read_only = True)
    class Meta:
        model = Feedback
        fields = ["id","user","username","product","comment","rating"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
        default=None
    )

    product_image = serializers.ImageField(
        source="product.image",
        read_only=True
    )
     
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "quantity",
            "price",
            "subtotal"
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "total_amount",
            "status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "created_at",
            "items"
        ]
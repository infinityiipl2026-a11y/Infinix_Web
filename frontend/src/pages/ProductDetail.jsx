import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useParams, Link } from "react-router-dom";
import { getProduct, getProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
const ProductDetail = () => {

  const { id } = useParams();

  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);

  const [allProducts, setAllProducts] =
    useState([]);

  const [quantity, setQuantity] =
    useState(1);

  const [showMessage, setShowMessage] =
    useState(false);

  useEffect(() => {

    const loadData = async () => {

      try {

        const productData =
          await getProduct(id);

        const productsData =
          await getProducts();

        setProduct(productData);

        setAllProducts(productsData);

      } catch (error) {

        console.log(error);

      }

    };

    loadData();

  }, [id]);

  if (!product) {

    return (
      <div className="container section">
        <h2>Loading...</h2>
      </div>
    );

  }

  const variants = allProducts.filter(
    (item) =>
      item.family === product.family
  );

  const relatedProducts = allProducts
    .filter(
      (item) =>
        item.category === product.category &&
        item.id !== product.id
    )
    .slice(0, 4);

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const handleAddToCart = async () => {
    await addToCart(product, quantity);

    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  return (

    <div className="container section">

      {showMessage && (

        <div className="cart-toast">

          ✓ Added {quantity}
          {" "}
          item
          {quantity > 1 ? "s" : ""}
          {" "}
          to cart

        </div>

      )}

      <div className="product-detail">

        <div className="product-detail-image">

          <img
            src={
              product.image?.startsWith("/uploads")
                ? `http://127.0.0.1:5000${product.image}`
                : product.image
            }
            alt={product.name}
          />

        </div>

        <div className="product-detail-info">

          <span className="product-category-badge">

            {product.category}

          </span>

          <h1 className="product-title">

            {product.name}

          </h1>

          <h2 className="product-price">

            ₹{product.price}

          </h2>

          {variants.length > 1 && (

            <div className="product-variants">

              <h3>
                Available Variants
              </h3>

              <div className="variant-list">

                {variants.map(
                  (item) => (

                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      className={
                        item.id === product.id
                          ? "variant-btn active"
                          : "variant-btn"
                      }
                    >

                      <img
                        src={
                          item.image?.startsWith("/uploads")
                            ? `http://127.0.0.1:5000${item.image}`
                            : item.image
                        }
                        alt={item.variant}
                      />

                      <span>
                        {item.variant}
                      </span>

                    </Link>

                  )
                )}

              </div>

            </div>

          )}

          <div className="product-meta">

            <p>
              <strong>
                Variant:
              </strong>
              {" "}
              {product.variant}
            </p>

            <p>
              <strong>
                Size:
              </strong>
              {" "}
              {product.size}
            </p>

            <p>
              <strong>
                Description:
              </strong>
              {" "}
              {product.description}
            </p>

            <p>
              <strong>
                Ingredients:
              </strong>
              {" "}
              {product.ingredients}
            </p>

          </div>

          <p className="stock">

            ✓ Available For Order

          </p>

          <div className="quantity-box">

            <button
              onClick={() =>
                quantity > 1 &&
                setQuantity(
                  quantity - 1
                )
              }
            >
              -
            </button>

            <span>
              {quantity}
            </span>

            <button
              onClick={() =>
                setQuantity(
                  quantity + 1
                )
              }
            >
              +
            </button>

          </div>

          {cartCount > 0 && (

            <p className="cart-counter">

              Cart Items:
              {" "}
              {cartCount}

            </p>

          )}

          <button
            className="btn add-cart-btn"
            onClick={
              handleAddToCart
            }
          >
            Add To Cart
          </button>

        </div>

      </div>

      <div className="related-products-section">

        <h2 className="related-title">
          You May Also Like
        </h2>

        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false
          }}
          spaceBetween={20}
          breakpoints={{
            320: {
              slidesPerView: 1
            },
            576: {
              slidesPerView: 2
            },
            768: {
              slidesPerView: 3
            },
            1200: {
              slidesPerView: 4
            }
          }}
        >

          {relatedProducts.map((item) => (

            <SwiperSlide key={item.id}>

              <ProductCard
                product={item}
              />

            </SwiperSlide>

          ))}

        </Swiper>

      </div>

    </div>

  );

};

export default ProductDetail;
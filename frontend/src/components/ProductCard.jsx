import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {

  return (

    <Link
      to={`/product/${product.id}`}
      className="product-card-link"
    >

      <div className="modern-product-card">

        <div className="product-img-box">

        <img
          src={
            product.image?.startsWith("/uploads")
              ? `http://127.0.0.1:5000${product.image}`
              : product.image
          }
          alt={product.name}
          className="product-image"
        />

        </div>

        <div className="product-details">

          <span className="product-category">
            {product.category.toUpperCase()}
          </span>

          <h3>
            {product.name}
          </h3>

          <p className="product-variant">
            {product.variant}
          </p>

          <div className="product-bottom">

            <span className="price">
              ₹{product.price}
            </span>

            <span className="size">
              {product.size}
            </span>

          </div>

        </div>

      </div>

    </Link>

  );

};

export default ProductCard;
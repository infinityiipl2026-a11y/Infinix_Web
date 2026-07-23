import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProducts } from "../api/products";


const Home = () => {

  const [featuredProducts, setFeaturedProducts] =
  useState([]);

const [productsCount, setProductsCount] =
  useState(0);

const [customerCount, setCustomerCount] =
  useState(0);

const [cityCount, setCityCount] =
  useState(0);

const [yearCount, setYearCount] =
  useState(0);

useEffect(() => {

  const loadProducts = async () => {

    try {

      const data =
        await getProducts();

      setFeaturedProducts(
        data.slice(0, 4)
      );

    } catch (error) {

      console.error(error);

    }

  };

  loadProducts();

}, []);

useEffect(() => {

  const interval = setInterval(() => {

    setProductsCount(prev =>
      prev < 25 ? prev + 1 : 25
    );

    setCustomerCount(prev =>
      prev < 10000
        ? prev + 200
        : 10000
    );

    setCityCount(prev =>
      prev < 50 ? prev + 1 : 50
    );

    setYearCount(prev =>
      prev < 5 ? prev + 1 : 5
    );

  }, 40);

  return () =>
    clearInterval(interval);

}, []);

  return (
    <>

      {/* HERO */}

      <section className="hero">

        <div className="container hero-container">

          <div className="hero-banner">

            <img
              src="/images/hero-banner.jpg"
              alt="Infinity Products"
              fetchpriority="high"
              width="800"
              height="600"
            />

          </div>

          <div className="hero-content">

            <h1>
              Welcome To
              <br />
              Infinix
            </h1>

            <p>
              Discover Household,
              Perfumes & Cosmetics
              at Best Prices
            </p>

            <a
              href="/shop"
              className="btn"
            >
              Shop Now
            </a>

          </div>

        </div>

      </section>

{/* SHOP BY CATEGORY */}

<section className="category-section">

  <div className="container">

    <h2 className="category-title">
      Shop By Category
    </h2>

    <div className="category-slider">

      {/* Household & Hygiene */}

{/* Household & Hygiene */}

        <Link
          to="/shop?category=Household%20%26%20Hygiene"
          className="circle-category"
        >

        <div className="circle-img">

          <img
            src="/images/categories/household.png"
            alt="Household & Hygiene"
            loading="lazy"
            width="120"
            height="120"
          />

        </div>

        <h3>
          HOUSEHOLD & HYGIENE
        </h3>

      </Link>

      {/* Personal Care */}

      <Link
        to="/shop?category=Personal Care"
        className="circle-category"
      >

        <div className="circle-img">

          <img
            src="/images/categories/personal.png"
            alt="Personal Care"
            loading="lazy"
            width="120"
            height="120"
          />

        </div>

        <h3>
          PERSONAL CARE
        </h3>

      </Link>

        {/* Fragrance & Grooming */}

        <Link
          to="/shop?category=Fragrance%20%26%20Grooming"
          className="circle-category"
        >

        <div className="circle-img">

          <img
            src="/images/categories/fragrance.png"
            alt="Fragrance & Grooming"
            loading="lazy"
            width="120"
            height="120"
          />

        </div>

        <h3>
          FRAGRANCE & GROOMING
        </h3>

      </Link>

    </div>

  </div>

</section>

      {/* FEATURED PRODUCTS */}

      <section className="section">

        <div className="container">

          <h2 className="page-title">
            Featured Products
          </h2>

          <div className="products-grid">

        {featuredProducts.length > 0 ? (

          featuredProducts.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            )
          )

        ) : (

          <p>
            Loading Products...
          </p>

        )}

          </div>

        </div>

      </section>

      {/* PRODUCT SHOWCASE */}

      <section className="showcase-section">

        <div className="container showcase-container">

          <div className="showcase-image">

            <img
              src="/images/Infinix Product Images/Gel/Aloevera.jpg"
              alt="Aloe Vera Gel"
              loading="lazy"
              width="500"
              height="500"
            />

          </div>

          <div className="showcase-content">

            <span className="showcase-tag">
              BEST SELLING PRODUCT
            </span>

            <h2>
              Infinix Aloe Vera Gel
            </h2>

            <p>

              Enriched with natural
              Aloe Vera to hydrate,
              nourish and protect
              your skin. Perfect for
              everyday skincare and
              haircare routines.

            </p>

            <a
              href="/shop"
              className="btn"
            >
              Shop Now
            </a>

          </div>

        </div>

      </section>

      {/* WHY CUSTOMERS LOVE INFINIX */}

      <section className="section">

        <div className="container">

          <h2 className="page-title">
            Why Customers Love Infinix
          </h2>

          <div className="love-grid">

            <div className="love-card">

              <h3>
                 Premium Quality
              </h3>

              <p>
                Every product
                undergoes strict
                quality checks.
              </p>

            </div>

            <div className="love-card">

              <h3>
                 Affordable Pricing
              </h3>

              <p>
                Premium products
                at budget friendly
                prices.
              </p>

            </div>

            <div className="love-card">

              <h3>
                 Easy Availability
              </h3>

              <p>
                Products available
                across multiple
                regions.
              </p>

            </div>

            <div className="love-card">

              <h3>
                 Customer Trust
              </h3>

              <p>
                Building relationships
                through quality and
                service.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* STATISTICS */}

      <section className="stats-section">

        <div className="container stats-grid">

          <div>

            <h2>
 {productsCount}+           
             </h2>

            <p>
              Products
            </p>

          </div>

          <div>

            <h2>
            {customerCount.toLocaleString()}+
            </h2>

            <p>
              Happy Customers
            </p>

          </div>

          <div>

            <h2>
              {cityCount}+
            </h2>

            <p>
              Cities Served
            </p>

          </div>

          <div>

            <h2>
              {yearCount}+
            </h2>

            <p>
              Years Experience
            </p>

          </div>

        </div>

      </section>

      {/* BRAND PROMISE */}

      <section className="promise-section">

        <div className="container">

          <h2>
            Our Promise
          </h2>

          <p>

            At Infinix, we are
            committed to delivering
            innovative, reliable and
            affordable consumer
            products that enhance
            everyday life.

          </p>

          <div className="promise-list">

            <span>
              ✓ Quality Assured
            </span>

            <span>
              ✓ Customer Focused
            </span>

            <span>
              ✓ Affordable Excellence
            </span>

            <span>
              ✓ Trusted Across India
            </span>

          </div>

        </div>

      </section>

    </>
  );
};

export default Home;
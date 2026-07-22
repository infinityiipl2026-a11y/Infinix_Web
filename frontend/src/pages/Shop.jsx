import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

import { getProducts } from "../api/products";

const Shop = () => {

  const location = useLocation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [products, setProducts] = useState([]);

  useEffect(() => {

    const loadProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };

    loadProducts();

  }, []);

  useEffect(() => {

    const params =
      new URLSearchParams(location.search);

    const searchValue =
      params.get("search");

    const categoryValue =
      params.get("category");

    setSearch(searchValue || "");
    setCategory(categoryValue || "");

  }, [location]);

  let filteredProducts = products.filter((product) =>

    (

      (product.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      (product.category || "")
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      (product.variant || "")
        .toLowerCase()
        .includes(search.toLowerCase())

    )

    &&

    (

      category === ""

      ||

      (

        category === "Household & Hygiene"

        &&

        [
          "Household",
          "Hand Wash",
          "Sanitizer"
        ].includes(product.category)

      )

      ||

      (

        category === "Personal Care"

        &&

        [
          "Gel",
          "Soap",
          "Cosmetics",
          "Wipes"
        ].includes(product.category)

      )

      ||

      (

        category === "Fragrance & Grooming"

        &&

        [
          "Perfumes",
          "Body Mist",
          "Talcum",
          "No Gas Deodorant"
        ].includes(product.category)

      )

      ||

      product.category === category

    )

  );

  if (sort === "low") {

    filteredProducts.sort(
      (a, b) => a.price - b.price
    );

  }

  if (sort === "high") {

    filteredProducts.sort(
      (a, b) => b.price - a.price
    );

  }

  if (sort === "name") {

    filteredProducts.sort(
      (a, b) =>
        a.name.localeCompare(b.name)
    );

  }

  return (

    <div className="container section">

      <h1 className="page-title">
        Infinix Product Collection
      </h1>

      <p className="shop-subtitle">
        Explore perfumes, cosmetics,
        hygiene and household products.
      </p>

      <div className="filters">

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        <CategoryFilter
          category={category}
          setCategory={setCategory}
        />

        <select
          className="filter-input"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >

          <option value="latest">
            Latest Products
          </option>

          <option value="low">
            Price Low To High
          </option>

          <option value="high">
            Price High To Low
          </option>

          <option value="name">
            Name A-Z
          </option>

        </select>

      </div>

      <div className="products-grid">

        {filteredProducts.length > 0 ? (

          filteredProducts.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            )
          )

        ) : (

          <h2
            style={{
              textAlign: "center",
              gridColumn: "1 / -1"
            }}
          >
            No Products Found
          </h2>

        )}

      </div>

    </div>

  );

};

export default Shop;
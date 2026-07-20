import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../api/products";
import { updateProduct } from "../services/api";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    family: "",
    name: "",
    category: "",
    variant: "",
    size: "",
    price: "",
    image: "",
    description: "",
    ingredients: ""
  });
  const [message, setMessage] = useState("");

  const loadProduct = async () => {
    try {
      const data = await getProduct(id);
      if (data && !data.message) {
        setForm({
          family: data.family || "",
          name: data.name || "",
          category: data.category || "",
          variant: data.variant || "",
          size: data.size || "",
          price: data.price || "",
          image: data.image || "",
          description: data.description || "",
          ingredients: data.ingredients || ""
        });
      } else {
        setMessage(data?.message || "Failed to load product.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error.");
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await updateProduct(id, form);
      if (data.success) {
        navigate("/admin");
      } else {
        setMessage(data.message || "Failed to update product.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error.");
    }
  };

  return (
    <div className="container section">
      <h1>Edit Product</h1>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <form className="product-form" onSubmit={handleSubmit}>
        <input name="family" value={form.family} onChange={handleChange} placeholder="Family" required />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required />
        <input name="variant" value={form.variant} onChange={handleChange} placeholder="Variant" required />
        <input name="size" value={form.size} onChange={handleChange} placeholder="Size" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" step="0.01" required />
        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <textarea name="ingredients" value={form.ingredients} onChange={handleChange} placeholder="Ingredients" required />
        <button className="btn" type="submit">Update Product</button>
      </form>
    </div>
  );
};

export default EditProduct;

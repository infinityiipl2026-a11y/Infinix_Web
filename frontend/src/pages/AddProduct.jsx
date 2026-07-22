import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/api";

const AddProduct = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    family: "",
    name: "",
    category: "",
    variant: "",
    size: "",
    price: "",
    image: null,
    description: "",
    ingredients: ""
  });

  const [message, setMessage] =
    useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData =
      new FormData();

    formData.append(
      "family",
      form.family
    );

    formData.append(
      "name",
      form.name
    );

    formData.append(
      "category",
      form.category
    );

    formData.append(
      "variant",
      form.variant
    );

    formData.append(
      "size",
      form.size
    );

    formData.append(
      "price",
      form.price
    );

    formData.append(
      "image",
      form.image
    );

    formData.append(
      "description",
      form.description
    );

    formData.append(
      "ingredients",
      form.ingredients
    );

    try {

      const data =
        await addProduct(formData);

      if (data.success) {

        navigate("/admin");

      } else {

        setMessage(
          data.message
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Server Error"
      );

    }

  };

  return (

    <div className="admin-container">

      <h1 className="admin-title">
        Add Product
      </h1>

      {message && (

        <p
          style={{
            color: "red",
            marginBottom: "15px"
          }}
        >
          {message}
        </p>

      )}

      <form
        className="admin-form"
        onSubmit={handleSubmit}
      >

        <input
          name="family"
          placeholder="Family"
          value={form.family}
          onChange={handleChange}
          required
        />

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >

          <option value="">
            Select Category
          </option>

          <optgroup label="Household & Hygiene">
            <option value="Household">Household</option>
            <option value="Hand Wash">Hand Wash</option>
            <option value="Sanitizer">Sanitizer</option>
          </optgroup>

          <optgroup label="Personal Care">
            <option value="Gel">Gel</option>
            <option value="Soap">Soap</option>
            <option value="Cosmetics">Cosmetics</option>
            <option value="Wipes">Wipes</option>
          </optgroup>

          <optgroup label="Fragrance & Grooming">
            <option value="Perfumes">Perfumes</option>
            <option value="Body Mist">Body Mist</option>
            <option value="Talcum">Talcum</option>
            <option value="No Gas Deodorant">No Gas Deodorant</option>
          </optgroup>

        </select>

        <input
          name="variant"
          placeholder="Variant"
          value={form.variant}
          onChange={handleChange}
          required
        />

        <input
          name="size"
          placeholder="Size"
          value={form.size}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({
              ...form,
              image:
                e.target.files[0]
            })
          }
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <textarea
          name="ingredients"
          placeholder="Ingredients"
          value={form.ingredients}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="btn"
        >
          Save Product
        </button>

      </form>

    </div>

  );

};

export default AddProduct;
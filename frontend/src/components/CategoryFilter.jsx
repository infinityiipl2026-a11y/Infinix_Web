const CategoryFilter = ({
  category,
  setCategory
}) => {

  return (

    <select
      value={category}
      onChange={(e) =>
        setCategory(
          e.target.value
        )
      }
      className="filter-input"
    >

      <option value="">
        All Categories
      </option>

      <option value="Household & Hygiene">
        Household & Hygiene
      </option>

      <option value="Personal Care">
        Personal Care
      </option>

      <option value="Fragrance & Grooming">
        Fragrance & Grooming
      </option>

    </select>

  );

};

export default CategoryFilter;
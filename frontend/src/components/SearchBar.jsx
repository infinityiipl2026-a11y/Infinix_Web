const SearchBar = ({ search, setSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search Products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="filter-input"
    />
  );
};

export default SearchBar;
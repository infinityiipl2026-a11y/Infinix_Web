import {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";

const SearchContext =
  createContext();

export const SearchProvider = ({
  children
}) => {

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  // Without useMemo, this object literal is a brand-new reference every
  // time SearchProvider renders, which forces every consumer of
  // useSearch() to re-render too - even ones that don't care about
  // searchTerm - since SearchProvider sits near the root of the app.
  const value = useMemo(
    () => ({ searchTerm, setSearchTerm }),
    [searchTerm]
  );

  return (

    <SearchContext.Provider
      value={value}
    >

      {children}

    </SearchContext.Provider>

  );

};

export const useSearch = () =>
  useContext(SearchContext);
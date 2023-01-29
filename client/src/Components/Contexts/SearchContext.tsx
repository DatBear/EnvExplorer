import React, { createContext, useState } from "react";

type SearchContextType = {
  search: string;
  setSearch: (search: string) => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export default SearchContext;


export function SearchContextProvider({ children } : React.PropsWithChildren){
  const [search, setSearchState] = useState('');

  const setSearch = (search: string) => {
    setSearchState(search);
  }

  return (
    <SearchContext.Provider value={{search, setSearch}}>
      {children}
    </SearchContext.Provider>
  );
};

export function useSearch() {
  return React.useContext(SearchContext)!;
}
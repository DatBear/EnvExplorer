import React, { createContext, useState } from "react";
import MissingParameterResponse from "../../Data/Model/MissingParameterResponse";
import ParameterGroupResponse from "../../Data/Model/ParameterGroupResponse";
import ParameterValueResponse from "../../Data/Model/ParameterValueResponse";

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



export function searchFilterParameter(search: string | null, param: ParameterValueResponse) : boolean {
  if(search === null || search === '') return true;
  return param.name.toLowerCase().indexOf(search) > -1 || param.value.toLowerCase().indexOf(search) > -1;
}

export function searchFilterGroup(search: string | null, group: ParameterGroupResponse) : boolean {
  if(search === null || search === '') return true;
  return group.children.find(x => x.name.toLowerCase().indexOf(search) >= 0) != null 
        || group.parameters.find(x => searchFilterParameter(search, x)) != null
        || group.children.find(x => searchFilterGroup(search, x)) != null;
}

export function searchFilterMissingParameter(search: string | null, missingParam: MissingParameterResponse) : boolean {
  if(search === null || search === '') return true;
  return missingParam.name.indexOf(search) >= 0 || missingParam.parameters.find(x => x.name.toLowerCase().indexOf(search) >= 0 || x.value!.toLowerCase().indexOf(search) >= 0) != null;
}


export function useSearch() {
  return React.useContext(SearchContext)!;
}
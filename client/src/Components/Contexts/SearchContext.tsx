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


export function SearchContextProvider({ children }: React.PropsWithChildren) {
  const [search, setSearchState] = useState('');

  const setSearch = (search: string) => {
    setSearchState(search);
  }

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
};



export function searchFilterParameter(search: string | null, param: ParameterValueResponse): boolean {
  if (search === null || search === '') return true;
  if (isValidRegex(search)) {
    const regex = new RegExp(search, 'i');
    return regex.test(param.name) || regex.test(param.value);
  }
  return param.name.toLowerCase().indexOf(search) > -1 || param.value.toLowerCase().indexOf(search) > -1;
}

export function searchFilterGroup(search: string | null, group: ParameterGroupResponse): boolean {
  if (search === null || search === '') return true;
  const regex = isValidRegex(search) ? new RegExp(search, 'i') : null;
  return group.children.find(x => regex?.test(x.name) ?? x.name.toLowerCase().indexOf(search) >= 0) != null
    || group.parameters.find(x => searchFilterParameter(search, x)) != null
    || group.children.find(x => searchFilterGroup(search, x)) != null;
}

export function searchFilterMissingParameter(search: string | null, missingParam: MissingParameterResponse): boolean {
  if (search === null || search === '') return true;
  const regex = isValidRegex(search) ? new RegExp(search, 'i') : null;
  return (regex?.test(missingParam.name) ?? missingParam.name.indexOf(search) >= 0)
    || missingParam.parameters
      .find(x => (regex?.test(x.name) ?? x.name.toLowerCase().indexOf(search) >= 0) || (regex?.test(x.value!) ?? x.value!.toLowerCase().indexOf(search) >= 0)) != null;
}

function isValidRegex(regex: string) {
  try {
    new RegExp(regex);
    return true;
  } catch (e) {
    return false;
  }
}


export function useSearch() {
  return React.useContext(SearchContext)!;
}
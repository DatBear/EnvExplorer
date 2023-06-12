import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearch } from "./Contexts/SearchContext";

export function SearchBar() {
  const { search, setSearch } = useSearch();

  return <div className="flex items-center bg-inherit rounded-md border border-emerald-800">
    <FontAwesomeIcon icon={faSearch} className="p-2" />
    <input className="ml-2 outline-none bg-inherit" placeholder="Filter parameters"
      value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
  </div>
}

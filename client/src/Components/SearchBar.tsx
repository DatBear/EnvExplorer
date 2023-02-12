import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, InputGroup } from "react-bootstrap";
import { useSearch } from "./Contexts/SearchContext";


export function SearchBar() {
  const { search, setSearch } = useSearch();


  return (<>
    <InputGroup>
      <InputGroup.Text id="search"><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
      <Form.Control
        placeholder="Filter parameters"
        aria-label="Filter parameters"
        aria-describedby="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
      // ref={searchRef.current}
      />
    </InputGroup>
  </>);
}
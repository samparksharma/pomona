import "./FruitSearch.css";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FruitSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] =
    useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(
      async () => {
        try {
          const response =
            await axios.get(
              `http://localhost:5000/api/fruits/search?q=${query}`
            );

          setSuggestions(
            response.data
          );
        } catch (error) {
          console.log(error);
        }
      },
      300
    );

    return () =>
      clearTimeout(timeout);
  }, [query]);

  return (
    <div className="fruit-search-wrapper">

      <div className="fruit-search">

        <input
          type="text"
          placeholder="Search fruits..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
        />

        <span className="search-icon">
          <FiSearch />
        </span>

      </div>

      {suggestions.length > 0 && (
        <div className="search-dropdown">

          {suggestions.map(
            (fruit) => (
              <div
                key={fruit._id}
                className="search-item"
                onClick={() =>
                  navigate(
                    `/fruit/${fruit._id}`
                  )
                }
              >
                {fruit.name}
              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default FruitSearch;
import "./FruitSearch.css";
import { FiSearch } from "react-icons/fi";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FruitSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] =
    useState([]);

  const [selectedIndex, setSelectedIndex] =
    useState(-1);

  const navigate = useNavigate();

  const searchRef = useRef(null);

  // -----------------------------------------
  // Search MongoDB
  // -----------------------------------------

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/fruits/search?q=${encodeURIComponent(
            query.trim()
          )}`
        );

        setSuggestions(response.data);

        // Start with nothing selected
        setSelectedIndex(-1);
      } catch (error) {
        console.log(
          "Fruit search failed:",
          error
        );

        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // -----------------------------------------
  // Close dropdown on outside click
  // -----------------------------------------

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // -----------------------------------------
  // Select fruit
  // -----------------------------------------

  function handleFruitClick(fruit) {
    setSuggestions([]);
    setSelectedIndex(-1);
    setQuery("");

    navigate(`/fruit/${fruit._id}`);
  }

  // -----------------------------------------
  // Keyboard navigation
  // -----------------------------------------

  function handleKeyDown(event) {
    if (!suggestions.length) {
      return;
    }

    // Arrow Down
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (
          current ===
          suggestions.length - 1
        ) {
          return 0;
        }

        return current + 1;
      });
    }

    // Arrow Up
    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (current <= 0) {
          return suggestions.length - 1;
        }

        return current - 1;
      });
    }

    // Enter
    if (
      event.key === "Enter" &&
      selectedIndex >= 0
    ) {
      event.preventDefault();

      handleFruitClick(
        suggestions[selectedIndex]
      );
    }

    // Escape
    if (event.key === "Escape") {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }

  return (
    <div
      className="fruit-search-wrapper"
      ref={searchRef}
    >
      <div className="fruit-search">
        <input
          type="text"
          placeholder="Search fruits..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <span className="search-icon">
          <FiSearch />
        </span>
      </div>

      {suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map(
            (fruit, index) => (
              <div
                key={fruit._id}
                className={`search-item ${
                  selectedIndex === index
                    ? "selected"
                    : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFruitClick(fruit);
                }}
                onMouseEnter={() =>
                  setSelectedIndex(index)
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
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";

const placeholders = [
  "Learn every fruit's history...",
  "Search by Latin name...",
  "Discover nature's encyclopedia...",
  "Become a fructophile...",
  "Explore seasonal fruits...",
  "Find your next favorite fruit...",
];

function SearchBar({ value, onChange, onSubmit }) {
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = placeholders[index];

    let timeout;

    if (!deleting) {
      if (placeholder.length < current.length) {
        timeout = setTimeout(() => {
          setPlaceholder(
            current.slice(0, placeholder.length + 1)
          );
        }, 45);
      } else {
        timeout = setTimeout(() => {
          setDeleting(true);
        }, 1800);
      }
    } else {
      if (placeholder.length > 0) {
        timeout = setTimeout(() => {
          setPlaceholder(
            current.slice(0, placeholder.length - 1)
          );
        }, 25);
      } else {
        setDeleting(false);

        setIndex(
          (prev) => (prev + 1) % placeholders.length
        );
      }
    }

    return () => clearTimeout(timeout);
  }, [placeholder, deleting, index]);

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (onSubmit) {
        onSubmit();
      }
    }
  }

  return (
    <div className="discover-search-wrapper">
      <div className="discover-search-box">
        <FiSearch className="discover-search-icon" />

        <input
          type="text"
          className="discover-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <span className="cursor"></span>
      </div>
    </div>
  );
}

export default SearchBar;
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

function SearchBar() {
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = placeholders[index];

    let timeout;

    if (!deleting) {
      if (placeholder.length < current.length) {
        timeout = setTimeout(() => {
          setPlaceholder(current.slice(0, placeholder.length + 1));
        }, 45);
      } else {
        timeout = setTimeout(() => {
          setDeleting(true);
        }, 1800);
      }
    } else {
      if (placeholder.length > 0) {
        timeout = setTimeout(() => {
          setPlaceholder(current.slice(0, placeholder.length - 1));
        }, 25);
      } else {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % placeholders.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [placeholder, deleting, index]);

  return (
    <div className="search-wrapper">
      <div className="search-box">
        <FiSearch className="search-icon" />

        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
        />

        <span className="cursor"></span>
      </div>
    </div>
  );
}

export default SearchBar;
import {
  Link,
  useLocation,
} from "react-router-dom";

import "./FruitCard.css";

function FruitCard({ fruit }) {
  const location = useLocation();

  return (
    <Link
      to={`/fruit/${fruit._id}`}
      state={{
        backgroundLocation: location,
      }}
      className="fruit-card"
    >
      <div className="fruit-image">
        <img
          src={
            fruit.heroImage ||
            `https://placehold.co/600x400?text=${encodeURIComponent(
              fruit.name
            )}`
          }
          alt={fruit.name}
          loading="lazy"
        />
      </div>

      <div className="fruit-content">
        <h3>{fruit.name}</h3>

        {fruit.latinName && (
          <p className="fruit-card-latin-name">
            <em>{fruit.latinName}</em>
          </p>
        )}

        <span className="learn-more">
          Explore
          <span>→</span>
        </span>
      </div>
    </Link>
  );
}

export default FruitCard;
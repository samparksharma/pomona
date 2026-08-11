import { Link } from "react-router-dom";
import "./FruitCard.css";

function FruitCard({ fruit }) {
  return (
    <article className="fruit-card">
      <div className="fruit-image">
        <img
          src={
            fruit.heroImage ||
            "https://placehold.co/600x400?text="+fruit.name
          }
          alt={fruit.name}
          loading="lazy"
        />
      </div>

      <div className="fruit-content">
        <h3>{fruit.name}</h3>

        <p className="latin-name">
          <em>{fruit.latinName}</em>
        </p>

        <Link
          to={`/fruit/${fruit._id}`}
          className="learn-more"
        >
          Explorare
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

export default FruitCard;
import "./FruitCard.css";

function FruitCard({ fruit }) {
  return (
    <article className="fruit-card">

      <div className="fruit-image">
        <img
          src={fruit.image}
          alt={fruit.name}
        />
      </div>

      <div className="fruit-content">

        <h3>{fruit.name}</h3>

        <p className="latin-name">
          <em>{fruit.latin}</em>
        </p>

        <button className="learn-more">
          Explorare
          <span>→</span>
        </button>

      </div>

    </article>
  );
}

export default FruitCard;
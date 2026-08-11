import "./FruitHero.css";

function FruitHero({ fruit, image }) {
  return (
    <section className="hero-section">
      <img
        src={image}
        alt={fruit.fruit.name}
        className="hero-image"
      />

      <div className="hero-content">
        <h1>{fruit.fruit.name}</h1>

        <p className="latin-name">
          {fruit.fruit.latinName}
        </p>
      </div>
    </section>
  );
}

export default FruitHero;
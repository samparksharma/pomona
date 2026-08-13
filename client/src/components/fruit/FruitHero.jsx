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
        <div className="hero-title">
          <h1>{fruit.fruit.name}</h1>

          {fruit.fruit.latinName && (
            <p className="latin-name">
              {fruit.fruit.latinName}
            </p>
          )}
        </div>

        {fruit.fruit.family && (
          <div className="hero-taxonomy">
            <p>
              <span>Family</span>
              {fruit.fruit.family}
            </p>

            {fruit.fruit.genus && (
              <p>
                <span>Genus</span>
                {fruit.fruit.genus}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default FruitHero;
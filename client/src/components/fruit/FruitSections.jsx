import "./FruitSections.css";

function FruitSections({ fruit }) {
  return (
    <>
      <section
        id="overview"
        className="content-section"
      >
        <h2>Overview</h2>

        <p>
          {fruit.wikipedia?.extract ||
            "Information coming soon."}
        </p>
      </section>

      <section
        id="history"
        className="content-section"
      >
        <h2>Origin & History</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="nutrition"
        className="content-section"
      >
        <h2>Nutrition</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="growing"
        className="content-section"
      >
        <h2>Growing Conditions</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="harvest"
        className="content-section"
      >
        <h2>Harvest</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="diseases"
        className="content-section"
      >
        <h2>Diseases</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="companion"
        className="content-section"
      >
        <h2>Companion Plants</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="cultivars"
        className="content-section"
      >
        <h2>Cultivars</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="facts"
        className="content-section"
      >
        <h2>Interesting Facts</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="science"
        className="content-section"
      >
        <h2>Scientific Facts</h2>

        <p>
          Information coming soon.
        </p>
      </section>

      <section
        id="gallery"
        className="content-section"
      >
        <h2>Gallery</h2>

        <p>
          Gallery coming soon.
        </p>
      </section>

      <section
        id="references"
        className="content-section"
      >
        <h2>References</h2>

        <p>
          References coming soon.
        </p>
      </section>
    </>
  );
}

export default FruitSections;
import "./FruitSections.css";

function FruitSections({ fruit }) {
  const data = fruit.fruit;

  return (
    <>
      {/* Overview */}
      <section
        id="overview"
        className="content-section"
      >
        <h2>Overview</h2>

        <p>
          {data.overview ||
            "Information coming soon."}
        </p>
      </section>

      {/* Origin & History */}
      <section
        id="history"
        className="content-section"
      >
        <h2>Origin & History</h2>

        {data.originHistory?.summary && (
          <p>
            {data.originHistory.summary}
          </p>
        )}

        {data.originHistory?.originRegion && (
          <div className="sub-section">
            <h3>Origin Region</h3>
            <p>
              {data.originHistory.originRegion}
            </p>
          </div>
        )}

        {data.originHistory?.detailedHistory && (
          <div className="sub-section">
            <h3>History</h3>
            <p>
              {data.originHistory.detailedHistory}
            </p>
          </div>
        )}

        {data.originHistory?.historicalSpread && (
          <div className="sub-section">
            <h3>Historical Spread</h3>
            <p>
              {data.originHistory.historicalSpread}
            </p>
          </div>
        )}

        {data.originHistory?.culturalImportance && (
          <div className="sub-section">
            <h3>Cultural Importance</h3>
            <p>
              {data.originHistory.culturalImportance}
            </p>
          </div>
        )}
      </section>

      {/* Nutrition */}
      <section
        id="nutrition"
        className="content-section"
      >
        <h2>Nutrition</h2>

        <p>
          {data.nutrition ||
            "Nutrition information coming soon."}
        </p>
      </section>

      {/* Growing Conditions */}
      <section
        id="growing"
        className="content-section"
      >
        <h2>Growing Conditions</h2>

        <p>
          {data.growingConditions ||
            "Growing information coming soon."}
        </p>
      </section>

      {/* Harvest */}
      <section
        id="harvest"
        className="content-section"
      >
        <h2>Harvest</h2>

        <p>
  {data.harvest?.description ||
    "Harvest information coming soon."}
</p>
      </section>

      {/* Diseases */}
      <section
        id="diseases"
        className="content-section"
      >
        <h2>Diseases</h2>

        <p>
          {data.diseases ||
            "Disease information coming soon."}
        </p>
      </section>

      {/* Companion Plants */}
      <section
        id="companion"
        className="content-section"
      >
        <h2>Companion Plants</h2>

        <p>
          {data.companionPlants ||
            "Companion plant information coming soon."}
        </p>
      </section>

      {/* Cultivars */}
      <section
        id="cultivars"
        className="content-section"
      >
        <h2>Cultivars</h2>

        <p>
          {data.cultivars ||
            "Cultivar information coming soon."}
        </p>
      </section>

      {/* Interesting Facts */}
      <section
        id="facts"
        className="content-section"
      >
        <h2>Interesting Facts</h2>

        {data.interestingFacts?.length > 0 ? (
          <ul className="fact-list">
            {data.interestingFacts.map(
              (fact, index) => (
                <li key={index}>{fact}</li>
              )
            )}
          </ul>
        ) : (
          <p>
            Interesting facts coming soon.
          </p>
        )}
      </section>

      {/* Scientific Facts */}
      <section
        id="science"
        className="content-section"
      >
        <h2>Scientific Facts</h2>

        {data.scientificFacts?.length > 0 ? (
          <ul className="fact-list">
            {data.scientificFacts.map(
              (fact, index) => (
                <li key={index}>{fact}</li>
              )
            )}
          </ul>
        ) : (
          <p>
            Scientific facts coming soon.
          </p>
        )}
      </section>

      {/* Gallery */}
      <section
        id="gallery"
        className="content-section"
      >
        <h2>Gallery</h2>

        {data.gallery?.length > 0 ? (
          <div className="fruit-gallery">
            {data.gallery.map(
              (image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${data.name} ${index + 1}`}
                />
              )
            )}
          </div>
        ) : (
          <p>Gallery coming soon.</p>
        )}
      </section>

      {/* References */}
      <section
        id="references"
        className="content-section"
      >
        <h2>References</h2>

        {data.wikipediaTitle ? (
          <p>
            Wikipedia: {data.wikipediaTitle}
          </p>
        ) : (
          <p>
            References coming soon.
          </p>
        )}
      </section>
    </>
  );
}

export default FruitSections;
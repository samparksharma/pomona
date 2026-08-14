import "./FruitGenerationLoading.css";
import { useEffect, useMemo, useState } from "react";
import weirdFacts from "../../data/weirdFacts";

function FruitGenerationLoading() {
  const [timeLeft, setTimeLeft] = useState(60);

  const facts = useMemo(() => {
    return [...weirdFacts].sort(
      () => Math.random() - 0.5
    );
  }, []);

  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const factTimer = setInterval(() => {
      setFactIndex((prev) =>
        prev + 1 < facts.length ? prev + 1 : 0
      );
    }, 5000);

    return () => clearInterval(factTimer);
  }, [facts.length]);

  const currentFact = facts[factIndex];

  return (
    <div className="fruit-generation-loading">
      <div className="generation-card">

        <div className="generation-spinner">
          <div />
        </div>

        <h2>Pomona is busy.</h2>

        <p className="generation-message">
          Preparing your fruit entry...
        </p>

        <div className="generation-timer">
          {String(
            Math.floor(timeLeft / 60)
          ).padStart(2, "0")}
          :
          {String(
            timeLeft % 60
          ).padStart(2, "0")}
        </div>

        {currentFact && (
          <div className="weird-fact">
            <span className="weird-fact-tag">
              {currentFact.tag}
            </span>

            <p>{currentFact.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FruitGenerationLoading;
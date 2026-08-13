import Navbar from "../components/layout/Navbar";
import FruitSidebar from "../components/fruit/FruitSidebar";
import FruitSections from "../components/fruit/FruitSections";
import FruitHero from "../components/fruit/FruitHero";
import FruitLoading from "../components/fruit/FruitLoading";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./FruitDetails.css";

function FruitDetails() {
  const { id } = useParams();

  const [fruit, setFruit] = useState(null);

  useEffect(() => {
    fetchFruit();
  }, [id]);

  async function fetchFruit() {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/fruits/${id}/details`
      );

      setFruit(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  if (!fruit) {
    return <FruitLoading />;
  }

  const image =
    fruit.wikipedia?.thumbnail?.source ||
    fruit.fruit.heroImage ||
    "https://placehold.co/1200x700?text=" +
      fruit.fruit.name;

 return (
  <>
    <Navbar light={true} 
     showBack={true}
     showSearch={true}
     />

    <div className="fruit-layout">

      <FruitSidebar />

      <main className="fruit-main">

        <FruitHero
          fruit={fruit}
          image={image}
        />

        <FruitSections
          fruit={fruit}
        />

      </main>

    </div>
  </>
);
}

export default FruitDetails;
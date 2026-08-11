import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import FruitCard from "./FruitCard";

export default function MasonryGrid({ fruits }) {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{
        0: 2,
        768: 3,
        1024: 4,
        1440: 5,
      }}
    >
      <Masonry gutter="24px">
        {fruits.map((fruit) => (
          <FruitCard
            key={fruit._id}
            fruit={fruit}
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
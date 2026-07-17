import "./Explore.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Explore() {
  return (
    <section className="explore">

      <div className="explore-left">

    <div className="bowl-target"></div>

</div>

      <div className="explore-right">

        <motion.h2
          className="explore-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Everything <br />
          about every fruit.
        </motion.h2>

        <motion.p
          className="explore-text"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Discover nutrition, origins, seasons, history,
          scientific names, cultivation, and beautiful imagery—
          all thoughtfully organized in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link to="/about" className="explore-btn">
            Our Story →
          </Link>
        </motion.div>

      </div>

    </section>
  );
}

export default Explore;
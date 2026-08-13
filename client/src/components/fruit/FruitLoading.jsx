import "./FruitLoading.css";
import { motion } from "framer-motion";

function FruitLoading() {
  return (
    <div className="fruit-loading">
      <div className="fruit-loading-inner">

        <motion.div
          className="fruit-loading-orbit"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span />
        </motion.div>

        <motion.p
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Preparing your fruit...
        </motion.p>

      </div>
    </div>
  );
}

export default FruitLoading;
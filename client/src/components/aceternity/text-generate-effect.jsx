import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Aceternity UI — Text Generate Effect
 * Words materialise one-by-one with a blur dissolve.
 */
export const TextGenerateEffect = ({ words, className, filter = true, duration = 0.5 }) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: filter ? "blur(0px)" : "none" },
      { duration: duration ? duration : 1, delay: stagger(0.2) }
    );
  }, [scope.current]);

  const renderWords = () => (
    <motion.div ref={scope}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="text-foreground opacity-0"
          style={{ filter: filter ? "blur(10px)" : "none" }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.div>
  );

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-2xl leading-snug tracking-wide">{renderWords()}</div>
      </div>
    </div>
  );
};

export default TextGenerateEffect;

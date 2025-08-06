import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

const Card = forwardRef(({ 
  className, 
  children, 
  hover = false,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-lg backdrop-blur-sm transition-all duration-200",
        hover && "hover:shadow-xl hover:scale-[1.02]",
        className
      )}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";

export default Card;
import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { motion } from "framer-motion";

const StatCard = ({ title, value, change, changeType, icon, color = "primary" }) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600 text-primary-600",
    emerald: "from-emerald-500 to-emerald-600 text-emerald-600",
    blue: "from-blue-500 to-blue-600 text-blue-600",
    orange: "from-orange-500 to-orange-600 text-orange-600"
  };

  return (
    <Card hover className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <motion.p 
            className="text-2xl font-bold text-slate-900"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === "increase" ? "text-emerald-600" : "text-red-600"
            }`}>
              <ApperIcon 
                name={changeType === "increase" ? "TrendingUp" : "TrendingDown"} 
                size={14} 
                className="mr-1" 
              />
              {change}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <ApperIcon name={icon} size={20} className="text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
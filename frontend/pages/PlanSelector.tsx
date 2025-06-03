import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PlanSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value;
    if (path) {
      navigate(path);
    }
  };

  return (
    <select onChange={handleChange} value={location.pathname}>
      <option value="/TheCurious">The Curious</option>
      <option value="/TheInformed">The Informed</option>
      <option value="/TheInsider">The Insider</option>
    </select>
  );
};

export default PlanSelector;

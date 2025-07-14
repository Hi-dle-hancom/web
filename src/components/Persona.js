import React from "react";

function PersonaCard({ persona, icon, description, onClick, isSelected }) {
  const cardClasses = `
    bg-gray-800 border rounded-xl p-6 cursor-pointer
    transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg
    hover:border-blue-500 flex flex-col items-center text-center
    ${
      isSelected
        ? "border-blue-500 shadow-blue-500/50 scale-105"
        : "border-gray-700"
    }
  `;

  return (
    <div className={cardClasses} onClick={() => onClick(persona)}>
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-xl font-bold mb-2">{persona}</div>
      <div className="text-gray-400 text-sm">{description}</div>
    </div>
  );
}

export default PersonaCard;

import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div 
      className={`${hover ? 'glass-card-hover' : 'glass-card'} overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

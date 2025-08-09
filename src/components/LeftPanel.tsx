import React from 'react';

const LeftPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('src/assets/Background.svg')"
        }}
      ></div>
    </div>
  );
};

export default LeftPanel;
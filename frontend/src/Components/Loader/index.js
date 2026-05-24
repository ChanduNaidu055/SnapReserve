import React from 'react';
import { Oval } from 'react-loader-spinner';
import './index.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <Oval
        height={30}
        width={30}
        color="#00bcd4"
        secondaryColor="#ddd"
        ariaLabel="loading"
        visible={true}
      />
      <p className="loader-text">Please Wait...We're loading your content.</p>
    </div>
  );
};

export default Loader;
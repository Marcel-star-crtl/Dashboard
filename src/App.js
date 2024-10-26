// import React from 'react';
// import { BrowserRouter } from 'react-router-dom';

// import routes, { renderRoutes } from './routes';

// const App = () => {
//   return (
//     <React.Fragment>
//       <BrowserRouter basename={process.env.REACT_APP_BASE_NAME}>{renderRoutes(routes)}</BrowserRouter>
//     </React.Fragment>
//   );
// };

// export default App;



// import React from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import routes, { renderRoutes } from './routes';

// const App = () => {
//   // Only use basename if it's defined
//   const basename = process.env.REACT_APP_BASE_NAME || '/';
  
//   return (
//     <BrowserRouter basename={basename}>
//       {renderRoutes(routes)}
//     </BrowserRouter>
//   );
// };

// export default App;




import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import routes, { renderRoutes } from './routes';

const App = () => {
  // Get basename from environment or default to '/'
  const basename = process.env.REACT_APP_BASE_NAME || '/';
  
  // Get public URL from environment
  const publicUrl = process.env.PUBLIC_URL || '';
  
  return (
    <React.Fragment>
      <BrowserRouter basename={basename}>
        {renderRoutes(routes)}
      </BrowserRouter>
    </React.Fragment>
  );
};

export default App;
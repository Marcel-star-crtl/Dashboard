// import React, { Suspense, Fragment, lazy } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { auth } from './config/firebase';
// import Loader from './components/Loader/Loader';
// import AdminLayout from './layouts/AdminLayout';

// // Wrap lazy components with error boundary
// const lazyWithRetry = (componentImport) =>
//   lazy(async () => {
//     const pageHasAlreadyBeenForceRefreshed = JSON.parse(
//       window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
//     );

//     try {
//       const component = await componentImport();
//       window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
//       return component;
//     } catch (error) {
//       if (!pageHasAlreadyBeenForceRefreshed) {
//         window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
//         window.location.reload();
//       }

//       throw error;
//     }
//   });

// const PrivateRoute = ({ children }) => {
//   // Add loading state for auth
//   const [isAuthChecked, setIsAuthChecked] = React.useState(false);

//   React.useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(() => {
//       setIsAuthChecked(true);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (!isAuthChecked) {
//     return <Loader />;
//   }

//   return auth.currentUser ? children : <Navigate to="/login" replace />;
// };

// export const renderRoutes = (routes = []) => (
//   <Suspense fallback={<Loader />}>
//     <Routes>
//       {/* Initial route */}
//       <Route path="/" element={<Navigate to="/app/overview" replace />} />
      
//       {routes.map((route, i) => {
//         const Guard = route.guard || Fragment;
//         const Layout = route.layout || Fragment;
//         const Element = route.element;

//         return (
//           <Route
//             key={i}
//             path={route.path}
//             element={
//               <Guard>
//                 <Layout>
//                   <Suspense fallback={<Loader />}>
//                     {route.routes ? (
//                       renderRoutes(route.routes)
//                     ) : (
//                       <Element />
//                     )}
//                   </Suspense>
//                 </Layout>
//               </Guard>
//             }
//           />
//         );
//       })}

//       {/* Catch-all route */}
//       <Route path="*" element={<Navigate to="/app/overview" replace />} />
//     </Routes>
//   </Suspense>
// );

// const routes = [
//   {
//     exact: true,
//     path: '/login',
//     element: lazyWithRetry(() => import('./views/auth/signin/SignIn1')),
//   },
//   {
//     exact: true,
//     path: '/auth/signin-1',
//     element: lazyWithRetry(() => import('./views/auth/signin/SignIn1'))
//   },
//   {
//     exact: true,
//     path: '/auth/signup-1',
//     element: lazyWithRetry(() => import('./views/auth/signup/SignUp1'))
//   },
//   {
//     exact: true,
//     path: '/auth/reset-password-1',
//     element: lazyWithRetry(() => import('./views/auth/reset-password/ResetPassword1'))
//   },
//   {
//     path: '/app/*',
//     layout: AdminLayout,
//     routes: [
//       {
//         exact: true,
//         path: '/app/overview',
//         element: lazyWithRetry(() => import('./components/Overview/index'))
//       },
//       {
//         exact: true,
//         path: '/app/overview-project',
//         guard: PrivateRoute,
//         element: lazyWithRetry(() => import('./components/OverviewProject/index'))
//       },
//       {
//         exact: true,
//         path: '/app/create',
//         guard: PrivateRoute,
//         element: lazyWithRetry(() => import('./components/CreateNews/index'))
//       },
//       {
//         exact: true,
//         path: '/app/create-project',
//         guard: PrivateRoute,
//         element: lazyWithRetry(() => import('./components/CreateProject/index'))
//       },
//       {
//         exact: true,
//         path: '/app/moderate',
//         guard: PrivateRoute,
//         element: lazyWithRetry(() => import('./components/Moderation/index'))
//       },
//       {
//         exact: true,
//         path: '/app/team-management',
//         guard: PrivateRoute,
//         element: lazyWithRetry(() => import('./components/CreateTeamMember/index'))
//       },
//       {
//         exact: true,
//         path: '/app/team-overview',
//         guard: PrivateRoute,
//         element: lazyWithRetry(() => import('./components/TeamOverview/index'))
//       }
//     ]
//   }
// ];

// export default routes;








import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './config/firebase';
import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

const PrivateRoute = ({ children }) => (
  auth.currentUser ? children : <Navigate to="/login" replace />
);

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {/* Initial route should direct to the overview page */}
      <Route path="/" element={<Navigate to="/app/overview" replace />} />
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    exact: true,
    path: '/login',
    element: lazy(() => import('./views/auth/signin/SignIn1')),
  },
  {
    exact: true,
    path: '/auth/signin-1',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: true,
    path: '/auth/signup-1',
    element: lazy(() => import('./views/auth/signup/SignUp1'))
  },
  {
    exact: true,
    path: '/auth/reset-password-1',
    element: lazy(() => import('./views/auth/reset-password/ResetPassword1'))
  },
  {
    // Wrap the admin routes in AdminLayout for the sidebar
    path: '*',
    layout: AdminLayout,
    routes: [
      {
        exact: true,
        path: '/app/overview',  // Overview page is now accessible without PrivateRoute guard
        element: lazy(() => import('./components/Overview/index'))
      },
      {
        exact: true,
        path: '/overview-project',
        guard: PrivateRoute,  // Only protect routes requiring authentication
        element: lazy(() => import('./components/OverviewProject/index'))
      },
      {
        exact: true,
        path: '/create',
        guard: PrivateRoute,
        element: lazy(() => import('./components/CreateNews/index'))
      },
      {
        exact: true,
        path: '/create-project',
        guard: PrivateRoute,
        element: lazy(() => import('./components/CreateProject/index'))
      },
      {
        exact: true,
        path: '/moderate',
        guard: PrivateRoute,
        element: lazy(() => import('./components/Moderation/index'))
      },
      {
        exact: true,
        path: '/team-management',
        guard: PrivateRoute,
        element: lazy(() => import('./components/CreateTeamMember/index'))
      },
      {
        exact: true,
        path: '/team-overview',
        guard: PrivateRoute,
        element: lazy(() => import('./components/TeamOverview/index'))
      }
    ]
  }
];

export default routes;









// import React, { Suspense, Fragment, lazy } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { auth } from './config/firebase';

// import Loader from './components/Loader/Loader';
// import AdminLayout from './layouts/AdminLayout';

// import { BASE_URL } from './config/constant';

// const PrivateRoute = ({ children }) => {
//   return auth.currentUser ? children : <Navigate to="/login" />;
// };

// export const renderRoutes = (routes = []) => (
//   <Suspense fallback={<Loader />}>
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" replace />} />
//       {routes.map((route, i) => {
//         const Guard = route.guard || Fragment;
//         const Layout = route.layout || Fragment;
//         const Element = route.element;

//         return (
//           <Route
//             key={i}
//             path={route.path}
//             element={
//               <Guard>
//                 <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
//               </Guard>
//             }
//           />
//         );
//       })}
//     </Routes>
//   </Suspense>
// );

// const routes = [
//   {
//     exact: true,
//     path: '/login',
//     element: lazy(() => import('./views/auth/signin/SignIn1')),
//   },
//   {
//     exact: true,
//     path: '/auth/signin-1',
//     element: lazy(() => import('./views/auth/signin/SignIn1'))
//   },
//   {
//     exact: true,
//     path: '/auth/signup-1',
//     element: lazy(() => import('./views/auth/signup/SignUp1'))
//   },
//   {
//     exact: true,
//     path: '/auth/reset-password-1',
//     element: lazy(() => import('./views/auth/reset-password/ResetPassword1'))
//   },
//   {
//     path: '*',
//     layout: AdminLayout,
//     guard: PrivateRoute,
//     routes: [
//       {
//         exact: true,
//         path: '/overview',
//         element: lazy(() => import('./components/Overview/index'))
//       },
//       {
//         exact: true,
//         path: '/overview-project',
//         element: lazy(() => import('./components/OverviewProject/index'))
//       },
//       {
//         exact: true,
//         path: '/create',
//         element: lazy(() => import('./components/CreateNews/index'))
//       },
//       {
//         exact: true,
//         path: '/create-project',
//         element: lazy(() => import('./components/CreateProject/index'))
//       },
//       {
//         exact: true,
//         path: '/moderate',
//         element: lazy(() => import('./components/Moderation/index'))
//       },
//       {
//         exact: true,
//         path: '/team-management',
//         element: lazy(() => import('./components/CreateTeamMember/index'))
//       },
//       {
//         exact: true,
//         path: '/team-overview',
//         element: lazy(() => import('./components/TeamOverview/index'))
//       }
//     ]
//   }
// ];

// export default routes;









// import React, { Suspense, Fragment, lazy } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// import Loader from './components/Loader/Loader';
// import AdminLayout from './layouts/AdminLayout';

// import { BASE_URL } from './config/constant';

// export const renderRoutes = (routes = []) => (
//   <Suspense fallback={<Loader />}>
//     <Routes>
//       {routes.map((route, i) => {
//         const Guard = route.guard || Fragment;
//         const Layout = route.layout || Fragment;
//         const Element = route.element;

//         return (
//           <Route
//             key={i}
//             path={route.path}
//             element={
//               <Guard>
//                 <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
//               </Guard>
//             }
//           />
//         );
//       })}
//     </Routes>
//   </Suspense>
// );

// const routes = [
//   {
//     exact: 'true',
//     path: '/login',
//     element: lazy(() => import('./views/auth/signin/SignIn1')),
//   },
//   {
//     exact: 'true',
//     path: '/auth/signin-1',
//     element: lazy(() => import('./views/auth/signin/SignIn1'))
//   },
//   {
//     exact: 'true',
//     path: '/auth/signup-1',
//     element: lazy(() => import('./views/auth/signup/SignUp1'))
//   },
//   {
//     exact: 'true',
//     path: '/auth/reset-password-1',
//     element: lazy(() => import('./views/auth/reset-password/ResetPassword1'))
//   },
//   {
//     path: '*',
//     layout: AdminLayout,
//     routes: [
//       {
//         exact: 'true',
//         path: '/overview',
//         element: lazy(() => import('./components/Overview/index'))
//         // element: lazy(() => import('./views/dashboard'))
//       },
//       {
//         exact: 'true',
//         path: '/overview-project',
//         element: lazy(() => import('./components/OverviewProject/index'))
//         // element: lazy(() => import('./views/dashboard'))
//       },
//       {
//         exact: 'true',
//         path: '/create',
//         element: lazy(() => import('./components/CreateNews/index'))
//         // element: lazy(() => import('./views/forms/FormsElements'))
//       },
//       {
//         exact: 'true',
//         path: '/create-project',
//         element: lazy(() => import('./components/CreateProject/index'))
//         // element: lazy(() => import('./views/forms/FormsElements'))
//       },
//       {
//         exact: 'true',
//         path: '/moderate',
//         element: lazy(() => import('./components/Moderation/index'))
//         // element: lazy(() => import('./views/forms/FormsElements'))
//       },
//       {
//         exact: 'true',
//         path: '/team-management',
//         element: lazy(() => import('./components/CreateTeamMember/index'))
//       },
//       {
//         exact: 'true',
//         path: '/team-overview',
//         element: lazy(() => import('./components/TeamOverview/index'))
//       }
//     ]
//   }
// ];

// export default routes;







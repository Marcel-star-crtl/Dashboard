import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './config/firebase';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import { BASE_URL } from './config/constant';

const PrivateRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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
    path: '*',
    layout: AdminLayout,
    guard: PrivateRoute,
    routes: [
      {
        exact: true,
        path: '/overview',
        element: lazy(() => import('./components/Overview/index'))
      },
      {
        exact: true,
        path: '/overview-project',
        element: lazy(() => import('./components/OverviewProject/index'))
      },
      {
        exact: true,
        path: '/create',
        element: lazy(() => import('./components/CreateNews/index'))
      },
      {
        exact: true,
        path: '/create-project',
        element: lazy(() => import('./components/CreateProject/index'))
      },
      {
        exact: true,
        path: '/moderate',
        element: lazy(() => import('./components/Moderation/index'))
      },
      {
        exact: true,
        path: '/team-management',
        element: lazy(() => import('./components/CreateTeamMember/index'))
      },
      {
        exact: true,
        path: '/team-overview',
        element: lazy(() => import('./components/TeamOverview/index'))
      }
    ]
  }
];

export default routes;









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






// import React, { Suspense, Fragment, lazy } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// import Loader from './components/Loader/Loader';
// import AdminLayout from './layouts/AdminLayout';

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
//                 <Layout>{route.element ? <Element /> : renderRoutes(route.routes)}</Layout>
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
//     path: '/',
//     element: <Navigate to="/login" replace />
//   },
//   {
//     path: '/login',
//     element: lazy(() => import('./views/auth/signin/SignIn1'))
//   },
//   {
//     path: '/auth/signin-1',
//     element: lazy(() => import('./views/auth/signin/SignIn1'))
//   },
//   {
//     path: '/auth/signup-1',
//     element: lazy(() => import('./views/auth/signup/SignUp1'))
//   },
//   {
//     path: '/auth/reset-password-1',
//     element: lazy(() => import('./views/auth/reset-password/ResetPassword1'))
//   },
//   {
//     path: '/',
//     layout: AdminLayout,
//     routes: [
//       {
//         path: 'overview',
//         element: lazy(() => import('./components/Overview/index'))
//       },
//       {
//         path: 'overview-project',
//         element: lazy(() => import('./components/OverviewProject/index'))
//       },
//       {
//         path: 'create',
//         element: lazy(() => import('./components/CreateNews/index'))
//       },
//       {
//         path: 'create-project',
//         element: lazy(() => import('./components/CreateProject/index'))
//       },
//       {
//         path: 'moderate',
//         element: lazy(() => import('./components/Moderation/index'))
//       },
//       {
//         path: 'team-management',
//         element: lazy(() => import('./components/CreateTeamMember/index'))
//       },
//       {
//         path: 'team-overview',
//         element: lazy(() => import('./components/TeamOverview/index'))
//       }
//     ]
//   }
// ];

// export default routes;
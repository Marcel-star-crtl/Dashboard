// import { signOut } from 'firebase/auth';
// import { auth } from './config/firebase';
// import { useNavigate } from 'react-router-dom';

// const LogoutButton = () => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate('/login');
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   return (
//     <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
//       Logout
//     </button>
//   );
// };



// import { signOut } from 'firebase/auth';
// import { auth } from './config/firebase';
// import { useNavigate } from 'react-router-dom';

// const LogoutButton = () => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate('/login');
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   return (
//     <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
//       Logout
//     </button>
//   );
// };

// const menuItems = {
//   items: [
//     {
//       id: 'navigation',
//       title: 'Navigation',
//       type: 'group',
//       icon: 'icon-navigation',
//       children: [
//         {
//           id: 'overview',
//           title: 'Overview',
//           type: 'item',
//           icon: 'feather icon-home',
//           url: '/overview'
//         },
//         {
//           id: 'create',
//           title: 'Create',
//           type: 'item',
//           icon: 'feather icon-home',
//           url: '/create'
//         },
//         {
//           id: 'overview-project',
//           title: 'Project Overview',
//           type: 'item',
//           icon: 'feather icon-briefcase',
//           url: '/overview-project'
//         },
//         {
//           id: 'create-project',
//           title: 'Create Project',
//           type: 'item',
//           icon: 'feather icon-briefcase',
//           url: '/create-project'
//         },
//         {
//           id: 'team-management',
//           title: 'Team Management',
//           type: 'item',
//           icon: 'feather icon-users',
//           url: '/team-management'
//         },
//         {
//           id: 'team-overview',
//           title: 'Team Overview',
//           type: 'item',
//           icon: 'feather icon-users',
//           url: '/team-overview'
//         },
//         // Add other items above the logout button
//         {
//           id: 'logout',
//           title: (
//             <div style={{ marginTop: 'auto' }}>
//               <LogoutButton />
//             </div>
//           ),
//           type: 'item',
//           icon: 'feather icon-log-out',
//         }
//       ]
//     }
//   ]
// };

// export default menuItems;







import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      style={{ 
        background: 'none', 
        border: 'none', 
        color: 'inherit', 
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        padding: '10px 20px'
      }}
    >
      <i className="feather icon-log-out" style={{ marginRight: '10px' }}></i>
      Logout
    </button>
  );
};

const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'overview',
          title: 'Overview',
          type: 'item',
          icon: 'feather icon-home',
          url: '/app/overview'
        },
        {
          id: 'create',
          title: 'Create',
          type: 'item',
          icon: 'feather icon-home',
          url: '/create'
        },
        {
          id: 'overview-project',
          title: 'Project Overview',
          type: 'item',
          icon: 'feather icon-briefcase',
          url: '/overview-project'
        },
        {
          id: 'create-project',
          title: 'Create Project',
          type: 'item',
          icon: 'feather icon-briefcase',
          url: '/create-project'
        },
        {
          id: 'team-management',
          title: 'Team Management',
          type: 'item',
          icon: 'feather icon-users',
          url: '/team-management'
        },
        {
          id: 'team-overview',
          title: 'Team Overview',
          type: 'item',
          icon: 'feather icon-users',
          url: '/team-overview'
        }
      ]
    },
    {
      id: 'logout-group',
      type: 'group',
      children: [
        {
          id: 'logout',
          title: <LogoutButton />,
          type: 'item',
          className: 'menu-item-logout'
        }
      ]
    }
  ]
};

export default menuItems;











// import React from 'react';
// import { signOut } from 'firebase/auth';
// import { auth } from './config/firebase';
// import { useNavigate } from 'react-router-dom';

// const LogoutButton = () => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate('/login');
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   return (
//     <button 
//       onClick={handleLogout}
//       className="btn btn-link text-danger"
//     >
//       Logout
//     </button>
//   );
// };

// const menuItems = {
//   items: [
//     {
//       id: 'navigation',
//       title: 'Navigation',
//       type: 'group',
//       icon: 'icon-navigation',
//       children: [
//         {
//           id: 'overview',
//           title: 'Overview',
//           type: 'item',
//           icon: 'feather icon-home',
//           url: '/app/overview'  
//         },
//         {
//           id: 'create',
//           title: 'Create',
//           type: 'item',
//           icon: 'feather icon-home',
//           url: '/app/create'  
//         },
//         {
//           id: 'overview-project',
//           title: 'Project Overview',
//           type: 'item',
//           icon: 'feather icon-briefcase',
//           url: '/app/overview-project'  
//         },
//         {
//           id: 'create-project',
//           title: 'Create Project',
//           type: 'item',
//           icon: 'feather icon-briefcase',
//           url: '/app/create-project'  
//         },
//         {
//           id: 'team-management',
//           title: 'Team Management',
//           type: 'item',
//           icon: 'feather icon-users',
//           url: '/app/team-management'  
//         },
//         {
//           id: 'team-overview',
//           title: 'Team Overview',
//           type: 'item',
//           icon: 'feather icon-users',
//           url: '/app/team-overview'  
//         }
//       ]
//     },
//     {
//       id: 'logout-group',
//       type: 'group',
//       children: [
//         {
//           id: 'logout',
//           title: <LogoutButton />,
//           type: 'item',
//           className: 'menu-item-logout'
//         }
//       ]
//     }
//   ]
// };

// export default menuItems;
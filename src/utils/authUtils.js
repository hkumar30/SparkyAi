// Helper functions for authentication and navigation

// Store the intended route
export const setRedirectPath = (path) => {
    sessionStorage.setItem('redirectPath', path);
  };
  
  // Get the stored route
  export const getRedirectPath = () => {
    const path = sessionStorage.getItem('redirectPath');
    sessionStorage.removeItem('redirectPath'); // Clear after reading
    return path || '/';
  };
  
  // Check if user is authenticated
  export const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };
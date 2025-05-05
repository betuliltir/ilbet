const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - No user found' });
    }

    // The decoded token doesn't have a role property, but it has userId
    // We need to check the role based on the userType in the token
    // Or fetch the user from the database to check their role
    if (req.user.userType && !roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: 'Forbidden - You do not have permission to perform this action' 
      });
    }
    
    // If the token doesn't have the role info, we'll need to check it in the route handlers

    next();
  };
};

module.exports = {
  authorize
};
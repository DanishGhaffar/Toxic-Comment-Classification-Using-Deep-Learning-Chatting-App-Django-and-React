// src/permissions.js

export const hasRole = (user, roles) => {
    return user && roles.includes(user.role);
};

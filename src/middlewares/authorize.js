import ApiError from '../utils/ApiError.js';

const authorize = (allowedActorTypes = []) => (req, res, next) => {
  const actorType = req.actor?.type;

  if (!actorType) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (!allowedActorTypes.includes(actorType)) {
    return next(ApiError.forbidden('You are not allowed to perform this action'));
  }

  return next();
};

export const ensureOwnerOrAdmin = (paramName = 'user_id') => (req, res, next) => {
  const actor = req.actor;
  if (!actor) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  const targetId = req.params[paramName];
  const isOwner = targetId && (actor.id === targetId || actor._id?.toString() === targetId);
  const isAdminOrMerchant = actor.role === 'ADMIN' || actor.type === 'ADMIN' || actor.role === 'MERCHANT' || actor.type === 'MERCHANT';
  const isAgent = actor.role === 'AGENT' || actor.type === 'AGENT';

  if (!isOwner && !isAdminOrMerchant && !isAgent) {
    return next(ApiError.forbidden('You do not have permission to access this resource'));
  }

  return next();
};

export default authorize;


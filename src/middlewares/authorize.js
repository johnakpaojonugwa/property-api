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

export default authorize;

const buildFilters = (query = {}) => {
  const filters = {};

  if (query.city) {
    filters.city = query.city;
  }

  if (query.verified === 'true') {
    filters.is_verified = true;
  }

  if (query.agent) {
    filters.agent = query.agent;
  }

  return filters;
};

const normalizePagination = (query = {}) => {
  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);

  return {
    page: Number.isNaN(page) ? 0 : page,
    limit: Number.isNaN(limit) ? 10 : limit,
  };
};

export default {
  buildFilters,
  normalizePagination,
};

export const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages: Math.max(1, Math.ceil(total / limit)),
});

export const buildFilterQuery = (query = {}, allowList = []) => {
  const filters = {};

  Object.entries(query).forEach(([key, value]) => {
    if (allowList.includes(key) && value !== undefined && value !== '') {
      filters[key] = value;
    }
  });

  return filters;
};

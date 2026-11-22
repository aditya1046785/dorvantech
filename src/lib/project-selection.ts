/** Projects arrive in the order chosen in the admin dashboard. */
export function selectHomepageProjects<T extends { id: string; homepage: boolean }>(
  projects: T[],
  featuredId?: string | null,
) {
  const eligible = projects.filter((project) => project.homepage);
  const featured = eligible.find((project) => project.id === featuredId);
  const visible = featured
    ? [featured, ...eligible.filter((project) => project.id !== featured.id).slice(0, 2)]
    : eligible.slice(0, 3);
  return { visible, featured };
}

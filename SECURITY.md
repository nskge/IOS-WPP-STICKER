# Security

This is a static GitHub Pages site. It has no backend, cookies, login, analytics, database, build workflow, package manager, or secrets.

## Boundaries

- No accounts, roles, private resources, server API, or server-side file access.
- No external scripts, package install, dynamic imports, or build pipeline.
- No user content is rendered as markup.
- Accepted post links are rebuilt from a strict host list, username, and numeric post ID.
- Browser permissions are only used after a direct tap on a button.
- The page policy blocks forms, objects, media tags, and scripts outside this site.

## Privacy

- The pasted link stays in the browser.
- The app does not store input.
- External image requests are limited to the decorative GIF and the generated media preview.

## URL handling

There is no routing layer or filesystem lookup. Generated links are rebuilt from validated post parts, and unsafe path fragments are rejected before output.

## Custom domain

Only configure a custom domain after the domain is owned and DNS is pointed to GitHub Pages. Adding an unowned `CNAME` is intentionally avoided.

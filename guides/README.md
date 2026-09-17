# Guides

Walkthroughs that build something end to end. Every TypeScript file in them
is compiled, booted and exercised with real requests by `yarn docs:check`,
so a guide that stops working fails CI instead of wasting your afternoon.

| Guide | Build this when |
| --- | --- |
| [Starting a new project](starting-a-new-project.md) | You have an empty directory and want a CRUD API with OpenAPI. |
| [JWKS / OIDC adapter](jwks-oidc-adapter.md) | Your tokens come from Entra ID, Auth0, Keycloak or any OIDC provider. |
| [Multi-tenant end to end](multi-tenant.md) | One API serves many tenants and a caller must never see another's rows. |
| [Unrestricted admin access](admin-unrestricted-access.md) | The same route returns own rows to a user and every row to an administrator. |
| [Row-level security](row-level-security.md) | The database itself must refuse cross-tenant rows, not just the API. |

## Where to look for what

| You want | Read |
| --- | --- |
| What Rockets is, and a first app | the [root README](../README.md) |
| A task done end to end | these guides |
| Every option and its exact contract | [CONFIGURATION.md](../CONFIGURATION.md) |
| One package's own surface | that package's README under [`packages/`](../packages) |
| A working application to copy from | [`examples/`](../examples) |

## Reading order

`Starting a new project` first — the later guides assume the entity,
schemas and module it sets up. After that they are independent: pick the
one whose problem you have.

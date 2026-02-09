# Architecture

- Client (current): static single-page app (`index.html`) with several mini-games written in HTML/CSS/JS.
- API: Node/Express with MongoDB for auth, game catalog, and session history.
- Unity: WebGL builds embedded via iframe or inlined loader; JS bridge for telemetry.

## Data model
- User: email, passwordHash, displayName, preferences(contrast, fontScale, reducedMotion)
- GameDefinition: key, name, description, config
- GameSession: userId, gameKey, metrics[{name,value}], startedAt, endedAt

## API (v0)
- GET /api/health
- POST /api/auth/register {email,password,displayName}
- POST /api/auth/login {email,password}
- PUT /api/auth/preferences {preferences}
- GET /api/games
- POST /api/sessions/start {gameKey}
- POST /api/sessions/:id/record {metrics:[{name,value}], end?:boolean}
- GET /api/sessions/mine
- GET /api/analytics/overview?scope=me|all&days=14

Auth with Bearer JWT.

## Unity integration
- Use `window.postMessage` between the parent page (client) and the Unity iframe.
- Parent receives gameplay telemetry and forwards to `/api/sessions/:id/record`.

## Accessibility
- High-contrast mode, font scaling, reduced motion controls on client and stored in user preferences.

# Portfolio

Personal site at [ondrejbures.com](https://www.ondrejbures.com): projects, blog, countries, flights and a dive log. React on Vite, data in Firebase Realtime Database, hosted on Firebase Hosting.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with hot reload at the URL Vite prints |
| `npm test` | Runs the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run build` | Production bundle into `build/`, which `firebase.json` deploys |
| `npm run preview` | Serves the production bundle locally |

## Deploy

Pushing to `master` runs `.github/workflows/main.yml`, which builds and deploys hosting with the Firebase service account stored in the repo secrets.

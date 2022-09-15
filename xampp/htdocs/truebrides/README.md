# Love Chest

This is a dating web app that uses Next.js

## Running locally in development mode

To get started, just clone the repository and run `npm install && npm run dev`:

    git clone git@gitlab.com:chetan191/love-chest.git
    npm install
    npm run dev
    
## Building and deploying in production

If you wanted to run this site in production, you should install modules then build the site with `npm run build` and run it with `npm start`:

    npm install
    npm run build
    npm start

You should run `npm run build` again any time you make changes to the site.
Note: If you are already running a webserver on port 3000, you can still start the app in production mode by passing a different port as an Environment Variable when starting (e.g. `PORT=3000 npm start`).

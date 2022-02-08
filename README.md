<img src='./public/reveal-logo.png' width='180px' />
<hr />

#  Reveal Web 

### Frontend application for Reveal platform

<br />

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

## Building a docker container

Application is docker ready and can be build and run inside Docker

### `docker build -t frontend .`

### `docker run --name frontend -p 3000:3000 frontend`
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

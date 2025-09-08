# Play:ce App

This is a mobile application for discovering and searching for places, built with React Native and Expo.

## Deployment to Fly.io

This guide explains how to deploy the Expo web application to Fly.io for production.

### Prerequisites

-   [flyctl](https://fly.io/docs/hands-on/install-flyctl/) is installed and you are logged in (`flyctl auth login`).
-   The application has been configured for Fly.io with `flyctl launch`.

### Production Deployment Steps

1.  **Set the Production Environment Variable**

    To ensure the application connects to the production API, you must set the `EXPO_PUBLIC_ENV` environment variable to `production`. Use the `flyctl secrets set` command:

    ```shell
    flyctl secrets set EXPO_PUBLIC_ENV=production
    ```

2.  **Deploy the Application**

    After setting the secret, deploy the application using the following command:

    ```shell
    flyctl deploy
    ```

    This will build the Expo web app in production mode, build the Docker image, and deploy it to Fly.io. The app will use the production API endpoint specified in `services/config.ts` (`https://playce-server.fly.dev`).

3. **How to deploy again?**
    ```
   npx expo export
   flyctl deploy
    ```

# Project: playce-app

## Description
This is a mobile application for discovering and searching for places, likely in Korea, given the mock data (Gyeongbokgung, Hongdae, etc.). The main screen features a search bar to find places and displays a list of popular places and playlists. The app has a modern and dynamic user interface with animations and a gradient background.

## Technical Details
*   **Framework:** React Native with Expo
*   **Language:** TypeScript
*   **Navigation:** Expo Router is used for navigation, with a tab-based layout and dynamic routes for place details (e.g., `app/spot/[id].tsx`).
*   **UI:** The app uses several custom components, including `WaveBackground`, `AppHeader`, `MainContent`, `PlaceCard`, and `SearchBar`. It also utilizes `react-native-reanimated` for animations, `react-native-svg` for vector graphics, and `expo-linear-gradient` for gradient effects.
*   **Data:** The app currently uses mock data for places, playlists, and congestion chart data. The data structure includes information about places (name, address, image), playlists (title, place count, thumbnail), and congestion data points.

## Functionality
*   **Place Search:** Users can search for places. The search functionality is debounced for performance.
*   **Popular Places:** The main screen displays a list of popular places.
*   **Playlists:** The app seems to have a concept of "playlists" of places.
*   **Congestion Chart:** There's mock data for a congestion chart, suggesting a feature to show how crowded a place is.
*   **Place Details:** The `app/spot/[id].tsx` file suggests that users can view details for a specific place.

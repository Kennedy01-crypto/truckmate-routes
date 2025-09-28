<p align="center">
  <img src="https://raw.githubusercontent.com/maptiler/maptiler-logo/master/maptiler-logo-full.svg" width="200px">
</p>
<h1 align="center">TruckMate Routes: HOS-Compliant Trip Planner</h1>

This project is a sophisticated truck route planning application designed to help drivers generate compliant Electronic Logging Device (ELD) logs by planning trips based on Hours of Service (HOS) regulations.

The application provides an interactive interface for selecting locations, visualizing routes, and reviewing simulated ELD logs.

## Key Features

- **Interactive Trip Planning**: Users can input their current, pickup, and drop-off locations using a geocoding search-enabled form.
- **Map Visualization**: Leverages the **MapTiler SDK** to display selected locations as markers on an interactive map and draw a straight-line route connecting them.
- **Click-to-Select**: Allows users to select locations directly by clicking on the map, with reverse geocoding to fetch the address.
- **HOS Cycle Hours Configuration**: A slider allows drivers to input their remaining hours in their 70-hour cycle.
- **Simulated Log Generation**: After planning a trip, the application generates mock ELD logs for a multi-day journey, showing statuses like `Driving`, `On Duty`, `Sleeper Berth`, and `Off Duty`.
- **Log Review**: A dedicated page to review the generated daily logs in a timeline format, with a daily summary of hours spent in each status.
- **Data Persistence**: The planned trip data is persisted in `localStorage` to be accessible on the log review page.
- **Responsive UI**: Built with **Shadcn/ui** and **Tailwind CSS** for a modern and responsive user experience.

## Core Architecture

This project is built with a modern React stack, emphasizing component-based architecture and clean state management.

- **Framework**: React with TypeScript, built using Vite.
- **Routing**: `react-router-dom` for client-side navigation between the trip planning and log review pages.
- **UI Components**: A combination of the **Shadcn/ui** component library and custom-built components.
- **Styling**: **Tailwind CSS** for utility-first styling.
- **Mapping**: **MapTiler SDK** for all mapping, geocoding, and location-based functionalities.
- **State Management**: Primarily uses React's built-in state management (`useState`, `useRef`, `useEffect`) for component-level and page-level state. Cross-page state is passed via `localStorage`.

### Data Flow

1.  **Plan Trip Page (`/plan`)**:

    - The user enters Current, Pickup, and Drop-off locations.
    - The `LocationInput` component uses MapTiler's geocoding service to provide address suggestions.
    - Selected locations are added to the `mapLocations` state, which re-renders the `InteractiveMap` to display markers.
    - The user sets their available cycle hours.
    - On clicking "Plan Trip", the trip data is validated and saved to `localStorage`. The app then navigates to the `/logs` page.

2.  **Review Logs Page (`/logs`)**:
    - The component mounts and reads the trip data from `localStorage`.
    - If no data is found, it redirects the user back to the `/plan` page.
    - It calls `generateELDLogs` to create mock log data based on the trip details.
    - The UI displays the trip summary, a route overview on a map, and a paginated view of the detailed daily logs.

### Security Considerations

- **API Key Management**: The MapTiler API key is currently hardcoded in `src/components/map/InteractiveMap.tsx`. For production environments, this should be moved to an environment variable (`.env`) and accessed via `import.meta.env.VITE_MAPTILER_API_KEY`.

  ```typescript
  // 🚨 SECURITY: Use an environment variable for the API key
  config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
  ```

- **Data Storage**: Sensitive trip information is stored in `localStorage`. For a production application, consider encrypting this data or using a more secure state management solution with a backend.

## Getting Started

To run this project locally, you'll need Node.js and npm installed.

1.  **Clone the repository:**

    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env.local` file in the root of the project and add your MapTiler API key.

    ```
    VITE_MAPTILER_API_KEY="YOUR_MAPTILER_API_KEY"
    ```

    You can get a free key from MapTiler Cloud.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Future Enhancements

This application serves as a strong foundation. Future work could include:

- **Real Route Calculation**: Integrate MapTiler's Routing API to calculate actual road routes instead of straight lines.
- **HOS Compliance Engine**: Replace the mock log generation with a real engine that calculates driving time, required breaks, and cycle limits based on the calculated route and HOS rules.
- **Backend Integration**: Store user and trip data in a database instead of `localStorage`.
- **Authentication**: Add user accounts to save and manage multiple trips.
- **Error Handling**: Implement more robust error handling for API calls and user input.
- **State Management Library**: For more complex state interactions, integrate a library like Zustand or Redux Toolkit.

---

_This project was bootstrapped with Vite and configured for a modern React development experience._

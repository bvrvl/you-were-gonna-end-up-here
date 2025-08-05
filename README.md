# You Were Gonna End Up Here

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-black?style=for-the-badge&logo=vercel)](https://you-were-gonna-end-up-here.vercel.app/)
[![Join the Discord](https://img.shields.io/badge/Discord-Join_Us-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/5aEuefvvAp)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?style=for-the-badge&logo=github)](https://github.com/bvrvl/you-were-gonna-end-up-here)
[![License: ISC](https://img.shields.io/badge/License-ISC-purple?style=for-the-badge)](LICENSE)

> "Every step, every choice, a link in a chain forged long before you arrived. You were always gonna end up here."

An interactive, full-stack web application that explores the philosophy of determinism. Users begin with a single event and trace its causes backward, guided by a generative AI, to uncover an inevitable origin point.

**Join the community and share your causal chain on our [Discord Server](https://discord.gg/5aEuefvvAp)!**

---

### Table of Contents

- [About The Project](#about-the-project)
- [Live Demo](#live-demo)
- [Screenshot](#screenshot)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

---

### About The Project

This project is an experiment in interactive storytelling and applied philosophy. It challenges the notion of free will by creating a compelling narrative of cause and effect. Starting from a user-defined premise, the application uses Google's Gemini API to generate a branching, yet convergent, path of preceding causes. The goal is to make the user feel like a participant in a causal chain that is both personal and universal, leading them to a foundational truth they couldn't have escaped.

### Live Demo

Experience the inevitable yourself: **[https://you-were-gonna-end-up-here.vercel.app/](https://you-were-gonna-end-up-here.vercel.app/)**

### Screenshots

Below are some previews of the application in action.

<br />

<a href="https://github.com/bvrvl/you-were-gonna-end-up-here/blob/main/assets/screenshot1.png" target="_blank">
  <img src="./assets/screenshot1.png" alt="A screenshot showing the initial phase of the application after the user has defined a premise" width="700"/>
</a>

<br />

<a href="https://github.com/bvrvl/you-were-gonna-end-up-here/blob/main/assets/screenshot2.png" target="_blank">
  <img src="./assets/screenshot2.png" alt="A screenshot showing the end causal chain, with several nodes connected, and the user presented with the final cause" width="700"/>
</a>

---

This project is built on a modern, full-stack architecture.

-   **Frontend:** [React.js](https://reactjs.org/), [Vite](https://vitejs.dev/)
-   **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
-   **AI:** [Google Gemini](https://ai.google.dev/)
-   **Deployment:** [Vercel](https://vercel.com/)

---

### Getting Started

To get a local copy up and running, follow these steps.

#### Prerequisites

-   Node.js (v18 or later)
-   `npm` / `pnpm` / `yarn`

#### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/bvrvl/you-were-gonna-end-up-here.git
    cd you-were-gonna-end-up-here
    ```

2.  **Install NPM packages**
    ```sh
    npm install
    ```

3.  **Set up your environment variables**
    You'll need a Google Gemini API key. Create a `.env` file in the root of the project and add your key:
    ```.env
    GEMINI_API_KEY='YOUR_API_KEY_HERE'
    ```

4.  **Run the development server**
    This will start the frontend on `http://localhost:5173` (or another port if 5173 is busy) and the backend API server on `http://localhost:3001`.
    ```sh
    npm run dev
    ```

---

### How It Works

The application state is managed by React on the frontend. When a user makes a choice, the entire history of their causal chain is sent to a serverless backend running on Vercel.

1.  **User Input**: The user provides the first "cause" or selects one from an AI-generated list.
2.  **API Call**: The React frontend POSTs the entire causal history to the `/api/generate` endpoint.
3.  **AI Processing**: The Node.js/Express backend receives the history. It constructs a detailed prompt for the Gemini API, instructing it to act as a "philosophical guide."
4.  **Dynamic Prompting**: The prompt changes based on the length of the chain.
    -   For short chains (<5 links), the AI is in **Exploration Mode**, providing diverse and insightful preceding causes.
    -   For longer chains (>=5 links), the AI enters **Convergence Mode**, guiding the user toward a definitive, foundational origin point (e.g., "You were born," "The laws of physics were set").
5.  **Structured JSON Response**: The Gemini model is configured to return a strictly-typed JSON object, ensuring reliable communication with the frontend.
6.  **UI Update**: The frontend parses the response and updates the UI, either presenting the next set of choices or displaying the final, inevitable conclusion.

---

### Contributing

Contributions, ideas, and feedback are always welcome.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
> *Led and developed by [@bvrvl](https://github.com/bvrvl) as part of [**Kritim Labs**](https://github.com/kritim-labs), an independent creative technology studio.*

### License

Distributed under the ISC License. See [LICENSE](LICENSE) file for more information.
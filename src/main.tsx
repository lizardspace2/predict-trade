import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Initialiser Web3Modal
import "./web3/config";

createRoot(document.getElementById("root")!).render(<App />);

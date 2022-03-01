import "./app.css";
import Home from "./Home.svelte";

const app = new Home({
  target: document.getElementById("app"),
});

export default app;

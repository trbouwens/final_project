import App from './App.svelte';
import Login from "./Login.svelte";

const app = new Login({
  target: document.body,
  props: {
    name: 'world'
  }
});

window.app = app;

export default app;
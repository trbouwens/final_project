import Login from "./Login.svelte";

const login = new Login({
  target: document.body,
  props: {
    name: 'world'
  }
});

window.login = login;

export default login;
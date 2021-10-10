<script>
    let username = "";
    let password = "";

    function attemptSignup(event) {
        event.preventDefault();
        fetch("/auth/signup", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        }).then(() => attemptLogin(event));
    }

    function attemptLogin(event) {
        event.preventDefault();
        fetch("/auth/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        }).then(x => x.json())
            .then(console.log);
    }
</script>

<input bind:value={username} placeholder="Username">
<input bind:value={password} placeholder="Password">
<button on:click={attemptSignup}>Signup</button>
<button on:click={attemptLogin}>Login</button>
<script>
    import "semantic-ui-css/semantic.css";
    import { writable } from 'svelte/store';

    let username = "";
    let password = "";
    let errors = writable([]);

    function attemptSignup(event) {
        event.preventDefault();
        fetch("/auth/signup", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
            .then(handleResponse)
            .catch(err => $errors = err)
            .then(() => attemptLogin(event));
    }

    function attemptLogin(event) {
        event.preventDefault();
        fetch("/auth/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
            .then(handleResponse)
            .catch(err => $errors = err);
    }

    function handleResponse(res) {
        // FIXME: I feel like this should be automatic, is there a better solution?
        if (res.redirected) {
            location.replace(res.url);
        }

        if (res.status === 401) {
            return Promise.reject(["incorrect username and/or password"]);
        }

        return res.json()
            .then(body => {
                if (body.hasOwnProperty("errors")) {
                    return Promise.reject(body.errors);
                }

                return body;
            });
    }
</script>

<style>
    .grid {
        height: 100%;
    }

    .column {
        max-width: 500px;
    }
</style>

<div class="ui middle aligned center aligned grid">
    <div class="column">
        <h2 class="ui teal header">
            <div class="content">Sample login page</div>
        </h2>
        <form class="ui large form {$errors.length === 0 ? '' : 'error'}">
            <div class="ui stacked segment">
                <div class="field">
                    <div class="ui left icon input">
                        <i class="user icon"></i>
                        <input bind:value={username} placeholder="Username">
                    </div>
                </div>
                <div class="field">
                    <div class="ui left icon input">
                        <i class="lock icon"></i>
                        <input bind:value={password} placeholder="Password">
                    </div>
                </div>
                <div on:click={attemptLogin} class="ui left attached large teal submit button">Login</div>
                <div on:click={attemptSignup} class="right attached ui large teal submit button">Sign Up</div>
            </div>
            <div id="errors" class="ui error message">
                <ul class="list">
                    {#each $errors as item}
                        <li>{item}</li>
                    {/each}
                </ul>
            </div>
        </form>
    </div>
</div>

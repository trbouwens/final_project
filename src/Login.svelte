<script>
    import "semantic-ui-css/semantic.css";
    import {writable} from 'svelte/store';

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
                <div class="field {$errors.length === 0 ? '' : 'error'}">
                    <div class="ui left icon input">
                        <i class="user icon"></i>
                        <input bind:value={username} type="text" placeholder="Username">
                    </div>
                </div>
                <div class="field {$errors.length === 0 ? '' : 'error'}">
                    <div class="ui left icon input">
                        <i class="lock icon"></i>
                        <input bind:value={password} type="password" placeholder="Password">
                    </div>
                </div>
                <div on:click={attemptLogin} class="ui left attached large teal submit button">Login</div>
                <div on:click={attemptSignup} class="right attached ui large teal submit button">Sign Up</div>

                <div class="ui horizontal divider">
                    Or
                </div>
                <button class="ui github button">
                    <a href="https://github.com/login/oauth/authorize?client_id=6256bfaa417e8c70d5df">
                        <i class="github icon"></i>
                        GitHub
                    </a>
                </button>
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

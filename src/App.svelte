<script>
    import 'codemirror/mode/javascript/javascript'
    import CodeMirror from '@joshnuss/svelte-codemirror'

    let editor;
    let code = "const x = 42";
    let filesPromise = ["loading..."];
    let saveName = "";

    // Request file list be loaded upon page opened
    getFiles();

    function getFiles() {
        fetch('/files', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(json => filesPromise = json.files);
    }

    function loadFile(event) {
        const name = event.target.getAttribute("name");

        fetch("/load", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        })
            .then(response => response.json())
            .then(json => {
                code = json.code;
                console.log(json);
            });
    }

    function saveFile(event) {
        event.preventDefault();
        const textToWrite = editor.doc.getValue();

        const json = {
            name: saveName,
            code: textToWrite
        };

        console.log("Saving file")

        fetch("/save", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(json)
        })
            .then(function (response) {
                if (response.status === 200) {
                    getFiles();
                } else {
                    return response.text();
                }
            });
    }
</script>

<div class="box">
    <div class="sidebar">
        {#await filesPromise then files}
            <ul>
                {#each files as f}
                    <li name={f} on:click={loadFile}>{f}.js</li>
                {/each}
            </ul>
        {/await}
    </div>

    <div class="codebox">
        <CodeMirror bind:editor options={{ lineNumbers: true, mode: "javascript"}} class="editor" value={code}/>
    </div>
</div>

<form action="">
    <input type="text" bind:value={saveName}/>
</form>
<button on:click={saveFile}>
    Save
</button>

<style>

    .box {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: nowrap;
    }

    :global(.editor) {
        /* Set height, width, borders, and global font properties here */
        font-family: monospace;
        height: 300px;
        direction: ltr;
        color: var(--cm-text-color);
        background: var(--cm-background-color);
    }
</style>

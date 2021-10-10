<script>
    import "semantic-ui-css/semantic.css";
    import 'codemirror/mode/javascript/javascript';
    import CodeMirror from '@joshnuss/svelte-codemirror';

    const config = {
        lineNumbers: true,
        mode: "javascript"
    };

    let editor;
    let code = "const x = 42";
    let filesPromise = ["loading..."];
    let saveName = "untitled.js";

    let currentFile = "unnamed.js";

    // Request file list be loaded upon page opened
    getFiles();

    function parentResize(parent) {
        console.log("Resize!");
        // const parent = event.target;
        const totalHeight = parent.height;
        const offset = editor.offsetTop;
        console.log("Total height:" + parent);
        console.log("Offset:" + offset);
        editor.setSize(editor.width, totalHeight - offset);
    }

    function getFiles() {
        fetch('/files', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(json => filesPromise = json.files);
    }

    function loadFile(event) {
        currentFile = event.target.getAttribute("name");
        saveName = currentFile;

        fetch("/load", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: currentFile})
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

        console.log("Saving file");

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

<div class="ui bottom attached segment pushable">
    <div class="ui visible inverted left vertical sidebar menu">
        {#await filesPromise then files}
            {#each files as file}
                <a name={file} on:click={loadFile} class="{file === currentFile ? 'active' : ''} item">
                    {file}
                </a>
            {/each}
        {/await}
    </div>
    <div class="pusher">
        <div class="ui basic bottom attached segment">
            <h3 class="ui header">
                <div class="ui transparent icon input">
                    <a on:click={saveFile}>
                        <i class="save icon"></i>
                    </a>
                    <input type="text" placeholder="untitled.js" bind:value={saveName}/>
                </div>
            </h3>
            <div class="codeArea">
                <CodeMirror bind:editor options={config} value={code}/>
            </div>
        </div>
    </div>
</div>

<style>
    CodeMirror {
        /*  *Demonic Screeching*  */
    }
</style>

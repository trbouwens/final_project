<script>
    import "semantic-ui-css/semantic.css";
    import CodeMirror from '@joshnuss/svelte-codemirror';
    import 'codemirror/mode/javascript/javascript';
    import 'codemirror/lib/codemirror.css';

    const config = {
        lineNumbers: true,
        mode: "javascript",
        viewportMargin: Infinity
    };

    let editor;
    let code = "const x = 42";
    let filesPromise = ["loading..."];
    let saveName = "untitled.js";

    let currentID = null;

    // Request file list be loaded upon page opened
    getFiles();

    function getFiles() {
        fetch('/api/files', {
            method: 'GET'
        })
            .then(res => {
                // Follow redirect for when user is not logged in
                if (res.redirected) {
                    location.replace(res.url);
                }

                return res.json();
            })
            .then(json => {
                filesPromise = json;
                if (currentID === null){
                    currentID = json[0]._id;
                }
            });
    }

    function loadFile(event) {
        currentID = event.target.getAttribute("id");
        saveName = "loading...";
        code = "";

        fetch("/api/load", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: currentID})
        })
            .then(response => response.json())
            .then(json => {
                saveName = json.name;
                code = json.code;         
            });
    }

    function saveFile(event) {
        event.preventDefault();
        const textToWrite = editor.doc.getValue();

        const json = {
            id: currentID,
            name: saveName,
            code: textToWrite
        };

        fetch("/api/save", {
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

    function download(event) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(editor.doc.getValue()));
        element.setAttribute('download', saveName);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function makeNew(event){
        event.preventDefault();

        saveName = 'untitled.js';
        code = "";
        // placeholder for aesthetics
        const menu = document.getElementById("filesMenu");
        const newPlaceholder = document.createElement('a');
        newPlaceholder.textContent = saveName;
        newPlaceholder.classList.add("item");
        menu.appendChild(newPlaceholder);

        const json = {
            name: saveName,
            code
        };

        fetch("/api/create", {
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
                newPlaceholder.remove();
            });
    }
</script>

<div class="ui bottom attached segment pushable">
    <div class="ui visible inverted left vertical sidebar menu" id="filesMenu">
        {#await filesPromise then files}
            {#each files as file}
                <a name={file.name} id={file._id} on:click={loadFile} class="{file._id === currentID ? 'active' : ''} item">
                    {file.name}
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
                    <a on:click={makeNew}>
                        <i class="plus icon"></i>
                    </a>
                    <a on:click={download}>
                        <i class="cloud download icon"></i>
                    </a>
                </div>
            </h3>
            <div class="codeArea">
                <CodeMirror bind:editor options={config} value={code}/>
                <style> .CodeMirror { height: 800px; } </style>
            </div>
        </div>
    </div>
</div>

<style>
    .codeArea {
        height: 800px
    }
</style>

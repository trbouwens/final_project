<script>
    import "semantic-ui-css/semantic.css";
    import 'codemirror/mode/javascript/javascript';
    import CodeMirror from './index'

    let editor;
    let code = "";
    let filesPromise = ["loading..."];
    let saveName = "untitled.js";

    let currentID = null;

    const config = {
        lineNumbers: true,
        mode: "javascript",
        viewportMargin: Infinity,
        value: code
    };

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
                    //if no valid file is currently selected, select the first
                    currentID = json[0]._id;
                    const menu = document.getElementById("filesMenu");
                    menu.children.item(0).click();
                }
            });
    }


    function loadFile(event) {
        if(event.target.getAttribute("id") !== null) {
            currentID = event.target.getAttribute("id");
        }
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
                config.value = json.code;
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

    function deleteFile(event){
        event.preventDefault();

        const json = {
            id: currentID,
        };

        fetch("/api/delete", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(json)
        })
            .then(function (response) {
                if (response.status === 200) {
                    if(currentID === filesPromise[0]._id){
                        makeNew(event)
                    }
                    getFiles();
                } else {
                    return response.text();
                }
            });
    }

    let fileinput;
    function fileSelected(event){
        let uploadFile = event.target.files[0];

        saveName = uploadFile.name;
        code = "loading...";

        //contents of file
        let reader = new FileReader();
        reader.readAsText(uploadFile)
        reader.onload = event=>{
            code = event.target.result;

            //now save as new file
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
            });
        }
    }

    function share(event){
        event.preventDefault()
        const sharee = document.getElementById("sharee").value;
        let json = {username: sharee, id: currentID}
        fetch("/api/share", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(json)
        }).then(function (response) {
                if (response.status === 200) {
                    currentID = null;
                    getFiles();
                } else {
                    return response.text();
                }
            });
    }
</script>

<div class="ui bottom attached segment pushable">
    <div class="ui visible inverted left vertical sidebar menu" id="filesMenu">
        {#await filesPromise then files}
            {#each files as file}
                <a name={file.name} id={file._id} on:click={loadFile}
                class="{file._id === currentID ? 'active' : ''} item">
                    {file.name}
                </a>
            {/each}
        {/await}
    </div>
    <div class="pusher">
        <div class="ui basic bottom attached segment">
            <h3 class="ui header">
                <div class="ui transparent icon input">
                    <a on:click={makeNew}>
                        <i class="plus icon"></i>
                    </a>
                    <input type="text" placeholder="untitled.js" bind:value={saveName}/>
                    <a on:click={saveFile}>
                        <i class="save icon"></i>
                    </a>
                     <a on:click={deleteFile}>
                        <i class="trash alternate icon"></i>
                    </a>
                    <a on:click={()=>{fileinput.click();}}>
                        <i class="cloud upload icon"></i>
                         <input style="display:none" type="file" accept=".js, .txt"
                         on:change={(e)=>fileSelected(e)} bind:this={fileinput}>
                    </a>
                    <a on:click={download}>
                        <i class="cloud download icon"></i>
                    </a>
                    <label for="sharing" id="shareLabel">Share with:</label>
                    <input type="text" id="sharee" name="sharing" style="background-color:grey; width:300px">
                    <a on:click={share}>
                        <i class="share icon"></i>
                    </a>
                </div>
            </h3>
            <div class="codeArea">
                <CodeMirror class="editor" bind:editor options={config}/>
                <style> .CodeMirror { height: 800px; } </style>
            </div>
        </div>
    </div>
</div>

<style>
    .codeArea {
        height: 800px
    }
    #shareLabel {
        font-size: medium;
    }
</style>

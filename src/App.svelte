<script>
  import 'codemirror/mode/javascript/javascript'
  import CodeMirror from '@joshnuss/svelte-codemirror'

  let editor
  let code = "const x = 42"

  function getFiles() {
    const p = fetch( '/files', {
      method:'GET'
    })
    .then( response => response.json() )
    .then( json => {
      promise = json.files
      return json.files
    })
    return p
  }

  function load(x) {
    let file = x.f

    let json = {
      name: file
    }
    let body = JSON.stringify(json);

    fetch("/load", {
  			method: "POST",
        headers: { 'Content-Type': 'application/json' },
  			body
  	})
    .then( response => response.json() )
    .then( json => {
      code = json.code
      console.log(json)
    })
    // code = "const x = 69420\nconst y = 21"
  }

  function save() {
    var textToWrite = editor.doc.getValue();

    const input = document.getElementById("saveName"),
      json = {
        name: input.elements[0].value,
        code: textToWrite
      },
      body = JSON.stringify(json);

    console.log("Saving file")

    fetch("/save", {
  			method: "POST",
        headers: { 'Content-Type': 'application/json' },
  			body
  	})
    .then( function( response ) {
  			if (response.status === 200) {
  					console.log(body);
            getFiles()
  			} else {
  					return response.text();
  			}
  	})

    return true
  }

let promise = ["test"]

</script>

<div class = "box">
  <div class = "sidebar">
    {#await promise then files}
      <ul>
        {#each files as f}
          <!-- USE CSS TO MAKE SIDEBAR ITEMS CLICKABLE. <a> IS ONLY TEMPORARY -->
          <li on:click={() => load({f})}> <a href="#"> {f}.js </a> </li>
        {/each}
      </ul>
    {/await}
  </div>

  <div class = "codebox">
    <CodeMirror bind:editor options={{ lineNumbers: true, mode: "javascript"}} class="editor" value={code}/>
  </div>
</div>

<form class="forms" id="saveName" action="">
  <input type="text" id="fileName" />
</form>
<button on:click={save}>
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

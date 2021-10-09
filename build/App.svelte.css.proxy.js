// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".box.svelte-r53fp3{display:flex;flex-direction:row;justify-content:flex-start;flex-wrap:nowrap}.editor{font-family:monospace;height:300px;direction:ltr;color:var(--cm-text-color);background:var(--cm-background-color)}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}
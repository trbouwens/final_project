# CS 4241 - Group 18 - The G18 Text Editor

## About:
We created the G18 text editor, a platform to upload, edit, share, and download text-based files.
Using the G18 editor is quick and easy, simply logging in with existing credentials or signing up with new ones (or using github OAuth)
allows the user to save and display all their files, and gives the ability to share the files edit access with other users. Users also have the ability to add new files, either from scratch by name, or by uploading them from their computer, and any files added or edited on the site can be downloaded back at any time. The editor is reactive, meaning it should always display the most recent changes to your files, and to the list of files accessible to any user. Syntax highlighting for JavaScript is also fully functional, meaning Javascript code edits can be done neatly and with the same ease of use that a regular text editor could give you.

Link: http://206.189.66.0/

## Additional Instructions:
There's no one specific login instructions, as github OAuth will allow for anyone to log in with ease.
The only thing of note is that a shared file being edited simultaneously can lead to unexpected results.  

## Outline of Technologies:
- We used OAuth to allow for users to login via Github instead of just the regular local login. This was done using Passport.
- The Code Editor uses CodeMirror, and was given a layer of abstraction to allow it to work with Svelte, as the only Svelte specific libraries didn't allow for code syntaxing.
- Svelte was used for the component view of both the login and main editor screens, and it allowed for easy editing of the site, and was remarkably convenient.
- Semantic UI was the CSS Framework that we chose to use, and helped the most as it provided neat icons for ease of accessibility, and was a very clean UI for the editor.
- Our Server utilized a route formatted express framework in NodeJS, allowing for good organization of server activities, and meant that our front end could work with a stable API setup to communicate back and forth with the server in.

## Challenges:
- Our first challenge was getting Svelte and CodeMirror to communicate well and in a way that allowed the live updating of files, as well as always displaying the existing live files.
- Another challenge was getting OAuth to work, as the tricky process alone, not to mention the bugs and issues that arose while going through it, took up a lot of time.
- Asynchronous behavior also caused a lot of hiccoughs in how we displayed files, and/or handled their uploading and removal. There were several bug-fixing sessions devoted to getting the file explorer and code editor working with the promises of other functions.
- CodeMirror was very problematic when it came to code colouring, and working nicely with Svelte. The two existing Svlete CodeMirror libraries didn't allow for theming or CodeColoring, so it was a a lot of work to try to figure out a way around this, and get something colored. We tried Highlight.js, but it als wasn't working nicely with Svelte, so in the end we simply rebased our CodeMirror implementation from scratch using their Open Source Svelte editor as a framework.

## What each group member was responsible for designing / developing:
Jasper Meggitt:
  - Rebased the express server to use Routes and have a standardized API
  - Implemented the OAuth functionality to the application.
  - Implemented the Semantic UI framework and designed the basic layout of the app.
  - Fixed miscellaneous async and other bugs.
  - Hosted the server on Digital Ocean

Mago Sheehy:
  - Got the Delete and download buttons working.
  - Implemented the share file feature.
  - Fixed miscellaneous async and other bugs.

Owen Blaufuss:
  - Got the Upload and Delete Buttons working.
  - Got the Add New file working
  - Fixed miscellaneous async and other bugs.

Tyler Bouwens:
  - Made the initial prototype of the app, including renaming, switching, and editing files.
  - Got CodeMirror working, and files being sent to and from the server to edit.
  - Got code-coloring to work
  - Fixed miscellaneous async and other bugs.

## Project Video
https://drive.google.com/file/d/1k00O_N9bjZCybzWKvnTiilqdOY3qo1WZ/view?usp=sharing
https://youtu.be/XRm4evdDj9I

## How to run on localhost

First install dependencies:
```sh
npm install
```

Next, build the project
```sh
npm run build
```
Finally, start up the server.:
```sh
npm run start
```

Then go to http://localhost:3000

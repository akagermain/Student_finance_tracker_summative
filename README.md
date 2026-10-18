# Pocketful
This is a simple, accessible expense tracker for students, and it is built with HTML, CSS and JavaScript only, no other frameworks. This is the theme chosen among the three themes proposed.

With this app, you can add expenses, edit or delete them, with a confirmation before anything is deleted. You can search and sort the expenses, matches are highlighted. The dashboard shows your total and a seven day chart. You can set monthly cap and see how much is left. Setting monthly cap is done in settings section. You can type exchange rates for USD and EUR, edit your categories and switch on dark mode. Everything saves automatically, and you can export or import your data as a JSON file. An imported file is checked completely first, so bad files can never break the app.

To directly check the web app, below are the website link and demo link, you can click on each to view.

- Live site link: [Pocketful](https://akagermain.github.io/pocketful/)
- Demo video: [Frontend-Web_Summative_Demo_Video](https://youtu.be/vwluVNrXrCg)

## Features and Regex
Features about the app, and the regex patterns applied are explained in SPEC.md which is located in docs directory. You click the link below to directly open it.

[Click here to view the source](./docs/SPEC.md)

## Keyboard map

- Tab/Shift+tab: Move to the next/previous item. 
- Enter: Follow a link, a press button, or submit the form.
- Space: Press a button, or switch a checkbox or the dark mode switch.
- Esc: Cancels editing a row, and closes a confirmation box without doing anything.

## How to run the app locally
- Cick the code dropdown in the repository header, click download zip, after downloading extract the files.
- Open VS code on your laptop, if you don't have Live Server extension install it. 
- Open index.html file in VS code, right-click, choose open with live server

#### Alternative way to run it
- If you have python installed on your computer, in VS code terminal run `python3 -m http.server 8000`
- Then open your browser and write: `http://localhost:8000`

## How to run the tests
To run the tests, follow the procedure as explained above to open the following files which run the tests. They are all located in tests directory.
1. Form validators: tests/validators.test.js
2. Dashboard maths: tests/stats.test.js
3. Saving and JSON files: tests/jsonfile.test.js

Each group shows a summary line like `44 passed, 0 failed`

## Project Structure
The following structure points everything from the root through each directory.

```
index.html
test.html
seed.json
styles/ main.css
tests/ validator.test.js stats.test.js jsonfile.test.js
docs/ SPEC.md wireframes/
scripts/ main.js router.js state.js storage.js validators.js search.js sort.js stats.js ui.js dashboard.js settings.js datatools.js jsonfile.js seed.js
codepause_report/ codepause-export-1792347325174
```

## Contact
- GitHub: [akagermain](https://github.com/akagermain)
- Email: [g.iradukund2@alustudent.com](mailto:g.iradukund2@alustudent.com)


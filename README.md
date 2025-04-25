# Trillium Zotero

Make it passable to cite documen in trillium from Zotero!

![Alt text](image.png)

**Welcome for pull request or fork and recreate**

## Usage

After moving the mouse to the desired location where you want to add a citation, press "Alt+Shift+X" to activate the Zotero selection dialog. Once you select the reference, it will be inserted at that location.

## Install

**This plugin depends on Better BibTeX for Zotero. Please refer to [this link](https://retorque.re/zotero-better-bibtex/installation/index.html) for installation instructions.**

1. Open Trillium and navigate to the section where you want to create the note.
2. Click on the "New Note" button or use the keyboard shortcut to create a new note.
3. In the note editor, set the type of the note as "JS frontend" and add tag `#run=frontendStartup ` if you want it enabled on startup.
4. Copy the contents of `AddZoteroCitation.js` paste it into the content area of the note.
5. Save the note and do the same to `AddZoteroBibliography.js`.
6. Restart Trillium to ensure the changes take effect.

## Export

**Export depends on  trilium-py，Please refer to [this link](https://github.com/Nriver/trilium-py#-installation)for installation instructions.**

Please edit the config.ini file to set the parameters.

This script converts the content of Trilium notes to Markdown, applies Zotero citation processing using the zotero.lua provided by Better BibTeX for Zotero, and finally exports it to the docx format.

``` bash
python export.py trilium_id
```

## Problem known

- After opening the note, you may need to wait for approximately 3 seconds for the JS plugin to load
- Lack of a more user-friendly interface
- Lack of export functionality
- Lack of testing for special content

## Todo

- make it more user-friendly

## Update log

- 2025.04-25 add support for bibliography generation
- 2023.11.22 initial the project
- 2023.11.30 add export

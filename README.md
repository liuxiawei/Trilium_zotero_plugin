
# Trilium Zotero Plugin

[English](README.md) | [中文](README.zh.md)

Enables seamless citation of Zotero references directly within Trilium Notes!

![Plugin UI](image.png)

**Pull requests and forks are welcome!**

## Usage

### Inserting Citations

- Ensure Zotero is running.
- In your Trilium note, place the cursor where you want to insert a reference and click the 📚 button in the bottom-right corner.
- Zotero will pop up a selection window—choose the references you wish to cite.
- Return to Trilium—the citation will be automatically inserted in the format `(Smith, 2020; Zhang, 2022)`.

> **Note**: The legacy shortcut `Alt+Shift+X` is still available and can be modified in the source code if needed.

### Reference List

If your note contains a level-2 heading such as `## References` or `## Ref`, the reference list will be **automatically updated** after each citation insertion.  
Alternatively, hover over the 📚 button to reveal an **“R” button**, which allows you to manually refresh the bibliography.

⚠️ **Auto-generated content includes a warning notice. Do not edit it manually—your changes will be overwritten on the next update.**

---

## Installation

> **This plugin requires Better BibTeX for Zotero.**  
> See the [official installation guide](https://retorque.re/zotero-better-bibtex/installation/index.html) for setup instructions.

1. Open Trilium and navigate to the section where you'd like to create the plugin note.
2. Click **"New Note"** or use a keyboard shortcut to create a new note.
3. In the note editor:
   - Set the note type to **"JS frontend"**.
   - (Optional) To auto-load the plugin on startup, add the label `#run=frontendStartup`.
4. Copy the contents of `AddZoteroCitation.js` and paste them into the note body.
5. Restart Trilium to ensure the changes take effect.

---

## Export

> **Export functionality depends on `trilium-py`.**  
> Install it following the [trilium-py installation guide](https://github.com/Nriver/trilium-py#-installation).

Edit the `config.ini` file to configure export parameters.

This script converts Trilium note content to Markdown, processes Zotero citations using Better BibTeX’s `zotero.lua` filter, and exports the result as a `.docx` file.

```bash
python export.py trilium_id
```

---

## Known Issues

- After opening a note, you may need to wait **~3 seconds** for the JavaScript plugin to load.
- ~~Lack of user-friendly interface (resolved in v2025.11.21).~~
- ~~Missing export feature (added on 2023-11-30 by liuxiawei).~~
- Limited testing with complex or special content formats.

## To-Do

- ~~Improve user-friendliness~~ ✅

## Acknowledgements

Special thanks to **@yiranlus** for code improvements and new feature contributions.

## Changelog

- **2025.11.21** – Added UI enhancements; merged code from @yiranlus  
- **2025.04.25** – Added support for automatic reference list generation  
- **2023.11.30** – Added export functionality (by liuxiawei)  
- **2023.11.22** – Project initialized

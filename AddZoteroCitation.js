// Zotero Citation Plugin for Trilium Notes v1.3
// Author: Liuxiawei & yiranlus; supported by Qwen (Alibaba Cloud)
// License: MIT


if (document.getElementById('zotero-cite-fab')) {
    console.log("[Zotero Plugin] Already loaded. Skipping.");
    return;
}

// === Language detection ===
const userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
const isZh = userLang.startsWith('zh');

const messages = {
    en: {
        fabTitle: "Insert Zotero Citation",
        refFabTitle: "Update References",
        noEditor: "❌ Editor not found",
        noCitations: "⚠️ No Zotero citations found (format: zotero://...)",
        missingRefHeading: "⚠️ Please add '## Ref' or '## References'",
        inserted: items => `✅ Inserted ${items} citation(s)`,
        updated: count => `✅ References updated (${count} item(s))`,
        connectionFailed: err => `❌ Zotero connection failed: ${err.message}`,
        noSelection: "⚠️ No citation selected in Zotero",
        updateFailed: err => `❌ Update failed: ${err.message || 'Unknown error'}`
    },
    zh: {
        fabTitle: "插入 Zotero 引用",
        refFabTitle: "更新参考文献",
        noEditor: "❌ 未找到编辑器",
        noCitations: "⚠️ 未找到 Zotero 引用（格式应为 zotero://...）",
        missingRefHeading: "⚠️ 请先添加 '## Ref' 或 '## References'",
        inserted: items => `✅ 已插入 ${items} 条引用`,
        updated: count => `✅ 参考文献已更新（${count} 条）`,
        connectionFailed: err => `❌ Zotero 连接失败: ${err.message}`,
        noSelection: "⚠️ Zotero 中未选择引用",
        updateFailed: err => `❌ 更新失败: ${err.message || '未知错误'}`
    }
};

const msg = isZh ? messages.zh : messages.en;

// === Inject styles ===
const style = document.createElement('style');
style.textContent = `
#zotero-cite-fab {
    position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
    border-radius: 50%; background: linear-gradient(135deg, #4A90E2, #50C878);
    color: white; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center;
    z-index: 10000; transition: transform 0.2s;
    font-family: system-ui, -apple-system, sans-serif;
}
#zotero-cite-fab:hover { transform: scale(1.1); }

#zotero-ref-fab {
    position: fixed; bottom: 90px; right: 24px; width: 48px; height: 48px;
    border-radius: 50%; background: #6c757d; color: white; border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    opacity: 0.9;
}
#zotero-ref-fab:hover { opacity: 1; }

a[href^="zotero://"] {
    color: #4A90E2 !important; text-decoration: none !important;
    background-color: rgba(74, 144, 226, 0.1); padding: 0 4px;
    border-radius: 3px; font-size: 0.9em; cursor: pointer;
}
a[href^="zotero://"]:hover { background-color: rgba(74, 144, 226, 0.2); }

a[href^="zotero://auto-generated/"] {
    color: #6c757d !important;
    font-style: italic;
    user-select: none;
    pointer-events: none;
}
`;
document.head.appendChild(style);

// === Utility: Safe slug ===
function safeSlug(str) {
    if (!str) return 'untitled';
    return str
        .replace(/<[^>]*>/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// === Extract valid citation keys ===
function extractCitationKeys(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a[href^="zotero://"]');
    const keys = new Set();

    for (const a of links) {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('zotero://auto-generated/')) continue;
        const match = href.match(/^zotero:\/\/(?:[^+]*\+)?([A-Za-z0-9:_\-.]+)$/);
        if (match) keys.add(match[1]);
    }
    return Array.from(keys);
}

// === Fetch bibliography from Zotero Better BibTeX ===
async function fetchBibliographyHTML(citationKeys) {
    const url = 'http://127.0.0.1:23119/better-bibtex/json-rpc';
    const res = await api.axios.post(url, {
        jsonrpc: "2.0",
        method: "item.bibliography",
        params: [citationKeys, { contentType: "html", id: "apa" }]
    });
    return res.data.result;
}

// === Update references section ===
async function generateAndInsertReferences() {
    try {
        const editor = await api.getActiveContextTextEditor();
        if (!editor) return api.showMessage(msg.noEditor, 3000);

        const currentHtml = editor.getData();
        const citationKeys = extractCitationKeys(currentHtml);

        if (citationKeys.length === 0) {
            return api.showMessage(msg.noCitations, 3000);
        }

        const rawBibHTML = await api.runAsyncOnBackendWithManualTransactionHandling(fetchBibliographyHTML, [citationKeys]);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentHtml;

        let refHeading = null;
        for (const h2 of tempDiv.querySelectorAll('h2')) {
            if (/^\s*(Ref|References)\s*$/i.test(h2.textContent)) {
                refHeading = h2;
                break;
            }
        }

        if (!refHeading) {
            return api.showMessage(msg.missingRefHeading, 4000);
        }

        // Remove old auto-generated content
        let next = refHeading.nextElementSibling;
        while (next && !next.tagName.match(/^H[1-6]$/)) {
            const el = next;
            next = next.nextElementSibling;
            if (el.querySelector?.('a[href^="zotero://auto-generated/"]')) {
                el.remove();
            }
        }

        // Parse new bibliography
        const parser = new DOMParser();
        const bibDoc = parser.parseFromString(rawBibHTML.trim(), 'text/html');
        let entries = Array.from(bibDoc.querySelectorAll('.csl-entry'));
        if (entries.length === 0) {
            entries = Array.from(bibDoc.body.children).filter(el =>
                el.tagName === 'DIV' || el.tagName === 'P'
            );
        }

        const fragment = document.createDocumentFragment();

        // Top hint
        const topHint = document.createElement('p');
        const topLink = document.createElement('a');
        topLink.href = 'zotero://auto-generated/hint-top';
        topLink.textContent = isZh
            ? '=========== 以下内容由 Zotero 自动生成，请勿手动修改 ==========='
            : '=========== The following content is auto-generated by Zotero. Do not edit manually. ===========';
        topHint.appendChild(topLink);
        fragment.appendChild(topHint);

        // Bibliography list
        if (entries.length > 0) {
            const ul = document.createElement('ul');
            for (let i = 0; i < entries.length && i < citationKeys.length; i++) {
                const content = entries[i].innerHTML.trim();
                if (!content) continue;
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `zotero://auto-generated/item+${safeSlug(citationKeys[i])}`;
                a.innerHTML = content;
                li.appendChild(a);
                ul.appendChild(li);
            }
            fragment.appendChild(ul);
        }

        // Bottom hint
        const bottomHint = document.createElement('p');
        const bottomLink = document.createElement('a');
        bottomLink.href = 'zotero://auto-generated/hint-bottom';
        bottomLink.textContent = isZh
            ? '=========== 以上内容由 Zotero 自动生成，请勿手动修改 ==========='
            : '=========== The above content is auto-generated by Zotero. Do not edit manually. ===========';
        bottomHint.appendChild(bottomLink);
        fragment.appendChild(bottomHint);

        refHeading.after(fragment);
        editor.setData(tempDiv.innerHTML);
        api.showMessage(msg.updated(citationKeys.length), 3000);
    } catch (e) {
        console.error("[Zotero Plugin] Update failed:", e);
        api.showMessage(msg.updateFailed(e), 5000);
    }
}

// === Insert citation (CKEditor-safe) ===
async function insertZoteroCitation() {
    let result;
    try {
        result = await api.runAsyncOnBackendWithManualTransactionHandling(async () => {
            const res = await api.axios.get('http://127.0.0.1:23119/better-bibtex/cayw?format=json');
            return res.data;
        });
    } catch (e) {
        return api.showMessage(msg.connectionFailed(e), 5000);
    }

    if (!Array.isArray(result) || result.length === 0) {
        return api.showMessage(msg.noSelection, 3000);
    }

    const editor = await api.getActiveContextTextEditor();
    if (!editor) return api.showMessage(msg.noEditor, 3000);

    editor.model.change(writer => {
        const items = [];
        for (const item of result) {
            try {
                const data = item.item;
                const creators = data.creators || [];
                const lastName = creators[0]?.lastName || 'Unknown';
                let year = 'n.d.';
                if (data.date) {
                    const match = data.date.match(/\b\d{4}\b/);
                    year = match ? match[0] : 'n.d.';
                }
                const displayText = `${lastName}, ${year}`;
                const title = data.title || '';
                const citeKey = item.citationKey || data.itemKey || 'unknown';
                const href = `zotero://${safeSlug(title)}+${safeSlug(citeKey)}`;
                items.push({ displayText, href });
            } catch (err) {
                console.warn("[Zotero Plugin] Failed to process citation:", item, err);
                items.push({ displayText: "Error", href: "#" });
            }
        }

        if (items.length === 0) return;

        const paragraph = writer.createElement('paragraph');
        writer.appendText(' (', paragraph);

        for (let i = 0; i < items.length; i++) {
            const { displayText, href } = items[i];
            const textNode = writer.createText(displayText);
            writer.setAttribute('linkHref', href, textNode);
            writer.append(textNode, paragraph);

            if (i < items.length - 1) {
                writer.appendText('; ', paragraph);
            }
        }

        writer.appendText(') ', paragraph);
        editor.model.insertContent(paragraph);
    });

    api.showMessage(msg.inserted(result.length), 3000);
    setTimeout(generateAndInsertReferences, 600);
}

// === Create buttons with hover-intent logic ===
const fab = document.createElement('button');
fab.id = 'zotero-cite-fab';
fab.title = msg.fabTitle;
fab.textContent = '📚';
fab.onclick = insertZoteroCitation;
document.body.appendChild(fab);

const refFab = document.createElement('button');
refFab.id = 'zotero-ref-fab';
refFab.textContent = 'R';
refFab.title = msg.refFabTitle;
refFab.style.display = 'none'; // Initially hidden
refFab.onclick = generateAndInsertReferences;
document.body.appendChild(refFab);

// Hover intent logic
let hideTimer = null;

const showRefButton = () => {
    clearTimeout(hideTimer);
    refFab.style.display = 'flex';
};

const scheduleHide = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        refFab.style.display = 'none';
    }, 1000);
};

fab.addEventListener('mouseenter', showRefButton);
fab.addEventListener('mouseleave', scheduleHide);
refFab.addEventListener('mouseenter', showRefButton);
refFab.addEventListener('mouseleave', scheduleHide);

// === Shortcuts ===
try {
    api.bindGlobalShortcut('alt+shift+x', insertZoteroCitation);
    api.bindGlobalShortcut('alt+shift+b', generateAndInsertReferences);
} catch (e) {
    console.warn("[Zotero Plugin] Failed to bind shortcuts:", e);
}

console.log(`[Zotero Plugin v1.3] Loaded. Language: ${isZh ? 'Chinese' : 'English'}`);
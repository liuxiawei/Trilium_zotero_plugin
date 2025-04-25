async function AddZoteroCitation() {
    const func = async () => {
        const url = 'http://127.0.0.1:23119/better-bibtex/cayw?format=json';
        return await api.axios.get(url)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                throw new Error(`request failed: ${error.message}`);
            });
    };

    const result = await api.runAsyncOnBackendWithManualTransactionHandling(func, [])
        .then(result => {
            return result;
        })
        .catch(error => {
            return error;
        });

    let editor = await api.getActiveContextTextEditor();
    editor.model.change((writer) => {
        if (result.length > 0) {
            let c = 0;
            let count = result.length;

            for (const item of result) {
                c = c + 1;
                const itemKey = item.item.itemKey;
                //const citationKey = item.item.citationKey;
                const creator = item.item.creators[0];
                //const firstName = creator.firstName;
                const lastName = creator.lastName;
                const date = new Date(item.item.date);
                var year = date.getFullYear();
                if (isNaN(year)) {
                    const yearRegx = item.item.date.match(/\b\d{4}\b/);
                    if (yearRegx) {
                        year = yearRegx[0];
                    } else {
                        year = item.item.date;
                    }
                }
                //const title = item.item.title;
                let cite_content = lastName + ',' + year;
                if (count == 1) {
                    cite_content = "(" + cite_content + ")";
                } else {
                    if (c == 1 && c < count) {
                        cite_content = "(" + cite_content + ";";
                    } else if (c == count) {
                        cite_content = cite_content + ")";
                    } else {
                        cite_content = cite_content + ";";
                    }
                }
                const myLink = writer.createText(
                    cite_content, {
                        linkHref: `zotero://select/library/items/${itemKey}`
                    }
                );
                editor.model.insertContent(myLink);
            }
        }
    });
}

api.bindGlobalShortcut('alt+shift+x', AddZoteroCitation);
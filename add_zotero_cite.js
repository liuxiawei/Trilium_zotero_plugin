async function add_zotero_cite() {

    const func = async (axios) => {
        const url = 'http://127.0.0.1:23119/better-bibtex/cayw?format=json'; // 指定的网址
        return await api.axios.get(url)
            .then((response) => {
                return response.data; // 返回获取到的内容
            })
            .catch((error) => {
                throw new Error(`请求失败: ${error.message}`);
            });
    };
    const params = [api.axios];
    const result = await api.runAsyncOnBackendWithManualTransactionHandling(func, params)
        .then((result) => {
            //console.log(result); // 输出获取到的内容
            return result;
        })
        .catch((error) => {
            // console.error(error.message); // 处理错误
            return error;
        });
    console.log(result);
    let editor = await api.getActiveContextTextEditor();
    editor.model.change((writer) => {
        if (result.length > 0) {
            let c = 0;
            // editor.model.insertContent(writer.createText('('));
            let count = result.length
            for (const item of result) {
                c = c + 1;
                //if (c > 1) {
                //    editor.model.insertContent(writer.createText(';'));
                //} else {
                //}
                const citationKey = item.item.citationKey;
                const creator = item.item.creators[0];
                const firstName = creator.firstName;
                const lastName = creator.lastName;
                const date = item.item.date;
                const title = item.item.title;
                let cite_content = lastName + ' ' + firstName + ',' + date;
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
                    cite_content,
                    { linkHref: `${title}#zotero#${citationKey}` }
                );
                // 在编辑器中插入元素
                editor.model.insertContent(myLink);
            }
            //editor.model.insertContent(writer.createText(')'));
        }
    });
}
api.bindGlobalShortcut('alt+shift+x', add_zotero_cite);
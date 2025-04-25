async function AddZoteroBibliography() {

    const getCitationKeys = async (ids) => {
        const url = 'http://localhost:23119/better-bibtex/json-rpc';
        return await api.axios.post(url, {
            jsonrpc: "2.0",
            method: "item.citationkey",
            params: [ ids ]
        }).then(response => {
            const citationMap = response.data.result;
            return Object.entries(citationMap).map(([key, value]) => { return value; });
        }).catch(error => {
            throw new Error(`request failed: ${error.message}`);
        });
    };

    const getBibliography = async (citationKeys) => {
        const url = 'http://localhost:23119/better-bibtex/json-rpc';
        return await api.axios.post(url, {
            "jsonrpc": "2.0",
            "method": "item.bibliography",
            "params": [
                citationKeys,
                {
                    "contentType": "html",
                    "id": "apa"
                }
            ]
        }).then((response) => {
            return response.data.result;
        }).catch((error) => {
            throw new Error(`request failed: ${error.message}`);
        });
    };

    let editor = await api.getActiveContextTextEditor();
    const links = $(editor.getData()).find('a[href^="zotero://"]').get();
    var IDs = links.map(a => {
        const hrefValue = a.href;
        const parts = hrefValue.split('/');
        return parts[parts.length - 1];
    });
    IDs = IDs.filter((item, index) => IDs.indexOf(item) === index);
    console.log("IDs: ", IDs);

    const citationKeys = await api.runAsyncOnBackendWithManualTransactionHandling(getCitationKeys, [IDs])
        .then((result) => {
            return result;
        })
        .catch((error) => {
            return error;
        });
    console.log(citationKeys);

    const bibliography = await api.runAsyncOnBackendWithManualTransactionHandling(getBibliography, [citationKeys])
        .then((result) => {
            return result;
        })
        .catch((error) => {
            return error;
        });
    /*
    const refFragment = editor.model.change(writer => {
        const listElement = writer.createElement("ul");
        const refFragment = writer.createDocumentFragment();
        writer.append(listElement, refFragment);

        bibliography.split('\n').forEach(value => {
            if (!value) return;

            console.log("Item: ", value);
            const listItem = writer.createElement("li");
            writer.insertText(value, listItem);

            writer.append(listItem, listElement);
        });

        console.log(refFragment);
        return refFragment;
    });

    editor.model.insertContent(refFragment);
    */
    editor.model.change(writer => {
        var $ul = $('<ul></ul>');

        var $innerDivs = $(bibliography).first().children('div');
        console.log($innerDivs);

        $innerDivs.map((k, $v) => {
            var $li = $('<li></li>').append($v.innerHTML);
            $ul.append($li);
        });

        const viewFragment = editor.data.processor.toView( $ul.prop('outerHTML') );
		const modelFragment = editor.data.toModel( viewFragment );
        editor.model.insertContent(modelFragment);
    });
	console.log(editor);
}

api.bindGlobalShortcut('alt+shift+b', AddZoteroBibliography);
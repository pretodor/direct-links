function saveTCoLinkNodesAndUrls(rootNode,
                                 tCoLinkNodes,
                                 urls) {
    let linkNodes = rootNode.getElementsByTagName("a");
    for (let linkNode of linkNodes) {
        if (linkNode.href.startsWith("http://t.co/")
            || linkNode.href.startsWith("https://t.co/")) {

            tCoLinkNodes.push(linkNode);

            if (linkNode.title && !urls[linkNode.href]) {
                urls[linkNode.href] = linkNode.title;
            }
        }
    }
}

let urls = {};

function resolveTCoLinkNodes(tCoLinkNodes) {
    for (let tCoLinkNode of tCoLinkNodes) {
        if (urls[tCoLinkNode.href]) {
            tCoLinkNode.href = urls[tCoLinkNode.href];
        }
    }
}

function resolveLinkNodes(rootNode) {

    let tCoLinkNodes = [];
    let iFrameNodes = rootNode.getElementsByTagName("iframe");

    // maybe just saveUrls(); ?
    saveTCoLinkNodesAndUrls(rootNode, tCoLinkNodes, urls);

    for (let iFrameNode of iFrameNodes) {
        saveTCoLinkNodesAndUrls(iFrameNode.contentDocument,
                                tCoLinkNodes,
                                urls);
    }
    
    resolveTCoLinkNodes(tCoLinkNodes);

}

function resolveIFrameNode(iFrameNode) {
    iFrameNode.contentWindow.onload = function (event) {
        resolveLinkNodes(iFrameNode.contentDocument);
    };
}

function mutationObserverCallback(mutationRecords,
                                  mutationObserver) {
    for (let mutationRecord of mutationRecords) {
        for (let addedNode of mutationRecord.addedNodes) {
            if (addedNode.tagName) {
                if (addedNode.tagName === "IFRAME") {
                    resolveIFrameNode(addedNode);
                } else {
                    resolveLinkNodes(addedNode);
                }
            }
        }
    }
}

let mutationObserver = new MutationObserver(mutationObserverCallback);
let iFrameNodes = document.getElementsByTagName("iframe");

mutationObserver.observe(document,
                         {childList: true,
                          subtree: true});

for (let iFrameNode of iFrameNodes) {
    resolveIFrameNode(iFrameNode);
}
resolveLinkNodes(document);

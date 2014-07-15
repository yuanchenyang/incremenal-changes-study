// ==UserScript==
// @name          Mutation Logger
// @namespace     http://www.chenyang.co/
// @description   Logs mutation events to the DOM
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version       0.1
// @run-at        document-end
// ==/UserScript==
S = new XMLSerializer();
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var SERVER_URL = "http://127.0.0.1:6666/";

var observer = new window.MutationObserver(function (mutations, observer) {
    // fired when a mutation occurs

    var mutationList = [];
    mutations.forEach(function (m) {
        try {
            var record = {type: m.type,
                          position: getDomPosition(m.target)};
            if (m.type == 'attributes') {
                record["data"] = {attrName: m.attributeName,
                                  oldValue: m.oldValue,
                                  newValue: m.target.attributes[m.attributeName].value};

            } else if (m.type == 'childList') {
                var prev = m.previousSibling;
                var next = m.nextSibling;
                if (prev) {
                    prev = findPos(m.target, prev);
                }
                if (next) {
                    next = findPos(m.target, next);
                }

                var added = serialize(m.addedNodes);
                var removed = serialize(m.removedNodes);
                record["data"] = {added: added, removed: removed,
                                  prev: prev, next:next};
            } else {
                return;
            }
            mutationList.push(record);
        } catch (e) {
            console.log(e);
        }
    });

    send("record_mutation", {url: window.location, id: uniqueNum}, mutationList);
});

var uniqueNum = GM_getValue("UniqueNum", 0);
GM_setValue("UniqueNum", uniqueNum + 1);

function serialize(nodeLst) {
    var res = [];
    for (var i = 0; i < nodeLst.length; i++) {
        res.push(S.serializeToString(nodeLst[i]));
    }
    return res;
};

function send(endpoint, params, data) {
    var getParams = $.map(params, function(val, key) {
        return encodeURIComponent(key)+'='+encodeURIComponent(val);
    });

    if (getParams.length) {
	endpoint += '?' + getParams.join('&');
    }

    GM_xmlhttpRequest({
        method: 'POST',
        url: SERVER_URL + endpoint,
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        onload: function (response) {
        }
    });
}

function findPos(parent, child) {
    return Array.prototype.indexOf.call(parent.childNodes, child);
}

function getDomPosition(target) {
    var pos = [];
    var child = target;
    var parent = target.parentElement;

    while (parent) {
        pos.push(findPos(parent, child));
        child = parent;
        parent = parent.parentElement;
    }
    return pos;
}

send("start_new_session", {url: window.location, id: uniqueNum},
     {domstring: S.serializeToString(document)});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
    // Set to true if mutations to not just target, but also target's
    // descendants are to be observed.
    subtree: true,
    // Set to true if mutations to target's attributes are to be observed.
    attributes: true,
    // Set to true if mutations to target's children are to be observed.
    childList: true,
    // Set to true if mutations to target's data are to be observed.
    characterData: false,
    // Set to true if attributes is set to true and target's attribute value
    // before the mutation needs to be recorded.
    attributeOldValue: true,
    // Set to true if characterData is set to true and target's data before the
    // mutation needs to be recorded.
    characterDataOldValue: false,
    // Set to a list of attribute local names (without namespace) if not all
    // attribute mutations need to be observed.
    attributeFilter: [
        'style',
        'class'
    ]
});

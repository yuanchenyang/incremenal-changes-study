// ==UserScript==
// @name          Mutation Highlighter
// @namespace     http://www.chenyang.co/
// @description   Highlights mutations to a webpage
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @version       0.2
// @run-at        document-end
// ==/UserScript==


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var HIGHLIGHT_CLS = "mutation-highlighter-class";
var INFO_CLS = "mutation-highlighter-info-class";

function prepend(node) {
    var height = node.offsetHeight;
    var width = node.offsetWidth;
    var html = '<div style="position: absolute; width: '+ width +
            'px; height: '+ height + 'px; background-color: rgba(255, 0, 0, 0.1);" '+
            'class="' + HIGHLIGHT_CLS + '"><p class="' + INFO_CLS + '" '+
            'style="display: none;"></p></div>';
    $(node).prepend(html);
}

var observer = new window.MutationObserver(function (mutations, observer) {
    mutations.forEach(function (m) {
        // We want to not log changes to nodes we added ourselves
        if (m.type == 'attributes' && m.target.className != HIGHLIGHT_CLS) {
            var added_nodes = $(m.target).find("." + HIGHLIGHT_CLS);
            if (added_nodes.length == 0) {
                prepend(m.target);
                console.log(m);
            }
            var info_class = $(m.target).find("." + INFO_CLS);
            var changes = m.attributeName +": " + m.oldValue + " -> " +
                          m.target.attributes[m.attributeName].value;
            info_class.append(changes);

        } else if (m.type == 'childList') {
            //m.addedNodes.forEach(function (n) {
            //    $(n).css("border", "3px red");
            //});
        }
        //console.log(m);
    });
});

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
    characterData: true,
    // Set to true if attributes is set to true and target's attribute value
    // before the mutation needs to be recorded.
    attributeOldValue: true,
    // Set to true if characterData is set to true and target's data before the
    // mutation needs to be recorded.
    characterDataOldValue: true,
    // Set to a list of attribute local names (without namespace) if not all
    // attribute mutations need to be observed.
    attributeFilter: [
        'style',
        'class'
    ]
});

// ==UserScript==
// @name          Attribute scraper
// @namespace     http://www.chenyang.co/
// @description   Collects information on changed attributes for visited websites
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version       1.4
// @run-at        document-end
// ==/UserScript==


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var NODE_CHANGES = "#nodeChanges";

var observer = new window.MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs

    var Changes = {origin: window.location.origin,
                   deltas: [],
                   addedNodes: 0,
                   removedNodes: 0};

    mutations.forEach(function(m) {
        if (m.type == "attributes") {
            if (m.attributeName == "style") {
                add_style_diff(Changes, m.oldValue, m.target.style);
            } else {
                add_diff(Changes,
                         "@" + m.attributeName,
                         m.oldValue,
                         m.target.attributes[m.attributeName].value);
            }
        } else if (m.type == "childList") {
            add_diff(Changes,
                     NODE_CHANGES,
                     m.removedNodes.length,
                     m.addedNodes.length);
        }
    });

    //console.log(Changes);
    GM_xmlhttpRequest({
        method: "POST",
        url: "http://127.0.0.1:6666/save_data",
        data: JSON.stringify(Changes),
        headers: {
            "Content-Type":"application/json; charset=UTF-8"
        },
        onload: function(response) {
        }
    });
});

function no_ws(s) {
    return s.replace(/\s/g, "");
}

function add_diff(Changes, attrName, oldAttr, newAttr) {
    var count = GM_getValue(attrName, 0);
    GM_setValue(attrName, count + 1);

    if (attrName == NODE_CHANGES) {
        Changes.addedNodes += newAttr;
        Changes.removedNodes += oldAttr;
    } else {
        Changes.deltas.push([attrName, oldAttr, newAttr]);
    }
}

function parse_styles(styleString) {
    var res = {};
    styleString = no_ws(styleString);
    if (! styleString.contains("{")) {

        styleString.split(";").forEach(function(e) {
            var keyValue = e.split(":");
            if (keyValue.length == 2) {
                res[keyValue[0]] = keyValue[1];
            }
        });
    }
    return res;
}

function add_style_diff(Changes, oldValue, newStyle) {

    var oldStyle = parse_styles(oldValue);

    // console.log(oldValue, newStyle.cssText);

    newStyle = parse_styles(newStyle.cssText);

    for (var attrName in newStyle) {
        var newattr = no_ws(newStyle[attrName]);
        if (attrName in oldStyle) {
            // console.log("@@@@", oldStyle[attrName], no_ws(newStyle[attrName]));
            var oldattr = oldStyle[attrName];
            if (oldattr != newattr) {
                add_diff(Changes, attrName, oldattr, newattr);
            }
            delete oldStyle[attrName];
        } else {
            add_diff(Changes, attrName, "", newattr);
        }
    }

    for (var remaining in oldStyle) {
        add_diff(Changes, remaining, oldStyle[remaining], "");
    }
}

function print_data() {
    var vals = {};
    GM_listValues().forEach(function (val) {
        vals[val] = GM_getValue(val);
    });
    console.log(JSON.stringify(vals));
}

GM_registerMenuCommand("Log Collected Data", print_data);

function delete_data() {
    GM_listValues().forEach(function (val) {
        GM_deleteValue(val);
    });
    console.log("Deleted all values");
}

GM_registerMenuCommand("Delete All Collected Data", delete_data);

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
    attributeFilter: ["style", "class"]
});

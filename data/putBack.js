// Reverse of getDomPosition
function getDomElement(pos) {
    var target = document.childNodes[1];
    for (var i = pos.length-1; i >=0 ; i--) {
        target = target.childNodes[pos[i]];
    }
    return target;
}

function insertMutation(result) {
    var target = getDomElement(result.position);
    var data = result.data;
    if (result.type == "attributes") {
        target.attributes[data.attrName] = data.newValue;
    } else if (result.type == "childList") {
        // TODO: handle more edge cases here
        var startPos   = data.prev || 0;
        var endPos     = data.next || target.childNodes.length;
        var insertFrom = target.childNodes[endPos];
        var i;
        for (i=0; i < data.removed.length ; i++) {
            // target.removeChild(target.childNodes[startPos + i + 1]);
        }

        for (i=0; i < data.added.length ; i++) {
            var div = document.createElement('div');
            div.innerHTML = data.added[i];
            var toInsert = div.childNodes[0];
            target.insertBefore(toInsert, insertFrom);
        }
    } else {
        throw "Error: Invalid result type: " + result.type;
    }
}

run = function () {
    mutations.forEach(function (m) {
        try {
            insertMutation(m);
        } catch (e) {
            console.log(e);
        }
    });
};

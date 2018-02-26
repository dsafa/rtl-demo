function dragStartListener(event) {
    $("#text-input").addClass("border-primary");
}

function dragMoveListener(event) {
    let target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransition = target.style.transition = undefined;
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function dragEndListener(event) {
    $("#text-input").removeClass("border-primary");

    let target = event.target;
    target.style.webkitTransition = target.style.transition = "0.2s";
    target.style.webkitTransform = target.style.transform = "translate(0px, 0px)";
    target.setAttribute("data-x", target.x0);
    target.setAttribute("data-y", target.y0);
}

interact(".bidi-character")
    .draggable({
        max: 1,
        onstart: dragStartListener,
        onmove: dragMoveListener,
        onend: dragEndListener,
    });

let inputElements = [];

function setCaretPos(element, pos) {
    element.focus();
    let range = document.createRange();
    let sel = window.getSelection();

    if (pos === undefined) {
        pos = element.childNodes && element.childNodes.length || 0;
    }
    range.setStart(element, pos);
    range.collapse(false);

    sel.removeAllRanges();
    sel.addRange(range);
}

function addNewCharacter(character, pos) {
    let element = $("<span>" + character + "</span>");
    element.css({
        "display": "inline-block",
        "transition": "all 0.2s",
    });
    element.addClass("drop-placeholder");

    //add to the end if pos not specified
    if (pos === undefined) {
        inputElements.push(element);
    } else {
        inputElements.splice(pos, 0, element);
    }
}

const bidiMarkerFontSize = "0.3em";

function addBidi(bidiElement, pos) {
    addNewCharacter(bidiElement.attr("data-char"), pos);
    let newChar = inputElements[pos];
    newChar.addClass("badge badge-primary bidi-marker");
    newChar.attr("contentEditable", false);
    newChar.attr("data-codepoint", bidiElement.attr("data-codepoint"));
    newChar.css({
        "font-size": bidiMarkerFontSize,
        "font-weight": "normal",
    })
}

function refreshInputBox(caretPos) {
    let inputBox = $("#text-input");
    inputBox.empty();
    inputBox.append(inputElements);
    setCaretPos(inputBox[0], caretPos);
}

function dropActivateListener (event) {
    var dropzone = $(event.target);
    dropzone.css({
        "font-size": dropzone.hasClass("bidi-marker") ? "0.5em" : "1.3em",
    });
}

function dropDeactivateListener(event) {
    var dropzone = $(event.target);
    dropzone.css({
        "margin-left": "0px",
        "margin-right": "0px",
        "font-size": dropzone.hasClass("bidi-marker") ? bidiMarkerFontSize : "1em",
    });

    dropzone.removeClass("border-primary");
}

function dragEnterListener(event) {
}

function dragLeaveListener(event) {
    var dropzone = $(event.target);
    dropzone.css({
        "margin-left": "0px",
        "margin-right": "0px",
    });

    dropzone.removeClass("border-primary");
}

function dropMoveListener(event) {
    var draggable = $(event.relatedTarget);
    var dropzone = $(event.target);

    var dropzoneX = dropzone.offset().left + dropzone.width() / 2;
    var dragX = draggable.offset().left + draggable.width() / 2;

    const distance = "20px";
    if (dragX <= dropzoneX) {
        dropzone.css({
            "margin-left": distance,
            "margin-right": "0px",
        });
    } else {
        dropzone.css({
            "margin-right": distance,
            "margin-left": "0px",
        });
    }
}

function dropListener(event) {
    let i = 0;
    for (i; i < inputElements.length; i++) {
        if (inputElements[i][0] === event.target) {
            break;
        }
    }

    let draggable = $(event.relatedTarget);
    addBidi(draggable, i);
    refreshInputBox(i + 1);
}

interact(".drop-placeholder")
    .dropzone({
        accept: ".bidi-character",
        ondropactivate: dropActivateListener,
        ondropdeactivate: dropDeactivateListener,
        ondragenter: dragEnterListener,
        ondragleave: dragLeaveListener,
        ondropmove: dropMoveListener,
        ondrop: dropListener,
    });

$("#text-input").bind('input', function (event) {
    let inputBox = $(event.target);
    let caretPos = undefined;

    let children = inputBox.find("span");
    if (children.length == 0) {
        let text = inputBox.text();
        if (text === "") {
            //was last character was deleted
            inputElements.pop();
        } else {
            //Initial state, text will be entered directly into the text of the input div
            addNewCharacter(text);
        }
    } else if (children.length < inputElements.length) {
        //Deleting
        let found = false;
        for (let i = 0; i < children.length; i++) {
            if (children[i].textContent != inputElements[i][0].textContent) {
                found = true;
                inputElements.splice(i, 1);
                caretPos = i;
            }
        }

        //delete last element
        if (!found) {
            inputElements.pop();
        }
    } else {
        //Addition
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.textContent.length > 1 && !child.classList.contains("bidi-marker")) {
                let newCharacter = child.textContent[1];
                child.textContent = child.textContent[0];
                addNewCharacter(newCharacter, i + 1);
                caretPos = i + 2; //new character was added so add 2
            }
        }
    }

    refreshInputBox(caretPos);
});

$(".bidi-character").bind("mouseover", function(event) {
    $("#bidi-details").removeClass("invisible");

    let target = $(event.target);
    let name = target.attr("data-name");
    let codepoint = target.attr("data-codepoint");
    let description = target.attr("data-description");

    $("#bidi-title").text(name);
    $("#bidi-codepoint").text("U+" + escape(codepoint).slice(2));
    $("#bidi-description").text(description);
});

$("#btn-result").bind("click", function(event) {
    let result = inputElements.map(el => {
            if (el.hasClass("bidi-marker")) {
                return el.attr("data-codepoint");
            } else {
                return el.text();
            }
        })
        .join("");

    $("#result").text(result);
    $("#result").addClass("border-success");
});

$("#btn-clear").bind("click", function(event) {
    inputElements = [];
    refreshInputBox();
    $("#result").removeClass("border-success");
});
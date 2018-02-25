function dragStartListener(event) {
    $(".text-input").addClass("border-primary");
}

function dragMoveListener(event) {
    let target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransition = target.style.transition = undefined;
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function dragEndListener(event) {
    $(".text-input").removeClass("border-primary");

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

let dropTargetPlaceholder = $("<span></span>");
dropTargetPlaceholder.addClass("drop-placeholder");
inputElements.push(dropTargetPlaceholder);

dropTargetPlaceholder.appendTo($(".text-input"));
$(".text-input").append(inputElements);

interact(".drop-placeholder")
    .dropzone({
        accept: ".bidi-character",
        overlap: 0.50,
        ondropactivate: function(event) {
            console.log("???");
            event.target.classList.add("border");
        },
        ondropdeactivate: function(event) {
            event.target.classList.remove("border");
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target;
        },
        ondragleave: function (event) {
        },
        ondrop: function (event) {
        },
    });

//https://stackoverflow.com/a/4238971
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function addNewCharacter(character) {
    inputElements.push($("<span>" + character + "</span>"))
    inputElements.push(dropTargetPlaceholder.clone());
}

$(".text-input").bind('input', function(event) {
    let inputBox = event.target;

    let children = inputBox.getElementsByTagName("span");
    if (children.length == 1) {
        //Initial state, text will be entered directly into the text of the input div
        let newCharacter = inputBox.childNodes[0].nodeValue.trim();
        addNewCharacter(newCharacter);
     } else {
        //Text is inserted into last non empty span, the second last element
        let textNode = children[children.length - 2];
        let insertedCharacter = textNode.textContent.slice(1, 2);
        textNode.textContent = textNode.textContent[0];
        addNewCharacter(insertedCharacter);
     }

    inputBox.innerHTML = "";
    $(inputBox).append(inputElements);
    placeCaretAtEnd(inputBox);
});
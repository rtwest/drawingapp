
// drawController.js

//cordovaNG.controller('drawController', function ($scope, $http, globalService) {


//////////////////////////////////////////////////////////////////////////////////////
//
//  - move tracking is working
//  - seems like an array of points isn't getting put onto the canvas
//
//
//
//////////////////////////////////////////////////////////////////////////////////////

var mousePressed = false,
	lastX,
	lastY,
	mouse = { x: 0, y: 0 },
	start_mouse = { x: 0, y: 0 },
	last_mouse = { x: 0, y: 0 },
	$textarea,
	ctx,
	canvas,
	$canvas,
	tmp_txt_ctn,
	gd = {},
	last_moved = 0,
	shifted = false,
	ctrlDown = false,
	cPushArray = [''],
	cStep = -1;

$(function () {
    setTimeout(function () {
        console.log('called on doc ready fundtion');
        InitDrawing();
        //InitTools();
    }, 3000);
});

function InitDrawing() {
    $canvas = $('#main-canvas');
    canvas = document.getElementById('main-canvas');
    ctx = canvas.getContext("2d");

    tmp_txt_ctn = document.getElementById('tempDiv'); // div for text tool

    $textarea = $('#text-input');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gd.tool = 'marker';
    gd.lastTool = gd.tool;
    //gd.toolSize = $('.active-tool').attr("data-size");
    gd.toolSize = 10;
    gd.fontSize = 12;
    //gd.color = $('.active-color').attr('id');
    gd.color = "#000";

    toggleInvisibleCanvas($('#toggle-drawing').attr("class"));
    /*	
        $canvas.bind("click", function(event) {
            if (gd.pushIt == false) {
                invisibleCanvas(event, $(this));	
            }
        });
    */
    $textarea.bind("focus", function (e) {
        $canvas.one("mousedown touchstart", function () {
            if ($textarea.val().length > 0) {
                writeText($textarea.val());
            }

            $textarea.val("").hide().css("z-index", 0);
        });
    });

    $canvas.bind("mousedown touchstart", function (e) {
        mousePressed = true;

        lastX = e.pageX - $(this).offset().left;
        lastY = e.pageY - $(this).offset().top;

        if (gd.pushIt == true) {
            if (gd.tool == 'marker') {
                Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
            if (gd.tool == 'eraser') {
                Erase(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
        }
        if (gd.pushIt == false) {
            invisibleCanvas(e, $(this));
        }
        if ($(".multi-item-menu").is(":visible")) {
            $(".multi-item-menu").fadeOut(400);
        }
        if ($("#draw-colors-pallet").is(":visible")) {
            $("#draw-colors-pallet").fadeOut(400);
        }

        // for text area tool
        if (gd.tool == 'text') {
            mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
            mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

            start_mouse.x = mouse.x;
            start_mouse.y = mouse.y;
        }
    });

    $canvas.bind("mousemove touchmove", function (e) {
        if (mousePressed == true && gd.pushIt == true) {
            if (gd.tool == 'marker') {
                Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
            if (gd.tool == 'eraser') {
                Erase(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }

            if (gd.tool == 'text') {
                mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
                mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

                adjustTextArea();
            }
        }
        if (gd.pushIt == false) {
            var x = e.pageX,
				y = e.pageY;

            mousePressed = false;

            if (x !== lastX || y !== lastY) {
                invisibleCanvas(e, $(this));
            }

            lastX = x;
            lastY = y;
        }
    });

    $canvas.bind("mouseleave mouseup touchend touchcancel", function (e) {
        if (mousePressed == true && gd.pushIt == true) {
            if (gd.tool !== 'text') {
                cPush();
            }

            if ($textarea.is(":visible")) {
                $textarea.focus().css({ "z-index": 10 });
            }
        }

        mousePressed = false;
    });

    $canvas.bind("mouseenter", function (e) {
        ManageCursor();
    });

    $('#draw-undo-ico').click(function () {
        cUndo();
    }).mousedown(function (e) {
        clearTimeout(this.downTimer);
        this.downTimer = setTimeout(function () {
            cUndo(true);
        }, 1500);
    }).mouseup(function (e) {
        clearTimeout(this.downTimer);
    });

    $('#draw-redo-ico').click(function () {
        cRedo();
    }).mousedown(function (e) {
        clearTimeout(this.downTimer);
        this.downTimer = setTimeout(function () {
            cRedo(true);
        }, 1500);
    }).mouseup(function (e) {
        clearTimeout(this.downTimer);
    });

    $canvas.keydown(function (e) {
        var ctrlKey = 17, yKey = 89, zKey = 90, mKey = 109, eKey = 101, tKey = 116;
        e = e || window.event //IE support
        ctrlDown = e.ctrlKey || e.metaKey //Mac support

        if (ctrlDown && e.keyCode == zKey) {
            cUndo();
        }
        if (ctrlDown && e.keyCode == yKey) {
            cRedo();
        }
    }).keyup(function (e) {
        var ctrlKey = 17, yKey = 89, zKey = 90;
        e = e || window.event //IE support

        if (e.keyCode == ctrlKey) {
            ctrlDown = false;
        }
    });

    cPush();
}

function InitTools() {
    var colorArray = ['#C0C0C0', '#808080', '#000000', '#FF0000', '#800000', '#FFFF00', '#808000', '#00FF00', '#008000', '#00FFFF', '#008080', '#0000FF', '#000080', '#FF00FF', '#800080'],
		penSizes = [0, 1, 2, 3, 5, 10],
		fontSizes = [12, 14, 16, 18, 20, 22, 26],
		toggleDrawing = $('#toggle-drawing'),
		toolsContainer = $('#draw-tools-container'),
		markerIco = $('#draw-marker-ico'),
		eraserIco = $('#draw-eraser-ico'),
		TextIco = $('#draw-text-ico'),
		colorsIco = $('#draw-colors-ico'),
		sizeSlider = $("#draw-size-slider"),
		sizeSliderValue = $('#slider-value'),
		fontSizeSlider = $('#text-size-slider'),
		fontSizeSliderValue = $('#text-slider-value'),
		colorPallet = $("#draw-colors-pallet");

    // print the usable colors in the pallet container
    $.each(colorArray, function (index, value) {
        var active = '';
        if (index == 2) { active = " active-color"; }

        // create span for color element
        $('<span />', {
            id: value,
            class: "pallet-colors" + active,
            style: 'background-color:' + value + ';'
        })
		.attr("data-color", value)
		.click(function () {
		    $('.active-color').removeClass('active-color');
		    $(this).addClass('active-color')
		    gd.color = value;

		    $textarea.css({ color: gd.color, "font-size": gd.fontSize + "px" });

		    $('.active-tool').click();
		    if ($textarea.is(":visible")) {
		        $textarea.focus();
		    }
		})
		.appendTo(colorPallet);
    });

    colorsIco.click(function () {
        colorPallet.fadeToggle(400);
    });

    $('.draw-tool-ico').click(function () {
        var $this = $(this),
			id = this.id;

        if (id !== "draw-colors-ico" && id !== "draw-undo-ico" && id !== "draw-redo-ico") {
            if (colorPallet.is(":visible")) {
                colorPallet.fadeOut(400);
            }

            if (!$this.hasClass("active-tool")) {
                $(".active-tool").removeClass("active-tool");

                $this.toggleClass("active-tool");
            }
        }

        if (id !== "draw-text-ico" && id !== "draw-colors-ico" && $textarea.is(":visible")) {
            $textarea.val("").hide().css("z-index", 0);
        }
    });

    sizeSlider.slider({
        orientation: 'horizontal',
        cursor: 'pointer',
        value: 2,
        min: 1,
        max: 5,
        step: 1,
        slide: function (event, ui) {
            var size = penSizes[ui.value];

            markerIco.attr("data-size", size);

            sizeSliderValue.html(size);
        },
        stop: function () {
            markerIco.click();
        }
    })
	.find("a")
	.css({ width: "15px", height: "15px", top: "-2px" });

    fontSizeSlider.slider({
        orientation: 'horizontal',
        cursor: 'pointer',
        value: 0,
        min: 0,
        max: 6,
        step: 1,
        slide: function (event, ui) {
            var size = fontSizes[ui.value];

            gd.fontSize = size;

            fontSizeSliderValue.html(size);

            $textarea.css({ color: gd.color, "font-size": gd.fontSize + "px" });
        },
        stop: function () {
            if ($textarea.is(":visible")) {
                $textarea.focus();
            }
        }
    })
	.find("a")
	.css({ width: "15px", height: "15px", top: "-2px" });

    markerIco.click(function () {
        gd.lastTool = gd.tool;
        gd.tool = "marker";
        gd.toolSize = $(this).attr("data-size");
        ManageCursor();
    });

    eraserIco.click(function () {
        gd.lastTool = gd.tool;
        gd.tool = "eraser";
        gd.toolSize = $(this).attr("data-size");
        ManageCursor();
    });

    TextIco.click(function () {
        gd.lastTool = gd.tool;
        gd.tool = "text";
        ManageCursor();
    });
    /*	
        toggleDrawing.click(function() {
            var $this = $(this);
    
            toolsContainer.fadeToggle(400);
            $this.toggleClass("active-highlight");
            toggleInvisibleCanvas($this.attr("class"));
        });
    */
}

function ManageCursor() {
    if (gd.pushIt == true) {
        if ($canvas.hasClass(gd.lastTool)) {
            $canvas.removeClass(gd.lastTool);
        }
        if (!$canvas.hasClass(gd.tool)) {
            $canvas.addClass(gd.tool);
        }
    } else {
        if ($canvas.hasClass(gd.lastTool)) {
            $canvas.removeClass(gd.lastTool);
        }
        if ($canvas.hasClass(gd.tool)) {
            $canvas.removeClass(gd.tool);
        }
    }
}

function Draw(x, y, isDown) {
    if (isDown) {
        //console.log('called draw');

        ctx.beginPath();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = gd.color;
        ctx.lineWidth = gd.toolSize;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x;
    lastY = y;
}

function drawFromMemory() {
    var canvasPic = new Image();
    canvasPic.src = cPushArray[cStep];
    canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0, canvasPic.width, canvasPic.height); }
}

function Erase(x, y, isDown) {
    if (isDown) {
        ctx.beginPath();
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = gd.toolSize;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x;
    lastY = y;
}

function writeText(value) {
    var x = Math.min(mouse.x, start_mouse.x),
		y = Math.min(mouse.y, start_mouse.y),
		lines = value.split('\n'),
		processed_lines = [];

    ctx.fillStyle = gd.color;
    ctx.font = gd.fontSize + "px arial";
    ctx.textBaseline = "top";

    for (var i = 0; i < lines.length; i++) {
        var chars = lines[i].length;

        for (var j = 0; j < chars; j++) {
            var text_node = document.createTextNode(lines[i][j]);
            tmp_txt_ctn.appendChild(text_node);

            // Since tmp_txt_ctn is not taking any space
            // in layout due to display: none, we gotta
            // make it take some space, while keeping it
            // hidden/invisible and then get dimensions
            tmp_txt_ctn.style.position = 'absolute';
            tmp_txt_ctn.style.visibility = 'hidden';
            tmp_txt_ctn.style.display = 'block';

            var width = tmp_txt_ctn.offsetWidth;
            var height = tmp_txt_ctn.offsetHeight;

            tmp_txt_ctn.style.position = '';
            tmp_txt_ctn.style.visibility = '';
            tmp_txt_ctn.style.display = 'none';

            // Logix
            // console.log(width, parseInt(textarea.style.width));
            if (width > parseInt($textarea.width())) {
                break;
            }
        }

        processed_lines.push(tmp_txt_ctn.textContent);
        tmp_txt_ctn.innerHTML = '';
    }

    for (var n = 0; n < processed_lines.length; n++) {
        var processed_line = processed_lines[n];

        ctx.fillText(
			processed_line,
			parseInt($textarea.position().left),
			parseInt($textarea.position().top) + n * parseInt(gd.fontSize)
		);
    }

    cPush();
}

function adjustTextArea() {
    var xx = Math.min(mouse.x, start_mouse.x);
    yy = Math.min(mouse.y, start_mouse.y),
    width = Math.abs(mouse.x - start_mouse.x),
    height = Math.abs(mouse.y - start_mouse.y);

    $textarea.css({ top: yy + 'px', left: xx + 'px', width: width + 'px', height: height + 'px', color: gd.color, "font-size": gd.fontSize + "px", display: 'block' });
}

function UndoRedoBtnActivity() {
    var redo = document.getElementById("draw-redo-ico"),
		undo = document.getElementById("draw-undo-ico");

    if (cStep < cPushArray.length - 1) {
        $(redo).removeClass("inactive");
    } else {
        $(redo).addClass("inactive");
    }
    if (cStep > 0) {
        $(undo).removeClass("inactive");
    } else {
        $(undo).addClass("inactive");
    }
};

function cClearAll() {
    cPushArray = [''];
    cStep = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cPushArray.push(document.getElementById('main-canvas').toDataURL());

    UndoRedoBtnActivity();
}

function cPush() {
    cStep++;
    if (cStep < cPushArray.length) { cPushArray.length = cStep; }
    cPushArray.push(document.getElementById('main-canvas').toDataURL());

    UndoRedoBtnActivity();
}

function cUndo(toStart) {
    if (toStart) {
        cStep = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawFromMemory();
    } else {
        if (cStep > 0) {
            cStep--;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawFromMemory();
        }
    }
    UndoRedoBtnActivity();
}

function cRedo(toEnd) {
    if (toEnd) {
        cStep = cPushArray.length - 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawFromMemory();
    } else {
        if (cStep < cPushArray.length - 1) {
            cStep++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawFromMemory();
        }
    }
    UndoRedoBtnActivity();
}

function toggleInvisibleCanvas(className) {
    //	if (!gp.standard) { 
    //		gd.pushIt = false;
    //		
    //		return false; 
    //	} else {
    if (!$canvas.is(":visible")) {
        $canvas.show();
    }
    //	}
    //	if (!className.match(/active/)) {
    //		gd.pushIt = false;
    //		$canvas.attr("contentEditable", "false")
    //		$canvas[0].contentEditable = false;
    //	} else {
    //		gd.pushIt = true;
    //		$canvas.attr("contentEditable", "true")
    //		$canvas[0].contentEditable = true;
    //	}
    gd.pushIt = true;
    $canvas.attr("contentEditable", "true")
    $canvas[0].contentEditable = true;
};

invisibleCanvas = function (e, _this) {
    var type = e,
		mouseX = e.clientX,
		mouseY = e.clientY,
		el;

    document.getElementById('main-canvas').style.display = "none";
    el = document.elementFromPoint(mouseX, mouseY);
    _this.css("cursor", $(el).css("cursor"));
    document.getElementById('main-canvas').style.display = "block";

    $(el).trigger(type);

    e.preventDefault();
    e.stopPropagation();
    return false;
};

$(window).resize(function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawFromMemory();
});


//});//end controller
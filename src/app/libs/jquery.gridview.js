/**
 * 
 * ------- Gridview -------
 * Provide a completely different way of navigating through
 * several menu options or pages - at least, that's one
 * possible usage. Be creative, think of a good place to
 * use this plugin :)
 * 
 * Copyright (c) 2012 Thom Castermans (http://denvelop.nl/gridview).
 * 
 * -- Changelog --
 * v1.2 - Changed 'simple' argument for the 'onPosition' option
 *        to 'simple-horizontal' and 'simple-vertical'. The original
 *        'simple' function is the new 'simple-vertical' function,
 *        the 'simple-horizontal' function is new and does just
 *        the same as 'simple', but then horizontal as the name
 *        suggests.
 * v1.1 - Changed code so that it is possible to have more
 *        than one gridview on a page. This was not possible
 *        because state-information was save globally in
 *        stead of per gridview instance.
 *      - Added the 'draggable' option.
 *      - Added the 'noOffset' and 'newZoom' options to onPosition function.
 *      - Some minor bugfixes.
 * v1.0 - Initial release.
 * 
 */
(function($) {
   
  function div(a, b) {
	return (a / b - (a % b) / b);
  }
  
  // -- METHODS
  var methods = {
	/**
	 * Return (a copy of) the current options object.
	 */
	getOptions: function() {
	  return jQuery.extend({}, (typeof($(this).data('gridviewoptions')) == 'object' ? $(this).data('gridviewoptions') : $.fn.gridview.defaults));
	},
	
	/**
	 * Constructor.
	 */
	init: function(options) {
	  // Extend default options with given options
	  var opts = $.extend({}, $.fn.gridview.defaults, options);
	  methods._checkOpts.apply(this, [opts]);
	  
	  // Initialize the gridview on every given object
	  this.each(function() {
		// Some variables and save data to element
		var $this = $(this),
			$gridChildren = $this.children('div'),
			gridData = {
			  target: $this,
			  zoom: opts.initialZoom
			};
		gridData.nrChildren = $gridChildren.size();
		$this.data('gridview', gridData);
		// Save options
		$this.data('gridviewoptions', opts);
		
		// Set some necessary styling for each child of the grid
		$gridChildren.each(function(i) {
		  $(this).css({
			display: 'block',
			overflow: 'hidden',
			position: 'absolute'
		  });
		  
		  // Set action to perform when scrollaction is performed on a child of the grid
		  if (typeof(opts.scrollToZoom) === 'boolean' && opts.scrollToZoom) {
			$(this).mousewheel(function(event, delta) {
			  event.preventDefault();
			  var $thisGrid = $(this).parent(),
				  gridData = $thisGrid.data('gridview'),
				  newZoom = gridData.zoom  - (delta > 0 ? 1 : -1);
			  methods._zoomTo.apply(this, [i, newZoom]);
			});
		  }
		  
		  // Set action to perform when user presses middle mouse button on a child
		  $(this).mousedown(function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (event.which === 2) {
			  var $thisGrid = $(this).parent(),
				  gridData = $thisGrid.data('gridview');
			  methods._zoomTo.apply(this, [i, gridData.zoom]);
			}
			return false;
		  });
		  
		  // Make children draggable - only if jQuery UI Draggable plugin is loaded (not a very good check, but... well it's better than nothing)
		  if (typeof($.fn.draggable) === 'function' && !(typeof(opts.draggable) === 'boolean' && !opts.draggable)) {
			$(this).draggable({
			  addClasses: false,
			  drag: function(event, ui) {
				var oldPos = $(this).data('gridview').offset,
					pos = ui.position;
				// Calculate delta
				var deltaPos = {
				  top: pos.top - oldPos.top,
				  left: pos.left - oldPos.left
				};
				$(this).parent().children().each(function() {
				  var newTop = parseInt($(this).css('top')) + deltaPos.top,
					  newLeft = parseInt($(this).css('left')) + deltaPos.left;
				  $(this).css({
					top: newTop,
					left: newLeft
				  }).data('gridview', {
					offset: $(this).position()
				  });
				});
			  }
			});
		  }
		});
		// Set some necessary styling of the grid
		$this.css({
		  display: 'block',
		  height: opts.height + 'px',
		  overflow: 'hidden',
		  position: 'relative',
		  width: opts.width + 'px'
		});
		
		// Initialize position of children
		var initialChild = opts.initialChild;
		if (initialChild >= $gridChildren.size()) {
		  initialChild = $gridChildren.size() - 1;
		}
		methods._zoomTo.apply($gridChildren.get(initialChild), [initialChild, opts.initialZoom, false]);
	  });
	  
	  // Keep the jQuery chain intact
	  return this;
	},
 
	/**
	 * Check for new children an adapt gridview to that.
	 * 
	 * Note that any ongoing animation will be stopped when calling this function.
	 */
	refresh: function() {
	  // Interrupt animation
	  this.each(function() {
	    $(this).children('div').stop(true, false);
	  });
	  // Re-initialize
	  methods.init.apply(this, [$(this).data('gridviewoptions')]);
	  
	  // Keep the jQuery chain intact
	  return this;
	},
 
	/**
	 * Zoom in to a given level, possibly animated, possibly with an offset (to be able to zoom in
	 * to a specific child).
	 * @param arg Object containing:
	 *             - animate boolean Animate the zooming yes or no;
	 *             - level   number  Level to zoom in to, 1 or greater;
	 *             - offset  object  Offset for zooming, contains:
	 *                        - x  number  Offset in X direction;
	 *                        - y  number  Offset in Y direction.
	 *             - onAnimationComplete function Function to call when animation has completed.
	 *                                            If animate is false, this function is called immediately.
	 *             - zoomedChild number Child that was zoomed in to (only used for onPosition function).
	 */
	zoom: function(arg) {
	  // Used as getter?
	  if (arg == null || typeof(arg) !== 'object') {
		var gridData = $(this).data('gridview');
		return gridData ? gridData.zoom : 0;
	  }
	  
	  // Arguments
	  var animate = arg.animate,
		  level   = arg.level,
		  offset  = arg.offset,
		  opts = (typeof($(this).data('gridviewoptions')) == 'object' ? $(this).data('gridviewoptions') : $.extend({}, $.fn.gridview.defaults)),
		  onAnimationComplete = arg.onAnimationComplete,
		  zoomedChild = arg.zoomedChild;
	  if (typeof(arg.animate) === 'undefined')  animate = true;
	  if (typeof(arg.level) === 'undefined')  level = 1;
	  if (typeof(arg.offset) === 'undefined')  offset = {x: 0, y: 0};
	  if (typeof(arg.onAnimationComplete) !== 'function')  onAnimationComplete = function() {};
 	  if (typeof(arg.zoomedChild) === 'undefined')  zoomedChild = 0;
 
	  // If level is out of bounds, do nothing
	  if (level < opts.minZoom || level < 1) {
		// Trigger error function
		methods._trigger.apply(this, [101, 'Zooming in not allowed']);
		// Keep the jQuery chain intact
		return this;
	  } else if (opts.maxZoom < level && opts.maxZoom > 0) {
		// Trigger error function
		methods._trigger.apply(this, [102, 'Zooming out not allowed']);
		// Keep the jQuery chain intact
		return this;
	  }
 
	  // Keep the jQuery chain intact
	  return this.each(function() {
		// Some variables, initialize gridview if needed
		var $this = $(this),
			$gridChildren = $this.children('div'),
			gridData = $this.data('gridview'),
			oldLevel = gridData.zoom;
		if (typeof(gridData) === 'undefined') {
		  $this.gridview();
		  gridData = $this.data('gridview');
		}
		// Save new zoomlevel
		gridData.zoom = typeof(level) === 'number' && level > 0 ? Math.round(level) : 1;
		$this.data('gridview', gridData);
		
		// Change style of every child to perform the zoom action,
		// animate this if wanted
		$gridChildren.each(function(i) {
		  var $this = $(this),
			  newHeight = methods._calcNewHeight.apply(this, [gridData.zoom]),
			  newWidth = methods._calcNewWidth.apply(this, [gridData.zoom]),
			  newX, newY,
			  result = methods._calcXY.apply(this, [i, newHeight, newWidth, oldLevel, gridData.zoom, zoomedChild]); // Calculate the X- and Y-coordinate depending on the function (onPosition)
		  newX = result.x;
		  newY = result.y;
		  
		  // Create CSS-object
		  var newCss = $.extend({
				height: methods._calcNewHeight.apply(this, [gridData.zoom, true]) + 'px',
				left: (newX + offset.x) + 'px',
				top: (newY + offset.y) + 'px',
				width: methods._calcNewWidth.apply(this, [gridData.zoom, true]) + 'px'
			  }, opts.onZoom.apply(this, [oldLevel, gridData.zoom]));
		  if (animate) {
			  $(this).stop(false, true).animate(newCss, opts.animationSpeed, function() {
				  $(this).data('gridview', {
					offset: $(this).position()
				  });
				  if (i == 0)  onAnimationComplete.call();
				});
		  } else {
			$(this).css(newCss).data('gridview', {
				offset: $(this).position()
			  });
			if (i == 0)  onAnimationComplete.call();
		  }
		});
	  });
	},
 
 	/**
	 * This is a public 'dummy' to call _zoomTo.
	 * _zoomTo expects 'this' to be the child to zoom in to, but
	 * if called from the open, 'this' is the parent. We fix that here.
	 */
	zoomTo: function(i, newZoom) {
	  if (typeof(i) === 'undefined')  i = 0;
	  if (typeof(newZoom) === 'undefined')  newZoom = 1;
	  
	  // Check index, if not good, trigger error and return
	  if (i < 0 || $(this).children('div').size() - 1 < i) {
		methods._trigger.apply(this, [103, 'Zoom to not possible']);
		// Keep the jQuery chain intact
		return this;
	  }
 
	  methods._zoomTo.apply($(this).children('div').get(i), [i, newZoom]);
	  
	  // Keep the jQuery chain intact
	  return this;
	},
 
	/**
	 * Calculate the height of a child given the zoom level.
	 */
	_calcNewHeight: function(newZoom, padding) {
	  if (padding === null)  padding = false;
	  if (padding !== true)  padding = false;
	  var $this = $(this),
	      gridData = $this.parent().data('gridview'),
	      opts = $this.parent().data('gridviewoptions'),
	      newHeight = Math.floor(opts.height / newZoom) - 2 * opts.margin - (padding ? (parseInt($this.css('padding-top')) + parseInt($this.css('padding-bottom'))) : 0),
	      onZoomResult = {};
	  if (typeof(opts.onZoom) === 'function') {
	    onZoomResult = opts.onZoom.apply(this, [gridData.zoom, newZoom]);
	    if (typeof(onZoomResult['height']) !== 'undefined') {
	      newHeight = onZoomResult['height'];
	    }
	  }
	  return newHeight;
	},
 
	/**
	 * Calculate the width of a child given the zoom level.
	 */
	_calcNewWidth: function(newZoom, padding) {
	  if (padding === null)  padding = false;
	  if (padding !== true)  padding = false;
	  var $this = $(this),
	      gridData = $this.parent().data('gridview'),
	      opts = $this.parent().data('gridviewoptions'),
	      newWidth = Math.floor(opts.width / newZoom) - 2 * opts.margin - (padding ? (parseInt($this.css('padding-left')) + parseInt($this.css('padding-right'))) : 0),
	      onZoomResult = {};
	  if (typeof(opts.onZoom) === 'function') {
	    onZoomResult = opts.onZoom.apply(this, [gridData.zoom, newZoom]);
	    if (typeof(onZoomResult['width']) !== 'undefined') {
	      newWidth = onZoomResult['width'];
	    }
	  }
	  return newWidth;
	},
 
	/**
	 * Given an index of a child, its width and its height, returns the top and left offset
	 * in the form of an object \result = {x: [leftOffset], y: [topOffset]}.
	 */
	_calcXY: function(i, newHeight, newWidth, oldZoom, newZoom, zoomedChild) {
	  var result = {}, newX = 0, newY = 0, noOffset = false, customNewZoom = newZoom,
	      opts = $(this).parent().data('gridviewoptions');
	  if (typeof(opts.onPosition) === 'function') {
		result = opts.onPosition.apply(this, [i, zoomedChild, opts.margin, oldZoom, newZoom]);
		if (typeof(result.x) == 'number' && typeof(result.y) == 'number') {
		  newX = result.x;
		  newY = result.y;
		} else {
		  methods._trigger.apply(this, [104, 'Return value onPosition not correct']);
		}
		if (typeof(result.noOffset) === 'boolean' && result.noOffset) {
		  noOffset = true;
		}
		if (typeof(result.newZoom) === 'number' && result.newZoom > 0 && result.newZoom >= opts.minZoom &&
		    (result.newZoom <= opts.maxZoom || opts.maxZoom == 0)) {
		  customNewZoom = result.newZoom;
		}
	  } else if (opts.onPosition === 'simple-vertical') {
		newX = opts.margin + (i % newZoom) * (newWidth + 2 * opts.margin);
		newY = opts.margin + (div(i, newZoom)) * (newHeight + 2 * opts.margin);
	  } else if (opts.onPosition === 'simple-horizontal') {
		newX = opts.margin + (div(i, newZoom)) * (newWidth + 2 * opts.margin);
		newY = opts.margin + (i % newZoom) * (newHeight + 2 * opts.margin);
	  } else if (opts.onPosition === 'intuitive') {
		var z0 = Math.floor(Math.sqrt(i)),
			z1 = z0 * z0;
		newX = opts.margin + (Math.min(z0, 2 * z0 + z1 - i)) * (newWidth + 2 * opts.margin);
		newY = opts.margin + (Math.min(z0, i - z1)) * (newHeight + 2 * opts.margin);
	  }
	  return (!noOffset ? {x: newX, y: newY, newZoom: customNewZoom} : {x: newX, y: newY, noOffset: true, newZoom: customNewZoom});
	},
 
	/**
	 * Loops through the opts-object and corrects erraneous options.
	 */
	_checkOpts: function(opts) {
	  $.each(opts, function(key, value) {
		switch (key) {
		  case 'initialChild' :
		  case 'maxZoom' :
			if (value < 0) { opts[key] = 0; }
			break;
		  case 'initialZoom' :
		  case 'minZoom' :
			if (value < 1) { opts[key] = 1; }
			break;
		}
	  });
	},
 
	/**
	 * Triggers the error-function given in the options, if this is a function indeed.
	 */
	_trigger: function(errorCode, errorDesc) {
	  var opts = $(this).data('gridviewoptions');
	  if (typeof(opts.onError) === 'function') {
		opts.onError.apply(this, [errorCode, errorDesc]);
	  }
	},
 
  	/**
	 * Zoom to given level and scroll to 'this' child.
	 * Parameter 'i' is the index of 'this' in the children.
	 * Defaults: i = 0, newZoom = 1, animate = true.
	 */
	_zoomTo: function(i, newZoom, animate) {
	  if (typeof(i) === 'undefined')  i = 0;
	  if (typeof(newZoom) === 'undefined')  newZoom = 1;
	  if (typeof(animate) !== 'boolean')  animate = true;
 
	  var $thisGrid = $(this).parent(),
		  gridData = $thisGrid.data('gridview'),
		  newHeight = methods._calcNewHeight.apply(this, [newZoom]),
		  newWidth = methods._calcNewWidth.apply(this, [newZoom]),
		  opts = $(this).parent().data('gridviewoptions'),
		  zoomedChild = $thisGrid.children('div').index(this);
	  // Get x- and y-coordinates of the child to zoom in to
	  var offset = methods._calcXY.apply(this, [i, newHeight, newWidth, gridData.zoom, newZoom, zoomedChild]);
	  // Change new zoomlevel if set by onPosition
	  if (typeof(offset.newZoom) === 'number' && offset.newZoom > 0 && offset.newZoom >= opts.minZoom &&
	      (offset.newZoom <= opts.maxZoom || opts.maxZoom == 0)) {
	    newZoom = offset.newZoom;
	  }
	  // Determine offset
	  if (typeof(offset.noOffset) === 'boolean' && offset.noOffset) {
	    offset = { x: 0, y: 0 };
	  } else {
	    offset.x = -offset.x;
	    offset.y = -offset.y;
	    // This would bring the child to the top left corner, but we want it in the center
	    offset.x = offset.x + (opts.width - newWidth) / 2;
	    offset.y = offset.y + (opts.height - newHeight) / 2;
	  }
	  // Perform the actual zooming action
	  $thisGrid.gridview('zoom', {
		  animate: animate,
		  level: newZoom,
		  offset: offset,
		  zoomedChild: zoomedChild
		});
	  
	  // Keep the jQuery chain intact
	  return this;
	}
  };
  
  // -- CLAIM PLUGIN NAMESPACE
  $.fn.gridview = function(method) {
    var opts = $(this).data('gridviewoptions');
    if (methods[method]) { // Method exists? Execute it
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof(method) === 'object' || !method) { // Constructor?
      return methods.init.apply(this, arguments);
    } else if (typeof(method) === 'string' && typeof(opts[method]) !== 'undefined' && arguments.length > 1) { // Set option value?
      opts[method] = arguments[1];
      // Keep the jQuery chain intact
      return this;
    } else if (typeof(method) === 'string' && typeof(opts[method]) !== 'undefined') { // Get option value?
      return opts[method];
    } else { // None of above... error.
	  methods._trigger.apply(this, [100, 'Method ' +  method + ' does not exist on jQuery.gridview']);
    }
  };
  
  // -- PLUGIN DEFAULT OPTIONS
  $.fn.gridview.defaults = {
	/** The number of milliseconds the zooming animation takes. */
	animationSpeed: 200,
	/** Indicate if the children are draggable or not. */
	draggable: true,
	/** The height of the grid in pixels. */
	height: 300,
	/** The index of the child that is initially zoomed to. */
	initialChild: 0,
	/** The initial zoomlevel. */
	initialZoom: 1,
	/** This function is called when an error occurs.
	 *  It is given an errorcode and a description. You may use this to show a dialog or a warning to a user when he tries to do something that is
	 *  not allowed. Below is a list of errorcodes, descriptions and when they occur:
	 *  - 100 - 'Method [methodName] does not exist on jQuery.gridview' - Triggered when you try to call an non-existing method of the plugin.
	 *  - 101 - 'Zooming in not allowed' - Triggered when you try or the user tries to zoom in when this is not allowed, either because the current zoomlevel
	 *                                     equals the minZoom, or equals one.
	 *  - 102 - 'Zooming out not allowed' - Triggered when you try or the user tries to zoom out when this is not allowed, because the current zoomlevel equals
	 *                                      the maxZoom and maxZoom is not equal to zero.
	 *  - 103 - 'Zoom to not possible' - Triggered when you try or the user tries to 'zoomTo' a non-existing child. Note that if you try to zoom to an
	 *                                   existing child, but an erroneous zoomlevel, either error 101 or 102 is triggered.
	 *  - 104 - 'Return value onPosition not correct' - Triggered when the onPosition function provided by you does not return an object with an x-
	 *                                                   and a y-property, or when one of these properties is not a number.
	 */
	onError: function(errorNum, errorDesc) {},
	/** This function is called when the positioning of children is performed.
	 *  Given the (zero-based!) index of the child in the grid, this function should return an object containing 'x' and 'y' properties that indicate
	 *  the left and top offset of that child relative to the parent.
	 *  There are two functions available by default, which can be used by providing either 'simple' or 'intuitive' as a string. */
	onPosition: 'intuitive',
  	/** This function is called when zooming is performed.
	 *  Given the old zoomlevel and the new zoomlevel, one can return an object with CSS-properties that is used to animate to.
	 *  The given function is called for every child of the grid and this refers to the current child. This way, it is possible to do different
	 *  actions for different children. */
	onZoom: function(oldZoom, newZoom) { return {}; },
	/** The margin around every child of the grid in pixels. */
	margin: 5,
	/** The maximum zoomlevel. If set to 0, there is no maximum. */
	maxZoom: 0,
	/** The minimum zoomlevel. This should be greater than or equal to 1. */
	minZoom: 1,
	/** Indicates if it is possible for the user to zoom in and out by scrolling. */
	scrollToZoom: true,
	/** The width of the grid in pixels. */
	width: 300
  };
  
})(jQuery);


/* -- MouseWheel Plugin --
 * Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */
(function (a) {
    function d(b) {
        var c = b || window.event,
            d = [].slice.call(arguments, 1),
            e = 0,
            f = !0,
            g = 0,
            h = 0;
        return b = a.event.fix(c), b.type = "mousewheel", c.wheelDelta && (e = c.wheelDelta / 120), c.detail && (e = -c.detail / 3), h = e, c.axis !== undefined && c.axis === c.HORIZONTAL_AXIS && (h = 0, g = -1 * e), c.wheelDeltaY !== undefined && (h = c.wheelDeltaY / 120), c.wheelDeltaX !== undefined && (g = -1 * c.wheelDeltaX / 120), d.unshift(b, e, g, h), (a.event.dispatch || a.event.handle).apply(this, d)
    }
    var b = ["DOMMouseScroll", "mousewheel"];
    if (a.event.fixHooks) for (var c = b.length; c;) a.event.fixHooks[b[--c]] = a.event.mouseHooks;
    a.event.special.mousewheel = {
        setup: function () {
            if (this.addEventListener) for (var a = b.length; a;) this.addEventListener(b[--a], d, !1);
            else this.onmousewheel = d
        },
        teardown: function () {
            if (this.removeEventListener) for (var a = b.length; a;) this.removeEventListener(b[--a], d, !1);
            else this.onmousewheel = null
        }
    }, a.fn.extend({
        mousewheel: function (a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function (a) {
            return this.unbind("mousewheel", a)
        }
    })
})(jQuery)
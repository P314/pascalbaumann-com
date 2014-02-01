var $container = $('.background'),
	offsetCoords = $container.offset(),
	topOffset = offsetCoords.top,
	startPos = $container.position().top,
	backgroundHeight = $container.height(),
	contentHeight = $('body').height(),
	positions = [[0,-1600],[600,-1600],[2000,600],[1400,200]],
	contentPos = 1,
	backgroundY = 0;
(function($,sr)
{
  var debounce = function (func, threshold, execAsap)
  {
      var timeout;
      return function debounced () {
          var obj = this, args = arguments;
          function delayed ()
          {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };
          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);
          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
})(jQuery,'smartresize');
$(document).ready(function() 
{
	intro();scroller();resize();
	$(window).smartresize(function()
	{
		resize();
	});
	function resize()
	{
		layout();	
		setBackgroundPosition();
	}
	$(window).scroll(function ()
	{
	    setBackgroundPosition();
	});
	if (detectTouchSupport())
		touchHover();
});
function detectTouchSupport()
{
	msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
	touchSupport = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch &&     document instanceof DocumentTouch);
	if(touchSupport) {
	    return true;
	}
	else {
	    false;
	}
}
function touchHover() 
{
    $('*').on('touchstart', function () {
        $(this).trigger('hover');
    }).on('touchend', function () {
        $(this).trigger('hover');
    });
};

function setBackgroundPosition()
{
	if (detectTouchSupport()) return;

	var startContentY = positions[contentPos-1][0];
	var nextContentY = positions[contentPos][0];
	var scrollTop = $(window).scrollTop();

	if ( scrollTop == 0 ) {
		contentPos = 1;
	}

	if ( scrollTop >= nextContentY )
	{
		if ( contentPos < positions.length-1 )
			contentPos++;
	}
	if ( scrollTop < startContentY )
	{
		if ( contentPos > 1 )
			contentPos--;
	}		
	startContentY = positions[contentPos-1][0];
	nextContentY = positions[contentPos][0];
	var startBackgroundY = positions[contentPos-1][1];
	var nextBackgroundY = positions[contentPos][1];
	var distanceToScroll = nextContentY-scrollTop;
	var distanceToMove = nextBackgroundY-backgroundY;	
	var scrollPercentage = ((scrollTop-startContentY) / (nextContentY-startContentY))*100;
	var moveDist = (nextBackgroundY - startBackgroundY);
	var moveY = (moveDist / 100)*scrollPercentage;	
	backgroundY = positions[contentPos-1][1]+moveY;
	var coords = '50% ' + backgroundY + 'px'; 
	$container.css({ backgroundPosition: coords });	
}
function layout()
{
	var browserWidth = $(window).width();
	var css = [];
	var yPointer = 0;
	$('section').each(function(i,v)
	{	
		var cssobj = { };
		if ( $(this).attr('data-width') == 'full' )
			cssobj.width = browserWidth;
		css.push(cssobj);
	});
	var i = 0;
	$('section').each(function(i,v)
	{		
	    $(this).css(css[i]);
		i++;
	});
}
function intro()
{
	setTimeout(function () {
        $('.background').addClass('fadein-background');
    }, 10);
	setTimeout(function () {
        $('.start').addClass('fadein-intro');
    }, 1200);
	setTimeout(function () {
        $('.logo').addClass('fadein-logo');
    }, 1200);
	setTimeout(function () {
		$('body').css({'overflow':'visible'});
    }, 2000);
	setTimeout(function () {
        $('.intro-continue').addClass('fadein');
    }, 2000);
}
function scroller()
{
	function calculateY(element)
	{
		var pTrans = element.css('-webkit-transform').split(',').map(parseFloat);
		var diffY = pTrans[5]/pTrans[3];
		var y = element.position().top;
		if ( diffY ) {
			y -= diffY;
		}	
		return y;
	}
	$(".scroll").click(function(event)
	{	
		var targetY = calculateY($(this.hash));
		if ( targetY ) 
		{
			event.preventDefault();
			$('html,body').animate({scrollTop:targetY}, 500, function(){});
		}
	});
	$(".snap").snapPoint(
	{ 
	    scrollDelay: 1500,    
	    scrollSpeed: 90,      
	    outerTopOffset: 100,   
	    innerTopOffset: 200 
	});
};
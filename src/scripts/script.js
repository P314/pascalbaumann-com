var positions = [[0,-1000],[600,-1400],[1800,180],[3082,-1400]]; 
var contentPos = 1;
var backgroundY = 0;
var $container = $('.background'),
	offsetCoords = $container.offset(),
	topOffset = offsetCoords.top,
	startPos = $container.position().top;
var backgroundHeight = $container.height();
var contentHeight = $('body').height();
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
	intro();scroller();mapbox();
	resize();
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
});
function setBackgroundPosition()
{
	var startContentY = positions[contentPos-1][0];
	var nextContentY = positions[contentPos][0];
	var scrollTop = $(window).scrollTop();
	if ( scrollTop >= nextContentY )
	{
		if ( contentPos < positions.length-1 )
		{
			contentPos++;
		}
	}
	if ( scrollTop < startContentY )
	{
		if ( contentPos > 1 )
		{
			contentPos--;
		}
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
	var browserHeight = window.innerHeight ? window.innerHeight : $(window).height();
	var browserWidth = $(window).width();
	var css = [];
	var yPointer = 0;
	$('section').each(function(i,v)
	{
		var minHeight = Number($(this).css('min-height').replace(/[^-\d\.]/g, ''));
		if (!minHeight)
		{
			minHeight = $(this).height();
		}	
		var cssobj = { };
		if ( $(this).attr('data-width') == 'full' )
		{	
				cssobj.width = browserWidth;		
		}
		if ( $(this).attr('data-height') == 'full' )
		{	
			if ( browserHeight >= Number($(this).css('min-height').replace(/[^-\d\.]/g, '')) )
			{
				cssobj.height = browserHeight;
			} 
			else
			{
				cssobj.height = minHeight;
			}			
		}
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
		event.preventDefault();
		$('html,body').animate({scrollTop:calculateY($(this.hash))}, 500, function(){});
	});
	$(".snap").snapPoint(
	{ 
	    scrollDelay: 1500,    
	    scrollSpeed: 90,      
	    outerTopOffset: 100,   
	    innerTopOffset: 200 
	});
};
function mapbox()
{
	var map = L.mapbox.map('map_canvas', 'pascalbaumann.map-bocmbect')
	    .setView([47.373092,8.524098], 17);
	var geoJson = [{
	    "type": "Feature",
	    "geometry": {
	        "type": "Point",
	        "coordinates": [8.524098,47.373092]
	    },
	    "properties": {
	        "icon": {
	            "iconUrl": "assets/images/hello.png",
	            "iconSize": [171, 100],
	            "iconAnchor": [68, 100] 
	        }
	    }
	}];
	map.markerLayer.on('layeradd', function(e)
	{
	    var marker = e.layer,
	        feature = marker.feature;
	    marker.setIcon(L.icon(feature.properties.icon));
	});
	map.markerLayer.setGeoJSON(geoJson);
	map.touchZoom.disable();
	map.scrollWheelZoom.disable();
}
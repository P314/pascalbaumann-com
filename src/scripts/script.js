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
	var totalWorks = 15;
	for ( var i=0;i < totalWorks;i++)
	{
		var layer = $(".layer").first().next().clone(); 
		layer.attr("id", "layer" + i); 
		$(".kontext").append(layer);
	}	
	intro();work();scroller();mapbox();
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
	var k = slides( document.querySelector( '.kontext' ) );
	var browserHeight = window.innerHeight ? window.innerHeight : $(window).height();
	var minScale = 940/$(window).width();
	var maxScale = 1;
	var workOffsetTop = $('#work').offset().top;
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
function setPositions(positions)
{
	contentPos = 1;
	this.positions = positions;
	setBackgroundPosition();
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
function work()
{	
	$(".image").imgLiquid({fill:true, verticalAlign:'center', horizontalAlign:'center'});
	var k = slides( document.querySelector( '.kontext' ) );
	$('.next').click(function()
	{
		k.next();
	});
	$('.prev').click(function()
	{
		k.prev();
	});
	var bulletsContainer = document.body.querySelector( '.bullets' );
	for( var i = 0, len = k.getTotal(); i < len; i++ ) {
		var bullet = document.createElement( 'li' );
		bullet.className = i === 0 ? 'active' : '';
		bullet.setAttribute( 'index', i );
		bullet.onclick = function( event ) { k.show( event.target.getAttribute( 'index' ) ) };
		bullet.ontouchstart = function( event ) { k.show( event.target.getAttribute( 'index' ) ) };
		bulletsContainer.appendChild( bullet );
	}
	k.changed.add( function( layer, index )
	{
		var bullets = document.body.querySelectorAll( '.bullets li' );
		for( var i = 0, len = bullets.length; i < len; i++ )
		{
			bullets[i].className = i === index ? 'active' : '';
		}
	} );
	document.addEventListener( 'keyup', function( event )
	{
		if( event.keyCode === 37 ) k.prev();
		if( event.keyCode === 39 ) k.next();
	}, false );
	var touchX = 0;
	var touchConsumed = false;
}
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
window.slides = function( container )
{
	var changed = new slides.Signal();
	var layers = Array.prototype.slice.call( container.querySelectorAll( '.layer' ) );
	var capable =	'WebkitPerspective' in document.body.style ||
					' MozPerspective' in document.body.style ||
					'msPerspective' in document.body.style ||
					'OPerspective' in document.body.style ||
					'perspective' in document.body.style;

	if( capable )
	{
		container.classList.add( 'capable' );
	}
	layers.forEach( function( el, i ) {
		if( !el.querySelector( '.dimmer' ) ) {
			var dimmer = document.createElement( 'div' );
			dimmer.className = 'dimmer';
			el.appendChild( dimmer );
		}
	} );
	function show( target, direction )
	{
		layers = Array.prototype.slice.call( container.querySelectorAll( '.layer' ) );
		container.classList.add( 'animate' );
		direction = direction || ( target > getIndex() ? 'right' : 'left' );
		if( typeof target === 'string' ) target = parseInt( target );
		if( typeof target !== 'number' ) target = getIndex( target );
		target = Math.max( Math.min( target, layers.length ), 0 );
		if( layers[ target ] && !layers[ target ].classList.contains( 'show' ) )
		{
			layers.forEach( function( el, i ) {
				el.classList.remove( 'left', 'right' );
				el.classList.add( direction );
				if( el.classList.contains( 'show' ) ) {
					el.classList.remove( 'show' );
					el.classList.add( 'hide' );
				}
				else {
					el.classList.remove( 'hide' );
				}
			} );
			layers[ target ].classList.add( 'show' );
			changed.dispatch( layers[target], target );
		}
	}
	function prev()
	{
		var index = getIndex() - 1;
		show( index >= 0 ? index : layers.length + index, 'left' );
	}
	function next()
	{
		show( ( getIndex() + 1 ) % layers.length, 'right' );
	}
	function getIndex( of )
	{
		var index = 0;
		layers.forEach( function( layer, i )
		{
			if( ( of && of == layer ) || ( !of && layer.classList.contains( 'show' ) ) )
			{
				index = i;
				return;
			}
		} );
		return index;
	}
	function getTotal()
	{
		return layers.length;
	}
	return {
		show: show,
		prev: prev,
		next: next,
		getIndex: getIndex,
		getTotal: getTotal,
		changed: changed
	};
};
slides.Signal = function()
{
	this.listeners = [];
}
slides.Signal.prototype.add = function( callback )
{
	this.listeners.push( callback );
}
slides.Signal.prototype.remove = function( callback )
{
	var i = this.listeners.indexOf( callback );
	if( i >= 0 ) this.listeners.splice( i, 1 );
}
slides.Signal.prototype.dispatch = function()
{
	var args = Array.prototype.slice.call( arguments );
	this.listeners.forEach( function( f, i ) {
		f.apply( null, args );
	} );
}

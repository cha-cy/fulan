(function(window,document) {
	// creates a global "addWheelListener" method
	// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
	var prefix = "", _addEventListener, onwheel, support;

	// detect event model
	if ( window.addEventListener ) {
		_addEventListener = "addEventListener";
	} else {
		_addEventListener = "attachEvent";
		prefix = "on";
	}

	// detect available wheel event
	support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
			  document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
			  "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

	window.addWheelListener = function( elem, callback, useCapture ) {
		_addWheelListener( elem, support, callback, useCapture );

		// handle MozMousePixelScroll in older Firefox
		if( support == "DOMMouseScroll" ) {
			_addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
		}
	};

	function _addWheelListener( elem, eventName, callback, useCapture ) {
		elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
			!originalEvent && ( originalEvent = window.event );

			// create a normalized event object
			var event = {
				// keep a ref to the original event object
				originalEvent: originalEvent,
				target: originalEvent.target || originalEvent.srcElement,
				type: "wheel",
				deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
				deltaX: 0,
				delatZ: 0,
				preventDefault: function() {
					originalEvent.preventDefault ?
						originalEvent.preventDefault() :
						originalEvent.returnValue = false;
				}
			};
			
			// calculate deltaY (and deltaX) according to the event
			if ( support == "mousewheel" ) {
				event.deltaY = - 1/40 * originalEvent.wheelDelta;
				// Webkit also support wheelDeltaX
				originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
			} else {
				event.deltaY = originalEvent.detail;
			}

			// it's time to fire the callback
			return callback( event );

		}, useCapture || false );
	}
	
	
	/*
	 * make a text view object with a scroll bar.
	 * @param an jQuery selector
	 * @return {
	 *     append: append text to the text view,
	 *     scrollTo: scroll the scroll bar,
	 *     heightChange: when the height of text view change
	 * }
	*/
	window.makeTextView = function (selector, content) {
		var panel, content, scroll, delta, kc, ks, vc, vs, that, hm, l, display;
		// create html elements
		selector = $(selector);
		selector.css({"position": "relative", "overflow": "hidden"});
		if (!content) {
			content = selector.append("<div style=\"position:relative; word-break: break-all;\"></div>").children().last();
		} else {
			content = $(content);
		}
		content.css("width", "100%").css("position", "relative");
		panel = selector.append("<div style=\"position: absolute; height: 100%; width: 14px; top: 0; right: 0;\"></div>")
			.children().last();
		panel.append("<div style=\"width: 1px; height: 100%; background-color: #c3c3c3; position: absolute; top: 0; left: 0;\"></div>",
			"<div style=\"width: 13px; height: 100%; background-color: #f4f4f4; position: absolute; top: 0; right: 0;\"></div>",
			"<div style=\"width: 7px; position: absolute; height:70px; right: 3px; top: 20%; border-radius: 7px;\"></div>");
		scroll = panel.children().last();
		// hide the scroll bar
		display = false;
		panel.hide();
		content.width(selector.width());
		// private functions
		var paintScroll, paintContent, checkTime, enableScroll;
		paintScroll = function () {
			scroll.css("top", 3 + delta * vs);
		};
		paintContent = function () {
			content.css("top", delta * vc);
		};
		checkTime = function (i) {
			return ((i < 10) ? ('0' + i) : i);
		};
		window.getTimeString = function () {
			var n = new Date();
			return n.getHours() + ':' + checkTime(n.getMinutes()) + ':' + checkTime(n.getSeconds());
		};
		enableScroll = function () {
			// when mouse wheel
			addWheelListener(selector[0], function (e) {
				delta += ks * 4 * e.deltaY;
				delta = Math.min(Math.max(delta, 0), 1);
				paintScroll();
				paintContent();
			});
			// drag the scroll slider
			var pressed, cy, in_use;
			scroll.mousedown(function (e) { pressed = true; cy = e.clientY; e.preventDefault(); });
			$(document)
				.mouseup(function (e) { pressed = false; cy = -1; e.preventDefault(); })
				.mousemove(function (e) {
					var dy;
					if (pressed) { 
						if (cy != -1) {
							dy = e.clientY - cy;
							delta += ks * dy;
							delta = Math.min(Math.max(delta, 0), 1);
							paintScroll();
							paintContent();
						}
						cy = e.clientY;
						e.preventDefault();
					}
				});
			// scroll bar get focus
			panel.hover(
				function () {scroll.css("background-color", "#7e7e7e"); },
				function () {scroll.css("background-color", "#c3c3c3"); }
			);
		};
		// use it when h change;
		update = function (h) {
			vs = (hm - 6) / h;
			vc = hm - h;
			scroll.height(hm * vs);
			var tttt = hm * vs;
			vs *= -vc;
			kc = 1 / vc
			ks = 1 / vs;
		};
		// public functions
		that = {
			appendText: function (text, color) {
				content.append("<span" + (color ? " style=\"color:" + color + "\" " : "") + ">" + text.replace("<", "&lt;") + "</span><br>");
				that.change();
				return that;
			},
			appendRaw: function (html) {
				content.append(html);
			},
			change: function () {
				var h;
				h = content[0].getBoundingClientRect().height;
				if (!display && h > hm) {
					content.width(selector.width() - 14);
					panel.fadeIn("slow");
					scroll.css("background-color", "#c3c3c3");
					display = true;
					enableScroll();
				}
				update(h);
				that.scrollTo(1);
				return that;
			},
			scrollTo: function (value) {
				if (value > 1 || value < 0 || display == false) return ;
				delta = value;
				paintScroll();
				paintContent();
				return that;
			},
			heightChange: function (height) {
				hm = selector.height();
				update(content.height());
				return that;
			}
		};
		
		// update informations
		that.heightChange();
		return that;
	};
})(window,document);

window.flanHome = {};


var delayLoad = function (selector, timeout, url) {
	var data, gotten = false;
	$.get(url, function (responce) { data = responce; gotten = true});
	setTimeout(function () {
		$(selector).children().html('');
		var interval = setInterval( function () {
			if (gotten) {
				clearInterval(interval);
				$(selector).html(data);
			}
		}, 50);
	}, Math.max(timeout - 100, 1));
};

/*$(document).ready(function() {
	$('#choose_card_1').bind('click', function(event) {
		delayLoad('#frame_turn', 1000, 'ann.html');
		event.preventDefault();
    });
	
	$('#choose_card_2').bind('click', function(event) {
		delayLoad('#frame_turn', 1000, 'chat.html');
        setTimeout(function() {
            $('#frame_turn').load('chat.html');
        }, 1000);
		event.preventDefault();
    });
	
	$('#icon_home').bind('click', function(event) {
		delayLoad('#frame_turn', 500, 'home.html');
		event.preventDefault();
    });
});*/


var playExitAnime = window.moon_palace.anime.playExitAnime;

function exit()
{
	$("#Frame").addClass("Frame_exit");
	$(".choose_card").each(function () {
		playExitAnime($(this));
	})
}

window.flanHome.frame_turn = {
	start: function () {
		$("#frame_turn").addClass("frame_turn");
	},
	stop: function () {
		$("#frame_turn").removeClass("frame_turn");
	}
};

function Frame_exit()
{
	document.getElementById("Frame").className = "shadow center fade_exit";
	document.getElementById("added_frame").className = "shadow fade_exit";
}



/*!
 PowerTip - v1.2.0 - 2013-04-03
 http://stevenbenner.github.com/jquery-powertip/
 Copyright (c) 2013 Steven Benner (http://stevenbenner.com/).
 Released under MIT license.
 https://raw.github.com/stevenbenner/jquery-powertip/master/LICENSE.txt
*/
(function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){function t(){var t=this;t.top="auto",t.left="auto",t.right="auto",t.bottom="auto",t.set=function(o,n){e.isNumeric(n)&&(t[o]=Math.round(n))}}function o(e,t,o){function n(n,i){r(),e.data(v)||(n?(i&&e.data(m,!0),o.showTip(e)):(P.tipOpenImminent=!0,l=setTimeout(function(){l=null,s()},t.intentPollInterval)))}function i(n){r(),P.tipOpenImminent=!1,e.data(v)&&(e.data(m,!1),n?o.hideTip(e):(P.delayInProgress=!0,l=setTimeout(function(){l=null,o.hideTip(e),P.delayInProgress=!1},t.closeDelay)))}function s(){var i=Math.abs(P.previousX-P.currentX),s=Math.abs(P.previousY-P.currentY),r=i+s;t.intentSensitivity>r?o.showTip(e):(P.previousX=P.currentX,P.previousY=P.currentY,n())}function r(){l=clearTimeout(l),P.delayInProgress=!1}function a(){o.resetPosition(e)}var l=null;this.show=n,this.hide=i,this.cancel=r,this.resetPosition=a}function n(){function e(e,i,r,a,l){var p,c=i.split("-")[0],u=new t;switch(p=s(e)?n(e,c):o(e,c),i){case"n":u.set("left",p.left-r/2),u.set("bottom",P.windowHeight-p.top+l);break;case"e":u.set("left",p.left+l),u.set("top",p.top-a/2);break;case"s":u.set("left",p.left-r/2),u.set("top",p.top+l);break;case"w":u.set("top",p.top-a/2),u.set("right",P.windowWidth-p.left+l);break;case"nw":u.set("bottom",P.windowHeight-p.top+l),u.set("right",P.windowWidth-p.left-20);break;case"nw-alt":u.set("left",p.left),u.set("bottom",P.windowHeight-p.top+l);break;case"ne":u.set("left",p.left-20),u.set("bottom",P.windowHeight-p.top+l);break;case"ne-alt":u.set("bottom",P.windowHeight-p.top+l),u.set("right",P.windowWidth-p.left);break;case"sw":u.set("top",p.top+l),u.set("right",P.windowWidth-p.left-20);break;case"sw-alt":u.set("left",p.left),u.set("top",p.top+l);break;case"se":u.set("left",p.left-20),u.set("top",p.top+l);break;case"se-alt":u.set("top",p.top+l),u.set("right",P.windowWidth-p.left)}return u}function o(e,t){var o,n,i=e.offset(),s=e.outerWidth(),r=e.outerHeight();switch(t){case"n":o=i.left+s/2,n=i.top;break;case"e":o=i.left+s,n=i.top+r/2;break;case"s":o=i.left+s/2,n=i.top+r;break;case"w":o=i.left,n=i.top+r/2;break;case"nw":o=i.left,n=i.top;break;case"ne":o=i.left+s,n=i.top;break;case"sw":o=i.left,n=i.top+r;break;case"se":o=i.left+s,n=i.top+r}return{top:n,left:o}}function n(e,t){function o(){d.push(p.matrixTransform(u))}var n,i,s,r,a=e.closest("svg")[0],l=e[0],p=a.createSVGPoint(),c=l.getBBox(),u=l.getScreenCTM(),f=c.width/2,w=c.height/2,d=[],h=["nw","n","ne","e","se","s","sw","w"];if(p.x=c.x,p.y=c.y,o(),p.x+=f,o(),p.x+=f,o(),p.y+=w,o(),p.y+=w,o(),p.x-=f,o(),p.x-=f,o(),p.y-=w,o(),d[0].y!==d[1].y||d[0].x!==d[7].x)for(i=Math.atan2(u.b,u.a)*O,s=Math.ceil((i%360-22.5)/45),1>s&&(s+=8);s--;)h.push(h.shift());for(r=0;d.length>r;r++)if(h[r]===t){n=d[r];break}return{top:n.y+P.scrollTop,left:n.x+P.scrollLeft}}this.compute=e}function i(o){function i(e){e.data(v,!0),O.queue(function(t){s(e),t()})}function s(e){var t;if(e.data(v)){if(P.isTipOpen)return P.isClosing||r(P.activeHover),O.delay(100).queue(function(t){s(e),t()}),void 0;e.trigger("powerTipPreRender"),t=p(e),t&&(O.empty().append(t),e.trigger("powerTipRender"),P.activeHover=e,P.isTipOpen=!0,O.data(g,o.mouseOnToPopup),o.followMouse?a():(b(e),P.isFixedTipOpen=!0),O.fadeIn(o.fadeInTime,function(){P.desyncTimeout||(P.desyncTimeout=setInterval(H,500)),e.trigger("powerTipOpen")}))}}function r(e){P.isClosing=!0,P.activeHover=null,P.isTipOpen=!1,P.desyncTimeout=clearInterval(P.desyncTimeout),e.data(v,!1),e.data(m,!1),O.fadeOut(o.fadeOutTime,function(){var n=new t;P.isClosing=!1,P.isFixedTipOpen=!1,O.removeClass(),n.set("top",P.currentY+o.offset),n.set("left",P.currentX+o.offset),O.css(n),e.trigger("powerTipClose")})}function a(){if(!P.isFixedTipOpen&&(P.isTipOpen||P.tipOpenImminent&&O.data(T))){var e,n,i=O.outerWidth(),s=O.outerHeight(),r=new t;r.set("top",P.currentY+o.offset),r.set("left",P.currentX+o.offset),e=c(r,i,s),e!==I.none&&(n=u(e),1===n?e===I.right?r.set("left",P.windowWidth-i):e===I.bottom&&r.set("top",P.scrollTop+P.windowHeight-s):(r.set("left",P.currentX-i-o.offset),r.set("top",P.currentY-s-o.offset))),O.css(r)}}function b(t){var n,i;o.smartPlacement?(n=e.fn.powerTip.smartPlacementLists[o.placement],e.each(n,function(e,o){var n=c(y(t,o),O.outerWidth(),O.outerHeight());return i=o,n===I.none?!1:void 0})):(y(t,o.placement),i=o.placement),O.addClass(i)}function y(e,n){var i,s,r=0,a=new t;a.set("top",0),a.set("left",0),O.css(a);do i=O.outerWidth(),s=O.outerHeight(),a=k.compute(e,n,i,s,o.offset),O.css(a);while(5>=++r&&(i!==O.outerWidth()||s!==O.outerHeight()));return a}function H(){var e=!1;!P.isTipOpen||P.isClosing||P.delayInProgress||(P.activeHover.data(v)===!1||P.activeHover.is(":disabled")?e=!0:l(P.activeHover)||P.activeHover.is(":focus")||P.activeHover.data(m)||(O.data(g)?l(O)||(e=!0):e=!0),e&&r(P.activeHover))}var k=new n,O=e("#"+o.popupId);0===O.length&&(O=e("<div/>",{id:o.popupId}),0===d.length&&(d=e("body")),d.append(O)),o.followMouse&&(O.data(T)||(f.on("mousemove",a),w.on("scroll",a),O.data(T,!0))),o.mouseOnToPopup&&O.on({mouseenter:function(){O.data(g)&&P.activeHover&&P.activeHover.data(h).cancel()},mouseleave:function(){P.activeHover&&P.activeHover.data(h).hide()}}),this.showTip=i,this.hideTip=r,this.resetPosition=b}function s(e){return window.SVGElement&&e[0]instanceof SVGElement}function r(){P.mouseTrackingActive||(P.mouseTrackingActive=!0,e(function(){P.scrollLeft=w.scrollLeft(),P.scrollTop=w.scrollTop(),P.windowWidth=w.width(),P.windowHeight=w.height()}),f.on("mousemove",a),w.on({resize:function(){P.windowWidth=w.width(),P.windowHeight=w.height()},scroll:function(){var e=w.scrollLeft(),t=w.scrollTop();e!==P.scrollLeft&&(P.currentX+=e-P.scrollLeft,P.scrollLeft=e),t!==P.scrollTop&&(P.currentY+=t-P.scrollTop,P.scrollTop=t)}}))}function a(e){P.currentX=e.pageX,P.currentY=e.pageY}function l(e){var t=e.offset(),o=e[0].getBoundingClientRect(),n=o.right-o.left,i=o.bottom-o.top;return P.currentX>=t.left&&P.currentX<=t.left+n&&P.currentY>=t.top&&P.currentY<=t.top+i}function p(t){var o,n,i=t.data(y),s=t.data(H),r=t.data(k);return i?(e.isFunction(i)&&(i=i.call(t[0])),n=i):s?(e.isFunction(s)&&(s=s.call(t[0])),s.length>0&&(n=s.clone(!0,!0))):r&&(o=e("#"+r),o.length>0&&(n=o.html())),n}function c(e,t,o){var n=P.scrollTop,i=P.scrollLeft,s=n+P.windowHeight,r=i+P.windowWidth,a=I.none;return(n>e.top||n>Math.abs(e.bottom-P.windowHeight)-o)&&(a|=I.top),(e.top+o>s||Math.abs(e.bottom-P.windowHeight)>s)&&(a|=I.bottom),(i>e.left||e.right+t>r)&&(a|=I.left),(e.left+t>r||i>e.right)&&(a|=I.right),a}function u(e){for(var t=0;e;)e&=e-1,t++;return t}var f=e(document),w=e(window),d=e("body"),h="displayController",v="hasActiveHover",m="forcedOpen",T="hasMouseMove",g="mouseOnToPopup",b="originalTitle",y="powertip",H="powertipjq",k="powertiptarget",O=180/Math.PI,P={isTipOpen:!1,isFixedTipOpen:!1,isClosing:!1,tipOpenImminent:!1,activeHover:null,currentX:0,currentY:0,previousX:0,previousY:0,desyncTimeout:null,mouseTrackingActive:!1,delayInProgress:!1,windowWidth:0,windowHeight:0,scrollTop:0,scrollLeft:0},I={none:0,top:1,bottom:2,left:4,right:8};e.fn.powerTip=function(t,n){if(!this.length)return this;if("string"===e.type(t)&&e.powerTip[t])return e.powerTip[t].call(this,this,n);var s=e.extend({},e.fn.powerTip.defaults,t),a=new i(s);return r(),this.each(function(){var t,n=e(this),i=n.data(y),r=n.data(H),l=n.data(k);n.data(h)&&e.powerTip.destroy(n),t=n.attr("title"),i||l||r||!t||(n.data(y,t),n.data(b,t),n.removeAttr("title")),n.data(h,new o(n,s,a))}),s.manual||this.on({"mouseenter.powertip":function(t){e.powerTip.show(this,t)},"mouseleave.powertip":function(){e.powerTip.hide(this)},"focus.powertip":function(){e.powerTip.show(this)},"blur.powertip":function(){e.powerTip.hide(this,!0)},"keydown.powertip":function(t){27===t.keyCode&&e.powerTip.hide(this,!0)}}),this},e.fn.powerTip.defaults={fadeInTime:200,fadeOutTime:100,followMouse:!1,popupId:"powerTip",intentSensitivity:7,intentPollInterval:100,closeDelay:100,placement:"n",smartPlacement:!1,offset:10,mouseOnToPopup:!1,manual:!1},e.fn.powerTip.smartPlacementLists={n:["n","ne","nw","s"],e:["e","ne","se","w","nw","sw","n","s","e"],s:["s","se","sw","n"],w:["w","nw","sw","e","ne","se","n","s","w"],nw:["nw","w","sw","n","s","se","nw"],ne:["ne","e","se","n","s","sw","ne"],sw:["sw","w","nw","s","n","ne","sw"],se:["se","e","ne","s","n","nw","se"],"nw-alt":["nw-alt","n","ne-alt","sw-alt","s","se-alt","w","e"],"ne-alt":["ne-alt","n","nw-alt","se-alt","s","sw-alt","e","w"],"sw-alt":["sw-alt","s","se-alt","nw-alt","n","ne-alt","w","e"],"se-alt":["se-alt","s","sw-alt","ne-alt","n","nw-alt","e","w"]},e.powerTip={show:function(t,o){return o?(a(o),P.previousX=o.pageX,P.previousY=o.pageY,e(t).data(h).show()):e(t).first().data(h).show(!0,!0),t},reposition:function(t){return e(t).first().data(h).resetPosition(),t},hide:function(t,o){return t?e(t).first().data(h).hide(o):P.activeHover&&P.activeHover.data(h).hide(!0),t},destroy:function(t){return e(t).off(".powertip").each(function(){var t=e(this),o=[b,h,v,m];t.data(b)&&(t.attr("title",t.data(b)),o.push(y)),t.removeData(o)}),t}},e.powerTip.showTip=e.powerTip.show,e.powerTip.closeTip=e.powerTip.hide});

/* PowerTip -> */
jQuery(document).ready(function() {
	jQuery("*[title]").powerTip({followMouse: true});
});
/* <- PowerTip */
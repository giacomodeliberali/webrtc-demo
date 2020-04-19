function asyncGeneratorStep(e,t,n,r,o,a,i){try{var u=e[a](i),c=u.value}catch(s){return void n(s)}u.done?t(c):Promise.resolve(c).then(r,o)}function _asyncToGenerator(e){return function(){var t=this,n=arguments;return new Promise((function(r,o){var a=e.apply(t,n);function i(e){asyncGeneratorStep(a,r,o,i,u,"next",e)}function u(e){asyncGeneratorStep(a,r,o,i,u,"throw",e)}i(void 0)}))}}(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{"7a3y":function(e,t,n){"use strict";n.r(t),n.d(t,"startInputShims",(function(){return d}));var r=n("pM1R"),o=new WeakMap,a=function(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;o.has(e)!==n&&(n?u(e,t,r):c(e,t))},i=function(e){return e===e.getRootNode().activeElement},u=function(e,t,n){var r=t.parentNode,a=t.cloneNode(!1);a.classList.add("cloned-input"),a.tabIndex=-1,r.appendChild(a),o.set(e,a);var i="rtl"===e.ownerDocument.dir?9999:-9999;e.style.pointerEvents="none",t.style.transform="translate3d(".concat(i,"px,").concat(n,"px,0) scale(0)")},c=function(e,t){var n=o.get(e);n&&(o.delete(e),n.remove()),e.style.pointerEvents="",t.style.transform=""},s="input, textarea, [no-blur]",l=function(e,t){if("INPUT"===e.tagName&&!(e.parentElement&&"ION-INPUT"===e.parentElement.tagName||e.parentElement&&e.parentElement.parentElement&&"ION-SEARCHBAR"===e.parentElement.parentElement.tagName)){var n=e.closest("ion-content");if(null!==n){var r=n.$ionPaddingTimer;r&&clearTimeout(r),t>0?n.style.setProperty("--keyboard-offset","".concat(t,"px")):n.$ionPaddingTimer=setTimeout((function(){n.style.setProperty("--keyboard-offset","0px")}),120)}}},d=function(e){var t=document,n=e.getNumber("keyboardHeight",290),o=e.getBoolean("scrollAssist",!0),u=e.getBoolean("hideCaretOnScroll",!0),c=e.getBoolean("inputBlurring",!0),d=e.getBoolean("scrollPadding",!0),f=Array.from(t.querySelectorAll("ion-input, ion-textarea")),v=new WeakMap,p=new WeakMap,m=function(){var e=_asyncToGenerator(regeneratorRuntime.mark((function e(t){var c,s,l,d,f;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.t0=t.componentOnReady,!e.t0){e.next=4;break}return e.next=4,t.componentOnReady();case 4:c=t.shadowRoot||t,s=c.querySelector("input")||c.querySelector("textarea"),l=t.closest("ion-content"),s&&(l&&u&&!v.has(t)&&(d=function(e,t,n){if(!n||!t)return function(){};var r=function(n){i(t)&&a(e,t,n)},o=function(){return a(e,t,!1)},u=function(){return r(!0)},c=function(){return r(!1)};return n.addEventListener("ionScrollStart",u),n.addEventListener("ionScrollEnd",c),t.addEventListener("blur",o),function(){n.removeEventListener("ionScrollStart",u),n.removeEventListener("ionScrollEnd",c),t.addEventListener("ionBlur",o)}}(t,s,l),v.set(t,d)),l&&o&&!p.has(t)&&(f=function(e,t,n,o){var u,c=function(e){u=Object(r.j)(e)},s=function(c){if(u){var s=Object(r.j)(c);(function(e,t,n){if(t&&n){var r=t.x-n.x,o=t.y-n.y;return r*r+o*o>36}return!1})(0,u,s)||i(t)||(c.preventDefault(),c.stopPropagation(),function(e,t,n,r){var o=function(e,t,n){return function(e,t,n,r){var o=e.top,a=e.bottom,i=t.top,u=i+15,c=.5*Math.min(t.bottom,r-n)-a,s=u-o,l=Math.round(c<0?-c:s>0?-s:0),d=Math.min(l,o-i),f=Math.abs(d);return{scrollAmount:d,scrollDuration:Math.min(400,Math.max(150,f/.3)),scrollPadding:n,inputSafeY:4-(o-u)}}((e.closest("ion-item,[ion-item]")||e).getBoundingClientRect(),t.getBoundingClientRect(),n,e.ownerDocument.defaultView.innerHeight)}(e,n,r);if(Math.abs(o.scrollAmount)<4)t.focus();else if(a(e,t,!0,o.inputSafeY),t.focus(),"undefined"!=typeof window){var i,u=function(){var r=_asyncToGenerator(regeneratorRuntime.mark((function r(){return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return void 0!==i&&clearTimeout(i),window.removeEventListener("resize",u),r.next=4,n.scrollByPoint(0,o.scrollAmount,o.scrollDuration);case 4:a(e,t,!1,o.inputSafeY),t.focus();case 6:case"end":return r.stop()}}),r)})));return function(){return r.apply(this,arguments)}}();window.addEventListener("resize",u),i=setTimeout(u,1e3)}}(e,t,n,o))}};return e.addEventListener("touchstart",c,!0),e.addEventListener("touchend",s,!0),function(){e.removeEventListener("touchstart",c,!0),e.removeEventListener("touchend",s,!0)}}(t,s,l,n),p.set(t,f)));case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();c&&function(){var e=!0,t=!1,n=document;n.addEventListener("ionScrollStart",(function(){t=!0})),n.addEventListener("focusin",(function(){e=!0}),!0),n.addEventListener("touchend",(function(r){if(t)t=!1;else{var o=n.activeElement;if(o&&!o.matches(s)){var a=r.target;a!==o&&(a.matches(s)||a.closest(s)||(e=!1,setTimeout((function(){e||o.blur()}),50)))}}}),!1)}(),d&&function(e){var t=document;t.addEventListener("focusin",(function(t){l(t.target,e)})),t.addEventListener("focusout",(function(e){l(e.target,0)}))}(n);for(var h=0,g=f;h<g.length;h++){var E=g[h];m(E)}t.addEventListener("ionInputDidLoad",(function(e){m(e.detail)})),t.addEventListener("ionInputDidUnload",(function(e){!function(e){if(u){var t=v.get(e);t&&t(),v.delete(e)}if(o){var n=p.get(e);n&&n(),p.delete(e)}}(e.detail)}))}}}]);
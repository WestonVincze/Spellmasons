var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function c(t){return"function"==typeof t}function r(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function u(t,n){t.appendChild(n)}function i(t,n,e){t.insertBefore(n,e||null)}function l(t){t.parentNode.removeChild(t)}function s(t){return document.createElement(t)}function a(t){return document.createTextNode(t)}function f(){return a(" ")}function d(){return a("")}function p(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function h(t,n){t.value=null==n?"":n}function m(t,n,e,o){null===e?t.style.removeProperty(n):t.style.setProperty(n,e,o?"important":"")}let g;function b(t){g=t}function $(){if(!g)throw new Error("Function called outside component initialization");return g}const k=[],v=[],y=[],x=[],w=Promise.resolve();let _=!1;function C(t){y.push(t)}const E=new Set;let P=0;function S(){const t=g;do{for(;P<k.length;){const t=k[P];P++,b(t),j(t.$$)}for(b(null),k.length=0,P=0;v.length;)v.pop()();for(let t=0;t<y.length;t+=1){const n=y[t];E.has(n)||(E.add(n),n())}y.length=0}while(k.length);for(;x.length;)x.pop()();_=!1,E.clear(),b(t)}function j(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(C)}}const N=new Set;let A;function L(t,n){t&&t.i&&(N.delete(t),t.i(n))}function O(t,n){const e=n.token={};function c(t,c,r,u){if(n.token!==e)return;n.resolved=u;let i=n.ctx;void 0!==r&&(i=i.slice(),i[r]=u);const l=t&&(n.current=t)(i);let s=!1;n.block&&(n.blocks?n.blocks.forEach(((t,e)=>{e!==c&&t&&(A={r:0,c:[],p:A},function(t,n,e,o){if(t&&t.o){if(N.has(t))return;N.add(t),A.c.push((()=>{N.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}(t,1,1,(()=>{n.blocks[e]===t&&(n.blocks[e]=null)})),A.r||o(A.c),A=A.p)})):n.block.d(1),l.c(),L(l,1),l.m(n.mount(),n.anchor),s=!0),n.block=l,n.blocks&&(n.blocks[c]=l),s&&S()}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){const e=$();if(t.then((t=>{b(e),c(n.then,1,n.value,t),b(null)}),(t=>{if(b(e),c(n.catch,2,n.error,t),b(null),!n.hasCatch)throw t})),n.current!==n.pending)return c(n.pending,0),!0}else{if(n.current!==n.then)return c(n.then,1,n.value,t),!0;n.resolved=t}var r}function z(t,n,e){const o=n.slice(),{resolved:c}=t;t.current===t.then&&(o[t.value]=c),t.current===t.catch&&(o[t.error]=c),t.block.p(o,e)}function B(t,n){-1===t.$$.dirty[0]&&(k.push(t),_||(_=!0,w.then(S)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function M(r,u,i,s,a,f,d,p=[-1]){const h=g;b(r);const m=r.$$={fragment:null,ctx:null,props:f,update:t,not_equal:a,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(u.context||(h?h.$$.context:[])),callbacks:e(),dirty:p,skip_bound:!1,root:u.target||h.$$.root};d&&d(m.root);let $=!1;if(m.ctx=i?i(r,u.props||{},((t,n,...e)=>{const o=e.length?e[0]:n;return m.ctx&&a(m.ctx[t],m.ctx[t]=o)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](o),$&&B(r,t)),n})):[],m.update(),$=!0,o(m.before_update),m.fragment=!!s&&s(m.ctx),u.target){if(u.hydrate){const t=function(t){return Array.from(t.childNodes)}(u.target);m.fragment&&m.fragment.l(t),t.forEach(l)}else m.fragment&&m.fragment.c();u.intro&&L(r.$$.fragment),function(t,e,r,u){const{fragment:i,on_mount:l,on_destroy:s,after_update:a}=t.$$;i&&i.m(e,r),u||C((()=>{const e=l.map(n).filter(c);s?s.push(...e):o(e),t.$$.on_mount=[]})),a.forEach(C)}(r,u.target,u.anchor,u.customElement),S()}b(h)}function T(n){let e;return{c(){e=s("p"),e.textContent="Something went wrong loading assets",m(e,"color","red")},m(t,n){i(t,e,n)},p:t,d(t){t&&l(e)}}}function q(t){let n,e=!1===t[0]&&D(t);return{c(){e&&e.c(),n=d()},m(t,o){e&&e.m(t,o),i(t,n,o)},p(t,o){!1===t[0]?e?e.p(t,o):(e=D(t),e.c(),e.m(n.parentNode,n)):e&&(e.d(1),e=null)},d(t){e&&e.d(t),t&&l(n)}}}function D(t){let n,e,c,r,m,g,b,$,k,v,y,x,w={ctx:t,current:null,token:null,hasCatch:!0,pending:H,then:G,catch:F,error:10};return O(v=t[2],w),{c(){n=a("Server Url\n    "),e=s("div"),c=s("input"),r=f(),m=s("button"),m.textContent="Connect",g=f(),b=s("button"),b.textContent="Disconnect",$=f(),k=d(),w.block.c()},m(o,l){i(o,n,l),i(o,e,l),u(e,c),h(c,t[1]),u(e,r),u(e,m),u(e,g),u(e,b),i(o,$,l),i(o,k,l),w.block.m(o,w.anchor=l),w.mount=()=>k.parentNode,w.anchor=k,y||(x=[p(c,"input",t[8]),p(m,"click",t[6]),p(b,"click",R)],y=!0)},p(n,e){t=n,2&e&&c.value!==t[1]&&h(c,t[1]),w.ctx=t,4&e&&v!==(v=t[2])&&O(v,w)||z(w,t,e)},d(t){t&&l(n),t&&l(e),t&&l($),t&&l(k),w.block.d(t),w.token=null,w=null,y=!1,o(x)}}}function F(t){let n,e,o=t[10].message+"";return{c(){n=s("p"),e=a(o),m(n,"color","red")},m(t,o){i(t,n,o),u(n,e)},p(t,n){4&n&&o!==(o=t[10].message+"")&&function(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}(e,o)},d(t){t&&l(n)}}}function G(t){let n,e,c,r,d,g,b,$,k;return{c(){n=a("Game name\n      "),e=s("input"),c=a("\n      Password (optional)\n      "),r=s("div"),d=s("button"),d.textContent="Host",g=f(),b=s("button"),b.textContent="Join",m(r,"display","flex")},m(o,l){i(o,n,l),i(o,e,l),h(e,t[3]),i(o,c,l),i(o,r,l),u(r,d),u(r,g),u(r,b),$||(k=[p(e,"input",t[9]),p(d,"click",t[7]),p(b,"click",t[7])],$=!0)},p(t,n){8&n&&e.value!==t[3]&&h(e,t[3])},d(t){t&&l(n),t&&l(e),t&&l(c),t&&l(r),$=!1,o(k)}}}function H(n){return{c:t,m:t,p:t,d:t}}function I(n){let e;return{c(){e=a("loading assets...")},m(t,n){i(t,e,n)},p:t,d(t){t&&l(e)}}}function J(n){let e,c,r,u,a,h,m,g,b,$={ctx:n,current:null,token:null,hasCatch:!0,pending:I,then:q,catch:T};return O(window.setupPixiPromise,$),{c(){var t,n,o;e=s("div"),c=f(),r=s("button"),r.textContent="Singleplayer",u=f(),a=s("button"),a.textContent="Multiplayer",h=f(),m=d(),$.block.c(),t=e,n="id",null==(o="websocket-pie-connection-status")?t.removeAttribute(n):t.getAttribute(n)!==o&&t.setAttribute(n,o)},m(t,o){i(t,e,o),i(t,c,o),i(t,r,o),i(t,u,o),i(t,a,o),i(t,h,o),i(t,m,o),$.block.m(t,$.anchor=o),$.mount=()=>m.parentNode,$.anchor=m,g||(b=[p(r,"click",n[4]),p(a,"click",n[5])],g=!0)},p(t,[e]){z($,n=t,e)},i:t,o:t,d(t){t&&l(e),t&&l(c),t&&l(r),t&&l(u),t&&l(a),t&&l(h),t&&l(m),$.block.d(t),$.token=null,$=null,g=!1,o(b)}}}function R(){window.pie.disconnect()}function U(t,n,e){let o,c,r,u;return[o,c,r,u,function(){e(0,o=!0),window.connect_to_wsPie_server()},function(){e(0,o=!1)},function(){c&&e(2,r=window.connect_to_wsPie_server(c))},function(){window.pie.isConnected()?(console.log("Setup: Loading complete.. initialize game"),window.joinRoom({name:u})):console.error("Cannot join room until pieClient is connected to a pieServer")},function(){c=this.value,e(1,c)},function(){u=this.value,e(3,u)}]}return new class extends class{$destroy(){!function(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),M(this,t,U,J,r,{})}}({target:document.getElementById("menu-inner")||document.body,props:{}})}();
//# sourceMappingURL=svelte-bundle.js.map

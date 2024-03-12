import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
import './chunks/astro_DQiTNdAv.mjs';
import { compile } from 'path-to-regexp';

if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const path = toPath(params);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"!(function(w,p,f,c){if(!window.crossOriginIsolated && !navigator.serviceWorker) return;c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.8.2 - MIT builder.io */\n!function(t,e,n,i,o,r,a,s,d,c,l,p){function u(){p||(p=1,\"/\"==(a=(r.lib||\"/~partytown/\")+(r.debug?\"debug/\":\"\"))[0]&&(d=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(s=setTimeout(f,1e4),e.addEventListener(\"pt0\",w),o?h(1):n.serviceWorker?n.serviceWorker.register(a+(r.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):f())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.style.display=\"block\",c.style.width=\"0\",c.style.height=\"0\",c.style.border=\"0\",c.style.visibility=\"hidden\",c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.8.2\":\"sandbox-sw.html?\"+Date.now()),e.querySelector(r.sandboxParent||\"body\").appendChild(c)}function f(n,o){for(w(),i==t&&(r.forward||[]).map((function(e){delete t[e.split(\".\")[0]]})),n=0;n<d.length;n++)(o=e.createElement(\"script\")).innerHTML=d[n].innerHTML,o.nonce=r.nonce,e.head.appendChild(o);c&&c.parentNode.removeChild(c)}function w(){clearTimeout(s)}r=t.partytown||{},i==t&&(r.forward||[]).map((function(e){l=t,e.split(\".\").map((function(e,n,i){l=l[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:l[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);;((d,s)=>(s=d.currentScript,d.addEventListener('astro:before-swap',()=>s.remove(),{once:true})))(document);"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"!(function(w,p,f,c){if(!window.crossOriginIsolated && !navigator.serviceWorker) return;c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.8.2 - MIT builder.io */\n!function(t,e,n,i,o,r,a,s,d,c,l,p){function u(){p||(p=1,\"/\"==(a=(r.lib||\"/~partytown/\")+(r.debug?\"debug/\":\"\"))[0]&&(d=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(s=setTimeout(f,1e4),e.addEventListener(\"pt0\",w),o?h(1):n.serviceWorker?n.serviceWorker.register(a+(r.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):f())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.style.display=\"block\",c.style.width=\"0\",c.style.height=\"0\",c.style.border=\"0\",c.style.visibility=\"hidden\",c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.8.2\":\"sandbox-sw.html?\"+Date.now()),e.querySelector(r.sandboxParent||\"body\").appendChild(c)}function f(n,o){for(w(),i==t&&(r.forward||[]).map((function(e){delete t[e.split(\".\")[0]]})),n=0;n<d.length;n++)(o=e.createElement(\"script\")).innerHTML=d[n].innerHTML,o.nonce=r.nonce,e.head.appendChild(o);c&&c.parentNode.removeChild(c)}function w(){clearTimeout(s)}r=t.partytown||{},i==t&&(r.forward||[]).map((function(e){l=t,e.split(\".\").map((function(e,n,i){l=l[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:l[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);;((d,s)=>(s=d.currentScript,d.addEventListener('astro:before-swap',()=>s.remove(),{once:true})))(document);"}],"styles":[{"type":"external","src":"/_astro/index.BrQHGP1L.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/Migration1/Migration/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_BR5P50x3.mjs","/src/pages/index.astro":"chunks/pages/index_BOnbdAbY.mjs","\u0000@astrojs-manifest":"manifest_DBXIdv2W.mjs","D:/Migration1/Migration/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_Hb05nn4I.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_dH-ODqDh.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_BR-PjBrv.mjs","@astrojs/react/client.js":"_astro/client.D9Vng9vH.js","D:/Migration1/Migration/src/js/script.jsx":"_astro/script.DGiRuR1s.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/index.BrQHGP1L.css","/boat.jpg","/favicon.ico","/Gate01.png","/Gate02.png","/Gate1.jpg","/index.5224771a.css","/index.c592948c.js","/index.c592948c.js.map","/india.jpg","/loader.webp","/loading.f68af09f.gif","/loading.gif","/models_new.glb","/path.json","/s1.jpg","/trinity_texture.jpg","/waternormals.jpg","/_astro/client.D9Vng9vH.js","/_astro/index.NEDEFKed.js","/_astro/script.DGiRuR1s.js","/~partytown/partytown-atomics.js","/~partytown/partytown-media.js","/~partytown/partytown-sw.js","/~partytown/partytown.js"],"buildFormat":"directory"});

export { manifest };

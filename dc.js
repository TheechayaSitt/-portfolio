/* Minimal runtime for the portfolio pages: renders <template id="tpl"> with
   {{expr}} bindings, <sc-for>/<sc-if>, and on* event bindings, and patches the
   DOM in place on setState so CSS animations are not restarted. */
(function () {
  function DCLogic() { this.state = {}; this.props = {}; }
  DCLogic.prototype.setState = function (patch) {
    var p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, p || {});
    schedule();
  };
  var comp, tpl, root, queued = false;
  function schedule() {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; render(); });
  }
  var fnCache = {};
  function compile(expr) {
    if (!fnCache[expr]) {
      try { fnCache[expr] = new Function('s', 'with(s){return (' + expr + ')}'); }
      catch (e) { fnCache[expr] = function () { return ''; }; }
    }
    return fnCache[expr];
  }
  function get(expr, scope) { try { return compile(expr)(scope); } catch (e) { return undefined; } }
  var ONE = /^\{\{([\s\S]+)\}\}$/;
  function sub(str, scope) {
    return str.replace(/\{\{([\s\S]+?)\}\}/g, function (m, e) {
      var v = get(e.trim(), scope);
      return (v == null || typeof v === 'function') ? '' : String(v);
    });
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function build(node, scope, out) {
    var kids = node.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var ch = kids[i];
      if (ch.nodeType === 3) { out.push({ t: 3, v: sub(ch.nodeValue, scope) }); continue; }
      if (ch.nodeType !== 1) continue;
      var tag = ch.localName;
      if (tag === 'sc-for') {
        var m = (ch.getAttribute('list') || '').match(ONE);
        var list = m ? get(m[1].trim(), scope) : null;
        var as = ch.getAttribute('as') || 'item';
        if (list && list.length) for (var j = 0; j < list.length; j++) {
          var sc = Object.create(scope); sc[as] = list[j]; sc.index = j; build(ch, sc, out);
        }
        continue;
      }
      if (tag === 'sc-if') {
        var m2 = (ch.getAttribute('value') || '').match(ONE);
        if (m2 && get(m2[1].trim(), scope)) build(ch, scope, out);
        continue;
      }
      var v = { t: 1, tag: ch.tagName, ns: ch.namespaceURI, a: {}, ev: {}, c: [] };
      for (var k = 0; k < ch.attributes.length; k++) {
        var at = ch.attributes[k], name = at.name;
        if (name.indexOf('hint-') === 0) continue;
        if (/^on[a-z]+$/i.test(name)) {
          var mm = at.value.match(ONE);
          var fn = mm ? get(mm[1].trim(), scope) : null;
          if (typeof fn === 'function') v.ev[name.slice(2).toLowerCase()] = fn;
          continue;
        }
        v.a[name] = sub(at.value, scope);
      }
      build(ch.content || ch, scope, v.c);
      out.push(v);
    }
  }
  function create(v) {
    if (v.t === 3) return document.createTextNode(v.v);
    var el = v.ns && v.ns !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(v.ns, v.tag) : document.createElement(v.tag);
    for (var n in v.a) el.setAttribute(n, v.a[n]);
    bindEvents(el, v.ev);
    for (var i = 0; i < v.c.length; i++) el.appendChild(create(v.c[i]));
    return el;
  }
  function bindEvents(el, ev) {
    el.__h = ev;
    for (var type in ev) {
      if (!el.__b) el.__b = {};
      if (!el.__b[type]) {
        el.__b[type] = true;
        el.addEventListener(type, function (e) { var h = this.__h && this.__h[e.type]; if (h) h(e); });
      }
    }
  }
  function same(el, v) {
    if (v.t === 3) return el.nodeType === 3;
    return el.nodeType === 1 && el.tagName === v.tag;
  }
  function patch(parent, vs) {
    var cur = parent.firstChild, i = 0;
    for (; i < vs.length; i++) {
      var v = vs[i];
      if (cur && same(cur, v)) {
        if (v.t === 3) { if (cur.nodeValue !== v.v) cur.nodeValue = v.v; }
        else {
          var old = cur.attributes;
          for (var k = old.length - 1; k >= 0; k--) if (!(old[k].name in v.a)) cur.removeAttribute(old[k].name);
          for (var n in v.a) if (cur.getAttribute(n) !== v.a[n]) cur.setAttribute(n, v.a[n]);
          bindEvents(cur, v.ev);
          patch(cur, v.c);
        }
        cur = cur.nextSibling;
      } else {
        var nn = create(v);
        parent.insertBefore(nn, cur || null);
      }
    }
    while (cur) { var nx = cur.nextSibling; parent.removeChild(cur); cur = nx; }
  }
  function render() {
    var vals = comp.renderVals ? (comp.renderVals() || {}) : {};
    var out = []; build(tpl.content, vals, out); patch(root, out);
  }
  window.addEventListener('DOMContentLoaded', function () {
    tpl = document.getElementById('tpl'); root = document.getElementById('root');
    var src = document.getElementById('dcsrc').textContent;
    var C = new Function('DCLogic', src + '\n;return typeof Component!=="undefined"?Component:null;')(DCLogic);
    comp = C ? new C() : new DCLogic();
    if (!comp.state) comp.state = {};
    var props = {};
    try { var pr = JSON.parse(document.getElementById('dcsrc').getAttribute('data-props') || '{}');
      for (var k in pr) if (k.charAt(0) !== '$' && pr[k] && 'default' in pr[k]) props[k] = pr[k]['default']; } catch (e) {}
    comp.props = props;
    render();
    if (comp.componentDidMount) comp.componentDidMount();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); }, 50); }
  });
})();

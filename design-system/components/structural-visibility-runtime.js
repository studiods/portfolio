/* Structural visibility runtime — portfolio-wide.
   Runs after the page's legacy content and motion scripts. It preserves all
   authored text in DOM while enforcing the system’s presentational state.

   Toggle direct numbered-subsection descriptions with
   <body class="hm-ds-subsection-copy-hidden">.
*/
(function () {
  "use strict";
  var hiddenClass = "hm-ds-subsection-copy-hidden";
  var owned = "data-hm-ds-visibility-owned";
  var indexOwned = "data-hm-ds-index-owned";

  function directChildrenBySelector(parent, selector) {
    return Array.prototype.filter.call(parent.children, function (child) { return child.matches(selector); });
  }
  function getDescriptionNodes() {
    var nodes = [];
    document.querySelectorAll(".hm-subhead, .data-card-head").forEach(function (head) {
      var number = directChildrenBySelector(head, ".hm-subno, .hm-card-no")[0];
      if (!number) return;
      directChildrenBySelector(head, "div").forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (child) {
          var named = child.matches(".hm-subcopy, .hm-ds-subsection__description, .desc, [data-hm-subsection-copy]");
          var followsTitle = child.matches("p") && child.previousElementSibling &&
            child.previousElementSibling.matches(".hm-subtitle, h3, h4");
          if ((named || followsTitle) && nodes.indexOf(child) === -1) nodes.push(child);
        });
      });
    });
    return nodes;
  }
  function getIndexNodes() {
    var candidates = document.querySelectorAll(".hm-ds-index-label, .hm-subno, .hm-card-no, .hm-section-no");
    return Array.prototype.filter.call(candidates, function (node) {
      var match = (node.textContent || "").trim().match(/^(\d{1,2}(?:\.\d{1,2})?)(?=\s*(?:\/|·|$))/);
      if (!match) return false;
      if (!node.hasAttribute("data-index")) node.setAttribute("data-index", match[1]);
      node.classList.add("hm-ds-index-label");
      return true;
    });
  }
  function setDescriptionVisibility(isHidden) {
    getDescriptionNodes().forEach(function (node) {
      if (isHidden) {
        node.setAttribute(owned, "description");
        node.style.setProperty("display", "none", "important");
        node.style.setProperty("margin", "0", "important");
        node.style.setProperty("padding", "0", "important");
      } else if (node.getAttribute(owned) === "description") {
        node.style.removeProperty("display"); node.style.removeProperty("margin");
        node.style.removeProperty("padding"); node.removeAttribute(owned);
      }
    });
  }
  function setIndexVisibility() {
    getIndexNodes().forEach(function (node) {
      node.setAttribute(indexOwned, "true");
      /* Legacy motion scripts inject 12px !important inline after load.
         This final layer replaces only that presentational value. */
      node.style.setProperty("font-size", "0px", "important");
      node.style.setProperty("white-space", "nowrap", "important");
    });
  }
  function apply() { setDescriptionVisibility(document.body.classList.contains(hiddenClass)); setIndexVisibility(); }
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; apply(); });
  }
  apply();
  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true, subtree:true, attributes:true, attributeFilter:["class","style"]
  });
}());

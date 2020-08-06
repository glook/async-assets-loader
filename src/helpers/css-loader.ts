// wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
/**
 * @ignore
 */
const ready = (cb: () => void) => {
  if (document.body) {
    return cb();
  }
  setTimeout(() => ready(cb));
  return null;
};
/**
 * @ignore
 */
const getRef = () => {
  const refs = (document.body || document.getElementsByTagName('head')[0]).childNodes;
  return refs[refs.length - 1];
};
/**
 * @ignore
 */
const addElement = (tag: HTMLElement) => {
  ready(() => {
    const ref = getRef();
    // Inject link
    // Note: the ternary preserves the existing behavior of 'before' argument, but we could choose to change the argument to 'after'
    // in a later release and standardize on ref.nextSibling for all refs
    // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
    if (ref && ref.parentNode) {
      ref.parentNode.insertBefore(tag, ref.nextSibling);
    } else {
      document.head.appendChild(tag);
    }
  });
};

/**
 * @ignore
 */
export const loadCSS = (href: string): Promise<HTMLLinkElement> =>
  new Promise(resolve => {
    const ss = document.createElement('link');
    ss.rel = 'stylesheet';
    ss.href = href;
    // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
    ss.media = 'only x';
    addElement(ss);
    // A method (exposed on return object for external use) that mimics onload by polling document.styleSheets until it includes the new sheet.
    const onLoadCssDefined = (cb: () => void) => {
      const resolvedHref = ss.href;
      const sheets = document.styleSheets;
      let i = sheets.length;

      i -= 1;
      while (i) {
        if (sheets[i].href === resolvedHref) {
          return cb();
        }
        i -= 1;
      }
      setTimeout(() => onLoadCssDefined(cb));
      return null;
    };

    const loadCB = () => {
      ss.removeEventListener('load', loadCB);
      ss.media = 'all';
      resolve(ss);
    };

    // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
    if (ss.addEventListener) {
      ss.addEventListener('load', loadCB);
    }
    // @ts-ignore
    ss.onloadcssdefined = onLoadCssDefined;
    onLoadCssDefined(loadCB);
    return ss;
  });

/**
 * Created by: Andrey Polyakov (andrey@polyakov.im)
 */
/**
 * @ignore
 */
export const getScriptLocation = (scriptSelector: string): HTMLScriptElement => {
  const currentScript = document.currentScript;

  if (currentScript && currentScript instanceof HTMLScriptElement) {
    return currentScript;
  }

  const scriptId = document.getElementById(scriptSelector);
  if (scriptId && scriptId instanceof HTMLScriptElement) {
    return scriptId;
  }
  throw new Error(`Can't find script element <script id="${scriptSelector}" src="..."></script>`);
};

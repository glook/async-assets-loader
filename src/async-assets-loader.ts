import LazyPromise from 'p-lazy';
import loadJs from 'loadjs';
import { getScriptLocation } from './helpers/get-script-location';
import { loadCSS } from './helpers/css-loader';
import 'unfetch/polyfill';
import urlJoin from 'url-join';

interface IAsyncAssetsLoaderProps {
  assetsPath?: string;
  assetsFile?: string;
  scriptSelector?: string;
  chunkAttribute?: string;
  baseChunks?: string[];
}

/**
 * @ignore
 */
type AssetContent = {
  js?: string | string[];
  css?: string | string[];
};

/**
 * @ignore
 */
type IAssetsContent = {
  [x: string]: AssetContent;
};

export default class AsyncAssetsLoader {
  protected props: IAsyncAssetsLoaderProps = {
    assetsPath: '/',
    assetsFile: 'assets.json',
    scriptSelector: 'assets-loader',
    chunkAttribute: 'data-chunks',
    baseChunks: [],
  };

  constructor(props: IAsyncAssetsLoaderProps = {}) {
    this.props = { ...this.props, ...props };
  }

  public init = async () => {
    const assetContent = await this.fetchAssetContent();
    const chunkList = this.chunkList;
    if (assetContent) {
      chunkList.forEach((chunkName) => {
        if (assetContent[chunkName]) {
          const { css = [], js = [] } = assetContent[chunkName];
          if (js) {
            this.loadJsChunkList(js);
          }
          if (css) {
            this.loadCssChunkList(css);
          }
        }
      });
    }
  };

  /**
   * @ignore
   */
  get currentScript(): HTMLScriptElement {
    const { scriptSelector = 'assetsLoader' } = this.props;
    const scriptElement = getScriptLocation(scriptSelector);
    if (scriptElement) {
      return scriptElement;
    } else {
      throw new Error("Can't find script element");
    }
  }

  /**
   * @ignore
   */
  get chunkList(): string[] {
    const { chunkAttribute = 'data-chunks', baseChunks = [], scriptSelector } = this.props;
    const chunkList = [
      ...baseChunks,
      ...(this.currentScript.getAttribute(chunkAttribute) ?? '').split(','),
    ];

    if (chunkList.length) {
      return chunkList;
    }

    throw new Error(`You need to specify list of chunks which you want to load in "${chunkAttribute}" attribute
                <script ${chunkAttribute}="..." id="${scriptSelector}" src="..."
        type="text/javascript"></script>
                `);
  }

  /**
   * @ignore
   */
  get assetsDirUrl() {
    const { currentScript } = this;
    const scriptElement = currentScript;
    const scriptElementSrc = scriptElement.getAttribute('src');
    if (scriptElementSrc) {
      const assetsPath =
        scriptElement.getAttribute('data-assets-path') ?? this.props.assetsPath ?? '/';
      const loaderFolder = scriptElementSrc.substr(0, scriptElementSrc.lastIndexOf('/'));
      return urlJoin(loaderFolder, assetsPath);
    }
    return '';
  }

  /**
   * @ignore
   */
  protected fetchAssetContent = async (): Promise<IAssetsContent | undefined> => {
    const { assetsDirUrl, currentScript } = this;

    try {
      const assetsFile =
        currentScript.getAttribute('data-assets-file') ?? this.props.assetsFile ?? 'assets.json';
      const url = urlJoin([assetsDirUrl, assetsFile]);
      const response = await window.fetch(urlJoin([assetsDirUrl, assetsFile]));
      const { status, ok } = response;
      if (ok) {
        return await response.json();
      }
      throw new Error(`There was an error while sending the request ${url}[${status.toString()}]`);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * @ignore
   */
  protected loadCssChunkList = async (chunks: string[] | string) => {
    if (typeof chunks === 'string') {
      return this.loadCssChunk(chunks);
    }
    chunks.forEach((chunk) => this.loadCssChunk(chunk));
  };

  /**
   * @ignore
   */
  protected loadCssChunk = async (chunkFile: string) => {
    const url = urlJoin([this.assetsDirUrl, chunkFile]);
    try {
      return new LazyPromise((resolve) => resolve(loadCSS(url)));
    } catch (e) {
      console.warn(e);
    }
  };

  /**
   * @ignore
   */
  protected loadJsChunkList = async (chunks: string[] | string) => {
    if (typeof chunks === 'string') {
      return this.loadJsChunk(chunks);
    }
    chunks.forEach((chunk) => this.loadJsChunk(chunk));
  };

  /**
   * @ignore
   */
  protected loadJsChunk = async (chunkFile: string) => {
    const url = urlJoin([this.assetsDirUrl, chunkFile]);
    try {
      return new LazyPromise((resolve) => loadJs(url, () => resolve(true)));
    } catch (e) {
      console.warn(e);
    }
  };
}

import AsyncAssetsLoader from '../src/async-assets-loader';
import fetchMock from 'jest-fetch-mock';
import { insertLoaderIntoDocument } from './helpers';

fetchMock.enableMocks();

const assetFixture = {
  runtime: { js: 'runtime.js' },
  vendor: { js: 'vendor.js' },
  'first-chunk': {
    css: 'foo-1.css',
    js: 'foo-1.js',
  },
  'second-chunk': {
    css: ['foo-2.css', 'bar-2.css', 'some-2.css'],
    js: ['foo-2.js', 'bar-2.js', 'some-2.js'],
  },
};

beforeEach(() => {
  fetchMock.mockIf(
    /(.*).json$/,
    (req) =>
      new Promise((resolve) => {
        resolve({
          status: 200,
          body: JSON.stringify(assetFixture),
          url: req.url,
        });
      })
  );
});

describe('AsyncAssetsLoader test', () => {
  it('AsyncAssetsLoader is instantiable', async () => {
    expect(new AsyncAssetsLoader()).toBeInstanceOf(AsyncAssetsLoader);
  });

  it('AsyncAssets init', async () => {
    insertLoaderIntoDocument({
      chunkAttribute: 'data-chunks',
      chunkList: 'vendor,second-chunk',
      scriptSelector: 'assets-loader',
      src: 'https://example.com/foo/bar/async-asset-loader.js',
      assetsPath: '/dist/foo',
      assetsFile: 'foo.json',
    });

    const instance = new AsyncAssetsLoader();
    await instance.init();
    const documentContent = [document.head.innerHTML, document.body.innerHTML].join('\n');
    console.log(documentContent);
    expect(documentContent).toContain('https://example.com/foo/bar/dist/foo');
    Object.values(assetFixture['second-chunk'])
      .reduce((accumulator, currentValue) => [...accumulator, ...currentValue], [])
      .forEach((chunkName) => {
        expect(documentContent).toContain(chunkName);
      });
  });

  it('test that assetsPath can be url', async () => {
    insertLoaderIntoDocument({
      chunkAttribute: 'data-chunks',
      chunkList: 'vendor,second-chunk',
      scriptSelector: 'assets-loader',
      src: 'https://example.com/foo/bar/async-asset-loader.js',
      assetsPath: 'https://foo.com/dist/',
      assetsFile: 'assets.json',
    });

    const instance = new AsyncAssetsLoader();
    await instance.init();
    const documentContent = [document.head.innerHTML, document.body.innerHTML].join('\n');
    console.log(documentContent);
    expect(documentContent).toContain('https://foo.com/dist/');
    Object.values(assetFixture['second-chunk'])
      .reduce((accumulator, currentValue) => [...accumulator, ...currentValue], [])
      .forEach((chunkName) => {
        expect(documentContent).toContain(chunkName);
      });
  });
});

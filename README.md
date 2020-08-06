# Async assets loader



Just a simple script which helps you with loading assets generated with 

[assets-webpack-plugi]: https://www.npmjs.com/package/assets-webpack-plugin



## How to use 

### Browser

coming soon

### NPM

```js
import AsyncAssetsLoader from '@glook/async-assets-loader';

const instance = new AsyncAssetsLoader();
await instance.init();
```

```html

<script async="" data-chunks="vendor,foo,bar" id="asset-loader" src="https://example.com/foo/bar/async-asset-loader.js" data-assets-path="/dist/foo" data-assets-file="foo.json" type="text/javascript">
</script>
```
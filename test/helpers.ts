/**
 * Created by: Andrey Polyakov (andrey@polyakov.im)
 */

export const insertLoaderIntoDocument = (props: {
  chunkAttribute: string;
  chunkList: string;
  scriptSelector: string;
  src: string;
  assetsPath: string;
  assetsFile: string;
}) => {
  const { chunkAttribute, chunkList, scriptSelector, src, assetsPath, assetsFile } = props;
  document.body.innerHTML = `
    <script async
    ${chunkAttribute}="${chunkList}"
    id="${scriptSelector}"
    src="${src}"
    data-assets-path="${assetsPath}"
    data-assets-file="${assetsFile}"
    type="text/javascript">
</script>`;
};

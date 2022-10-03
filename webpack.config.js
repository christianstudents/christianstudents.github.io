const path = require('path');
const glob = require('glob');
const cssnano = require('cssnano');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');
const { JSDOM } = require('jsdom');

const JS_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const JS_INPUT_DIR = './js';
const JS_OUTPUT_DIR = './assets/js';
const CSS_EXTENSIONS = ['.css', '.scss', '.sass'];
const CSS_INPUT_DIR = './css';
const CSS_OUTPUT_DIR = './assets/css';

const htmlFiles = glob.sync('./**/*.html');

const getStyles = () =>
  glob.sync(`${CSS_INPUT_DIR}/**/*{${CSS_EXTENSIONS.join(',')}}`);

const getScriptsAsync = () => {
  const promises = htmlFiles.map(filePath =>
    JSDOM.fromFile(filePath, {})
      .then(({ window }) =>
        new Promise((resolve, reject) => {
          const scriptPaths = Array.from(window.document.getElementsByTagName('script'))
            .filter(script => !script.hasAttribute('type') || script.getAttribute('type') === 'text/javascript')
            .filter(script => script.hasAttribute('src'))
            .map(script => script.getAttribute('src'))
            .filter(scriptPath =>
              // Block http://, https://, //, and data: URIs since we only care about local files
              !scriptPath.startsWith('http:') && !scriptPath.startsWith('https:') && !scriptPath.startsWith('//') && !scriptPath.startsWith('data:')
            )
            .map(scriptPath =>
              // If the script's path is absolute, it's from the root of the website, not the root
              // of the computer's files, so we should append a './' to the beginning of the path.
              path.isAbsolute(scriptPath)
                ? './' + path.relative(path.parse(path.resolve('.')).root, scriptPath)
                : scriptPath
            )
            .filter(scriptPath => {
              // Check if script is a file within the JS_OUTPUT directory.
              // https://stackoverflow.com/a/45242825/6212261
              const relative = path.relative(JS_OUTPUT_DIR, scriptPath);
              return relative.length > 0 && !relative.startsWith('..') && !path.isAbsolute(relative);
            })
            .map(scriptPath =>
              path.parse(path.join(JS_INPUT_DIR, path.relative(JS_OUTPUT_DIR, scriptPath)))
            )
            .flatMap(pathObject => {
              // Prevent `base` from overriding our own `ext`.
              pathObject.base = null;

              // Change other JavaScript-related extension (e.g. ".ts") to ".js"
              if (JS_EXTENSIONS.includes(pathObject.ext)) {
                pathObject.ext = '';
              }
              return JS_EXTENSIONS.map(ext => './' + path.format({
                ...pathObject,
                ext,
              }));
            });
          
          if (scriptPaths.length === 0) return resolve([]);

          glob(
            '{' + scriptPaths.join(',') + '}',
            (err, files) => {
              if (err) return reject(err);
              resolve(files);
            })
        })
      )
  );

  return Promise.all(promises).then(files => files.flat());
};

module.exports = [
  async () => ({
    mode: 'production',
    entry: (await getScriptsAsync()).reduce((acc, item) => {
      const otherPath = path.parse(path.relative('.', path.join(JS_OUTPUT_DIR, path.relative(JS_INPUT_DIR, item))));
      const key = path.format({
        dir: otherPath.dir,
        name: otherPath.name,
        ext: '',
      });
      acc[key] = item;
      return acc;
    }, {}),
    output: {
      path: __dirname,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(?:sc|sa|c)ss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: () => [
                    cssnano(), // https://cssnano.co/
                  ],
                },
              },
            },
            {
              loader: 'sass-loader',
              ident: 'sass',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: JS_EXTENSIONS,
    },
  }),
  {
    mode: 'production',
    entry: getStyles().reduce((acc, item) => {
      const otherPath = path.parse(path.relative('.', path.join(CSS_OUTPUT_DIR, path.relative(CSS_INPUT_DIR, item))));
      const key = path.format({
        dir: otherPath.dir,
        name: otherPath.name,
        ext: '',
      });
      acc[key] = item;
      return acc;
    }, {}),
    output: {
      path: __dirname,
      filename: '[name].js',
    },
    plugins: [
      new MiniCssExtractPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.(?:sc|sa|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: () => [
                    cssnano(), // https://cssnano.co/
                  ],
                },
              },
            },
            {
              loader: 'sass-loader',
              ident: 'sass',
              options: {
                sourceMap: true,
              },
            },
          ],
        }
      ],
    },
  },
];

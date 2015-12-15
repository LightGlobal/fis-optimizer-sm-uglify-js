/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var UglifyJS = require('uglify-js');

var convert = require('convert-source-map');
var sm = require('source-map');
var fis = require('fis3');

function uglify(content, file, conf) {
  conf.fromString = true;
  try{
    //browserify后的文件都必须带有sourcemap
    conf.inSourceMap = JSON.parse(convert.fromComment(getSM(content, file)).toJSON());
  }catch(e){
    conf.inSourceMap = null;
  }

  if (conf.sourceMap) {
      conf.outSourceMap = file.filename + '.org' + file.rExt;
  }

  var ret = UglifyJS.minify(content, conf);

  if (conf.sourceMap) {
      ret.code = ret.code.replace(/\/\/\# sourceMappingURL\=.*/g, '');
      var hash = file.getHash();
      var filenameWithHash = file.filename + '_' + hash;
      var smapPath = fis.project.getProjectPath('/sm/' + filenameWithHash + '.map');
      //var mapping = fis.file.wrap(mapPath);
      //mapping.useDomain = true;
      //mapping.useHash = false;
      
      // console.log(mapData)
      // //不明白下方的操作是为什么
      // //mapData.sources = [mapData.file];
      // mapData.sourcesContent = [content];

      // var newData = {
      //     version: mapData.version,
      //     file: mapData.file,
      //     sources: mapData.sources,
      //     names: mapData.names,
      //     mappings: mapData.mappings
      // };

      //mapping.setContent(JSON.stringify(newData));

      // file.extras = file.extras || {};
      // file.extras.derived = file.extras.derived || [];
      // file.extras.derived.push(mapping);
      
      fis.util.write(smapPath, ret.map, 'utf-8', false);

      // var readData = JSON.parse(fis.util.read(smapPath));
      // //console.log(readData)
      // var smc = new sm.SourceMapConsumer(readData);
      // console.log(smc.originalPositionFor({
      //   line: 1,
      //   column: 527
      // }));

      //ret.code += '\n//# sourceMappingURL=' + mapping.getUrl(fis.compile.settings.hash, fis.compile.settings.domain); + '\n';
  }

  return ret.code;
}

function getSM(content, file){
  let comment = content.match(convert.commentRegex);
  return comment[0];
}

module.exports = function(content, file, conf){
  try {
    content = uglify(content, file, conf);
  } catch (e) {
    fis.log.warn('Got Error %s while uglify %s', e.message, file.subpath);
    fis.log.debug(e.stack);
  }

  return content;
};

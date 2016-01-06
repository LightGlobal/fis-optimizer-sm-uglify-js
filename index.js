/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var UglifyJS = require('uglify-js');

var convert = require('convert-source-map');
//var sm = require('source-map');
var fis = require('fis3');

function uglify(content, file, conf) {
  conf.fromString = true;
  try{
    //prod模式下browserify后的文件都必须带有sourcemap
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
      
      fis.util.write(smapPath, ret.map, 'utf-8', false);

  }

  return ret.code;
}

function getSM(content, file){
  var comment = content.match(convert.commentRegex);
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

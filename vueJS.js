var path = require('path')
var fs = require('fs')
var Promise = require('bluebird')
var component = require('./base/component')

var tagnames = ['style', 'template', 'script']

module.exports = function(config, hostPath, mainPath){
	return new Promise(function(resolve, reject) {
		var comp = component(config, hostPath, mainPath)
		var components = comp.components
		var name = comp.name

		var len = 0
		var source = {}
		var code = []

		function done(){
			if(len) return;

			var style = JSON.stringify(source['style'].join(''))
			var template = JSON.stringify('<div class="' + name + '">' + source['template'].join('') + '</div>')

			code.push('require("loadStyle")("'+ name + '",' + style +');')
			code.push('var opts = (function(){' + source['script'] + '})();')
			code.push('opts.template = ' + template)
			code.push('var component = Vue.extend(opts)')
			code.push('Vue.component("'+ name +'", component)')
			code.push('return component')

			resolve(code.join('\n'));
		}

		for(var tagname in components){
			len++
			;(function(tagname){
				Promise.all(components[tagname]).then(function(res){
					len--
					source[tagname] = res

					done()
				})
			})(tagname)
		}

	})
} 



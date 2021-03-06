"use strict";

var xmlUtil = require("./xmlUtil");
var SubContent = require("./subContent");

function PptXFileTypeConfig() {
	return  {
		textPath: "ppt/slides/slide1.xml",
		tagsXmlArray: ["a:t", "m:t"],
		tagRawXml: "p: sp",
		getTemplatedFiles(zip) {
			var slideTemplates = zip.file(/ppt\/(slides|slideMasters)\/(slide|slideMaster)\d+\.xml/).map(function (file) { return file.name; });
			return slideTemplates.concat(["ppt/presentation.xml"]);
		},
		calcIntellegentlyDashElement(content, templaterState) {
			var outer = new SubContent(content).getOuterLoop(templaterState);
			var scopeContent = xmlUtil.getListXmlElements(content.substr(outer.start, outer.end - outer.start));
			for (var i = 0, t; i < scopeContent.length; i++) {
				t = scopeContent[i];
				if (t.tag === "<a:tc>") {
					return "a:tr";
				}
			}
			return false;
		}
	};
};

function DocXFileTypeConfig() {
	return {
		getTemplatedFiles(zip) {
			var slideTemplates = zip.file(/word\/(header|footer)\d+\.xml/).map(function (file) { return file.name; });
			return slideTemplates.concat(["word/document.xml"]);
		},
		textPath: "word/document.xml",
		tagsXmlArray: ["w:t", "m:t"],
		tagRawXml: "w:p",
		calcIntellegentlyDashElement(content, templaterState) {
			var outer = new SubContent(content).getOuterLoop(templaterState);
			var scopeContent = xmlUtil.getListXmlElements(content.substr(outer.start, outer.end - outer.start));
			for (var i = 0, t; i < scopeContent.length; i++) {
				t = scopeContent[i];
				if (t.tag === "<w:tc>") {
					return "w:tr";
				}
			}
			return false;
		}
	};
};

function mergeWithDefaults(fileType, options) {
	var defaults = defaultFor(fileType);
	options = options || {};
	Object.keys(options).forEach((key) => {
		defaults[key] = options[key];
	});
	return defaults;
}

function defaultFor(filetype){
	if(filetype == 'docx') {
		return DocXFileTypeConfig();
	} else if(filetype == 'pptx') {
		return PptXFileTypeConfig();
	} else{
		throw new TypeError('file type must be either docx or pptx');
	}
}

module.exports = {
	docx: defaultFor('docx'),
	pptx: defaultFor('pptx'),
	mergeWithDefaults: mergeWithDefaults,
};

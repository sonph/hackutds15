
var debug = function(left_editor, right_editor) {
	var doc = preprocess(left_editor);
	var output = evaluate(doc);
	var content = parse(output);
	right_editor.setValue(content);
	right_editor.selection.clearSelection();
	return;
}
/* 
 * Preprocess user code by finding variables in each line 
 * and log var values
 */
var preprocess = function(editor) {
	var doc = editor.session.getDocument();
	var new_doc = "";
	var isBlockCommet = false;
	for (var index = 0; index < doc.getLength(); index++) {
		var line = doc.getLine(index).trim();
		
		/* process line */
		var vars = [];
		var hasAssignment = false;

		// block comment
		if (isBlockCommet) {
			if (line.indexOf('*/') > -1) {
				isBlockCommet = false;
			}
			new_doc += line + '\n';
			continue;
		}
		// isBlockComment == false
		if (line.indexOf('/*') > -1) {
			if (line.indexOf('*/') == -1) {
				isBlockCommet = true;
			}
			// else: block comment ends on the same line
			new_doc += line + '\n';
			continue;
		}

		// line comment -- eliminate comment
		// e.g. "var a = b; // assignment"
		if (line.indexOf('//') > -1) {
			line = line.substring(0, line.indexOf('//'));
		}

		// assignment statement -- push variable name
		// e.g. "var a = 5;"
		// e.g. "a = b + 1;"
		// e.g. "var l = list.sort();"
		if (line.indexOf('=') > -1) {
			vars.push(line.split('=')[0].replace('var', '').trim());
			hasAssignment = true;
		}
		// contitional statement -- ignore line
		// e.g. "if (true)"
		// e.g. "} else {"
		// e.g. "switch (month) {"
		if (line.indexOf('if') > -1 || line.indexOf('else') > -1 || line.indexOf('switch') > -1) {
			new_doc += line + '\n';
			continue;
		}

		// function call without assignent -- push variable name
		// e.g. "list.sort();"
		if (line.indexOf('.') > -1 && !hasAssignment) {
			vars.push(line.split('.')[0].trim());
		}

		// function definition -- push arguments
		// e.g. "var func = function(<args>) {"
		if (line.indexOf('function') > -1) {
			var args = line.split('(')[1].split(')')[0].split(',');
			for (var i = 0; i < args.length; i++) {
				vars.push(args[i].trim());
			}
		}

		// insert log
		for (var i = 0; i < vars.length; i++) {
			if (vars[i] == undefined) {
				line += 'arr.push({line: ' + (index + 1) + ', name: "' + vars[i] + '", value: undefined});';
			} else {
				line += 'arr.push({line: ' + (index + 1) + ', name: "' + vars[i] + '", value: ' + vars[i] + '});';
			}
			// console.log(line);
		}
		new_doc += line + '\n';
	}
	return new_doc;
}

/* 
 * Evaluate preprocessed document
 * @string doc 	preprocessed document with logs
 */
var evaluate = function(doc) {
	// doc = '( \
	// 		function() { \
	// 			try { \
	// 				arr = []; ' +
	// 				doc + 
	// 				'return {arr: arr, exception: undefined}; \
	// 			} catch (e) { \
	// 				return {arr: arr, exception: e}; \
	// 			} \
	// 		} \
	// 	)();';
	// console.log('doc_to_eval = ' + doc);
	try {
		arr = [];
		eval(doc);
		return {arr: arr, exception: undefined};
	} catch(e) {
		return {arr: arr, exception: e};
	}
}

/* 
 * Parse evaluation output into a string 
 * @string doc	output document of the eval function
 */
var parse = function (output) {
	// return JSON.stringify(output, undefined, 2);
	// console.log(JSON.stringify(output, undefined, 2));

	hash = {};

	if (output.exception !== undefined) {
		return JSON.stringify(output.arr);
		output.arr.forEach(function(e, ind, arr) {
			console.log(e.name);
		});
	}

}
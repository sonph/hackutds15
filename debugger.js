
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
	var definedVar = [];
	var new_doc = "";
	var isBlockComment = false;
	for (var index = 0; index < doc.getLength(); index++) {
		var line = doc.getLine(index).trim();
		
		/* process line */
		var vars = [];
		var hasAssignment = false;

		// block comment
		if (isBlockComment) {
			if (line.indexOf('*/') > -1) {
				isBlockComment = false;
			}
			// in block comment, ignore line
			continue;
		}
		// isBlockComment == false
		if (line.indexOf('/*') > -1) {
			// going into a block comment -- ignore line
			if (line.indexOf('*/') == -1) {
				isBlockComment = true;
			}
			// else: block comment ends on the same line
			continue;
		}

		// return statement -- eval return value and push to arr
		if (line.indexOf('return') > -1) {
			var toReturn = 'var temporary_variable_that_no_one_will_name = ' + line.replace('return', '');
			var tmp = 'arr.push({line: ' + (index + 1) + ', name: "return", value: JSON.stringify(eval("temporary_variable_that_no_one_will_name"))});\nreturn temporary_variable_that_no_one_will_name';
			new_doc += (toReturn + '\n' + tmp + '\n');
			continue;
		}

		// line comment -- eliminate comment
		// e.g. "var a = b; // assignment"
		if (line.indexOf('//') > -1) {
			line = line.substring(0, line.indexOf('//')).trim();
		}
		if (line.length == 0) continue;

		// TODO : forEach

		// for loop -- ignore line
		// e.g. "for (var index = 0; index < arr.length; index ++) {"
		// e.g. "for (x in list) {"
		if (line.indexOf('for') > -1) {
			var iter = null;
			if (line.indexOf('in') > -1) {
				iter = line.substring(line.indexOf('(') + 1, line.indexOf(')')).split('in')[0].replace('var', '').trim();
			} else {
				iter = line.substring(line.indexOf('(') + 1, line.indexOf(')')).split(';')[0].split('=')[0].replace('var', '').trim();
			}

			if (iter != null && iter.length > 0) {
				line += 'arr.push({line: ' + (index +  1) + ', name: "' + iter + '", value: JSON.stringify(eval("' + iter + '"))});';
			}
			new_doc += line + '\n';
			continue;
		}

		// while loop -- ignore line
		if (line.indexOf('while') > -1 || line.indexOf('do') > -1) {
			new_doc += line + '\n';
			continue;
		}

		// function definition -- push arguments + next line
		// e.g. "var func = function(<args>) {"
		if (line.indexOf('function') > -1) {
			var args = line.split('(')[1].split(')')[0].split(',');
			for (var i = 0; i < args.length; i++) {
				vars.push(args[i].trim());
			}
			new_doc += line + '\n';
			continue;
		}

		// contitional statement -- ignore line
		// e.g. "if (true)"
		// e.g. "} else {"
		// e.g. "switch (month) {"
		if (line.indexOf('if ') > -1 || line.indexOf('else') > -1 || line.indexOf('switch') > -1) {
			new_doc += line + '\n';
			continue;
		}

		// assignment statement -- push variable name
		// e.g. "var a = 5;"
		// e.g. "a += b + 1;"
		// e.g. "var l = list.sort();"
		if (line.indexOf('=') > -1) {
			if (line.indexOf('+=') > -1 || line.indexOf('-=') > -1 || line.indexOf('*=') > -1 || line.indexOf('/=') > -1 || line.indexOf('%=') > -1) {
				vars.push(line.substring(0, line.indexOf('=') - 1).replace('var', '').trim());
				definedVar.push(line.substring(0, line.indexOf('=') - 1).replace('var', '').trim());
			} else {
				definedVar.push(line.split('=')[0].replace('var', '').trim());
				vars.push(line.split('=')[0].replace('var', '').trim());
			}
			hasAssignment = true;
		}

		// increment n. decrement -- push variable name
		// e.g. "a ++;"
		// e.g. "a --;"
		if (!hasAssignment && line.indexOf('++') > -1) {
			vars.push(line.replace('++', '').split(';')[0].trim());
		}
		if (!hasAssignment && line.indexOf('--') > -1) {
			vars.push(line.replace('--', '').split(';')[0].trim());
		}

		// function call without assignent -- push variable name
		// e.g. "list.sort();"
		if (line.indexOf('.') > -1 && !hasAssignment) {
			if (definedVar.indexOf(line.split('.')[0].trim()) > -1) {
				// user-defined variable
				vars.push(line.split('.')[0].trim());
			}
		}

		// insert log
		console.log('vars = [' + vars + ']');
		for (var i = 0; i < vars.length; i++) {
			line += '; arr.push({line: ' + (index + 1) + ', name: "' + vars[i] + '", value: JSON.stringify(eval("' + vars[i] + '"))});';
		}
		new_doc += line + '\n';
	}
	console.log(new_doc);
	return new_doc;
}

/* 
 * Evaluate preprocessed document
 * @string doc 	preprocessed document with logs
 */
var evaluate = function(doc) {
	try {
		arr = [];
		eval(doc);
		return {arr: arr, exception: null};
	} catch(e) {
		return {arr: arr, exception: e};
	}
}

/* 
 * Parse evaluation output into a string 
 * @string doc	output document of the eval function
 */
var parse = function (output) {
	// return JSON.stringify(output.arr, undefined, 2);
	// console.log(JSON.stringify(output, undefined, 2));

	hash = {};

	// if (output.exception === null) {
	// 	console.log("executed");
	// } else {
	// 	console.log("exception");
	// }

	if(output.exception != null) {
		// if exception, display exception's name only
		return output.exception.name;
	}

	output.arr.forEach(function(e, i, arr) {
		var line = e.line;
		var name = e.name;
		var value = e.value;
		if (line in hash) {
			hash[line] += (' ' + value);
		} else {
			hash[line] = name + ' = ' + value;
		}
	});


	var lines_no = R.max(R.keys(hash));
	console.log(lines_no);

	lines = [];

	for(var i = 1; i <= lines_no; i++) {
		if (i in hash) {
			lines.push(hash[i]);
		} else {
			lines.push('');
		}
	}

	return R.join('\n', lines);

	// return JSON.stringify(output, undefined, 2);
}
class NativeModal {
    static show(id, htmlContent, options = {}) {
        let modal = document.getElementById(id);
        let overlay = document.getElementById(id + "_overlay");

        if (modal && !options.force) {
            overlay.style.visibility = "visible";
            overlay.style.pointerEvents = "auto";

            modal.style.visibility = "visible";
            modal.style.pointerEvents = "auto";

            modal.getBoundingClientRect();
            window.dispatchEvent(new Event("resize"));

            return modal;
        }

        if (modal) modal.remove();
        if (overlay) overlay.remove();

        overlay = document.createElement("div");
        overlay.id = id + "_overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: ${options.zIndex ? options.zIndex - 1 : 100};
        `;

        modal = document.createElement("div");
        modal.id = id;
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${options.width || "75vw"};
            height: ${options.height || "75vh"};
            background: white;
            border-radius: 8px;
            padding: 0;
            display: flex;
            flex-direction: column;
            z-index: ${options.zIndex || 101};
            box-shadow: 0 4px 30px rgba(0,0,0,0.25);
            box-sizing: border-box;
            overflow: hidden;
        `;

        const header = document.createElement("div");
        header.style.cssText = `
            flex: 0 0 auto;
            padding: 10px 15px;
            background: #f0f0f0;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span class="native-modal-title">${options.title || ""}</span>
            <span class="native-modal-close" style="cursor:pointer;font-size:20px;">&times;</span>
        `;

        const body = document.createElement("div");
        body.style.cssText = `
            flex: 1 1 auto;
            padding: 12px;
            overflow: auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        `;
        body.innerHTML = htmlContent;

        modal.appendChild(header);
        modal.appendChild(body);
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const hide = () => {
            overlay.style.visibility = "hidden";
            overlay.style.pointerEvents = "none";

            modal.style.visibility = "hidden";
            modal.style.pointerEvents = "none";
        };

        header.querySelector(".native-modal-close").onclick = hide;
        overlay.onclick = e => {
            if (e.target === overlay) hide();
        };

        return modal;
    }

    static hide(id) {
        const modal = document.getElementById(id);
        const overlay = document.getElementById(id + "_overlay");

        if (modal) {
            modal.style.visibility = "hidden";
            modal.style.pointerEvents = "none";
        }

        if (overlay) {
            overlay.style.visibility = "hidden";
            overlay.style.pointerEvents = "none";
        }
    }

    static destroy(id) {
        const modal = document.getElementById(id);
        const overlay = document.getElementById(id + "_overlay");

        if (modal) modal.remove();
        if (overlay) overlay.remove();
    }
}



function queryEditor(nodekey) {
    this.data = data;
    this.nodekey = nodekey;
    this.tables = {};
    this.selectedRightValue = "";
    this.rightValueIsTable = false;
    this.selectedTable = null;
    this.memoryTableFullName = null;
    this.editorFieldList = null;
    this.editor = null;
	
    for (let i = 0; i < this.data.schemas.length; i++) {
        const schemaName = this.data.schemas[i].name;
        for (let j = 0; j < this.data.schemas[i].tables.length; j++) {
            const tableName = this.data.schemas[i].tables[j].dataTreePath.table;
            this.tables[tableName] = {
                schema: schemaName,
                dataTreePath: this.data.schemas[i].tables[j].dataTreePath
            };
			// console.log(this.data.schemas[i].tables[j].dataTreePath);
        }
    }
}

queryEditor.prototype = {

	insertKeywordTemplate(keywordText) {

	    const sel = this.editor.getSelection();
	    if (sel && sel.length > 0) {
	        const text = keywordText.endsWith(" ") ? keywordText : keywordText + " ";
	        this.editor.replaceSelection(text);
	        this.editor.focus();
	        return this.editor.getCursor().line;
	    }

	    const forceMultilineKeywords = ["WHERE", "GROUP BY", "ORDER BY"];

	    const inlineKeywords = ["AND", "OR"];

	    const cursor = this.editor.getCursor();
	    const lineIndex = cursor.line;
	    const lineContent = this.editor.getLine(lineIndex) || "";

	    if (forceMultilineKeywords.some(kw => keywordText.trim().startsWith(kw))) {
	        const finalKeyword = keywordText.trim() + " ";

	        let insertAtLine = lineIndex;
	        if (lineContent.trim() !== "") {
	            this.editor.replaceRange("\n", { line: lineIndex, ch: lineContent.length });
	            insertAtLine = lineIndex + 1;
	        }

	        this.editor.replaceRange(finalKeyword, { line: insertAtLine, ch: 0 });
	        this.editor.setCursor({ line: insertAtLine, ch: finalKeyword.length });
	        this.editor.focus();
	        return insertAtLine;
	    }

	    // AND / OR
	    if (inlineKeywords.includes(keywordText.trim())) {
	        const finalKeyword = "     " + keywordText.trim() + " ";
	        let targetLine = lineIndex;

	        if (lineContent.trim() !== "") {
	            this.editor.replaceRange("\n", { line: lineIndex, ch: lineContent.length });
	            targetLine = lineIndex + 1;
	        }

	        this.editor.replaceRange(finalKeyword, { line: targetLine, ch: 0 });
	        this.editor.setCursor({ line: targetLine, ch: finalKeyword.length });
	        this.editor.focus();
	        return targetLine;
	    }
		// Standard
	    return this.insertTextAtSelection(keywordText);
	},


    moveCursorToEnd: function() {
        try {
            const lines = this.editor.getValue().split("\n");
            let lastNonEmpty = -1;
            for (let i = 0; i < lines.length; i++) if (lines[i].trim() !== "") lastNonEmpty = i;
            const lastLineIndex = lines.length - 1;
            if (lastLineIndex <= lastNonEmpty) this.editor.replaceRange("\n", { line: lastLineIndex, ch: Infinity });
            const targetLine = Math.max(lastNonEmpty + 1, lastLineIndex + 1);
            this.editor.setCursor({ line: targetLine, ch: 0 });
            this.editor.focus();
        } catch (e) {}
    },

    show: function() {
        const str = `
		<script type="module" src="queryEditor.js"></script>

		<div class="main-container" style="display:flex; gap:20px; align-items:flex-start; overflow: scroll;">

		    <div class="editor-panel">
		        <div class="btn-group">
				
					<div class="dropdown">
		                <button id="keyword-btn" class="dropbtn">Verbs</button>
		                <div id="keyword-dropdown" class="dropdown-content">
		                    <a href="#" data-keyword="SELECT *">SELECT</a>
		                    <a href="#" data-keyword="SELECT  TOP 100 *">SELECT TOP</a>
		                    <a href="#" data-keyword="SELECT DISTINCT *">SELECT DISTINCT</a>
		                    <a href="#" data-keyword="FROM __selectTable__">FROM</a>
		                    <a href="#" data-keyword="JOIN __joinTable__ ON __joinTable__.__joinColumn__ = __joiningTable__.__joiningColumn__">JOIN</a>
		                    <a href="#" data-keyword="WHERE ">WHERE</a>
		                    <a href="#" data-keyword="GROUP BY ">GROUP BY</a>
		                    <a href="#" data-keyword="ORDER BY ">ORDER BY</a>
		                    <a href="#" data-keyword="AND ">AND</a>
		                    <a href="#" data-keyword="OR ">OR</a>
		                </div>
		            </div>
				
		            <div class="dropdown">
		                <button id="ope-btn" class="dropbtn">Operators</button>
		                <div id="ope-dropdown" class="dropdown-content">
		                    <a href="#" data-ope="= ">=</a>
		                    <a href="#" data-ope="!= ">!=</a>
		                    <a href="#" data-ope="> ">&gt;</a>
		                    <a href="#" data-ope="< ">&lt;</a>
		                    <a href="#" data-ope=">= ">&gt;=</a>
		                    <a href="#" data-ope="<= ">&lt;=</a>
		                    <a href="#" data-ope="LIKE ">LIKE</a>
		                    <a href="#" data-ope="NOT LIKE ">NOT LIKE</a>
		                    <a href="#" data-ope="IS NULL ">IS NULL</a>
		                    <a href="#" data-ope="IS NOT NULL ">IS NOT NULL</a>
		                    <a href="#" data-ope="BETWEEN __value__ AND ">BETWEEN</a>
		                </div>
		            </div>

		            <div class="dropdown">
		                <button id="func-btn" class="dropbtn">Functions</button>
		                <div id="func-dropdown" class="dropdown-content">
		                    <a href="#" data-func="COUNT">COUNT</a>
		                    <a href="#" data-func="SUM">SUM</a>
		                    <a href="#" data-func="AVG">AVG</a>
		                    <a href="#" data-func="MAX">MAX</a>
		                    <a href="#" data-func="MIN">MIN</a>
		                    <a href="#" data-func="POSITION">POSITION</a>
		                </div>
		            </div>

		            <button id="clear-editor-btn" class="dropbtn" style="margin-left:6px; color:white;" title="Effacer la requête">🗑️</button>
		        </div>
		        <textarea id="sql-editor" spellcheck="false" placeholder="Ecrivez vos requêtes SQL ici..."></textarea>
				<a href="javascript:void(0);" class='accept' id='submitqueryfromeditor' title='Execute the query as shown in the "plain text query" tab' style="margin-top:8px; margin-left:-4px;"></a>
		    </div>
		    
		    <div id="insert-values">

		        <div class="columns-panel">

		            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
		                <div class="dropdown" id="table-dropdown-container">
		                    <button id="table-btn" class="dropbtn">Tables</button>
		                    <div id="table-dropdown" class="dropdown-content"></div>
		                </div>

		                <div id="selected-table-name"
		                     class="table-name"
		                     style="font-size:14px;font-weight:bold;color:#444;"
		                     title="Click to replace selected text">
		                </div>
		            </div>

		            <div id="fill"></div>
		            <input type="text" style="display:none;" id="selected-text" placeholder="Selected text..." readonly />

		            <div style="display:flex; gap:10px;">

		                <div style="display:flex; flex-direction:column;">
		                    <label style="font-weight:bold;">ra :</label>
		                    <input type="text" id="ra-text" readonly style="width:100%; border:1px solid #ccc; border-radius:4px; background-color:#f9f9f9; color:#333;">
		                </div>

		                <div style="display:flex; flex-direction:column;">
		                    <label style="font-weight:bold;">dec :</label>
		                    <input type="text" id="dec-text" readonly style="width:100%; border:1px solid #ccc; border-radius:4px; background-color:#f9f9f9; color:#333;">
		                </div>

		            </div>

		            <div style="display:flex; gap:10px; align-items:flex-start;">
		                <div style="display:flex; flex-direction:column; flex:1;">
		                    <label style="font-weight:bold;">Coordinates :</label>
		                    <div style="display:flex; flex-direction:row; flex:1; ">
		                        <input type="text" id="coord-text" style="width:90%;">
		                        <a id="tapPosName_CSsesame" class="sesame-small" href="javascript:void(0);" title="Invoke the CDS name resolver"></a>
		                    </div>
		                </div>

		                <div style="display:flex; flex-direction:column; flex:1;">
		                    <label style="font-weight:bold;">Radius :</label>
		                    <input type="text" id="radius-text" style="width:100%;" placeholder="arcsec">
		                </div>
		            </div>

		        </div>

		        <div id="vocabulary-panel" style="margin-top:30px;">
		            <select id="vocabulary-select" style="margin-left: 3px;"></select>
		            <div id="vocabulary-fieldlist-container"></div>
		        </div>
		    
		    </div>

		</div>


        `;

		NativeModal.show("queryEditorModal", str, { title: "ADQL query editor for node : " + this.nodekey });
		
		this.jobs = new Array();

		        if (!this.editor) this.initTextArea();

		        this.initSQLOperators();
		        this.initSQLFunctions();
		        this.initSQLKeywords();
		        this.initTableSelector();
		        this.initSelectionWatcher();
		        this.setSesameForm();
		        this.initVocabularyPanel();
				this.initSubmit();

		        document.getElementById("clear-editor-btn").onclick = () => {
		            this.editor.setValue("");
		            document.getElementById("selected-text").value = "";
		            this.memoryTableFullName = null;
		            this.moveCursorToEnd();
        };
    },
	
	initSubmit: function() {
	    const submitbtn = document.getElementById("submitqueryfromeditor");
	    if (submitbtn) {
			submitbtn.onclick = () => {
				this.submitQueryFromEditor();
			}
	    }
	},
	
	submitQueryFromEditor: function() {
		const that = this;
		if( dataTreeView.dataTreePath == null) {
			Modalinfo.error("No data node selected: cannot process any query\nSelect the data table table you want to query in the 'Tap Nodes' panel\nand ClickClick on it");
			return;
		}
		Processing.show("Run job");
		var limit = getQLimit();
		var upload = tapPosSelector.getUploadedFile();
		var post_data = {jsessionid: sessionID
				, NODE: this.nodekey
				, TREEPATH: this.nodekey + ";" + null + ";" + null
				, REQUEST: "doQuery"
				, LANG: 'ADQL'
				, FORMAT: 'json'
				, PHASE: 'RUN'
				, MAXREC: limit
				, QUERY: this.editor.getValue() };
		if( upload ){
			 post_data.UPLOAD = upload;
		} 
		$.ajax({type: 'POST'
			, url:"runasyncjob"
			, dataType: 'json'
			, data: post_data
		, beforeSend: function(  jqXHR, settins) {
		}
		, error: function(  jqXHR,  textStatus,  errorThrown) {
			Processing.hide();
			Modalinfo.error(errorThrown);
		}
		, success: function(jsondata) {
			Processing.hide();
			if( Processing.jsonError(jsondata, "tap/async Cannot get job status") ) {
				return;
			} else {
				Processing.show("Run job " +  jsondata.status.job.jobId);
				var jobParam = {"dataTreePath" : jQuery.extend({}, dataTreeView.dataTreePath), "status": jsondata.status, "session": jsondata.session};
				jobParam.dataTreePath.jobid = jsondata.status.job.jobId;
				
				jv = new $.JobView();
				jm = new $.JobModel(jobParam);
				new $.JobControler(jm, jv);
				var queryJobs = tapView.fireGetJobs();
				queryJobs[jsondata.status.job.jobId] = jv;
				tapView.fireReplaceJobs(queryJobs);
				
				jv.fireInitForm('tapjobs', []);
				ViewState.fireSubmitted(dataTreeView.dataTreePath,jsondata.status.job.jobId  );
				jv.fireCheckJobCompleted();
			}
		}
		});
	},
	
	initVocabularyPanel: function () {
	    const that = this;
	
	    if (!this.vocabularyFieldList) {
	        this.vocabularyFieldList = new VocabularyFieldList(
	            "vocabulary-fieldlist-container",
	            "vocabulary",
	            {
					stackHandler: data => {
					    if (!data) return;

					    that.selectedRightValue = data;
					    that.rightValueIsTable = false;

					    let textToInsert;

					    if (that.rightValueIsTable) {

					        const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
					        textToInsert = schemaForTable ? `${schemaForTable}.${that.selectedTable}` : that.selectedTable;
					    } else {
					        textToInsert = "'" + that.selectedRightValue + "' ";
					    }

					    const sel = that.editor.getSelection().trim();
					    if (sel && sel.length > 0) {
					        that.editor.replaceSelection(textToInsert);
					    } else {
					        that.editor.replaceRange(textToInsert, that.editor.getCursor());
					    }

					    that.editor.focus();

					    that.selectedRightValue = "";
					    that.rightValueIsTable = false;
					},
	                orderByHandler: null,
	                raHandler: null,
	                decHandler: null
	            }
	        );
	        this.vocabularyFieldList.draw();
	    }
	
	
	    const vocabSelect = $("#vocabulary-select");
	
	    vocabSelect.empty().append(
	        `<option value="" selected disabled>Choose a vocabulary…</option>`
	    );
	
	    Object.keys(vocabulary).forEach(v => {
	        vocabSelect.append(`<option value="${v}">${v}</option>`);
	    });
	
	    vocabSelect.off("change").on("change", function () {
	        const selected = $(this).val();
	        if (!selected) return;
	
	        const dtp = {
	            schema: "",
	            quoted: false,
	            table: selected,
	            tableorg: selected,
	            nodekey: ""
	        };
	
	        that.vocabularyFieldList.setDataTreePath(dtp);
	    });
	},

	setSesameForm: function () {
	    $(document).off("click", "#tapPosName_CSsesame");
	    $(document).on("click", "#tapPosName_CSsesame", () => {

	        const inputfield = $("#coord-text");
	        const objectName = inputfield.val().trim();

	        if (!objectName) return;

	        Processing.show("Waiting on SESAME response");

	        $.getJSON("sesame", { object: objectName }, function (data) {
	            Processing.hide();

	            if (Processing.jsonError(data, "Sesame failure")) {
	                console.log("Error when translating name to coordinates");
	                return;
	            }

	            inputfield.val(data.alpha + " " + data.delta);
	        });
	    });
	},

    initTextArea: function() {
        this.editor = CodeMirror.fromTextArea(document.getElementById("sql-editor"), {
            mode: "text/x-sql",
            lineNumbers: false,
            autofocus: true,
            tabSize: 2
        });

        const wrapper = this.editor.getWrapperElement();
        wrapper.style.height = "100%";
        wrapper.style.minHeight = "420px";
        wrapper.style.maxHeight = "420px";

        const scroller = wrapper.querySelector(".CodeMirror-scroll");
        if (scroller) scroller.style.height = "100%";

        wrapper.style.cursor = "text";
        wrapper.querySelectorAll("*").forEach(el => el.style.cursor = "text");

        setTimeout(() => {
            const lines = this.editor.getValue().split("\n");
            let lastNonEmpty = 0;
            for (let i = 0; i < lines.length; i++) if (lines[i].trim() !== "") lastNonEmpty = i;
            this.editor.setCursor({ line: lastNonEmpty + 1, ch: 0 });
        }, 10);
    },
	
	formatQualifiedName: function(name) {
	    if (!name) return name;
	    return name.quotedTableName().qualifiedName;
	},


    insertTextAtCursorOrReplaceSelection(text) {
        const sel = this.editor.getSelection();
        if (sel && sel.length > 0) {
            this.editor.replaceSelection(text);
        } else {
            this.editor.replaceRange(text, this.editor.getCursor());
        }
        this.editor.focus();
    },

    insertTextAtSelection: function(text) {
        const sel = this.editor.getSelection();
        if (sel && sel.length > 0) {
            this.editor.replaceSelection(text);
            this.editor.focus();
            this.moveCursorToEnd();
            return this.editor.getCursor().line;
        }

        const cursor = this.editor.getCursor();
        const currentLine = cursor.line;
        const currentLineContent = this.editor.getLine(currentLine);

        let targetLine;
        if (currentLineContent.trim() === "") targetLine = currentLine;
        else {
            const nextLine = currentLine + 1;
            const lastLine = this.editor.lineCount() - 1;
            if (nextLine <= lastLine && this.editor.getLine(nextLine).trim() === "") {
                targetLine = nextLine;
            } else {
                this.editor.replaceRange("\n", { line: currentLine, ch: Infinity });
                targetLine = currentLine + 1;
            }
        }

        this.editor.replaceRange(text, { line: targetLine, ch: 0 });
        this.editor.focus();
        this.moveCursorToEnd();
        return targetLine;
    },

	replaceSelectedText: function() {
	    const selectedTextBox = document.getElementById("selected-text");

	    const editorSelectionRaw = this.editor.getSelection() || "";
	    const editorSelection = editorSelectionRaw.trim();

	    let selectedText = selectedTextBox.value.trim();
	    if (!selectedText && editorSelection) selectedText = editorSelection;

	    const cursor = this.editor.getCursor();
	    const currentLine = this.editor.getLine(cursor.line) || "";
	    const editorContent = this.editor.getValue().trim();

	    // GROUP BY / ORDER BY
	    const isGroupOrOrderBy = /^\s*(GROUP\s+BY|ORDER\s+BY)\b/i.test(currentLine);

	    const schemaForTable = this.selectedTable
	        ? this.tables[this.selectedTable]?.schema || ""
	        : "";
	    const tableName = this.selectedTable;
	    const columnName = this.rightValueIsTable ? null : this.selectedRightValue;

	    const parts = [];
	    if (schemaForTable) parts.push(schemaForTable);
	    if (tableName) parts.push(tableName);
	    if (columnName) parts.push(columnName);

	    let fullReplacement = parts.join(".");
	    fullReplacement = this.formatQualifiedName(fullReplacement);

	    if (columnName && isGroupOrOrderBy) {
	        fullReplacement = columnName;
	    }

	    /* ======================================================
	       Table insertion if the query is empty
	       ====================================================== */
	    if (!editorContent && this.rightValueIsTable && tableName) {
	        const qualifiedTable = this.formatQualifiedName(
	            schemaForTable ? `${schemaForTable}.${tableName}` : tableName
	        );

	        const query = [
	            "SELECT TOP 100 *",
	            `FROM ${qualifiedTable}`
	        ].join("\n");

	        this.editor.setValue(query);
	        const lastLine = this.editor.lineCount() - 1;
	        const lastCh = this.editor.getLine(lastLine).length;
	        this.editor.setCursor({ line: lastLine, ch: lastCh });
	        this.editor.focus();

	        selectedTextBox.value = "";
	        this.selectedRightValue = "";
	        this.rightValueIsTable = false;
	        return;
	    }

	    /* ======================================================
	       Column insertion if the query is empty
	       ====================================================== */
	    if (!editorContent && columnName && !editorSelection && !this.rightValueIsTable) {
	        const qualifiedTable = this.formatQualifiedName(
	            schemaForTable ? `${schemaForTable}.${tableName}` : tableName
	        );

	        const query = [
	            `SELECT TOP 100 ${fullReplacement}`,
	            `FROM ${qualifiedTable}`
	        ].join("\n");

	        this.editor.setValue(query);
	        const lastLine = this.editor.lineCount() - 1;
	        const lastCh = this.editor.getLine(lastLine).length;
	        this.editor.setCursor({ line: lastLine, ch: lastCh });
	        this.editor.focus();

	        selectedTextBox.value = "";
	        this.selectedRightValue = "";
	        this.rightValueIsTable = false;
	        return;
	    }

	    /* ======================================================
	       Replace the complete qualified name (selected text)
	       ====================================================== */
	    if (editorSelection) {
	        const from = this.editor.getCursor("from");
	        const to = this.editor.getCursor("to");
	        const line = from.line;
	        const lineText = this.editor.getLine(line);

	        let startCh = from.ch;
	        let endCh = to.ch;
	        while (startCh > 0 && /[\w".]/.test(lineText[startCh - 1])) startCh--;
	        while (endCh < lineText.length && /[\w".]/.test(lineText[endCh])) endCh++;

	        const selectedPart = this.editor.getRange(
	            { line, ch: startCh },
	            { line, ch: endCh }
	        );

			/* ======================================================
			   JOIN PLACEHOLDER LOGIC (LOCAL TO LINE)
			   ====================================================== */
			if (/JOIN\s+__joinTable__\s+ON\s+__joinTable__\.__joinColumn__/i.test(lineText) &&
			    (selectedPart.includes("__joinTable__") || selectedPart.includes("__joinColumn__"))) {

			    const qualifiedTable = this.formatQualifiedName(
			        schemaForTable ? `${schemaForTable}.${tableName}` : tableName
			    );

			    let newLine = lineText;

			    if (selectedPart.includes("__joinColumn__") && columnName) {
			        newLine = newLine.replace(/__joinColumn__/g, columnName);

			        newLine = newLine.replace(/__joinTable__/g, qualifiedTable);

			    } else if (selectedPart.includes("__joinTable__")) {
			        newLine = newLine.replace(/\b__joinTable__\b/g, qualifiedTable);
			    }

			    this.editor.replaceRange(
			        newLine,
			        { line, ch: 0 },
			        { line, ch: lineText.length }
			    );

			    this.moveCursorToEnd();
			    selectedTextBox.value = "";
			    this.selectedRightValue = "";
			    this.rightValueIsTable = false;
			    return;
			}


	        /* ======================================================
	           DEFAULT replacement (EXISTING WORKING LOGIC)
	           ====================================================== */
	        this.editor.replaceRange(
	            fullReplacement,
	            { line, ch: startCh },
	            { line, ch: endCh }
	        );

	        const content = this.editor.getValue();
	        let newContent = content;

	        const partsSplit = selectedPart.split(".");
	        const colName = partsSplit.pop().replace(/^"|"$/g, "");
	        const tableNamePart = partsSplit.length ? partsSplit.pop().replace(/^"|"$/g, "") : null;
	        const schemaNamePart = partsSplit.length ? partsSplit.pop().replace(/^"|"$/g, "") : null;

	        if (!this.rightValueIsTable) {
	            let colPattern = `(?:"${colName}"|${colName})`;
	            if (tableNamePart) colPattern = `(?:"${tableNamePart}"|${tableNamePart})\\.${colPattern}`;
	            if (schemaNamePart) colPattern = `(?:"${schemaNamePart}"|${schemaNamePart})\\.${colPattern}`;
	            const colRegex = new RegExp(colPattern, "g");
	            newContent = newContent.replace(colRegex, fullReplacement);
	        } else {
	            const tablePart = selectedPart.replace(/^"|"$/g, "");
	            const tableRegex = new RegExp(`(?:"${tablePart}"|${tablePart})(?!\\.)`, "g");
	            newContent = newContent.replace(tableRegex, fullReplacement);
	        }

	        this.editor.setValue(newContent);
	        this.moveCursorToEnd();

	        selectedTextBox.value = "";
	        this.selectedRightValue = "";
	        this.rightValueIsTable = false;
	        return;
	    }

	    /* ======================================================
	       BASIC insertion when no selection
	       ====================================================== */
	    if (!selectedText) {
	        this.editor.replaceRange(fullReplacement + " ", cursor);
	        this.editor.setCursor({
	            line: cursor.line,
	            ch: cursor.ch + fullReplacement.length + 1
	        });
	        this.editor.focus();
	        this.selectedRightValue = "";
	        this.rightValueIsTable = false;
	        return;
	    }

	    /* ======================================================
	       PLACEHOLDERS outside of JOIN
	       ====================================================== */
	    const isPlaceholderTable = selectedText === "__selectTable__" || selectedText === "__joinTable__";

	    if (isPlaceholderTable) {
	        this.editor.replaceSelection(fullReplacement);
	        const lines = this.editor.getValue().split("\n");
	        let lastNonEmpty = -1;
	        for (let i = 0; i < lines.length; i++) {
	            if (lines[i].trim() !== "") lastNonEmpty = i;
	        }
	        this.editor.setCursor({ line: lastNonEmpty + 1, ch: 0 });
	        this.moveCursorToEnd();
	        selectedTextBox.value = "";
	        this.selectedRightValue = "";
	        this.rightValueIsTable = false;
	        return;
	    }
	},


    initSQLOperators: function() {
        const opeBtn = document.getElementById("ope-btn");
        const opeDropdown = document.getElementById("ope-dropdown");
        const that = this;

        function hideAllDropdowns(){ document.querySelectorAll(".dropdown-content").forEach(d=>d.style.display="none"); }
        function toggleDropdown(dropdown){ const isOpen = dropdown.style.display==="block"; hideAllDropdowns(); dropdown.style.display=isOpen?"none":"block"; }
        document.addEventListener("click", e=>{ if(!e.target.closest(".dropdown")) hideAllDropdowns(); });

        opeBtn.addEventListener("click", e=>{
            e.preventDefault();
            toggleDropdown(opeDropdown);
        });

        opeDropdown.querySelectorAll("a").forEach(link=>{
            link.addEventListener("click", e=>{
                e.preventDefault();
                const op = e.target.getAttribute("data-ope");

                if (that.editor.getSelection().length > 0)
                    that.editor.replaceSelection(op);
                else
                    that.insertTextAtCursorOrReplaceSelection(op);

                hideAllDropdowns();
            });
        });
    },

	initSQLFunctions: function() {
	    const funcBtn = document.getElementById("func-btn");
	    const funcDropdown = document.getElementById("func-dropdown");
	    const that = this;

	    function hideAllDropdowns() {
	        document.querySelectorAll(".dropdown-content")
	            .forEach(d => d.style.display = "none");
	    }

	    function toggleDropdown(dropdown) {
	        const isOpen = dropdown.style.display === "block";
	        hideAllDropdowns();
	        dropdown.style.display = isOpen ? "none" : "block";
	    }

	    document.addEventListener("click", e => {
	        if (!e.target.closest(".dropdown")) hideAllDropdowns();
	    });

	    funcBtn.addEventListener("click", e => {
	        e.preventDefault();
	        toggleDropdown(funcDropdown);
	    });

	    funcDropdown.querySelectorAll("a").forEach(link => {
	        link.addEventListener("click", e => {
	            e.preventDefault();
	            const funcName = e.target.getAttribute("data-func");

	            // POSITION
	            if (funcName === "POSITION") {

	                const raField = document.getElementById("ra-text");
	                const decField = document.getElementById("dec-text");
	                const coordField = document.getElementById("coord-text");
	                const radiusField = document.getElementById("radius-text");

	                const raVal = raField.value.trim();
	                const decVal = decField.value.trim();
	                const coordVal = coordField.value.trim();
	                const radiusVal = radiusField.value.trim();

	                const missingFields = [];

	                if (!raVal) missingFields.push(raField);
	                if (!decVal) missingFields.push(decField);
	                if (!coordVal) missingFields.push(coordField);
	                if (!radiusVal) missingFields.push(radiusField);

	                const coordRegex = /^[+-]?\d+(\.\d+)?\s+[+-]?\d+(\.\d+)?$/;
	                if (coordVal && !coordRegex.test(coordVal)) {
	                    missingFields.push(coordField);
	                    coordField.value = "";
	                    coordField.placeholder = "Invalid format";
	                }

	                if (radiusVal && isNaN(parseFloat(radiusVal))) {
	                    missingFields.push(radiusField);
	                    radiusField.value = "";
	                    radiusField.placeholder = "Not a number";
	                }

	                if (missingFields.length > 0) {
	                    missingFields.forEach(f => f.style.color = "red");
	                    hideAllDropdowns();
	                    return;
	                }

	                const radiusValue = parseFloat(radiusVal) / 3600;

	                // Formatting columns
	                const raFormatted  = that.formatQualifiedName(raVal);
	                const decFormatted = that.formatQualifiedName(decVal);

	                const coordFormatted = coordVal.replace(" ", ", ");

	                const insertText =
	                    `CONTAINS(` +
	                    `POINT('ICRS', ${raFormatted}, ${decFormatted}), ` +
	                    `CIRCLE('ICRS', ${coordFormatted}, ${radiusValue})` +
	                    `) = 1`;

	                const sel = that.editor.getSelection();
	                if (sel && sel.length > 0) {
	                    that.editor.replaceSelection(insertText);
	                } else {
	                    that.editor.replaceRange(insertText, that.editor.getCursor());
	                }

	                that.editor.focus();
	                hideAllDropdowns();
	                return;
	            }

	            // Classic SQL functions
	            const sel = that.editor.getSelection();

	            if (sel && sel.length > 0) {
	                that.editor.replaceSelection(`${funcName}(${sel})`);
	                that.moveCursorToEnd();
	            } else {
	                const cursor = that.editor.getCursor();
	                const insertText = `${funcName}()`;

	                that.editor.replaceRange(insertText, cursor);
	                that.editor.setCursor({
	                    line: cursor.line,
	                    ch: cursor.ch + funcName.length + 1
	                });
	            }

	            that.editor.focus();
	            hideAllDropdowns();
	        });
	    });
	},



	initSQLKeywords: function() {
	    const keywordBtn = document.getElementById("keyword-btn");
	    const keywordDropdown = document.getElementById("keyword-dropdown");
	    const that = this;

	    function hideAllDropdowns(){ document.querySelectorAll(".dropdown-content").forEach(d=>d.style.display="none"); }
	    function toggleDropdown(dropdown){ const isOpen = dropdown.style.display==="block"; hideAllDropdowns(); dropdown.style.display=isOpen?"none":"block"; }
	    document.addEventListener("click", e=>{ if(!e.target.closest(".dropdown")) hideAllDropdowns(); });

	    keywordBtn.addEventListener("click", e=>{ e.preventDefault(); toggleDropdown(keywordDropdown); });

	    keywordDropdown.querySelectorAll("a").forEach(link => {
	        link.addEventListener("click", e => {
	            e.preventDefault();
	            const keyword = e.target.getAttribute("data-keyword");
	            const insert = text => that.insertKeywordTemplate(text);

	            if (keyword && keyword.startsWith("FROM ")) {
	                insert(keyword);
	                that.editor.refresh();
	                const lineCount = that.editor.lineCount();
	                for (let i = 0; i < lineCount; i++) {
	                    const lineText = that.editor.getLine(i);
	                    const startCh = lineText.indexOf("__selectTable__");
	                    if (startCh !== -1) {
	                        const endCh = startCh + "__selectTable__".length;
	                        that.editor.setSelection({ line: i, ch: startCh }, { line: i, ch: endCh });
	                        document.getElementById("selected-text").value = "__selectTable__";
	                        break;
	                    }
	                }
	                hideAllDropdowns();
	                return;
	            }

	            if (keyword && keyword.startsWith("JOIN")) {
	                const finalKeyword = that.memoryTableFullName
	                    ? keyword.replace(/__joiningTable__/g, that.memoryTableFullName)
	                    : keyword;
	                insert(finalKeyword);
	                hideAllDropdowns();
	                return;
	            }

	            if (keyword) insert(keyword);
	            hideAllDropdowns();
	        });
	    });
	},


	initTableSelector: function() {
	    const liste = Object.keys(this.tables);
	    const tableBtn = document.getElementById("table-btn");
	    const tableDropdown = document.getElementById("table-dropdown");
	    const selectedTableNameEl = document.getElementById("selected-table-name");
	    const that = this;

	    tableDropdown.innerHTML = "";

	    function hideAllDropdowns() {
	        document.querySelectorAll(".dropdown-content")
	            .forEach(d => d.style.display = "none");
	    }

	    function toggleDropdown(dropdown) {
	        const isOpen = dropdown.style.display === "block";
	        hideAllDropdowns();
	        dropdown.style.display = isOpen ? "none" : "block";
	    }

	    document.addEventListener("click", e => {
	        if (!e.target.closest(".dropdown")) hideAllDropdowns();
	    });

	    tableBtn.addEventListener("click", e => {
	        e.preventDefault();
	        toggleDropdown(tableDropdown);
	    });

	    liste.forEach(tableName => {
	        const link = document.createElement("a");
	        link.href = "#";

	        const schemaForTable = that.tables[tableName]?.schema || "";
	        const fullTableNameRaw = schemaForTable
	            ? `${schemaForTable}.${tableName}`
	            : tableName;

	        const fullTableName = that.formatQualifiedName(fullTableNameRaw);
	        link.textContent = fullTableNameRaw;

	        link.addEventListener("click", e => {
	            e.preventDefault();

	            that.selectedTable = tableName;
	            that.memoryTableFullName = fullTableName;
	            selectedTableNameEl.textContent = fullTableName;

	            const editorSelection = that.editor.getSelection().trim();

	            // ======================================================
	            // PLACEHOLDER ONLY
	            // ======================================================
	            if (
	                editorSelection === "__selectTable__" ||
	                editorSelection === "__joinTable__"
	            ) {
	                that.selectedRightValue = tableName;
	                that.rightValueIsTable = true;
	                that.replaceSelectedText();
	            }

	            // ======================================================
	            // Field list init
	            // ======================================================
	            that.editorDataTreePath = that.tables[tableName].dataTreePath;
	            that.editorDataTreePath.nodekey = that.nodekey;

	            that.editorFieldList = new BasicFieldList_mVc(
	                "fill", "fill",
	                {
	                    stackHandler: data => {
	                        if (!data) return;
	                        that.selectedRightValue = data;
	                        that.rightValueIsTable = false;
	                        that.replaceSelectedText();
	                    },
	                    raHandler: data => {
	                        if (!data) return;
	                        const fullName = [schemaForTable, tableName, data]
	                            .filter(Boolean).join(".");
	                        document.getElementById("ra-text").value = fullName;
	                    },
	                    decHandler: data => {
	                        if (!data) return;
	                        const fullName = [schemaForTable, tableName, data]
	                            .filter(Boolean).join(".");
	                        document.getElementById("dec-text").value = fullName;
	                    }
	                }
	            );

	            that.editorFieldList.draw();
	            that.editorFieldList.setDataTreePath(that.editorDataTreePath);

	            // ======================================================
	            // RA / DEC auto-detection
	            // ======================================================
	            const coords = that.editorFieldList.autoDetectRaDec();
	            if (coords.ra) {
	                document.getElementById("ra-text").value =
	                    [schemaForTable, tableName, coords.ra]
	                        .filter(Boolean).join(".");
	            }
	            if (coords.dec) {
	                document.getElementById("dec-text").value =
	                    [schemaForTable, tableName, coords.dec]
	                        .filter(Boolean).join(".");
	            }

	            hideAllDropdowns();
	            addInsertButton();
	        });

	        tableDropdown.appendChild(link);
	    });

	    // ======================================================
	    // Insert button (++)
	    // ======================================================
	    function addInsertButton() {
	        selectedTableNameEl.innerHTML = "";
	        selectedTableNameEl.textContent = that.memoryTableFullName;

	        const insertTableBtn = document.createElement("span");
	        insertTableBtn.className = "stackconstbutton column-btn";
	        insertTableBtn.textContent = "++";
	        insertTableBtn.title = "Insert table";
	        insertTableBtn.style.cursor = "pointer";
	        insertTableBtn.style.marginLeft = "6px";

	        insertTableBtn.onclick = () => {
	            if (!that.selectedTable) return;

	            that.selectedRightValue = that.selectedTable;
	            that.rightValueIsTable = true;
	            that.replaceSelectedText();
	            that.editor.focus();
	        };

	        selectedTableNameEl.appendChild(insertTableBtn);
	    }
	},




	initSelectionWatcher: function() {
	    const that = this;
	    const box = document.getElementById("selected-text");
	    const selectedTableNameEl = document.getElementById("selected-table-name");

	    let currentMarker = null;

		function detectType(selectedText, editor) {
		    const from = editor.getCursor("from");
		    const to = editor.getCursor("to");
		    const line = editor.getLine(from.line);
		    if (!line) return "unknown";

		    function normalizeIdentifier(id) {
		        return id ? id.replace(/^"(.*)"$/, "$1") : id;
		    }

		    let contextStart = from.ch;
		    let contextEnd = to.ch;

		    while (contextStart > 0 && !/\s/.test(line[contextStart - 1])) contextStart--;
		    while (contextEnd < line.length && !/\s/.test(line[contextEnd])) contextEnd++;

		    const contextText = line.slice(contextStart, contextEnd);
		    if (!contextText) return "unknown";

		    const parts = [];
		    let current = "";
		    let inQuotes = false;
		    let partStart = 0;

		    for (let i = 0; i < contextText.length; i++) {
		        const c = contextText[i];

		        if (c === '"') {
		            inQuotes = !inQuotes;
		            current += c;
		            continue;
		        }

		        if (c === "." && !inQuotes) {
		            parts.push({
		                raw: current,
		                start: partStart,
		                end: i
		            });
		            current = "";
		            partStart = i + 1;
		        } else {
		            current += c;
		        }
		    }

		    parts.push({
		        raw: current,
		        start: partStart,
		        end: contextText.length
		    });

		    const cursorOffset = from.ch - contextStart;

		    const selectedPartIndex = parts.findIndex(
		        p => cursorOffset >= p.start && cursorOffset <= p.end
		    );

		    if (selectedPartIndex === -1) return "unknown";

		    const elements = parts.map(p => normalizeIdentifier(p.raw));

		    if (elements.length === 3) {
		        if (selectedPartIndex === 0) return "schema";
		        if (selectedPartIndex === 1) return "table";
		        if (selectedPartIndex === 2) return "column";
		        return "unknown";
		    }

		    if (elements.length === 2) {
		        const left = elements[0];

		        if (selectedPartIndex === 0) {
		            if (Object.values(that.tables).some(t => t.schema === left)) return "schema";
		            if (that.tables[left]) return "table";
		        }

		        if (selectedPartIndex === 1) {
		            if (Object.values(that.tables).some(t => t.schema === left)) return "table";
		            if (that.tables[left]) return "column";
		        }
		    }

		    if (elements.length === 1) {
		        const single = elements[0];

		        if (Object.values(that.tables).some(t => t.schema === single)) return "schema";
		        if (that.tables[single]) return "table";

		        for (const tableName in that.tables) {
		            if (that.tables[tableName].columns?.includes(single)) {
		                return "column";
		            }
		        }
		    }

		    return "unknown";
		}


	    this.editor.on("cursorActivity", () => {
	        const selectedText = that.editor.getSelection().trim();
	        box.value = selectedText;

	        if (currentMarker) { currentMarker.clear(); currentMarker = null; }
	        if (!selectedText) return;

	        const cursor = that.editor.getCursor();
	        const type = detectType(selectedText, that.editor, cursor);

	        const from = that.editor.getCursor("from");
	        const to = that.editor.getCursor("to");
	        currentMarker = that.editor.markText(from, to, { title: `${type} detected` });

	        if (type === "table") {
	            const parts = selectedText.split(".");
	            const maybeTable = parts[parts.length - 1];
	            if (!that.tables[maybeTable] || maybeTable === that.selectedTable) return;

	            that.selectedTable = maybeTable;
	            const schemaForTable = that.tables[maybeTable].schema;
	            const fullTableName = that.formatQualifiedName(`${schemaForTable}.${maybeTable}`);

	            function addInsertButton() {
	                selectedTableNameEl.innerHTML = "";
	                selectedTableNameEl.textContent = fullTableName;

	                const insertTableBtn = document.createElement("span");
	                insertTableBtn.className = "stackconstbutton column-btn";
	                insertTableBtn.textContent = "++";
	                insertTableBtn.title = "Insert table at cursor / replace selection";
	                insertTableBtn.style.cursor = "pointer";
	                insertTableBtn.style.marginLeft = "6px";
	                insertTableBtn.onclick = () => {
						console.log(fullTableName);
	                    const sel = that.editor.getSelection().trim();
	                    if (sel && sel.length > 0) that.editor.replaceSelection(fullTableName);
	                    else that.editor.replaceRange(fullTableName, that.editor.getCursor());
	                    that.memoryTableFullName = fullTableName;
	                    that.editor.focus();
	                };
	                selectedTableNameEl.appendChild(insertTableBtn);
	            }

	            addInsertButton();

	            that.editorDataTreePath = that.tables[maybeTable].dataTreePath;
	            that.editorDataTreePath["nodekey"] = that.nodekey;

	            that.editorFieldList = new BasicFieldList_mVc(
	                "fill", "fill",
	                {
	                    stackHandler: data => {
	                        if (!data) return;
	                        that.selectedRightValue = data;
	                        that.rightValueIsTable = false;
	                        that.replaceSelectedText();
	                    },
	                    raHandler: data => {
	                        if (!data) return;
	                        const fullName = [schemaForTable, maybeTable, data].filter(Boolean).join(".");
	                        document.getElementById("ra-text").value = fullName;
	                    },
	                    decHandler: data => {
	                        if (!data) return;
	                        const fullName = [schemaForTable, maybeTable, data].filter(Boolean).join(".");
	                        document.getElementById("dec-text").value = fullName;
	                    }
	                }
	            );

	            that.editorFieldList.draw();
	            that.editorFieldList.setDataTreePath(that.editorDataTreePath);

	            // Detecting ra and dec
	            const coords = that.editorFieldList.autoDetectRaDec();
	            if (coords.ra) document.getElementById("ra-text").value = [schemaForTable, maybeTable, coords.ra].filter(Boolean).join(".");
	            if (coords.dec) document.getElementById("dec-text").value = [schemaForTable, maybeTable, coords.dec].filter(Boolean).join(".");
	        }
	    });
	}



};
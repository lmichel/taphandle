class NativeModal {
    static show(id, htmlContent, options = {}) {
        let modal = document.getElementById(id);
        let overlay = document.getElementById(id + "_overlay");

        // =========================
        // MODALE DÉJÀ EXISTANTE
        // =========================
        if (modal && !options.force) {
            overlay.style.visibility = "visible";
            overlay.style.pointerEvents = "auto";

            modal.style.visibility = "visible";
            modal.style.pointerEvents = "auto";

            // 🔑 Forcer recalcul layout
            modal.getBoundingClientRect();
            window.dispatchEvent(new Event("resize"));

            return modal;
        }

        // =========================
        // SUPPRESSION SI FORCE
        // =========================
        if (modal) modal.remove();
        if (overlay) overlay.remove();

        // =========================
        // OVERLAY
        // =========================
        overlay = document.createElement("div");
        overlay.id = id + "_overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: ${options.zIndex ? options.zIndex - 1 : 20000};
        `;

        // =========================
        // MODALE (TAILLE ORIGINALE)
        // =========================
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
            z-index: ${options.zIndex || 20001};
            box-shadow: 0 4px 30px rgba(0,0,0,0.25);
            box-sizing: border-box;
            overflow: hidden;
        `;

        // =========================
        // HEADER
        // =========================
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

        // =========================
        // BODY
        // =========================
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

        // =========================
        // FERMETURE = CACHER
        // =========================
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
	
	var chaine = "public.tableTest";
	console.log(chaine.quotedTableName().qualifiedName);
	

    for (let i = 0; i < this.data.schemas.length; i++) {
        const schemaName = this.data.schemas[i].name;
        for (let j = 0; j < this.data.schemas[i].tables.length; j++) {
            const tableName = this.data.schemas[i].tables[j].dataTreePath.table;
            this.tables[tableName] = {
                schema: schemaName,
                dataTreePath: this.data.schemas[i].tables[j].dataTreePath
            };
        }
    }
}

queryEditor.prototype = {

	insertKeywordTemplate(keywordText) {

	    // ✅ PRIORITÉ ABSOLUE : remplacer la sélection si elle existe
	    const sel = this.editor.getSelection();
	    if (sel && sel.length > 0) {
	        const text = keywordText.endsWith(" ") ? keywordText : keywordText + " ";
	        this.editor.replaceSelection(text);
	        this.editor.focus();
	        return this.editor.getCursor().line;
	    }

	    // --- Mots-clés à forcer sur une ligne avec curseur juste après ---
	    const forceMultilineKeywords = ["WHERE", "GROUP BY", "ORDER BY", "SELECT DISTINCT"];

	    // --- Mots-clés inline normaux ---
	    const inlineKeywords = ["AND", "OR"];

	    const cursor = this.editor.getCursor();
	    const lineIndex = cursor.line;
	    const lineContent = this.editor.getLine(lineIndex) || "";

	    // --- Cas WHERE / GROUP BY / ORDER BY / SELECT DISTINCT ---
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

	    // --- Cas AND / OR avec indentation ---
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

	    // --- Cas standard ---
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
		                <button id="ope-btn" class="dropbtn">SQL Operators</button>
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
		                <button id="func-btn" class="dropbtn">SQL Functions</button>
		                <div id="func-dropdown" class="dropdown-content">
		                    <a href="#" data-func="COUNT">COUNT</a>
		                    <a href="#" data-func="SUM">SUM</a>
		                    <a href="#" data-func="AVG">AVG</a>
		                    <a href="#" data-func="MAX">MAX</a>
		                    <a href="#" data-func="MIN">MIN</a>
		                    <a href="#" data-func="POSITION">POSITION</a>
		                </div>
		            </div>

		            <div class="dropdown">
		                <button id="keyword-btn" class="dropbtn">SQL Keywords</button>
		                <div id="keyword-dropdown" class="dropdown-content">
		                    <a href="#" data-keyword="SELECT *">SELECT</a>
		                    <a href="#" data-keyword="SELECT  TOP 100  *">SELECT TOP</a>
		                    <a href="#" data-keyword="SELECT DISTINCT">SELECT DISTINCT</a>
		                    <a href="#" data-keyword="FROM __selectTable__">FROM</a>
		                    <a href="#" data-keyword="JOIN __joinTable__ ON __joinTable__.__joinColumn__ = __joiningTable__.__joiningColumn__">JOIN</a>
		                    <a href="#" data-keyword="WHERE ">WHERE</a>
		                    <a href="#" data-keyword="GROUP BY ">GROUP BY</a>
		                    <a href="#" data-keyword="ORDER BY ">ORDER BY</a>
		                    <a href="#" data-keyword="AND ">AND</a>
		                    <a href="#" data-keyword="OR ">OR</a>
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

		NativeModal.show("queryEditorModal", str, { title: this.nodekey });
		
		this.jobs = new Array();

		        // --- Initialisation CodeMirror seulement si pas déjà fait ---
		        if (!this.editor) this.initTextArea();

		        // Initialisations restantes (drop-downs, boutons, etc.)
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
				console.log(this.editor.getValue());
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
	
	    // --- Créer la zone fieldlist si ce n’est pas encore fait ---
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
					        // si c'est une table → ajouter schema.table
					        const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
					        textToInsert = schemaForTable ? `${schemaForTable}.${that.selectedTable}` : that.selectedTable;
					    } else {
					        // si c'est une colonne ou lien → juste le nom
					        textToInsert = "'" + that.selectedRightValue + "' ";
					    }

					    const sel = that.editor.getSelection().trim();
					    if (sel && sel.length > 0) {
					        that.editor.replaceSelection(textToInsert);
					    } else {
					        that.editor.replaceRange(textToInsert, that.editor.getCursor());
					    }

					    that.editor.focus();

					    // Reset flags
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
	
	
	    // --- Préparer le dropdown ---
	    const vocabSelect = $("#vocabulary-select");
	
	    // Ajouter le placeholder uniquement au démarrage
	    vocabSelect.empty().append(
	        `<option value="" selected disabled>Choose a vocabulary…</option>`
	    );
	
	    // Remplir le dropdown avec les vocabulaires
	    Object.keys(vocabulary).forEach(v => {
	        vocabSelect.append(`<option value="${v}">${v}</option>`);
	    });
	
	    // --- Réagir au choix d’un vocabulary ---
	    vocabSelect.off("change").on("change", function () {
	        const selected = $(this).val();
	        if (!selected) return;
	
	        // Construire le dataTreePath attendu par VocabularyFieldList
	        const dtp = {
	            schema: "",
	            quoted: false,
	            table: selected,
	            tableorg: selected,
	            nodekey: ""
	        };
	
	        // Charger dans VocabularyFieldList
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
	
	formatQualifiedName: function(fullName) {
	    // fullName = schema.table OR schema.table.column
	    if (!fullName) return fullName;

	    const parts = fullName.split(".");
	    if (parts.length < 2) return fullName;

	    if (parts[0] === "public") {
	        parts[0] = `"public"`;
	    }

	    return parts.join(".");
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

	    /* ======================================================
	       ✅ CAS PRIORITAIRE : une vraie sélection dans l’éditeur
	       ====================================================== */
	    if (editorSelection && !this.rightValueIsTable) {
	        this.editor.replaceSelection(fullReplacement);
	        this.editor.focus();

	        selectedTextBox.value = "";
	        this.selectedRightValue = "";
	        this.rightValueIsTable = false;
	        return;
	    }

	    /* ======================================================
	       CAS 1 : insertion simple (pas de sélection)
	       ====================================================== */
	    if (!selectedText) {
	        const cursor = this.editor.getCursor();
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

	    const isPlaceholderTable =
	        selectedText === "__selectTable__" ||
	        selectedText === "__joinTable__";

	    /* ======================================================
	       CAS PLACEHOLDER (__selectTable__ / __joinTable__)
	       ====================================================== */
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

	    /* ======================================================
	       CAS 2 : remplacement global (ancien comportement)
	       ====================================================== */
	    const content = this.editor.getValue();
	    let newContent = content;

	    function escapeRegex(s) {
	        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	    }

	    const escapedSelection = escapeRegex(selectedText);

	    const regexQualified = new RegExp(
	        `(?:\\b\\w+\\.)?(?:\\b\\w+\\.)${escapedSelection}\\b`,
	        "g"
	    );
	    newContent = newContent.replace(regexQualified, fullReplacement);

	    function replaceUnqualified(content, target, replacement) {
	        const esc = escapeRegex(target);
	        const re = new RegExp(`(^|[^\\.\\w])(${esc})(?=\\b)`, "g");
	        return content.replace(re, (m, p1) => `${p1}${replacement}`);
	    }

	    newContent = replaceUnqualified(
	        newContent,
	        selectedText,
	        fullReplacement
	    );

	    let oldTable = null;
	    const maybeTable = selectedText.split(".")[0];

	    if (
	        this.tables[maybeTable] ||
	        maybeTable === "__selectTable__" ||
	        maybeTable === "__joinTable__"
	    ) {
	        oldTable = maybeTable;
	    }

	    if (oldTable) {
	        const oldTableEsc = escapeRegex(oldTable);
	        const reTableOnly = new RegExp(`\\b${oldTableEsc}\\b`, "g");

	        let tableReplacement = schemaForTable
	            ? `${schemaForTable}.${tableName}`
	            : tableName;

	        tableReplacement = this.formatQualifiedName(tableReplacement);

	        newContent = newContent.replace(reTableOnly, tableReplacement);
	    }

	    this.editor.setValue(newContent);
	    this.moveCursorToEnd();

	    selectedTextBox.value = "";
	    this.selectedRightValue = "";
	    this.rightValueIsTable = false;
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

	            /* =====================================================
	               CAS SPÉCIAL : POSITION
	            ===================================================== */
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

	                // 🔑 FORMATAGE CORRECT DES COLONNES
	                const raFormatted  = that.formatQualifiedName(raVal);
	                const decFormatted = that.formatQualifiedName(decVal);

	                // coord = valeurs numériques → pas de formatage SQL
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

	            /* =====================================================
	               FONCTIONS SQL CLASSIQUES
	            ===================================================== */
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
	    const that = this; // ajout

	    function hideAllDropdowns(){ document.querySelectorAll(".dropdown-content").forEach(d=>d.style.display="none"); }
	    function toggleDropdown(dropdown){ const isOpen = dropdown.style.display==="block"; hideAllDropdowns(); dropdown.style.display=isOpen?"none":"block"; }
	    document.addEventListener("click", e=>{ if(!e.target.closest(".dropdown")) hideAllDropdowns(); });

	    keywordBtn.addEventListener("click", e=>{ e.preventDefault(); toggleDropdown(keywordDropdown); });

	    keywordDropdown.querySelectorAll("a").forEach(link => {
	        link.addEventListener("click", e => {
	            e.preventDefault();
	            const keyword = e.target.getAttribute("data-keyword");
	            const insert = text => that.insertKeywordTemplate(text); // utilise that

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

	    function hideAllDropdowns(){ document.querySelectorAll(".dropdown-content").forEach(d => d.style.display = "none"); }
	    function toggleDropdown(dropdown){ const isOpen = dropdown.style.display === "block"; hideAllDropdowns(); dropdown.style.display=isOpen?"none":"block"; }
	    document.addEventListener("click", e => { if (!e.target.closest(".dropdown")) hideAllDropdowns(); });
	    tableBtn.addEventListener("click", e => { e.preventDefault(); toggleDropdown(tableDropdown); });

	    liste.forEach(tableName => {
	        const link = document.createElement("a");
	        link.href = "#";
	        const schemaForTable = that.tables[tableName]?.schema || "";
	        const fullTableNameRaw = schemaForTable ? `${schemaForTable}.${tableName}` : tableName;
	        const fullTableName = that.formatQualifiedName(fullTableNameRaw);

	        link.textContent = fullTableNameRaw;

	        link.addEventListener("click", e => {
	            e.preventDefault();

	            const selectedText = document.getElementById("selected-text").value.trim();

				// --- CASE A: placeholder FROM / JOIN ---
				if (selectedText === "__selectTable__" || selectedText === "__joinTable__") {
				    that.selectedTable = tableName;
				    that.rightValueIsTable = true;

				    // Formater le nom complet de la table avec quotes si nécessaire
				    const formattedFullTableName = that.formatQualifiedName(fullTableNameRaw);
				    that.selectedRightValue = formattedFullTableName;

				    // Remplacer le placeholder par le nom formaté
				    const sel = that.editor.getSelection().trim();
				    if (sel && sel.length > 0) {
				        that.editor.replaceSelection(formattedFullTableName);
				    } else {
				        that.editor.replaceRange(formattedFullTableName, that.editor.getCursor());
				    }

				    that.memoryTableFullName = formattedFullTableName;
				    selectedTableNameEl.textContent = formattedFullTableName;

				    that.editorDataTreePath = that.tables[tableName].dataTreePath;
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
				                const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
				                const columnName = data;
				                const fullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
				                document.getElementById("ra-text").value = fullName;
				            },
				            decHandler: data => {
				                if (!data) return;
				                const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
				                const columnName = data;
				                const fullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
				                document.getElementById("dec-text").value = fullName;
				            }
				        }
				    );
				    that.editorFieldList.draw();
				    that.editorFieldList.setDataTreePath(that.editorDataTreePath);

				    hideAllDropdowns();
				    addInsertButton();
				    return;
				}


	            // --- CASE B: table sélectionnée manuellement ---
	            if (selectedText) {
	                const parts = selectedText.split(".");
	                const maybeTable = parts[parts.length - 1];
	                if (that.tables[maybeTable]) {
	                    const selFrom = that.editor.getCursor("from");
	                    const selTo = that.editor.getCursor("to");
	                    const line = selFrom.line;
	                    const lineContent = that.editor.getLine(line);

	                    let replaceFrom = { line: line, ch: selFrom.ch };
	                    let replaceTo   = { line: line, ch: selTo.ch };

	                    if (!selectedText.includes(".") && selFrom.ch > 0 && lineContent[selFrom.ch - 1] === ".") {
	                        let p = selFrom.ch - 2;
	                        while (p >= 0 && /\w/.test(lineContent[p])) p--;
	                        replaceFrom.ch = p + 1;
	                    }

	                    that.editor.replaceRange(fullTableName, replaceFrom, replaceTo);
	                    that.selectedTable = tableName;
	                    selectedTableNameEl.textContent = fullTableName;

	                    that.editorDataTreePath = that.tables[tableName].dataTreePath;
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
	                                const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
	                                const columnName = data;
	                                const fullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
	                                document.getElementById("ra-text").value = fullName;
	                            },
	                            decHandler: data => {
	                                if (!data) return;
	                                const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
	                                const columnName = data;
	                                const fullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
	                                document.getElementById("dec-text").value = fullName;
	                            }
	                        }
	                    );
	                    that.editorFieldList.draw();
	                    that.editorFieldList.setDataTreePath(that.editorDataTreePath);

	                    hideAllDropdowns();
	                    addInsertButton();
	                    return;
	                }
	            }

	            // --- DEFAULT: afficher la table à droite ---
	            that.selectedTable = tableName;
	            selectedTableNameEl.textContent = fullTableName;

	            that.editorDataTreePath = that.tables[tableName].dataTreePath;
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
	                        const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
	                        const columnName = data;
	                        const fullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
	                        document.getElementById("ra-text").value = fullName;
	                    },
	                    decHandler: data => {
	                        if (!data) return;
	                        const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
	                        const columnName = data;
	                        const fullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
	                        document.getElementById("dec-text").value = fullName;
	                    }
	                }
	            );
	            that.editorFieldList.draw();
	            that.editorFieldList.setDataTreePath(that.editorDataTreePath);

	            hideAllDropdowns();
	            addInsertButton();

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
	                    const sel = that.editor.getSelection().trim();
	                    if (sel && sel.length > 0) that.editor.replaceSelection(fullTableName);
	                    else that.editor.replaceRange(fullTableName, that.editor.getCursor());

	                    that.memoryTableFullName = fullTableName;
	                    that.editor.focus();
	                };
	                selectedTableNameEl.appendChild(insertTableBtn);
	            }
	        });

	        tableDropdown.appendChild(link);
	    });
	},





	initSelectionWatcher: function() {
	    const that = this;
	    const box = document.getElementById("selected-text");
	    const selectedTableNameEl = document.getElementById("selected-table-name");

	    let currentMarker = null;

		function detectType(selectedText, editor, cursor) {
		    const line = editor.getLine(cursor.line);
		    if (!line) return "unknown";

		    function normalizeIdentifier(id) {
		        if (!id) return id;
		        return id.replace(/^"(.*)"$/, "$1");
		    }

		    // --- 1. Extraire le contexte autour de la sélection ---
		    const startCh = cursor.ch - selectedText.length;
		    const endCh = cursor.ch;

		    let contextStart = startCh;
		    while (contextStart > 0 && !/\s/.test(line[contextStart - 1])) {
		        contextStart--;
		    }

		    let contextEnd = endCh;
		    while (contextEnd < line.length && !/\s/.test(line[contextEnd])) {
		        contextEnd++;
		    }

		    const contextText = line.slice(contextStart, contextEnd).trim();
		    const rawElements = contextText.split(".").filter(e => e.length > 0);

		    if (rawElements.length === 0) return "unknown";

		    // --- 2. Normalisation (suppression des quotes pour la logique) ---
		    const elements = rawElements.map(normalizeIdentifier);
		    const normalizedSelected = normalizeIdentifier(selectedText);

		    const selectedIndex = elements.findIndex(el => el === normalizedSelected);
		    if (selectedIndex === -1) return "unknown";

		    // --- 3. Déduction du type ---
		    if (elements.length === 3) {
		        // schema.table.column
		        if (selectedIndex === 0) return "schema";
		        if (selectedIndex === 1) return "table";
		        if (selectedIndex === 2) return "column";
		    }

		    if (elements.length === 2) {
		        const left = elements[0];
		        const right = elements[1];

		        if (selectedIndex === 0) {
		            if (Object.values(that.tables).some(t => t.schema === left)) return "schema";
		            if (that.tables[left]) return "table";
		            return "unknown";
		        }

		        if (selectedIndex === 1) {
		            if (Object.values(that.tables).some(t => t.schema === left)) return "table";
		            if (that.tables[left]) return "column";
		            return "unknown";
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

		        return "unknown";
		    }

		    return "unknown";
		}


	    this.editor.on("cursorActivity", () => {
	        const selectedText = that.editor.getSelection().trim();
	        box.value = selectedText;

	        if (currentMarker) {
	            currentMarker.clear();
	            currentMarker = null;
	        }

	        if (!selectedText) return;

	        const cursor = that.editor.getCursor();
	        const type = detectType(selectedText, that.editor, cursor);

	        const from = that.editor.getCursor("from");
	        const to = that.editor.getCursor("to");
	        currentMarker = that.editor.markText(from, to, {
	            title: `Type détecté : ${type}`
	        });

	        if (type === "table") {
	            let tableCandidate = null;
	            const parts = selectedText.split(".");
	            const maybeTable = parts[parts.length - 1];
	            if (that.tables[maybeTable]) tableCandidate = maybeTable;

	            if (!tableCandidate || tableCandidate === that.selectedTable) return;

	            that.selectedTable = tableCandidate;
	            const schemaForTable = that.tables[tableCandidate].schema;
	            const rawFullTableName = `${schemaForTable}.${tableCandidate}`;
	            const fullTableName = that.formatQualifiedName(rawFullTableName);

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
	                    const sel = that.editor.getSelection().trim();
	                    if (sel && sel.length > 0) that.editor.replaceSelection(fullTableName);
	                    else that.editor.replaceRange(fullTableName, that.editor.getCursor());

	                    that.memoryTableFullName = fullTableName;
	                    that.editor.focus();
	                };
	                selectedTableNameEl.appendChild(insertTableBtn);
	            }

	            addInsertButton();

	            that.editorDataTreePath = that.tables[tableCandidate].dataTreePath;
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
	                        const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
	                        const tableName = that.selectedTable;
	                        const columnName = data;

	                        const rawFullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
	                        const fullName = that.formatQualifiedName(rawFullName);
	                        document.getElementById("ra-text").value = fullName;
	                    },
	                    decHandler: data => {
	                        if (!data) return;
	                        const schemaForTable = that.selectedTable ? that.tables[that.selectedTable]?.schema || "" : "";
	                        const tableName = that.selectedTable;
	                        const columnName = data;

	                        const rawFullName = [schemaForTable, tableName, columnName].filter(Boolean).join(".");
	                        const fullName = that.formatQualifiedName(rawFullName);
	                        document.getElementById("dec-text").value = fullName;
	                    }
	                }
	            );

	            that.editorFieldList.draw();
	            that.editorFieldList.setDataTreePath(that.editorDataTreePath);
	        }
	    });
	}


};
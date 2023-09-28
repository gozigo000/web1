require.config({ paths: { vs: './out-editor-min/vs' } });
require(['vs/editor/editor.main'], start);


// ToDo: 단어 단위 매칭 & 문장 단위 제안 & 단어 단위 삽입
// ToDo: 폰트 사이즈도 가변적으로 하면 좋을 듯
// ToDo: 한글 타이핑할 때 줄 전체 스타일이 가려지는 문제점 없애기


const myLangSyntax = {

   // 내가 토큰으로 안 만든 게 있는지 확인하기 위해 defaultToken: 'invalid'로 설정
   defaultToken: 'invalid',

   // 여기서 키 이름은 아무거나 가능함
   keywords: [
      'for', 'while', 'if', 'else', 'interface', 'class', 'const', 'true', 'false'
   ],
   typeKeywords: [
      'boolean', 'double', 'byte', 'int', 'short', 'char', 'void', 'long', 'float'
   ],
   operators: [
      '=', '!', '~', '?', '>', '<', ':', '==', '<=', '>=', '!=',
      '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%'
   ],


   // we include these common regular expressions
   symbols: /[=><!~?:&|+\-*\/\^%]+/,

   // C# style strings
   escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

   // The main tokenizer for our languages
   tokenizer: {
      root: [
         [/([A-Z])(\d+)/, ['banaco-midscript','banaco-subscript']],
         [/(청구항)( \d+)/, ['banaco-claim-string','banaco-claim-number']],
         [/(제)(\d)(항에 있어서,)/, ['banaco-claim-string2','banaco-claim-number','banaco-claim-string2']],
         // [/\s{2,}/, "banaco-doublespace"],
         
         [/\[error\].*/, "custom-error"],
         [/\[notice\].*/, "custom-notice"],
         [/\[info\].*/, "custom-info"],
         [/\[[a-zA-Z 0-9:]+\]/, "custom-date"],

         // identifiers and keywords
         [/[a-z_가-힣][\w가-힣]*/, {
            cases: {
               '@keywords': 'keyword',
               '@typeKeywords': 'keyword',
               '@default': 'identifier',
            }
         }],
         [/[A-Z][\w\$]*/, 'type.identifier'],  // to show class names nicely

         // whitespace
         { include: '@whitespace' },

         // delimiters and operators
         [/[{}()\[\]]/, '@brackets'],
         [/[<>](?!@symbols)/, '@brackets'],
         [/@symbols/, {
            cases: {
               '@operators': 'operator',
               '@default': ''
            }
         }],

         // @ annotations.
         // As an example, we emit a debugging log message on these tokens.
         // Note: message are supressed during the first load -- change some lines to see them.
         [/@\s*[a-zA-Z_\$][\w\$]*/, { token: 'annotation', log: 'annotation token: $0' }],

         // 숫자s
         [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
         [/0[xX][0-9a-fA-F]+/, 'number.hex'],
         [/\d+/, 'number'],

         // 구분자: after number because of .\d floats
         [/[;,.]/, 'delimiter'],

         // 문자열s
         [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
         [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

         // characters
         [/'[^\\']'/, 'string'],
         [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
         [/'/, 'string.invalid']
      ],

      comment: [
         [/[^\/*]+/, 'comment'],
         [/\/\*/, 'comment', '@push'],    // nested comment
         ["\\*/", 'comment', '@pop'],
         [/[\/*]/, 'comment']
      ],

      string: [
         [/[^\\"]+/, 'string'],
         [/@escapes/, 'string.escape'],
         [/\\./, 'string.escape.invalid'],
         [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      whitespace: [
         [/[ \t\r\n]+/, 'white'],
         [/\/\*/, 'comment', '@comment'],
         [/\/\/.*$/, 'comment'],
      ],
   },
};


const myThemeColors = {
   base: "vs",
   inherit: true,
   rules: [
      { token: "banaco-midscript", foreground: "FFA500", fontStyle: "bold" }, // 
      { token: "banaco-subscript", foreground: "ff0000", fontStyle: "subscript" }, // 아래 첨자
      { token: "banaco-claim-string", foreground: "aa3333", fontStyle: "bold underline" }, // 
      { token: "banaco-claim-string2", foreground: "000000" }, // 
      { token: "banaco-claim-number", foreground: "cc2222", fontStyle: "bold" }, // 
      // { token: "banaco-doublespace", foreground: "ff0000", fontStyle: "underline" }, // 

      { token: "custom-info", foreground: "808080" },
      { token: "custom-error", foreground: "ff0000", fontStyle: "bold" },
      { token: "custom-notice", foreground: "FFA500" },
      { token: "custom-date", foreground: "008800" },
   ],
   colors: {
      "editor.foreground": "#000000",
      "editor.background": "#EDF9FA",
      "editorCursor.foreground": "#8B0000",
      "editor.lineHighlightBackground": "#0000FF20",
      "editorLineNumber.foreground": "#008800",
      "editor.selectionBackground": "#88000030",
      "editor.inactiveSelectionBackground": "#88000015",
   },
}

function start() {
   // ❮Custom Languages❯

   // 새로운 언어 등록
   monaco.languages.register({ id: "myLanguage" });

   // 새로운 언어의 토큰 제공자(tokens provider) 등록
   monaco.languages.setMonarchTokensProvider("myLanguage", myLangSyntax)

   // ❮Exposed Colors❯
   // 새로운 언어의 테마 정의 및 등록
   // CSS 또는 JS를 통해서 색상 커즈터마이징할 수 있음 (세세한 색상 구성들은 맨 아래 리스트 참고)
   monaco.editor.defineTheme("myTheme", myThemeColors);
   monaco.editor.setTheme("myTheme");


   // 새로운 언어에서 쓰고 싶은 완성 아이템 제공자(completion item provider) 등록
   // monaco.languages.registerCompletionItemProvider("myLanguage", {
   //    provideCompletionItems: (model, position) => {
   //       var word = model.getWordUntilPosition(position);
   //       var range = {
   //          startLineNumber: position.lineNumber,
   //          endLineNumber: position.lineNumber,
   //          startColumn: word.startColumn,
   //          endColumn: word.endColumn,
   //       };
   //       var suggestions = [
   //          {
   //             label: "simpleText",
   //             kind: monaco.languages.CompletionItemKind.Text,
   //             insertText: "simpleText",
   //             range: range,
   //          },
   //          {
   //             label: "testing",
   //             kind: monaco.languages.CompletionItemKind.Keyword,
   //             insertText: "testing(${1:조건})",
   //             insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
   //             range: range,
   //          },
   //          {
   //             label: "ifelse",
   //             kind: monaco.languages.CompletionItemKind.Snippet,
   //             insertText: [
   //                "if (${1:condition}) {",
   //                "\t$2",
   //                "} else {",
   //                "\t$0",
   //                "}",
   //             ].join("\n"),
   //             insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
   //             documentation: "If-Else Statement",
   //             range: range,
   //          },
   //       ];
   //       return { suggestions: suggestions };
   //    },
   // });




   const value = `청구항 2
제1항에 있어서,
X1은 C(R21)(R22) 또는 Si(R21)(R22)인, 유기 발광 소자.

청구항 3
제2항에 있어서,
상기 R21 및 R22는,
단일 결합; 또는
C1-C10알킬기, C1-C10알콕시기, 페닐기, 비페닐기, 터페닐기 및 나프틸기 중에서 선택된 적어도 하나로 치환된,
C1-C5알킬렌기 또는 C2-C5알케닐렌기;
를 통하여 서로 결합된, 유기 발광 소자.
\n\n`

   var editor = monaco.editor.create(document.getElementById('container'), {
      value: value,
      language: 'myLanguage',       // "javascript", "text/plain", "text/html", "text/css"
      automaticLayout: true,

      // ❮Editor Basic Options❯
      // 옵션 리터럴을 통해 쉽게 편집기 동작을 사용자 정의할 수 있습니다.
      // 다음은 편집기에 전달할 수 있는 몇 가지 구성 옵션의 예입니다.
      // 언제든지 editor.updateOptions()를 호출하여 옵션을 변경할 수 있습니다.

      lineNumbers: "on",            // 줄 번호 표시 여부 (기본값: "on")
      roundedSelection: false,      // 글자 드래그할 때 선택 영역의 모서리가 둥근지 네모난지 여부 (기본값: true)
      scrollBeyondLastLine: false,  // 마지막 줄만 보일 때까지 아래로 스크롤할 수 있는지 여부 (기본값: true)
      readOnly: false,              // 읽기전용 여부 (기본값: false)
      theme: "myTheme",             // 다크모드("vs-dark")

      // ❮Hard Wrapping❯
      wordWrap: "on",               // 자동 줄바꿈 설정 ("wordWrapColumn",,,)
      wrappingIndent: "same",       // 줄바꿈 시 다음 줄 위치 ("same", "indent", "none")
      wordWrapBreakAfterCharacters: "- ", 
      // wordBreak: 'keepAll', // 'normal'

      fontFamily: "Arial",          // 글꼴
      fontSize: 14,                 // 글자 크기

      padding: {top: 15, bottom: 50}, // 에디터 패딩
      copyWithSyntaxHighlighting: true, // 복사할 때 텍스트 서식도 복사하기
      renderLineHighlight: 'line', // | 'gutter' | 'line' | 'all'
      lineHeight: 22, // 줄 간격
      // letterSpacing: 0.2, // 글자 간격
      
      // ❮Scrollbars❯
      scrollbar: {
         useShadows: false, // Subtle shadows to the left & top. (기본값: true)
         vertical: "visible",   // Render vertical scrollbar. ('auto', 'visible', 'hidden') (기본값: 'auto')
         horizontal: "visible", // Render horizontal scrollbar. ('auto', 'visible', 'hidden') (기본값: 'auto')
         verticalScrollbarSize: 15,   // 스크롤바 굵기
         horizontalScrollbarSize: 15, // 스크롤바 굵기
      },
   });

   // setTimeout(function () {
   //    editor.updateOptions({
   //       lineNumbers: "on",
   //    });
   // }, 2000);

}











// 색상 이름 리스트:
("foreground"); // Overall 전경색. This color is only used if not overridden by a component.
("errorForeground"); // Overall 전경색 for error messages. This color is only used if not overridden by a component.
("descriptionForeground"); // 전경색 for description text providing additional information, for example for a label.
("focusBorder"); // Overall 테두리색 for focused elements. This color is only used if not overridden by a component.
("contrastBorder"); // An extra border around elements to separate them from others for greater contrast.
("contrastActiveBorder"); // An extra border around active elements to separate them from others for greater contrast.
("selection.background"); // The 배경색 of text selections in the workbench (e.g. for input fields or text areas). Note that this does not apply to selections within the editor.
("textSeparator.foreground"); // Color for text separators.
("textLink.foreground"); // 전경색 for links in text.
("textLink.activeForeground"); // 전경색 for active links in text.
("textPreformat.foreground"); // 전경색 for preformatted text segments.
("textBlockQuote.background"); // 배경색 for block quotes in text.
("textBlockQuote.border"); // 테두리색 for block quotes in text.
("textCodeBlock.background"); // 배경색 for code blocks in text.
("widget.shadow"); // Shadow color of widgets such as find/replace inside the editor.
("input.background"); // Input box background.
("input.foreground"); // Input box foreground.
("input.border"); // Input box border.
("inputOption.activeBorder"); // 테두리색 of activated options in input fields.
("input.placeholderForeground"); // Input box 전경색 for placeholder text.
("inputValidation.infoBackground"); // Input validation 배경색 for information severity.
("inputValidation.infoBorder"); // Input validation 테두리색 for information severity.
("inputValidation.warningBackground"); // Input validation 배경색 for information warning.
("inputValidation.warningBorder"); // Input validation 테두리색 for warning severity.
("inputValidation.errorBackground"); // Input validation 배경색 for error severity.
("inputValidation.errorBorder"); // Input validation 테두리색 for error severity.
("dropdown.background"); // Dropdown background.
("dropdown.foreground"); // Dropdown foreground.
("dropdown.border"); // Dropdown border.
("list.focusBackground"); // List/Tree 배경색 for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.
("list.focusForeground"); // List/Tree 전경색 for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.
("list.activeSelectionBackground"); // List/Tree 배경색 for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.
("list.activeSelectionForeground"); // List/Tree 전경색 for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.
("list.inactiveSelectionBackground"); // List/Tree 배경색 for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not.
("list.inactiveSelectionForeground"); // List/Tree 전경색 for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not.
("list.hoverBackground"); // List/Tree background when hovering over items using the mouse.
("list.hoverForeground"); // List/Tree foreground when hovering over items using the mouse.
("list.dropBackground"); // List/Tree drag and drop background when moving items around using the mouse.
("list.highlightForeground"); // List/Tree 전경색 of the match highlights when searching inside the list/tree.
("pickerGroup.foreground"); // Quick picker color for grouping labels.
("pickerGroup.border"); // Quick picker color for grouping borders.
("button.foreground"); // Button 전경색.
("button.background"); // Button 배경색.
("button.hoverBackground"); // Button 배경색 when hovering.
("badge.background"); // Badge 배경색. Badges are small information labels, e.g. for search results count.
("badge.foreground"); // Badge 전경색. Badges are small information labels, e.g. for search results count.
("scrollbar.shadow"); // Scrollbar shadow to indicate that the view is scrolled.
("scrollbarSlider.background"); // Slider 배경색.
("scrollbarSlider.hoverBackground"); // Slider 배경색 when hovering.
("scrollbarSlider.activeBackground"); // Slider 배경색 when active.
("progressBar.background"); // 배경색 of the progress bar that can show for long running operations.
("editor.background"); // Editor 배경색.
("editor.foreground"); // Editor default 전경색.
("editorWidget.background"); // 배경색 of editor widgets, such as find/replace.
("editorWidget.border"); // 테두리색 of editor widgets. The color is only used if the widget chooses to have a border and if the color is not overridden by a widget.
("editor.selectionBackground"); // Color of the editor selection.
("editor.selectionForeground"); // Color of the selected text for high contrast.
("editor.inactiveSelectionBackground"); // Color of the selection in an inactive editor.
("editor.selectionHighlightBackground"); // Color for regions with the same content as the selection.
("editor.findMatchBackground"); // Color of the current search match.
("editor.findMatchHighlightBackground"); // Color of the other search matches.
("editor.findRangeHighlightBackground"); // Color the range limiting the search.
("editor.hoverHighlightBackground"); // Highlight below the word for which a hover is shown.
("editorHoverWidget.background"); // 배경색 of the editor hover.
("editorHoverWidget.border"); // 테두리색 of the editor hover.
("editorLink.activeForeground"); // Color of active links.
("diffEditor.insertedTextBackground"); // 배경색 for text that got inserted.
("diffEditor.removedTextBackground"); // 배경색 for text that got removed.
("diffEditor.insertedTextBorder"); // Outline color for the text that got inserted.
("diffEditor.removedTextBorder"); // Outline color for text that got removed.
("editorOverviewRuler.currentContentForeground"); // Current overview ruler foreground for inline merge-conflicts.
("editorOverviewRuler.incomingContentForeground"); // Incoming overview ruler foreground for inline merge-conflicts.
("editorOverviewRuler.commonContentForeground"); // Common ancestor overview ruler foreground for inline merge-conflicts.
("editor.lineHighlightBackground"); // 배경색 for the highlight of line at the cursor position.
("editor.lineHighlightBorder"); // 배경색 for the border around the line at the cursor position.
("editor.rangeHighlightBackground"); // 배경색 of highlighted ranges, like by quick open and find features.
("editorCursor.foreground"); // Color of the editor cursor.
("editorWhitespace.foreground"); // Color of whitespace characters in the editor.
("editorIndentGuide.background"); // Color of the editor indentation guides.
("editorLineNumber.foreground"); // Color of editor line numbers.
("editorLineNumber.activeForeground"); // Color of editor active line number.
("editorRuler.foreground"); // Color of the editor rulers.
("editorCodeLens.foreground"); // 전경색 of editor code lenses
("editorInlayHint.foreground"); // 전경색 of editor inlay hints
("editorInlayHint.background"); // 배경색 of editor inlay hints
("editorBracketMatch.background"); // 배경색 behind matching brackets
("editorBracketMatch.border"); // Color for matching brackets boxes
("editorOverviewRuler.border"); // Color of the overview ruler border.
("editorGutter.background"); // 배경색 of the editor gutter. The gutter contains the glyph margins and the line numbers.
("editorError.foreground"); // 전경색 of error squigglies in the editor.
("editorError.border"); // 테두리색 of error squigglies in the editor.
("editorWarning.foreground"); // 전경색 of warning squigglies in the editor.
("editorWarning.border"); // 테두리색 of warning squigglies in the editor.
("editorMarkerNavigationError.background"); // Editor marker navigation widget error color.
("editorMarkerNavigationWarning.background"); // Editor marker navigation widget warning color.
("editorMarkerNavigation.background"); // Editor marker navigation widget background.
("editorSuggestWidget.background"); // 배경색 of the suggest widget.
("editorSuggestWidget.border"); // 테두리색 of the suggest widget.
("editorSuggestWidget.foreground"); // 전경색 of the suggest widget.
("editorSuggestWidget.selectedBackground"); // 배경색 of the selected entry in the suggest widget.
("editorSuggestWidget.highlightForeground"); // Color of the match highlights in the suggest widget.
("editor.wordHighlightBackground"); // 배경색 of a symbol during read-access, like reading a variable.
("editor.wordHighlightStrongBackground"); // 배경색 of a symbol during write-access, like writing to a variable.
("peekViewTitle.background"); // 배경색 of the peek view title area.
("peekViewTitleLabel.foreground"); // Color of the peek view title.
("peekViewTitleDescription.foreground"); // Color of the peek view title info.
("peekView.border"); // Color of the peek view borders and arrow.
("peekViewResult.background"); // 배경색 of the peek view result list.
("peekViewResult.lineForeground"); // 전경색 for line nodes in the peek view result list.
("peekViewResult.fileForeground"); // 전경색 for file nodes in the peek view result list.
("peekViewResult.selectionBackground"); // 배경색 of the selected entry in the peek view result list.
("peekViewResult.selectionForeground"); // 전경색 of the selected entry in the peek view result list.
("peekViewEditor.background"); // 배경색 of the peek view editor.
("peekViewEditorGutter.background"); // 배경색 of the gutter in the peek view editor.
("peekViewResult.matchHighlightBackground"); // Match highlight color in the peek view result list.
("peekViewEditor.matchHighlightBackground"); // Match highlight color in the peek view editor.

/*
var colors = require('vs/platform/registry/common/platform').Registry.data.get('base.contributions.colors').colorSchema.properties
Object.keys(colors).forEach(function(key) {
    var val = colors[key];
    console.log( '//' + val.description + '\n' + key);
})
*/

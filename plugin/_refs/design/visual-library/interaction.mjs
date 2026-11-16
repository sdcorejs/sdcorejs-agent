/** Fixed local-only behaviour, shared by standalone, static and live previews. */
export const PATTERN_SCRIPT = `(function(){
  "use strict";
  document.querySelectorAll("[data-pattern-id]").forEach(function(root){
    var state=root.querySelector("[data-preview-state]"), viewport=root.querySelector("[data-preview-viewport]");
    var data=root.querySelector("[data-preview-data]"), status=root.querySelector("[data-preview-status]");
    function announce(){status.textContent=root.dataset.localStatus;}
    function setState(value){state.value=value;data.hidden=value!=="data";root.querySelectorAll("[data-state-panel]").forEach(function(panel){panel.hidden=panel.dataset.statePanel!==value;});}
    state.addEventListener("change",function(){setState(state.value);});
    viewport.addEventListener("change",function(){root.dataset.viewport=viewport.value;});
    root.querySelectorAll("[data-preview-action]").forEach(function(button){button.addEventListener("click",announce);});
    root.querySelectorAll("[data-preview-retry]").forEach(function(button){button.addEventListener("click",function(){setState("data");announce();});});
    var drawer=root.querySelector("[data-preview-drawer]"), lastRecord=null;
    root.querySelectorAll("[data-preview-record]").forEach(function(button){button.addEventListener("click",function(){
      lastRecord=button;
      root.querySelectorAll("[data-detail-title]").forEach(function(title){title.textContent=button.dataset.previewRecord;});
      root.querySelectorAll("[data-record-value]").forEach(function(value){var cells=JSON.parse(button.dataset.recordCells);value.textContent=cells[Number(value.dataset.recordValue)]||cells[0];});
      if(drawer){drawer.hidden=false;drawer.querySelector("button").focus();}else announce();
    });});
    root.querySelectorAll("[data-close-drawer]").forEach(function(button){button.addEventListener("click",function(){drawer.hidden=true;if(lastRecord)lastRecord.focus();});});
    root.addEventListener("keydown",function(event){if(event.key==="Escape"&&drawer&&!drawer.hidden){drawer.hidden=true;if(lastRecord)lastRecord.focus();}});
    root.querySelectorAll("[data-preview-tab]").forEach(function(button){button.addEventListener("click",function(){
      root.querySelectorAll("[data-preview-tab]").forEach(function(tab){tab.setAttribute("aria-pressed",String(tab===button));});
      root.querySelectorAll("[data-tab-panel]").forEach(function(panel){panel.hidden=panel.dataset.tabPanel!==button.dataset.previewTab;});
    });});
    var steps=Array.from(root.querySelectorAll("[data-preview-step]")), current=0;
    function step(index){current=Math.max(0,Math.min(steps.length-1,index));steps.forEach(function(button,i){if(i===current)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");});root.querySelectorAll("[data-step-panel]").forEach(function(panel){panel.hidden=Number(panel.dataset.stepPanel)!==current;});root.querySelectorAll("[data-step-back]").forEach(function(b){b.disabled=current===0;});root.querySelectorAll("[data-step-next]").forEach(function(b){b.disabled=current===steps.length-1;});}
    steps.forEach(function(button,i){button.addEventListener("click",function(){step(i);});});
    root.querySelectorAll("[data-step-back]").forEach(function(b){b.addEventListener("click",function(){step(current-1);});});
    root.querySelectorAll("[data-step-next]").forEach(function(b){b.addEventListener("click",function(){step(current+1);});});
    root.querySelectorAll("[data-preview-search]").forEach(function(input){input.addEventListener("input",function(){
      var shown=0;root.querySelectorAll("[data-search-row]").forEach(function(row){row.hidden=!row.textContent.toLocaleLowerCase().includes(input.value.toLocaleLowerCase());if(!row.hidden)shown++;});
      root.querySelectorAll("[data-search-empty]").forEach(function(message){message.hidden=shown>0;});
    });});
  });
}());`;

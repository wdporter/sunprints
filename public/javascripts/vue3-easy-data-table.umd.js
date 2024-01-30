(function(e,le){typeof exports=="object"&&typeof module!="undefined"?module.exports=le(require("vue")):typeof define=="function"&&define.amd?define(["vue"],le):(e=typeof globalThis!="undefined"?globalThis:e||self,e["vue3-easy-data-table"]=le(e.Vue))})(this,function(e){"use strict";var le="",M=(r,i)=>{const d=r.__vccOpts||r;for(const[t,g]of i)d[t]=g;return d};const Ve=r=>(e.pushScopeId("data-v-e0a0b7f0"),r=r(),e.popScopeId(),r),Re=["checked"],Le=Ve(()=>e.createElementVNode("label",{for:"checbox"},null,-1)),Te=e.defineComponent({__name:"MultipleSelectCheckBox",props:{status:{type:String,required:!0}},emits:["change"],setup(r,{emit:i}){e.useCssVars(n=>({"51ab8a49":e.unref(p)}));const d=i,t=r,g=e.computed(()=>t.status==="allSelected"),o=()=>{d("change",!g.value)},p=e.inject("themeColor");return(n,a)=>(e.openBlock(),e.createElementBlock("div",{class:"easy-checkbox",onClick:e.withModifiers(o,["stop","prevent"])},[e.createElementVNode("input",{type:"checkbox",checked:g.value,class:e.normalizeClass(r.status)},null,10,Re),Le]))}});var Fe=M(Te,[["__scopeId","data-v-e0a0b7f0"]]),ra="";const De=r=>(e.pushScopeId("data-v-7e69a276"),r=r(),e.popScopeId(),r),ze=["checked"],Me=De(()=>e.createElementVNode("label",{for:"checbox"},null,-1)),He=e.defineComponent({__name:"SingleSelectCheckBox",props:{checked:{type:Boolean,required:!0}},emits:["change"],setup(r,{emit:i}){e.useCssVars(g=>({fdaf7e9e:e.unref(t)}));const d=i,t=e.inject("themeColor");return(g,o)=>(e.openBlock(),e.createElementBlock("div",{class:"easy-checkbox",onClick:o[0]||(o[0]=e.withModifiers(p=>d("change"),["stop","prevent"]))},[e.createElementVNode("input",{type:"checkbox",checked:r.checked},null,8,ze),Me]))}});var Oe=M(He,[["__scopeId","data-v-7e69a276"]]),oa="";const je=r=>(e.pushScopeId("data-v-4ca5de3a"),r=r(),e.popScopeId(),r),We={class:"easy-data-table__rows-selector"},qe={class:"rows-input"},Je=je(()=>e.createElementVNode("div",{class:"triangle"},null,-1)),Ue=["onClick"],Ge=e.defineComponent({__name:"RowsSelector",props:{modelValue:{type:Number,required:!0},rowsItems:{type:Array,required:!0}},emits:["update:modelValue"],setup(r,{emit:i}){e.useCssVars(f=>({"1b889342":e.unref(w)}));const d=r,t=i,g=e.ref(!1),o=e.ref(!1),p=e.inject("dataTable");e.watch(g,f=>{if(f&&p){const C=window.innerHeight,b=p.value.getBoundingClientRect().height,_=p.value.getBoundingClientRect().top;C-(b+_)<=100?o.value=!0:o.value=!1}});const n=e.computed({get:()=>d.modelValue,set:f=>{t("update:modelValue",f)}}),a=f=>{n.value=f,g.value=!1},l=(f,C)=>{let b=f.parentNode;for(;b!=null;){if(b.classList&&b.classList.contains(C))return!0;b=b.parentNode}return!1},y=f=>{l(f.target,"easy-data-table__rows-selector")||(g.value=!1)};e.onMounted(()=>{document.addEventListener("click",y)}),e.onBeforeUnmount(()=>{document.removeEventListener("click",y)});const w=e.inject("themeColor");return(f,C)=>(e.openBlock(),e.createElementBlock("div",We,[e.createElementVNode("div",{class:"rows-input__wrapper",onClick:C[0]||(C[0]=b=>g.value=!g.value)},[e.createElementVNode("div",qe,e.toDisplayString(n.value),1),Je]),e.createElementVNode("ul",{class:e.normalizeClass(["select-items",{show:g.value,inside:o.value}])},[(e.openBlock(!0),e.createElementBlock(e.Fragment,null,e.renderList(r.rowsItems,b=>(e.openBlock(),e.createElementBlock("li",{key:b,class:e.normalizeClass({selected:b===n.value}),onClick:_=>a(b)},e.toDisplayString(b),11,Ue))),128))],2)]))}});var Ke=M(Ge,[["__scopeId","data-v-4ca5de3a"]]),la="";const se=r=>(e.pushScopeId("data-v-1fa3a520"),r=r(),e.popScopeId(),r),Qe={class:"lds-ring"},Xe=[se(()=>e.createElementVNode("div",null,null,-1)),se(()=>e.createElementVNode("div",null,null,-1)),se(()=>e.createElementVNode("div",null,null,-1)),se(()=>e.createElementVNode("div",null,null,-1))],Ye=e.defineComponent({__name:"Loading",setup(r){e.useCssVars(d=>({26774109:e.unref(i)}));const i=e.inject("themeColor");return(d,t)=>(e.openBlock(),e.createElementBlock("div",Qe,Xe))}});var Ze=M(Ye,[["__scopeId","data-v-1fa3a520"]]),ua="";const et={class:"loader-line"},tt=e.defineComponent({__name:"LoadingLine",setup(r){e.useCssVars(d=>({"0d327f57":e.unref(i)}));const i=e.inject("themeColor");return(d,t)=>(e.openBlock(),e.createElementBlock("div",et))}});var at=M(tt,[["__scopeId","data-v-7d281cac"]]),pa="";const nt={class:"buttons-pagination"},rt=["onClick"],q=7,ot=e.defineComponent({__name:"ButtonsPagination",props:{maxPaginationNumber:{type:Number,required:!0},currentPaginationNumber:{type:Number,required:!0}},emits:["updatePage"],setup(r,{emit:i}){e.useCssVars(n=>({"116a0dd4":e.unref(p)}));const d=i,t=r,g=n=>{n.type==="button"&&!n.active&&d("updatePage",n.page)},o=e.computed(()=>{const n=[];if(t.maxPaginationNumber<=q)for(let a=1;a<=t.maxPaginationNumber;a+=1)n.push({type:"button",page:a,active:a===t.currentPaginationNumber,activePrev:a+1===t.currentPaginationNumber});else if([1,2,t.maxPaginationNumber,t.maxPaginationNumber-1].includes(t.currentPaginationNumber))for(let a=1;a<=q;a+=1)if(a<=3)n.push({type:"button",page:a,active:a===t.currentPaginationNumber,activePrev:a+1===t.currentPaginationNumber});else if(a===4)n.push({type:"omission"});else{const l=t.maxPaginationNumber-(q-a);n.push({type:"button",page:l,active:l===t.currentPaginationNumber,activePrev:l+1===t.currentPaginationNumber})}else if([3,4].includes(t.currentPaginationNumber))for(let a=1;a<=q;a+=1)a<=5?n.push({type:"button",page:a,active:a===t.currentPaginationNumber,activePrev:a+1===t.currentPaginationNumber}):a===6?n.push({type:"omission"}):n.push({type:"button",page:t.maxPaginationNumber,active:t.maxPaginationNumber===t.currentPaginationNumber,activePrev:a+1===t.currentPaginationNumber});else if([t.maxPaginationNumber-2,t.maxPaginationNumber-3].includes(t.currentPaginationNumber))for(let a=1;a<=q;a+=1)if(a===1)n.push({type:"button",page:1,active:t.currentPaginationNumber===1,activePrev:a+1===t.currentPaginationNumber});else if(a===2)n.push({type:"omission"});else{const l=t.maxPaginationNumber-(q-a);n.push({type:"button",page:l,active:l===t.currentPaginationNumber,activePrev:l+1===t.currentPaginationNumber})}else for(let a=1;a<=q;a+=1)if(a===1)n.push({type:"button",page:1,active:t.currentPaginationNumber===1,activePrev:a+1===t.currentPaginationNumber});else if(a===2||a===6)n.push({type:"omission"});else if(a===7)n.push({type:"button",page:t.maxPaginationNumber,active:t.maxPaginationNumber===t.currentPaginationNumber,activePrev:a+1===t.currentPaginationNumber});else{const l=4-a,y=t.currentPaginationNumber-l;n.push({type:"button",page:y,active:y===t.currentPaginationNumber,activePrev:y+1===t.currentPaginationNumber})}return n}),p=e.inject("themeColor");return(n,a)=>(e.openBlock(),e.createElementBlock("div",nt,[(e.openBlock(!0),e.createElementBlock(e.Fragment,null,e.renderList(o.value,(l,y)=>(e.openBlock(),e.createElementBlock("div",{key:y,class:e.normalizeClass(["item",{button:l.type==="button",active:l.type==="button"&&l.active,"active-prev":l.type==="button"&&l.activePrev,omission:l.type==="omission"}]),onClick:w=>g(l)},e.toDisplayString(l.type==="button"?l.page:"\u2026"),11,rt))),128))]))}});var lt=M(ot,[["__scopeId","data-v-719fd31a"]]),fa="";const me=r=>(e.pushScopeId("data-v-c9da5286"),r=r(),e.popScopeId(),r),st=[me(()=>e.createElementVNode("span",{class:"arrow arrow-right"},null,-1))],it=[me(()=>e.createElementVNode("span",{class:"arrow arrow-left"},null,-1))],ct=e.defineComponent({__name:"PaginationArrows",props:{isFirstPage:{type:Boolean,required:!1},isLastPage:{type:Boolean,required:!1}},emits:["clickPrevPage","clickNextPage"],setup(r,{emit:i}){const d=i,t=e.useSlots();return(g,o)=>(e.openBlock(),e.createElementBlock(e.Fragment,null,[e.createElementVNode("div",{class:e.normalizeClass(["previous-page__click-button",{"first-page":r.isFirstPage}]),onClick:o[0]||(o[0]=p=>d("clickPrevPage"))},st,2),e.unref(t).buttonsPagination?e.renderSlot(g.$slots,"buttonsPagination",{key:0},void 0,!0):e.createCommentVNode("",!0),e.createElementVNode("div",{class:e.normalizeClass(["next-page__click-button",{"last-page":r.isLastPage}]),onClick:o[1]||(o[1]=p=>d("clickNextPage"))},it,2)],64))}});var dt=M(ct,[["__scopeId","data-v-c9da5286"]]);function ut(r,i,d,t){return{clickRow:(o,p,n)=>{if(r.value!==p)return;const a={...o};if(i.value){const{checkbox:l}=o;delete a.checkbox,a.isSelected=l}if(d.value){const{index:l}=o;delete a.index,a.indexInCurrentPage=l}t("clickRow",a,n)}}}function pt(r,i,d){const t=e.ref([]);return{expandingItemIndexList:t,updateExpandingItemIndexList:(p,n,a)=>{a.stopPropagation();const l=t.value.indexOf(p);if(l!==-1)t.value.splice(l,1);else{const y=r.value.findIndex(w=>JSON.stringify(w)===JSON.stringify(n));d("expandRow",i.value+y,n),t.value.push(i.value+y)}},clearExpandingItemIndexList:()=>{t.value=[]}}}function ft(r){const i=e.computed(()=>r.value.filter(g=>g.fixed)),d=e.computed(()=>i.value.length?i.value[i.value.length-1].value:""),t=e.computed(()=>{if(!i.value.length)return[];const g=i.value.map(o=>{var p;return(p=o.width)!=null?p:100});return i.value.map((o,p)=>{var n,a;return{value:o.value,fixed:(n=o.fixed)!=null?n:!0,width:(a=o.width)!=null?a:100,distance:p===0?0:g.reduce((l,y,w)=>{let f=l;return w<p&&(f+=y),f})}})});return{fixedHeaders:i,lastFixedColumn:d,fixedColumnsInfos:t}}function mt(r,i,d,t,g,o,p,n,a,l,y,w,f,C,b,_,$,T,F){const u=e.computed(()=>p.value.findIndex(h=>h.fixed)!==-1),k=e.computed(()=>u.value?p.value.filter(h=>h.fixed):[]),P=e.computed(()=>p.value.filter(h=>!h.fixed)),B=(h,D)=>Array.isArray(h)&&Array.isArray(D)?{sortBy:h,sortDesc:D.map(S=>S==="desc")}:h!==""?{sortBy:b.value,sortDesc:_.value==="desc"}:null,m=e.ref(B(b.value,_.value)),N=e.computed(()=>{var ie;const D=[...k.value,...P.value].map(Q=>{const A=Object.assign(Q);if(A.sortable&&(A.sortType="none"),f.value)if(Array.isArray(f.value.sortBy)&&Array.isArray(f.value.sortType)&&f.value.sortBy.includes(A.value)){const Y=f.value.sortBy.indexOf(A.value);A.sortType=f.value.sortType[Y]}else A.value===f.value.sortBy&&f.value.sortType&&(A.sortType=f.value.sortType);if(m.value&&Array.isArray(m.value.sortBy)&&Array.isArray(m.value.sortDesc)&&m.value.sortBy.includes(A.value)){const Y=m.value.sortBy.indexOf(A.value);A.sortType=m.value.sortDesc[Y]?"desc":"asc"}else m.value&&A.value===m.value.sortBy&&(A.sortType=m.value.sortDesc?"desc":"asc");return A});let S=[];n.value?S=[g.value||u.value?{text:"",value:"expand",fixed:!0,width:d.value}:{text:"",value:"expand"},...D]:S=D;let V=[];C.value?V=[o.value||u.value?{text:r.value,value:"index",fixed:!0,width:a.value}:{text:r.value,value:"index"},...S]:V=S;let X=[];return l.value?X=[t.value||u.value?{text:"checkbox",value:"checkbox",fixed:!0,width:(ie=i.value)!=null?ie:36}:{text:"checkbox",value:"checkbox"},...V]:X=V,X}),E=e.computed(()=>N.value.map(h=>h.value));return{clientSortOptions:m,headerColumns:E,headersForRender:N,updateSortField:(h,D)=>{let S=null;if(D==="none"?S="asc":D==="asc"?S="desc":S=w.value?"asc":null,y.value&&T(h,S),m.value&&Array.isArray(m.value.sortBy)&&Array.isArray(m.value.sortDesc)){const V=m.value.sortBy.indexOf(h);V===-1?S!==null&&(m.value.sortBy.push(h),m.value.sortDesc.push(S==="desc")):S===null?(m.value.sortDesc.splice(V,1),m.value.sortBy.splice(V,1)):m.value.sortDesc[V]=S==="desc"}else S===null?m.value=null:m.value={sortBy:h,sortDesc:S==="desc"};F("updateSort",{sortType:S,sortBy:h})},isMultiSorting:h=>f.value&&Array.isArray(f.value.sortBy)?f.value.sortBy.includes(h):m.value&&Array.isArray(m.value.sortBy)?m.value.sortBy.includes(h):!1,getMultiSortNumber:h=>f.value&&Array.isArray(f.value.sortBy)?f.value.sortBy.indexOf(h)+1:m.value&&Array.isArray(m.value.sortBy)?m.value.sortBy.indexOf(h)+1:!1}}function gt(r,i,d,t,g,o,p,n,a){const l=e.computed(()=>(r.value-1)*g.value+1),y=e.computed(()=>d.value?Math.min(a.value,r.value*g.value):Math.min(n.value.length,r.value*g.value)),w=e.computed(()=>d.value?t.value:n.value.slice(l.value-1,y.value)),f=e.computed(()=>p.value?w.value.map((_,$)=>({index:l.value+$,..._})):w.value),C=e.computed(()=>o.value.length===0||o.value.every($=>n.value.findIndex(T=>JSON.stringify($)===JSON.stringify(T))===-1)?"noneSelected":o.value.length===n.value.length&&o.value.every(T=>n.value.findIndex(F=>JSON.stringify(T)===JSON.stringify(F))!==-1)?"allSelected":"partSelected"),b=e.computed(()=>i.value?C.value==="allSelected"?f.value.map(_=>({checkbox:!0,..._})):C.value==="noneSelected"?f.value.map(_=>({checkbox:!1,..._})):f.value.map(_=>({checkbox:o.value.findIndex(T=>{const F={..._};return delete F.index,JSON.stringify(T)===JSON.stringify(F)})!==-1,..._})):f.value);return{currentPageFirstIndex:l,currentPageLastIndex:y,multipleSelectStatus:C,pageItems:b}}function yt(r,i,d,t,g,o,p){const n=e.ref(o.value?o.value.page:r.value),a=e.computed(()=>Math.ceil(t.value/g.value)),l=e.computed(()=>a.value===0||n.value===a.value),y=e.computed(()=>n.value===1);return{currentPaginationNumber:n,maxPaginationNumber:a,isLastPage:l,isFirstPage:y,nextPage:()=>{if(t.value!==0&&!l.value&&!d.value)if(i.value){const _=n.value+1;p(_)}else n.value+=1},prevPage:()=>{if(t.value!==0&&!y.value&&!d.value)if(i.value){const _=n.value-1;p(_)}else n.value-=1},updatePage:_=>{d.value||(i.value?p(_):n.value=_)},updateCurrentPaginationNumber:_=>{n.value=_}}}function ht(r,i,d,t){const g=e.computed(()=>!r.value&&i.value.findIndex(n=>n===t.value)===-1?[t.value,...i.value]:i.value),o=e.ref(d.value?d.value.rowsPerPage:t.value);return{rowsItemsComputed:g,rowsPerPageRef:o,updateRowsPerPage:n=>{o.value=n}}}function _t(r,i,d){const t=e.computed({get:()=>{if(r.value){const{page:n,rowsPerPage:a,sortBy:l,sortType:y}=r.value;return{page:n,rowsPerPage:a,sortBy:l!=null?l:null,sortType:y!=null?y:null}}return null},set:n=>{d("update:serverOptions",n)}});return{serverOptionsComputed:t,updateServerOptionsPage:n=>{t.value&&(t.value={...t.value,page:n})},updateServerOptionsSort:(n,a)=>{if(t.value)if(i.value&&Array.isArray(t.value.sortBy)&&Array.isArray(t.value.sortType)){const l=t.value.sortBy.findIndex(y=>y===n);l===-1&&a!==null&&(t.value.sortBy.push(n),t.value.sortType.push(a)),a===null?(t.value.sortBy.splice(l,1),t.value.sortType.splice(l,1)):t.value.sortType[l]=a}else t.value={...t.value,sortBy:a!==null?n:null,sortType:a}},updateServerOptionsRowsPerPage:n=>{t.value&&(t.value={...t.value,page:1,rowsPerPage:n})}}}function v(r,i){var d;if(r.includes(".")){const t=r.split("."),{length:g}=t;let o,p=0;for(;p<g;){if(p===0)o=i[t[0]];else if(o&&typeof o=="object")o=o[t[p]];else{o="";break}p+=1}return o!=null?o:""}return(d=i[r])!=null?d:""}function bt(r,i){const d=v(r,i);return Array.isArray(d)?d.join(","):d}function kt(r,i,d,t,g,o,p,n,a,l){const y=u=>{if(typeof o.value=="string"&&o.value!=="")return v(o.value,u);if(Array.isArray(o.value)){let k="";return o.value.forEach(P=>{k+=v(P,u)}),k}return Object.values(u).join(" ")},w=e.computed(()=>{if(!d.value&&p.value!==""){const u=new RegExp(p.value,"i");return t.value.filter(k=>u.test(y(k)))}return t.value}),f=e.computed(()=>{let u=[...w.value];return i.value?(i.value.forEach(k=>{u=u.filter(P=>{const{field:B,comparison:m,criteria:N}=k;if(typeof m=="function")return m(v(B,P),N);const E=v(B,P);switch(m){case"=":return E===N;case"!=":return E!==N;case">":return E>N;case"<":return E<N;case"<=":return E<=N;case">=":return E>=N;case"between":return E>=Math.min(...N)&&E<=Math.max(...N);case"in":return N.includes(E);default:return E===N}})}),u):w.value});e.watch(f,u=>{i.value&&l("updateFilter",u)},{immediate:!0,deep:!0});function C(u,k,P,B){const m=u[B],N=k[B];return(B===0?P:C(u,k,P,B-1)).sort((H,K)=>{let O=!0;for(let h=0;h<B;h+=1)if(v(u[h],H)!==v(u[h],K)){O=!1;break}return O?v(m,H)<v(m,K)?N?1:-1:v(m,H)>v(m,K)?N?-1:1:0:0})}const b=e.computed(()=>{if(d.value)return t.value;if(r.value===null)return f.value;const{sortBy:u,sortDesc:k}=r.value,P=[...f.value];return a&&Array.isArray(u)&&Array.isArray(k)?u.length===0?P:C(u,k,P,u.length-1):P.sort((B,m)=>v(u,B)<v(u,m)?k?1:-1:v(u,B)>v(u,m)?k?-1:1:0)}),_=e.computed(()=>d.value?n.value:b.value.length),$=e.computed({get:()=>{var u;return(u=g.value)!=null?u:[]},set:u=>{l("update:itemsSelected",u)}});return{totalItems:b,selectItemsComputed:$,totalItemsLength:_,toggleSelectAll:u=>{$.value=u?b.value:[],u&&l("selectAll")},toggleSelectItem:u=>{const k=u.checkbox;if(delete u.checkbox,delete u.index,k)$.value=$.value.filter(P=>JSON.stringify(P)!==JSON.stringify(u)),l("deselectRow",u);else{const P=$.value;P.unshift(u),$.value=P,l("selectRow",u)}}}}var xt={alternating:{type:Boolean,default:!1},buttonsPagination:{type:Boolean,default:!1},checkboxColumnWidth:{type:Number,default:null},currentPage:{type:Number,default:1},emptyMessage:{type:String,default:"No Available Data"},expandColumnWidth:{type:Number,default:36},filterOptions:{type:Array,default:null},fixedExpand:{type:Boolean,default:!1},fixedHeader:{type:Boolean,default:!0},fixedCheckbox:{type:Boolean,default:!1},fixedIndex:{type:Boolean,default:!1},headerTextDirection:{type:String,default:"left"},bodyTextDirection:{type:String,default:"left"},hideFooter:{type:Boolean,default:!1},hideRowsPerPage:{type:Boolean,default:!1},hideHeader:{type:Boolean,default:!1},indexColumnWidth:{type:Number,default:60},itemsSelected:{type:Array,default:null},loading:{type:Boolean,default:!1},rowsPerPage:{type:Number,default:25},rowsItems:{type:Array,default:()=>[25,50,100]},rowsPerPageMessage:{type:String,default:"rows per page:"},searchField:{type:[String,Array],default:""},searchValue:{type:String,default:""},serverOptions:{type:Object,default:null},serverItemsLength:{type:Number,default:0},showIndex:{type:Boolean,default:!1},sortBy:{type:[String,Array],default:""},sortType:{type:[String,Array],default:"asc"},multiSort:{type:Boolean,default:!1},tableMinHeight:{type:Number,default:180},tableHeight:{type:Number,default:null},themeColor:{type:String,default:"#42b883"},tableClassName:{type:String,default:""},headerClassName:{type:String,default:""},headerItemClassName:{type:[Function,String],default:""},bodyRowClassName:{type:[Function,String],default:""},bodyExpandRowClassName:{type:[Function,String],default:""},bodyItemClassName:{type:[Function,String],default:""},noHover:{type:Boolean,default:!1},borderCell:{type:Boolean,default:!1},mustSort:{type:Boolean,default:!1},rowsOfPageSeparatorMessage:{type:String,default:"of"},clickEventType:{type:String,default:"single"},clickRowToExpand:{type:Boolean,default:!1},tableNodeId:{type:String,default:""},showIndexSymbol:{type:String,default:"#"},preventContextMenuRow:{type:Boolean,default:!0}},ya="",ha="";const Pt=r=>(e.pushScopeId("data-v-32683533"),r=r(),e.popScopeId(),r),St=["id"],Nt=["onClick"],Ct={key:3,class:"header-text"},Bt={key:5,class:"multi-sort__number"},wt=["onClick","onDblclick","onContextmenu"],It=["onClick"],Et=["colspan"],vt={key:0,class:"vue3-easy-data-table__loading"},$t=Pt(()=>e.createElementVNode("div",{class:"vue3-easy-data-table__loading-mask"},null,-1)),At={class:"loading-entity"},Vt={key:1,class:"vue3-easy-data-table__message"},Rt={key:0,class:"vue3-easy-data-table__footer"},Lt={key:0,class:"pagination__rows-per-page"},Tt={class:"pagination__items-index"},Ft=e.defineComponent({__name:"DataTable",props:{...xt,items:{type:Array,required:!0},headers:{type:Array,required:!0}},emits:["clickRow","contextmenuRow","selectRow","deselectRow","expandRow","updateSort","updateFilter","update:itemsSelected","update:serverOptions","updatePageItems","updateTotalItems","selectAll"],setup(r,{expose:i,emit:d}){e.useCssVars(c=>({da0d4328:zt.value,"3037e504":Dt.value}));const t=r,{tableNodeId:g,clickEventType:o,bodyTextDirection:p,checkboxColumnWidth:n,currentPage:a,expandColumnWidth:l,filterOptions:y,fixedCheckbox:w,fixedExpand:f,fixedHeader:C,fixedIndex:b,headers:_,headerTextDirection:$,indexColumnWidth:T,items:F,itemsSelected:u,loading:k,mustSort:P,multiSort:B,rowsItems:m,rowsPerPage:N,searchField:E,searchValue:H,serverItemsLength:K,serverOptions:O,showIndex:h,sortBy:D,sortType:S,tableHeight:V,tableMinHeight:X,themeColor:ie,rowsOfPageSeparatorMessage:Q,showIndexSymbol:A,preventContextMenuRow:Y}=e.toRefs(t),Dt=e.computed(()=>V.value?`${V.value}px`:null),zt=e.computed(()=>`${X.value}px`);e.provide("themeColor",ie.value);const L=e.useSlots(),Mt=e.computed(()=>!!L.pagination),Ht=e.computed(()=>!!L.loading),ye=e.computed(()=>!!L.expand),Ot=e.computed(()=>!!L.body),he=e.ref(),de=e.ref();e.provide("dataTable",he);const _e=e.ref(!1);e.onMounted(()=>{de.value.addEventListener("scroll",()=>{_e.value=de.value.scrollLeft>0})});const j=d,ue=e.computed(()=>u.value!==null),J=e.computed(()=>O.value!==null),{serverOptionsComputed:pe,updateServerOptionsPage:jt,updateServerOptionsSort:Wt,updateServerOptionsRowsPerPage:qt}=_t(O,B,j),{clientSortOptions:be,headerColumns:ke,headersForRender:U,updateSortField:Jt,isMultiSorting:Ut,getMultiSortNumber:Gt}=mt(A,n,l,w,f,b,_,ye,T,ue,J,P,pe,h,D,S,B,Wt,j),{rowsItemsComputed:xe,rowsPerPageRef:W,updateRowsPerPage:Kt}=ht(J,m,O,N),{totalItems:Pe,selectItemsComputed:Qt,totalItemsLength:ce,toggleSelectAll:Xt,toggleSelectItem:Yt}=kt(be,y,J,F,u,E,H,K,B,j),{currentPaginationNumber:z,maxPaginationNumber:Z,isLastPage:ee,isFirstPage:te,nextPage:ae,prevPage:ne,updatePage:re,updateCurrentPaginationNumber:Zt}=yt(a,J,k,ce,W,O,jt),{currentPageFirstIndex:Se,currentPageLastIndex:Ne,multipleSelectStatus:Ce,pageItems:G}=gt(z,ue,J,F,W,Qt,h,Pe,ce),oe=e.computed(()=>z.value===0?0:(z.value-1)*W.value),{expandingItemIndexList:Be,updateExpandingItemIndexList:we,clearExpandingItemIndexList:Ie}=pt(G,oe,j),{fixedHeaders:fe,lastFixedColumn:Ee,fixedColumnsInfos:ea}=ft(U),{clickRow:ve}=ut(o,ue,h,j),ta=(c,R)=>{Y.value&&R.preventDefault(),j("contextmenuRow",c,R)},aa=c=>{var s;const R=(s=c.width)!=null?s:fe.value.length?100:null;if(R)return`width: ${R}px; min-width: ${R}px;`},$e=(c,R="th")=>{if(!fe.value.length)return;const s=ea.value.find(I=>I.value===c);if(s)return`left: ${s.distance}px;z-index: ${R==="th"?3:1};position: sticky;`};return e.watch(k,(c,R)=>{pe.value&&c===!1&&R===!0&&(Zt(pe.value.page),Ie())}),e.watch(W,c=>{J.value?qt(c):re(1)}),e.watch([H,y],()=>{J.value||re(1)}),e.watch([z,be,E,H,y],()=>{Ie()},{deep:!0}),e.watch(G,c=>{j("updatePageItems",c)},{deep:!0}),e.watch(Pe,c=>{j("updateTotalItems",c)},{deep:!0}),i({currentPageFirstIndex:Se,currentPageLastIndex:Ne,clientItemsLength:ce,maxPaginationNumber:Z,currentPaginationNumber:z,isLastPage:ee,isFirstPage:te,nextPage:ae,prevPage:ne,updatePage:re,rowsPerPageOptions:xe,rowsPerPageActiveOption:W,updateRowsPerPageActiveOption:Kt}),(c,R)=>(e.openBlock(),e.createElementBlock("div",{ref_key:"dataTable",ref:he,class:e.normalizeClass(["vue3-easy-data-table",[c.tableClassName]])},[e.createElementVNode("div",{ref_key:"tableBody",ref:de,class:e.normalizeClass(["vue3-easy-data-table__main",{"fixed-header":e.unref(C),"fixed-height":e.unref(V),"show-shadow":_e.value,"table-fixed":e.unref(fe).length,hoverable:!c.noHover,"border-cell":c.borderCell}])},[e.createElementVNode("table",{id:e.unref(g)},[e.createElementVNode("colgroup",null,[(e.openBlock(!0),e.createElementBlock(e.Fragment,null,e.renderList(e.unref(U),(s,I)=>(e.openBlock(),e.createElementBlock("col",{key:I,style:e.normalizeStyle(aa(s))},null,4))),128))]),e.unref(L)["customize-headers"]?e.renderSlot(c.$slots,"customize-headers",{key:0},void 0,!0):e.unref(U).length&&!c.hideHeader?(e.openBlock(),e.createElementBlock("thead",{key:1,class:e.normalizeClass(["vue3-easy-data-table__header",[c.headerClassName]])},[e.createElementVNode("tr",null,[(e.openBlock(!0),e.createElementBlock(e.Fragment,null,e.renderList(e.unref(U),(s,I)=>(e.openBlock(),e.createElementBlock("th",{key:I,class:e.normalizeClass([{sortable:s.sortable,none:s.sortable&&s.sortType==="none",desc:s.sortable&&s.sortType==="desc",asc:s.sortable&&s.sortType==="asc",shadow:s.value===e.unref(Ee)},typeof c.headerItemClassName=="string"?c.headerItemClassName:c.headerItemClassName(s,I+1)]),style:e.normalizeStyle($e(s.value)),onClick:e.withModifiers(x=>s.sortable&&s.sortType?e.unref(Jt)(s.value,s.sortType):null,["stop"])},[s.text==="checkbox"?(e.openBlock(),e.createBlock(Fe,{key:e.unref(Ce),status:e.unref(Ce),onChange:e.unref(Xt)},null,8,["status","onChange"])):(e.openBlock(),e.createElementBlock("span",{key:1,class:e.normalizeClass(["header",`direction-${e.unref($)}`])},[e.unref(L)[`header-${s.value}`]?e.renderSlot(c.$slots,`header-${s.value}`,e.normalizeProps(e.mergeProps({key:0},s)),void 0,!0):e.unref(L)[`header-${s.value.toLowerCase()}`]?e.renderSlot(c.$slots,`header-${s.value.toLowerCase()}`,e.normalizeProps(e.mergeProps({key:1},s)),void 0,!0):e.unref(L).header?e.renderSlot(c.$slots,"header",e.normalizeProps(e.mergeProps({key:2},s)),void 0,!0):(e.openBlock(),e.createElementBlock("span",Ct,e.toDisplayString(s.text),1)),s.sortable?(e.openBlock(),e.createElementBlock("i",{key:s.sortType?s.sortType:"none",class:e.normalizeClass(["sortType-icon",{desc:s.sortType==="desc"}])},null,2)):e.createCommentVNode("",!0),e.unref(B)&&e.unref(Ut)(s.value)?(e.openBlock(),e.createElementBlock("span",Bt,e.toDisplayString(e.unref(Gt)(s.value)),1)):e.createCommentVNode("",!0)],2))],14,Nt))),128))])],2)):e.createCommentVNode("",!0),Ot.value?e.renderSlot(c.$slots,"body",e.normalizeProps(e.mergeProps({key:2},e.unref(G))),void 0,!0):e.unref(ke).length?(e.openBlock(),e.createElementBlock("tbody",{key:3,class:e.normalizeClass(["vue3-easy-data-table__body",{"row-alternation":c.alternating}])},[e.renderSlot(c.$slots,"body-prepend",e.normalizeProps(e.guardReactiveProps({items:e.unref(G),pagination:{isFirstPage:e.unref(te),isLastPage:e.unref(ee),currentPaginationNumber:e.unref(z),maxPaginationNumber:e.unref(Z),nextPage:e.unref(ae),prevPage:e.unref(ne)},headers:e.unref(U)})),void 0,!0),(e.openBlock(!0),e.createElementBlock(e.Fragment,null,e.renderList(e.unref(G),(s,I)=>(e.openBlock(),e.createElementBlock(e.Fragment,{key:I},[e.createElementVNode("tr",{class:e.normalizeClass([{"even-row":(I+1)%2===0},typeof c.bodyRowClassName=="string"?c.bodyRowClassName:c.bodyRowClassName(s,I+1)]),onClick:x=>{e.unref(ve)(s,"single",x),c.clickRowToExpand&&e.unref(we)(I+oe.value,s,x)},onDblclick:x=>{e.unref(ve)(s,"double",x)},onContextmenu:x=>{ta(s,x)}},[(e.openBlock(!0),e.createElementBlock(e.Fragment,null,e.renderList(e.unref(ke),(x,na)=>(e.openBlock(),e.createElementBlock("td",{key:na,style:e.normalizeStyle($e(x,"td")),class:e.normalizeClass([{shadow:x===e.unref(Ee),"can-expand":x==="expand"},typeof c.bodyItemClassName=="string"?c.bodyItemClassName:c.bodyItemClassName(x,I+1),`direction-${e.unref(p)}`]),onClick:Ae=>x==="expand"?e.unref(we)(I+oe.value,s,Ae):null},[e.unref(L)[`item-${x}`]?e.renderSlot(c.$slots,`item-${x}`,e.normalizeProps(e.mergeProps({key:0},s)),void 0,!0):e.unref(L)[`item-${x.toLowerCase()}`]?e.renderSlot(c.$slots,`item-${x.toLowerCase()}`,e.normalizeProps(e.mergeProps({key:1},s)),void 0,!0):x==="expand"?(e.openBlock(),e.createElementBlock("i",{key:2,class:e.normalizeClass(["expand-icon",{expanding:e.unref(Be).includes(oe.value+I)}])},null,2)):x==="checkbox"?(e.openBlock(),e.createBlock(Oe,{key:3,checked:s[x],onChange:Ae=>e.unref(Yt)(s)},null,8,["checked","onChange"])):e.unref(L).item?e.renderSlot(c.$slots,"item",e.normalizeProps(e.mergeProps({key:4},{column:x,item:s})),void 0,!0):(e.openBlock(),e.createElementBlock(e.Fragment,{key:5},[e.createTextVNode(e.toDisplayString(e.unref(bt)(x,s)),1)],64))],14,It))),128))],42,wt),ye.value&&e.unref(Be).includes(I+oe.value)?(e.openBlock(),e.createElementBlock("tr",{key:0,class:e.normalizeClass([{"even-row":(I+1)%2===0},typeof c.bodyExpandRowClassName=="string"?c.bodyExpandRowClassName:c.bodyExpandRowClassName(s,I+1)])},[e.createElementVNode("td",{colspan:e.unref(U).length,class:"expand"},[s.expandLoading?(e.openBlock(),e.createBlock(at,{key:0,class:"expand-loading"})):e.createCommentVNode("",!0),e.renderSlot(c.$slots,"expand",e.normalizeProps(e.guardReactiveProps(s)),void 0,!0)],8,Et)],2)):e.createCommentVNode("",!0)],64))),128)),e.renderSlot(c.$slots,"body-append",e.normalizeProps(e.guardReactiveProps({items:e.unref(G),pagination:{isFirstPage:e.unref(te),isLastPage:e.unref(ee),currentPaginationNumber:e.unref(z),maxPaginationNumber:e.unref(Z),nextPage:e.unref(ae),prevPage:e.unref(ne),updatePage:e.unref(re)},headers:e.unref(U)})),void 0,!0)],2)):e.createCommentVNode("",!0)],8,St),e.unref(k)?(e.openBlock(),e.createElementBlock("div",vt,[$t,e.createElementVNode("div",At,[Ht.value?e.renderSlot(c.$slots,"loading",{key:0},void 0,!0):(e.openBlock(),e.createBlock(Ze,{key:1}))])])):e.createCommentVNode("",!0),!e.unref(G).length&&!e.unref(k)?(e.openBlock(),e.createElementBlock("div",Vt,[e.renderSlot(c.$slots,"empty-message",{},()=>[e.createTextVNode(e.toDisplayString(c.emptyMessage),1)],!0)])):e.createCommentVNode("",!0)],2),c.hideFooter?e.createCommentVNode("",!0):(e.openBlock(),e.createElementBlock("div",Rt,[c.hideRowsPerPage?e.createCommentVNode("",!0):(e.openBlock(),e.createElementBlock("div",Lt,[e.createTextVNode(e.toDisplayString(c.rowsPerPageMessage)+" ",1),e.createVNode(Ke,{modelValue:e.unref(W),"onUpdate:modelValue":R[0]||(R[0]=s=>e.isRef(W)?W.value=s:null),"rows-items":e.unref(xe)},null,8,["modelValue","rows-items"])])),e.createElementVNode("div",Tt,e.toDisplayString(`${e.unref(Se)}\u2013${e.unref(Ne)}`)+" "+e.toDisplayString(e.unref(Q))+" "+e.toDisplayString(e.unref(ce)),1),Mt.value?e.renderSlot(c.$slots,"pagination",e.normalizeProps(e.mergeProps({key:1},{isFirstPage:e.unref(te),isLastPage:e.unref(ee),currentPaginationNumber:e.unref(z),maxPaginationNumber:e.unref(Z),nextPage:e.unref(ae),prevPage:e.unref(ne)})),void 0,!0):(e.openBlock(),e.createBlock(dt,{key:2,"is-first-page":e.unref(te),"is-last-page":e.unref(ee),onClickNextPage:e.unref(ae),onClickPrevPage:e.unref(ne)},e.createSlots({_:2},[c.buttonsPagination?{name:"buttonsPagination",fn:e.withCtx(()=>[e.createVNode(lt,{"current-pagination-number":e.unref(z),"max-pagination-number":e.unref(Z),onUpdatePage:e.unref(re)},null,8,["current-pagination-number","max-pagination-number","onUpdatePage"])]),key:"0"}:void 0]),1032,["is-first-page","is-last-page","onClickNextPage","onClickPrevPage"]))]))],2))}});var ge=M(Ft,[["__scopeId","data-v-32683533"]]);return typeof window!="undefined"&&window.Vue&&window.Vue.createApp({}).component("Vue3EasyDataTable",ge),ge});

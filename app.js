(function(){
var C=window.CONFIG,Q=C.questions.map(function(q){
  if(q.type==="days"){
    var o=[],excluded=C.excludedWeekdays||[];for(var i=1;i<=C.daysAhead;i++){var d=new Date();d.setDate(d.getDate()+i);if(excluded.indexOf(d.getDay())<0)o.push(d.toLocaleDateString("uk-UA",{weekday:"short",day:"numeric",month:"numeric"}))}
    q=Object.assign({},q,{multi:true,options:o.concat(q.extra||[])});
  }
  return q;
});
var A={},own={},step=-1,app=document.getElementById("app"),pb=document.getElementById("pb");
document.title=C.pageTitle;document.getElementById("foot").textContent=C.footer||"";
function el(h){var d=document.createElement("div");d.innerHTML=h;return d.firstElementChild}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function render(){
  pb.style.width=Math.max(0,Math.min(100,(step+1)/(Q.length+1)*100))+"%";app.innerHTML="";
  if(step<0){
    var I=C.intro;
    app.appendChild(el('<div class="card"><div class="emoji">'+I.emoji+'</div><h1>'+esc(I.title)+'</h1>'+I.text.map(function(t){return '<p>'+esc(t)+'</p>'}).join("")+'<div class="row"><button class="btn" id="go">'+esc(I.button)+'</button></div></div>'));
    document.getElementById("go").onclick=function(){step=0;render()};return;
  }
  if(step>=Q.length)return fin();
  var q=Q[step],card=el('<div class="card"><div class="emoji">'+q.emoji+'</div><h2>'+esc(q.title)+'</h2><p class="sub">'+esc(q.sub||"")+'</p><div class="chips" id="ch"></div><div class="row"><button class="btn ghost" id="bk">←</button><button class="btn" id="nx">Далі</button></div><p class="hint" id="hn"></p></div>');
  app.appendChild(card);
  var ch=card.querySelector("#ch"),nx=card.querySelector("#nx"),hn=card.querySelector("#hn");
  if(q.type==="text"){
    var ta=el('<textarea placeholder="Напиши тут...">'+esc(A[q.id]||"")+'</textarea>');
    ch.replaceWith(ta);nx.textContent="Готово";ta.oninput=function(){A[q.id]=ta.value};
  }else{
    var sel=A[q.id]||(q.multi?[]:null),ownBox=null;
    q.options.forEach(function(o){
      var b=el('<button class="chip" aria-pressed="false">'+esc(o)+'</button>');
      b.onclick=function(){
        if(q.multi){var i=sel.indexOf(o);i>-1?sel.splice(i,1):sel.push(o)}else{sel=(sel===o)?null:o}
        A[q.id]=sel;refresh();
      };
      ch.appendChild(b);
    });
    function refresh(){
      var chips=ch.querySelectorAll(".chip");
      q.options.forEach(function(o,i){chips[i].setAttribute("aria-pressed",(q.multi?sel.indexOf(o)>-1:sel===o)?"true":"false")});
      if(q.ownOption){
        var has=q.multi?sel.indexOf(q.ownOption)>-1:sel===q.ownOption;
        if(has&&!ownBox){ownBox=el('<input type="text" placeholder="'+esc(q.ownPlaceholder||"")+'">');ownBox.value=own[q.id]||"";ownBox.oninput=function(){own[q.id]=ownBox.value};ch.after(ownBox)}
        if(!has&&ownBox){ownBox.remove();ownBox=null}
      }
      var ok=q.multi?sel.length>0:!!sel;nx.disabled=!ok;hn.textContent=ok?"":"Обери хоча б один варіант";
    }
    refresh();
  }
  card.querySelector("#bk").onclick=function(){step--;render()};
  nx.onclick=function(){step++;render()};
}
function val(q){
  var v=A[q.id];if(!v||(Array.isArray(v)&&!v.length))return "";
  var arr=Array.isArray(v)?v:[v];
  return arr.map(function(x){return(q.ownOption&&x===q.ownOption&&own[q.id])?own[q.id]:x.replace(" ✍️","")}).join(", ");
}
function fin(){
  var F=C.finish,L=[C.messageGreeting,""];
  Q.forEach(function(q){if(q.type==="text")return;var v=val(q);if(v)L.push(q.label+": "+v)});
  var nq=Q.filter(function(q){return q.type==="text"})[0];
  if(nq&&A[nq.id]&&A[nq.id].trim())L.push("",nq.label+" "+A[nq.id].trim());
  var txt=L.join("\n");
  var card=el('<div class="card"><div class="emoji">'+F.emoji+'</div><h2>'+esc(F.title)+'</h2><p class="sub">'+esc(F.sub)+'</p><div class="chip out">'+esc(txt)+'</div><div class="row"><button class="btn ghost" id="bk">←</button><button class="btn" id="cp">'+esc(F.button)+'</button></div><p class="hint" id="hn"></p></div>');
  app.appendChild(card);
  card.querySelector("#bk").onclick=function(){step=Q.length-1;render()};
  var hn=card.querySelector("#hn");
  card.querySelector("#cp").onclick=function(){
    var shareUrl="https://t.me/share/url?text="+encodeURIComponent(txt);
    if(navigator.share){
      navigator.share({text:txt}).then(function(){hn.textContent="Перевір, що вибрала чат і надіслала відповіді."}).catch(function(e){
        if(e&&e.name==="AbortError"){hn.textContent="Надсилання скасовано. Відповіді не надіслано.";return}
        window.location.href=shareUrl;
      });
    }else{
      window.location.href=shareUrl;
    }
  };
}
render();
})();

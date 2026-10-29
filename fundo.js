/* Fundo diário: uma imagem por dia, escolhida pela data local. */
(function(){
  var IMAGENS=[];
  for(var i=1;i<=14;i++)IMAGENS.push('fundo-'+(i<10?'0':'')+i);
  /* Procura a imagem na pasta fundos/, na raiz e em variações de extensão. */
  var TENTATIVAS=['fundos/#.jpg','#.jpg','fundos/#.JPG','#.JPG','fundos/#.jpeg','#.jpeg'];

  var el=document.getElementById('bg');
  if(!el){el=document.createElement('div');el.id='bg';el.className='bg';el.setAttribute('aria-hidden','true');document.body.insertBefore(el,document.body.firstChild)}

  var atual=null;

  function indiceDoDia(){
    var d=new Date();
    var dias=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
    return dias%IMAGENS.length;
  }

  /* Mede o brilho médio da imagem e ajusta a película escura:
     imagens claras (ex.: ursos polares) recebem mais escurecimento. */
  function ajustarPelicula(img){
    var scrim=.5;
    try{
      var c=document.createElement('canvas');c.width=c.height=24;
      var x=c.getContext('2d');x.drawImage(img,0,0,24,24);
      var p=x.getImageData(0,0,24,24).data,s=0;
      for(var i=0;i<p.length;i+=4)s+=(p[i]*.299+p[i+1]*.587+p[i+2]*.114)/255;
      var lum=s/(p.length/4);
      scrim=Math.min(.74,Math.max(.42,.36+lum*.5));
    }catch(e){}
    el.style.setProperty('--scrim',scrim.toFixed(2));
  }

  function aplicar(){
    var src=IMAGENS[indiceDoDia()];
    if(src===atual)return;
    atual=src;
    var n=0;
    (function tentar(){
      if(n>=TENTATIVAS.length){
        el.classList.remove('on');
        if(window.console)console.warn('Fundo: imagem '+src+' não encontrada. Tentei: '+TENTATIVAS.map(function(t){return t.replace('#',src)}).join(', '));
        return;
      }
      var url=TENTATIVAS[n++].replace('#',src);
      var img=new Image();
      img.onload=function(){
        if(src!==atual)return;
        ajustarPelicula(img);
        el.style.backgroundImage='url("'+url+'")';
        el.classList.add('on');
      };
      img.onerror=tentar;
      img.src=url;
    })();
  }

  aplicar();
  /* Troca sozinho à meia-noite, mesmo com o app aberto. */
  setInterval(aplicar,60000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)aplicar()});
})();

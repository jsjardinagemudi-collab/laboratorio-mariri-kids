// Mantém nomes novos por versão, evitando reutilizar CSS/JS antigos no navegador.
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
for(const [from,to] of [['styles.css','styles-v3-2.css'],...['content','engine','app'].map(n=>['js/'+n+'.js','js/'+n+'-v3-2.js'])])fs.copyFileSync(path.join(root,from),path.join(root,to));

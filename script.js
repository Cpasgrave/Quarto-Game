/* TODO

- off pawns shouldn't be reacting to click 
- add AI
- add difficulty levels and different groups selectable in settings
- fill the settings pannel
      -> sound volume - nice slider
      -> rules level
      -> AI level
      -> music on/off
      -> snd eff on/off
- keep the fly in the game, it will sit sometimes, have a sound, move if it's hovered or clicked, sit on the last played pawn sometimes, etc.

*/

/* Debug
- pawn should not go into box when ai wins
- problem with diagonal 1 too high (got it once)
*/

const $i      = a=>document.getElementById(a),
      $c      = a=>Array.from(document.getElementsByClassName(a)),
      $c2     = (a,b)=>Array.from(document.getElementsByClassName(a+" "+b)),
      all_eq  = a=>{x=a[0];if(x===0){return 0};for(var el of a){if(el!==x){return 0}}return 1;},
      col     = (arr,ix)=>arr.filter(function(el,j){return j%4==ix;}),
      diag    = (arr,ix)=>arr.filter(function(el,j){return[[0,5,10,15],[3,6,9,12]][ix].includes(j);}),
      listen  = (el,type,func)=>el.addEventListener(type,func),
      deaf    = (el,type,func)=>el.removeEventListener(type,func),
      type    = o=>log(typeof(o)),
      log     = s=>console.log(s),
      olog    = o=>log(JSON.stringify(o));
      vh      = (v)=>{var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                      return (v*h) / 100;},
      vw      = (v)=>{var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                      return (v*w) / 100;},
      vmin    = (v)=>Math.min(vh(v), vw(v)),
      vmax    = (v)=>Math.max(vh(v), vw(v)),
      Ssub    = (a,b)=>new Set([...a].filter(x => !b.has(x))),
      Sint    = (a,b)=> new Set([...a].filter(x => b.has(x))),
      Suni    = (a,b)=> new Set([...a, ...b]),
      sort_A  = (arr)=>arr.sort((a,b)=>{return +a - +b}),
      sort2dAi= (arr,i)=>arr.sort((a,b)=>{return +a[i] - +b[i]}),
      {abs, random, sign, max, min, pow, sqrt, cos, PI} = Math;


// lOADER ANIMATION SCRIPT
loader=()=>{
    const fly=$i("fly"),
          container=$i("container"),
          blacks=$c("black"),
          whites=$c("white"),
          fbox=fly.getBoundingClientRect(),
          cbox=container.getBoundingClientRect(),
          fly_max=(cbox.right-cbox.left)*1.8;

    function blink(lid){
      setTimeout(function(){
        lid.style.animation = "blink 0.7s";
        lid.style.animationIterationCount = "1";
      },100);
      lid.style.animation = "";lid.style.animationIterationCount = "";}

    const fcx=(fbox.right-fbox.left)/2,
          fcy=(fbox.bottom-fbox.top)/2,
          ccx=(cbox.right-cbox.left)/2,
          ccy=(cbox.bottom-cbox.top)/2;
    var fly_vect = [0,0],
        [fx,fy] = [ccx-fcx,ccy-fcy],
        bbox = blacks[0].getBoundingClientRect(),
        [bbl,bbr,bbt,bbb] = [bbox.left, bbox.right, bbox.top, bbox.bottom],
        [bbw,bbh] = [bbr-bbl, bbb-bbt];
    const loop=(T)=>{
        let wh=window.innerHeight,ww=window.innerWidth,[dx,dy]=[fx+fcx-ccx,fy+fcy-ccy];
        let rx=8*random()-4;
        let ry=8*random()-4;
        fly_vect[0] += rx;
        fly_vect[1] += ry;
        fly_vect[0]=sign(fly_vect[0])===sign(dx) ? fly_vect[0]*sqrt((fly_max-abs(dx))/fly_max): fly_vect[0];
        fly_vect[1]=sign(fly_vect[1])===sign(dy) ? fly_vect[1]*sqrt((fly_max-abs(dy))/fly_max): fly_vect[1];
        fx=max(min(fx+fly_vect[0],fly_max),-fly_max);fy = max(min(fy+fly_vect[1],fly_max),-fly_max);
        fly.style.left = fx+"px";
        fly.style.top  = fy+"px";
        let [fposx,fposy] = [fx+fcx, fy+fcy];
        for(let b of blacks){
            let box = b.getBoundingClientRect(),
                [bl,br,bt,bb]=[box.left, box.right, box.top, box.bottom],
                [xdiff,ydiff]=[fposx-bl+cbox.left, fposy-bt+cbox.top];
            b.style.left = bbw/2+xdiff/8-10+"px";
            b.style.top  = bbh/2+ydiff/8-10+"px";}

        let [e1,e2,e3,e4] = [random(), random(), random(), random()];
        for (let i=0;i<4;i++){
            let e = [e1,e2,e3,e4][i];
            if (e<0.5&&e>0.495) {blink(whites[i]);}}};
    var intervals = setInterval(loop,18);
}
var waaaait=()=>{if($i("eye4")){loader();}
    else{window.setTimeout(waaaait,50);}}
// just wait for the loader parts to be loaded before animating it
waaaait()


function main(intervals){

  // Preparing Audio:

  // loading audio files
  const cors = "https://cors-anywhere.herokuapp.com/";
  audio_elements = {
  "piece_drop": [cors+"https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-two/impact_wood_pole_hit_wood_003.mp3",
                 null], // buffer
  "piece_box" : [cors+"https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-35448/zapsplat_foley_footstep_single_work_boot_on_loose_wood_boards_temp_018_35625.mp3",
                 null],

  "opening"   : ["https://drive.google.com/file/d/1rwmbodSo5h40L5gD5LsiXi2jDEl3L0g7/preview",null],
  // "gameover"  : ["",null],
  }

  function playSound(buffer, time, loop) {
      var source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      source.loop = loop;
      source.start(time);
  }

  var audioCtx, analyser;
  audio_init = ()=>{
      try {
          window.audioCtx = window.AudioContext|| window.webkitAudioContext;
          audioCtx = new AudioContext();
          analyser = audioCtx.createAnalyser();
          }
      catch(e) {alert("Web Audio API is not supported in this browser");}

      load_sound = (sound_name)=>{
          let sound = audio_elements[sound_name];
          let request = new XMLHttpRequest();
          let url = sound[0];
          request.open('GET', url, true);
          request.responseType = 'arraybuffer';
          request.send();
          request.onload = ()=>{
              audioCtx.decodeAudioData(
                  request.response,
                  // the presence of data in the sound dict will be the info taken
                  // in the code, to allow playing it.
                  (buffer)=>{sound[1] = buffer;}, 
                  function(e){"Error with decoding audio data" + e.err},
              );
          };
      }
      // loading the list of sounds from audio_elements
      let sounds_names = Object.keys(audio_elements);
      for (let sound_name of sounds_names){load_sound(sound_name);}
  }

  // loader fade out
  const loader=$i("loader");
  loader_fade=()=>{
    let val = 1-ct*(1/25);
    loader.style.opacity=val;
    if(ct==26){
      loader.style.display="none";
      window.clearInterval(intervals);
      window.clearInterval(fade_anim);}}
  let ct=0,fade_anim=window.setInterval(()=>loader_fade(ct++),25);
  
  // troops
  var cells    = $c("cell"),
      blurs    = $c("blur"),
      pawns    = $c("pawn"),
      td       = $c("td"),
      board_table= $i("board_table"),
      title    = $i("title"),
      chosen   = $i("chosen_spot"),
      pawn_box = $i("pawn_box"),
      play_again=$i("play_again"),
      pawnset  = $i("pawnset"),
      overlay  = $i("overlay"),
      G12P     = $i("G12P"),
      G1P      = $i("G1P"),
      G2P      = $i("G2P"),
      rul_b    = $i("rules_button"),
      set_b    = $i("settings_button"),
      settings = $i("settings"),
      rules    = $i("rules"),
      newGame  = $i("nGbox"),
      winline  = $i("winline"),
      message  = $i("message"),
      message2 = $i("message2"),
      body     = $i("body");

  
  var tell = (e)=>{message2.innerHTML=e},
      otell= (o)=>{message.innerHTML=JSON.stringify(o)};

  // text formating - responsive
  text_resize = ()=>{
      let w = vw(100);
      let h = vh(100);
      if (w>h/1.1){
          rules.style.columnCount = 2;
          rules.style.fontSize = 3.3+"vh";}
      else{
          rules.style.columnCount = 1;
          rules.style.fontSize = (3.3*h/w)+"vmin";}
    }
  text_resize();
  window.addEventListener('resize', text_resize);

  // FIRST LISTENERS - THE GAME STARTS HERE
  listen(G12P, "click", ()=>{audio_init()});
  listen(G1P, "click", ()=>{game1P()});
  listen(G2P, "click", ()=>{game2P()});
  listen(rul_b, "click", ()=>{pop_open(rules)});
  listen(set_b, "click", ()=>{pop_open(settings)});
  listen(rules, "click", ()=>{close(rules)});
  listen(settings, "click", ()=>{close(settings)});

  // resetting the board and pawns to initial position
  function setup(){
    while (pawnset.firstChild){pawnset.removeChild(pawnset.firstChild);}
    color      = new Array(16).fill(0),
    size       = new Array(16).fill(0),
    hole       = new Array(16).fill(0),
    shape      = new Array(16).fill(0),
    boards     = [color,size,hole,shape];
    for (let p of pawns){
        p.classList.remove("onboard");
        p.classList.add("off");
        pawnset.appendChild(p);}
    for (let c of td){c.classList.add("free");}
    winline.style.display = "none";
    winline.style.top = "6vmin";
    winline.style.left = "0.5vmin";
    winline.style.width = "50vmin";
    winline.style.transform = "";
    play_again.style.display = "none";
    tell("");
  }
  
  // here what happens when there's a win
  function game_over(winner,check){
      let type  = ["color","size","hole","shape"][check[2]];
      let who   = ["","Player 1",P2=="AI"?"AI":"Player 2"][winner]
      let where = check[0]+check[1];
      // placing the red line:
      switch (check[0]){
          case "row":
              winline.style.top = (6+13*check[1])+"vmin";
              break;
          case "col":
              winline.style.transform = "rotate(90deg)";
              winline.style.left = (-18.3+12.5*check[1])+"vmin";
              winline.style.top = 25.7+"vmin";
              break;
          case "diag":
              let rot = check[1]===0 ? 46: -46;
              winline.style.transform = "rotate("+rot+"deg)";
              winline.style.width = "60vmin";
              winline.style.top = "25.7vmin";
              winline.style.left = "-5vmin";
              break;
      }
      tell(who+" won !");

      let sound = audio_elements["gameover"];
      if (sound[1]!==null){playSound(sound[1],0,false)};


      message.style.animation = "game_over 1s infinite";
      winline.style.display = "block";
      play_again.style.display = "block";
      listen(play_again,"click",()=>pop_open(newGame));
  }

  // closing any pop-up window (el) and removing the overlay+blur
  function close(el){
      el.style.display = "none";
      overlay.style.display = "none";
      for (var b of blurs){b.style.filter = "none";}
  }

  function reduce_title(){
      title.style.animation = "title_reduce 0.7s forwards";
      chosen.style.animation = "appear 0.8s forwards";
  }
  
  // depending on the level, checks if there's a win
  function check_boards(){
      // level 1
      // olog(boards);

      for (let i=0;i<4;i++){          
          let check = check_board(boards[i]);
          if(check!==0){
              check.push(i);
              game_over(turn,check);
              return 1
          }
      }
      
      function check_board(b){
          for(let j=0;j<4;j++){
              if (all_eq(b.slice(j*4,(j+1)*4))){
                  return ["row",j]}               //rows
              if (all_eq(col(b,j))){
                  return ["col",j]}
          }                               //columns
          for(let j=0;j<2;j++){
              if (all_eq(diag(b,j))){
                  return ["diag",j]}
          }                               // diagonals     
          if (level>1){
            // higher levels, to be added ...
          }
          return 0;
      }
      return 0;
  }
  
  // place the chosen pawn to the table cell with index r,c
  function place(pawn,r,c,f=()=>{}){

    let dest = board_table.rows[r].cells[c].firstChild;
    let after = ()=>{
        board_table.rows[r].cells[c].classList.remove("free");
        cl = pawn.classList;
        let idx = r*4+c;
        color[idx]  = cl.contains("gre") ? 1 : 2;
        size[idx]   = cl.contains("sim") ? 1 : 2;
        hole[idx]   = cl.contains("ful") ? 1 : 2;
        shape[idx]  = cl.contains("squ") ? 1 : 2;
        if (check_boards()===0){
            // condition for AI to continue playing.
            f()}
        }
    move(pawn,dest,after);
  }

  // when pawn from the pawnset is clicked
  function select(){
    listen(chosen,"click",choose);
    for (let off of $c("off")){
        listen(off,"click",deselect);
        if (off!==this){ off.classList.add("notselected");}
        else {           off.classList.add("selected");}
    }
  }
  
  // Cancelling the selection
  function deselect(){
    deaf(chosen,"click",choose);
    for(let off of $c("off")){
        deaf(off,'click',deselect);
        off.classList.remove("selected");
        off.classList.remove("notselected");
        listen(off,"click",select);
    }
  }
  
  function move(pawn,destination,after){
      let rect_p = pawn.getBoundingClientRect();
      let [xp,yp] = [rect_p.left, rect_p.top];
      let rect_c = destination.getBoundingClientRect();
      let [xc,yc] = [rect_c.left, rect_c.top];
      var [dx,dy] = [xc-xp, yc-yp];
      var count = 0;
      var inter = 22;
      let shut = document.createElement("div");
      shut.classList.add("shuttle");
      shut.style.left = xp+"px"; 
      shut.style.top  = yp+"px";
      body.appendChild(shut);
      shut.appendChild(pawn);
      function move_anim(){
          count += 1;
          inter = count<=10 ? inter-3 : inter+3 ;
          if (count<21){
              shut.style.left = xp+(dx*(-cos(count*PI/20)+1)/2)+"px";
              shut.style.top = yp+(dy*(-cos(count*PI/20)+1)/2)+"px";};
          if (count==18){
              // if the sound is loaded, it will be played
              let sound = destination==pawn_box ? audio_elements["piece_box"]: audio_elements["piece_drop"];
              if (sound[1]!==null){playSound(sound[1],0,false)}
          }
          if (count===30){
              window.clearInterval(anim_id);
              destination.appendChild(pawn);
              shut.parentNode.removeChild(shut);
              after();
          };
      }
      var anim_id = window.setInterval(move_anim,inter);
  }

  // when the "chosen spot" is clicked after a pawn has been selected
  function choose(){

      sel = $c("selected");
      if ($c("selected").length===1){
          deaf(chosen,"click",choose);
          let selected_pawn = sel[0];
          for (let off of $c("off")){
              off.classList.remove("selected");
              off.classList.remove("notselected");
              deaf(off,"click",deselect);
              deaf(off,"click",select);
          }
          selected_pawn.classList.remove("off");

          function after(){
              turn = 2;
              if (P2=="AI"){ AIplay(selected_pawn);
              } else {       Pplay();}
          }
          move(selected_pawn,pawn_box,after);
      }
      else return
  }
  
  function cell_confirm(){
      this.classList.remove("selcell");
      r = this.parentNode.rowIndex;
      c = this.cellIndex;
      let pawn = pawn_box.firstChild;
      for (let f of $c("free")){
          deaf(f,"click",cell_desel);
          deaf(f,"click",cell_confirm);
      }
      for (let off of $c("off")){
          listen(off,"click",select);
      }
      place(pawn,r,c);
  }

  function cell_desel(){
      for (let f of $c("free")){
          f.classList.remove("selcell");
          deaf(f,"click",cell_desel);
          deaf(f,"click",cell_confirm);
          listen(f,"click",cell_presel);
      }
  }

  function cell_presel(){
      for (let f of $c("free")){
          deaf(f,"click",cell_presel);
          if (f===this){
              f.classList.add("selcell");
              listen(f,"click",cell_confirm);
          }
          else {
              listen(f,"click",cell_desel);
          }
      }
  }

  function Pplay(){
      for (let f of $c("free")){
          listen(f,"click",cell_presel)
      }
  }

  ////////////////
  // AI is HERE //
  ////////////////

  const indices = {
      "lin" :[[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]],
      "col" :[[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]],
      "diag":[[0,5,10,15],[3,6,9,12]]
  }
  const properties = {
      0:{1:"gre",2:"ora"},
      1:{1:"sim",2:"dou"},
      2:{1:"ful",2:"hol"},
      3:{1:"squ",2:"cir"},
  }
//  couting the partial lines of 3 pawns sharing a property
  function score_boards(B,playable){
      let score = [];
      let playable_set = new Set(playable);
      let three = "";

      if (check_boards(B)===1){return [100,playable_set];};

      for(let group of groups){ // groups = "lin","col","diag"
          for(let i=0;i<4;i++){
              let board = B[i];
              // group
              for(let j=0;j<group_len[group];j++){
                  // check if group has 3 pawns of same property + 1 empty cell

                  // selecting the group
                  let a,b,c,d;
                  [a,b,c,d] = indices[group][j]
                  let line = [board[a],board[b],board[c],board[d]]

                  // counting elements
                  var  count = {};
                  let ct = line.forEach(function(i){count[i] = (count[i]||0) + 1;});
                  for (let val of ['1','2']){
                      if (count["0"]===1 && count[val]===3){
                          three = properties[i][1];
                          let s = new Set($c(three));
                          playable_set = Sint(playable_set,s);
                      }
                  }
              }
          }
      }
      let ps = playable_set.size;
      score = ps%2===0 ? -ps*5 : ps*5;

      log(score)

      return [score,playable_set];
  }


  function explore_cellchoice(pawn, depth){

      let Freecells = $c("free");
      let Current_boards = boards.map(x=>x.slice());
      let playable = $c("off");
      let positions = [];

      for(let round=0;round<depth;round++){
          
          // AI chooses a cell where to play
          for(let i=0;i<Freecells.length;i++){
              // current cell
              let H_cell = Freecells[i];
              // new copy of the current board, H for hypothetic
              let H_boards = Current_boards.map(x=>x.slice());

              // simulate pawn placement:
              let r,c;
              r = H_cell.parentNode.rowIndex;
              c = H_cell.cellIndex;
              cl = pawn.classList;
              let idx = r*4+c;
              H_boards[0][idx] = cl.contains("gre") ? 1 : 2;
              H_boards[1][idx] = cl.contains("sim") ? 1 : 2;
              H_boards[2][idx] = cl.contains("ful") ? 1 : 2;
              H_boards[3][idx] = cl.contains("squ") ? 1 : 2;





              /// PROBLEME DE BOUCLE SANS FIN ICI ET AVEC SCORE BOARDS


              let score = [100,playable];
              log("here "+Freecells.length)
              score = score_boards(H_boards,playable);

              // if direct win is possible:
              if(round===0 && score[0]===100){return [r,c]};






              positions.push([score[0],r,c]);
          }
      }

    // if many cells have the same score, randomise the choice:
    positions = sort2dAi(positions,0);
    let maxscore = positions[0][0];
    for (i=0;i<positions.length;i++){if (positions[i][0]<maxscore){positions=positions.slice(0,i);break;}}
    let idx = Math.floor(Math.random()*positions.length);

    return [positions[idx][1],positions[idx][2]];
  }

  function explore_pawnchoice(depth){

      let Hplayable = new Set($c("off"));
      let score;
      [score,Hplayable] = score_boards(boards,Hplayable);
      let Hfreecells = new Set($c("free"));
      let Hboards = boards.slice();

      for(let round=0;round<depth;round++){

          // First: AI chooses the pawn + player plays it

          // parsing available pawns (none allowing a win)
          for (let i=0;i<Hplayable.size;i++){

              // hypothetic pawn
              let Hpawn = Array.from(Hplayable)[i];
              let Hplayable = Ssub(Hplayable,Hpawn);

              // parsing all the free cells
              for (let j=0;j<Hfreecells.size;j++){

                  // hypothetic cell
                  let Hcell = Array.from(Hfreecells)[j];
                  let Hfreecells = Ssub(Hfreecells,Hcell);
                  
                  // simulate pawn placement:   //////////////////////////// This can be generalised as a function
                  [r,c] = Hcell.parentNode.rowIndex,Hcell.cellIndex;
                  cl = Hpawn.classList;
                  let idx = r*4+c;
                  Hboards[0][idx] = cl.contains("gre") ? 1 : 2;
                  Hboards[1][idx] = cl.contains("sim") ? 1 : 2;
                  Hboards[2][idx] = cl.contains("ful") ? 1 : 2;
                  Hboards[3][idx] = cl.contains("squ") ? 1 : 2;

                  // /////////////////////////////////////////////////Here think what to do from it
                  let sc,pl;
                  [sc,pl] = score_boards(Hboards,Hplayable);

              }
          }

          // Next: player chooses the pawn + AI plays it

      }

      return chosen
  }

  function AIchoose(){
      

      // let depth = 1;
      // chosen = explore_pawnchoice(depth)

      // RANDOM
      let offs = $c("off");
      let idx = Math.floor(Math.random()*offs.length);
      let chosen = offs[idx];

      chosen.classList.remove("off");
      let after = ()=>{
          turn = 1;
          Pplay();
      }
      move(chosen,pawn_box,after)
  }

  function AIplay(pawn){
      // RANDOM
      // free = []
      // for (let f of $c("free")){
      //     olog(f);
      //     free.push([f.parentNode.rowIndex,f.cellIndex]);
      // }
      // let idx = Math.floor(Math.random()*free.length);
      // let r = free[idx][0];
      // let c = free[idx][1];

      let depth = 1;

      let [r,c] = explore_cellchoice(pawn, depth);

      place(pawn,r,c,AIchoose);
  }
  
/*--------------------
----1 PLAYER GAME-----
--------------------*/
  function game1P(){
      
      setup();
      close(newGame);
      reduce_title();

      turn = turn||1+(Math.random()>=0.5);

      P2 = "AI";
      turn = 1; //// Temporary

      // opening sound
      let sound = audio_elements["opening"];
      if (sound[1]!==null){playSound(sound[1],0,false)};

      //player 1 to play
      if (turn===1) {
        for (let off of $c("off")){
          listen(off,"click",select)}
      }
      // AI to play
      else { AIchoose() }
  }

/*--------------------
----2 PLAYER GAME-----
--------------------*/
  function game2P(){

    setup();
    close(newGame);
    reduce_title();
    P2 = "P2"
    turn = 1;

    // opening sound
    let sound = audio_elements["opening"];
    if (sound[1]!==null){playSound(sound[1],0,false)};

    for (let off of $c("off")){
          listen(off,"click",select)}
  }
  
  function pop_open(el,cross){
    overlay.style.display = "block";
    for(var b of blurs){b.style.filter="grayscale(25%) blur(0.35vw)";}
    el.style.display = "block";
  }

} /// END of MAIN

var turn       = 0, // 0=random 1=player1  2=AI/player2
    P2         = "", // "AI" or "P2"
    color      = new Array(16).fill(0), // "gre"=1 "ora"=2
    size       = new Array(16).fill(0), // "sim"=1 "dou"=2
    hole       = new Array(16).fill(0), // "ful"=1 "hol"=2
    shape      = new Array(16).fill(0), // "squ"=1 "cir"=2
    boards     = [color,size,hole,shape],
    groups     = ["lin","col","diag"],
    group_len   = {'lin':4,'col':4,'diag':2},
    level      = 1; // 1,2,3,4

window.onload = main;

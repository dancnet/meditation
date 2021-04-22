class fadingLoopSound {
   // Pour le constructeur et pour le setSound, il faut donner le link vers un fichier de son.
   // Quand le temps est demandé, c'est le temps par boucle en millisécondes.
   // Ça prends 10 boucles pour passer du mute au volume au max et vice versa.
   // Pour le preview, il faut aussi donner le nombre de boucles où le son va rester au max. Minimum une boucle.
   interval = null;
   sound = null;
   stopInterval() {
      if (this.interval !== null) {
         clearInterval(this.interval);
         this.interval = null;
      }
   }
   loop() { // c'est plus smooth que loop: true.
      this.sound.addEventListener('timeupdate', function() {
         if (this.currentTime > this.duration - 0.5)
            this.currentTime = 0;
      });
   }
   constructor(sound) {
      this.sound = new Audio(sound);
      this.loop();
   }
   play(time) {
      this.stopInterval();
      if (this.sound.paused)
         this.sound.volume = 0;
      this.sound.play();
      this.interval = setInterval(function() {
         if (this.sound.volume < 1)
            this.sound.volume = (this.sound.volume + 0.1).toFixed(1);
         else
            this.stopInterval();
      }.bind(this), time);
   }
   pause(time) {
      this.stopInterval();
      this.interval = setInterval(function() {
         if (this.sound.volume > 0)
            this.sound.volume = (this.sound.volume - 0.1).toFixed(1);
         else {
            this.sound.pause();
            this.stopInterval();
         }
      }.bind(this), time);
   }
   preview(time,loops) {
      if (loops <= 0)
         loops = 1;
      this.stopInterval();
      this.sound.pause();
      this.sound.volume = 0;
      this.sound.play();
      this.interval = setInterval(function() {
         if (loops > 0 && this.sound.volume < 1)
            this.sound.volume = (this.sound.volume + 0.1).toFixed(1);
         else if(loops > 0 && this.sound.volume === 1)
            loops--;
         else if(loops === 0 && this.sound.volume > 0)
            this.sound.volume = (this.sound.volume - 0.1).toFixed(1);
         else {
            this.sound.pause();
            this.sound.currentTime = 0;
            this.stopInterval();
         }
      }.bind(this), time);
   }
   setSound(sound) {
      this.stopInterval();
      this.sound.pause();
      this.sound = new Audio(sound);
      this.loop();
   }
}

function setIntervalN(f,t,n,f2) {
   /* f: fonction à exécuter;
    * t: temps entre chaque exécution;
    * n: nombre de répétitions;
    * f2: fonction optionnelle à exécuter toute de suite après la dernière répétition;
   */ 
   var id=setInterval(function() {
      f();
      n--;
      if (n <= 0) {
         clearInterval(id);
         if (typeof f2 == 'function')
            f2();
      }
   },t);
   return id;
}

function $(query) { // manipulation plus simple du dom.
   return document.querySelectorAll(query);
}

var app = new Vue({
   el: '#app',
   data: {
      minutes: 30,
      progress: 0,
      meditate: false,
      theme: null,
      bgSound: null,
      bell: new Audio('assets/sounds/bell.ogg'),
      themes: [
         { name: 'Nature', sound: 'nature.ogg', image: 'nature.jpg', color: '#008080' },
         { name: 'Univers', sound: 'universe.ogg', image: 'universe.jpg', color: '#7fdbff' },
         { name: 'Starbucks', sound: 'starbucks.ogg', image: 'starbucks.jpg', color: '#808080' }
      ],
   },
   computed: {
      grayscale: function() {
         if (this.meditate)
            return 100-this.progress;
         else
            return 0;
      },
      brightness: function() {
         if (this.meditate)
            return this.progress;
         else
            return 100;
      }
   },
   methods: {
      startMeditation: function() {
         if (this.$refs.minutes.checkValidity()) {
            this.meditate = true;
            this.bell.play();
            this.bgSound.play(150);
            // On execute progress++ 100 fois à un interval de 1% de la durée de la séance exprimé en millisecondes. Quand le progress arrive à 100 la séance est fini alors on arrête le son.
            setIntervalN(
               function() {
                  this.progress++;
                  if (this.progress == 50)
                     this.bell.play();
               }.bind(this),
               this.minutes*600,
               100,
               function() {
                  this.bell.play();
                  this.bgSound.pause(150);
               }.bind(this)
            );
         }
      },
      loadTheme: function(theme, preview=false) {
         this.theme=theme.name;
         // CSS
         $('#background')[0].style.backgroundImage=`url('assets/images/${theme.image}')`;
         $('#med,input,button,select').forEach(function(el) {
            el.style.color = theme.color;
            el.style.borderColor = theme.color;
         });
         $('input,button,select').forEach(function(el) {
            el.onmouseover = function() {
               this.style.backgroundColor = theme.color+'4c';
            };
            el.onmouseout = function() {
               this.style.backgroundColor = '';
            };
         });
         $('#progress')[0].style.backgroundColor = theme.color;
         $('hr').forEach(function(el) {
            el.style.borderColor = theme.color;
         });
         // Son
         if (this.bgSound === null)
            this.bgSound = new fadingLoopSound('assets/sounds/' + theme.sound);
         else
            this.bgSound.setSound('assets/sounds/' + theme.sound);
         if (preview) 
            this.bgSound.preview(150,15);
      }
   },
   mounted: function() {
      // Au démarrage on doit appliquer un thème.
      this.loadTheme(this.themes[0]);
   },
   watch: {
      theme: function(newTheme,oldTheme) {
         // Chaque fois que l'utilisateur change le thème dans la liste on l'applique.
         if(oldTheme !== null) {
            let theme = this.themes.find(function(t) {
               return t.name === newTheme;
            });
            this.loadTheme(theme, true);
         }
      }
   }
});

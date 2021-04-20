function loadBgSound(file) {
   var sound = new Audio('assets/sounds/' + file);
   sound.loop = true;
   return sound;
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

var app = new Vue({
   el: '#app',
   data: {
      minutes: 30,
      progress: 0,
      meditate: false,
      bgSound: loadBgSound('celestial.ogg'),
      bell: new Audio('assets/sounds/bell.ogg')
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
            this.bgSound.play();
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
                  this.bgSound.pause();
                  this.bell.play();
               }.bind(this)
            );
         }
      }
   }
});

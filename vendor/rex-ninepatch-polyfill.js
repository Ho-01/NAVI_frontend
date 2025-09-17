
// Lightweight rexNinePatch polyfill (temporary).
// Registers scene.add.rexNinePatch returning a stretched Image.
(function(){
  function registerFactory(){
    if (window.Phaser && Phaser.GameObjects && Phaser.GameObjects.GameObjectFactory) {
      if (!Phaser.GameObjects.GameObjectFactory.hasOwnProperty('rexNinePatch')) {
        Phaser.GameObjects.GameObjectFactory.register('rexNinePatch', function (x, y, width, height, key) {
          const img = this.displayList.add(new Phaser.GameObjects.Image(this.scene, x, y, key));
          img.setOrigin(0.5).setDisplaySize(width, height);
          return img;
        });
      }
    }
  }
  class RexNinePatchPolyfill extends Phaser.Plugins.BasePlugin { start(){ registerFactory(); } }
  window.rexNinePatchPlugin = RexNinePatchPolyfill;
  registerFactory();
})();

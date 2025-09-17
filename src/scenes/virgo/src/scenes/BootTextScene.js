export default class BootTextScene extends Phaser.Scene {
  constructor() { super('BOOT_TEXT'); }
  preload() {
    // rex ninepatch plugin: 전역 시작(true)
    this.load.plugin(
      'rexninepatchplugin',
      'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.80.16/dist/rexninepatchplugin.min.js',
      true
    );
    // 필요한 공통 리소스가 있으면 여기서 load.image(...) 등 추가
  }
  create() {
    // 부트 끝. 해시 있으면 우선 이동, 없으면 Q01으로.
    if (location.hash) {
      const key = location.hash.slice(1);
      if (window.go) window.go(key);
    } else {
      if (window.go) window.go('Q01');
    }
  }
}
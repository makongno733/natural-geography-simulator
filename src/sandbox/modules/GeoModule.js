export class GeoModule {
  constructor(config) {
    this.id = config.id
    this.name = config.name
    this.icon = config.icon
    this.knowledge = config.knowledge || []
    this._onActivate = config.onActivate || (() => {})
    this._onDeactivate = config.onDeactivate || (() => {})
  }

  onActivate(engine) { this._onActivate(engine) }
  onDeactivate(engine) { this._onDeactivate(engine) }
}

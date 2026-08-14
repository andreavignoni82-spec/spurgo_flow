# Fleet feature

Autonomous v7 Mezzi module. The feature owns only the `#flotta` route container and implements
list, search, create, edit and conditional delete through `VehiclesRepository`. Its pure model
preserves the v6.1.21 vehicle fields, while mutations publish stable `{ id }` EventBus payloads.

Placeholder for the future independently migrated feature.

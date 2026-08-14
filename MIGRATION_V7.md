# Spurgo Flow 7 migration plan

Migrate and test exactly one independently deployable module at a time while the v6.1.21-R1 application remains available. For every step: define/validate shared contracts, implement repositories, mount behind `FeatureBoundary`, test isolation and parity, then remove only that module's legacy-global access.

1. Dashboard
2. Clienti
3. Mezzi
4. Operatori/Squadre
5. Interventi
6. Agenda
7. Control Room
8. Messaggi
9. Rapportini
10. Operatore
11. Statistiche

A step is complete only after its contract, unit, architectural, integration, error-isolation, and v6 regression tests pass. No module may import another feature or Firebase directly. Maps and planning are optional services: failure must degrade only the dependent enhancement, never manual intervention workflows.

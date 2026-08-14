# Auth architecture

`AuthService` è l'unica porta applicativa verso l'adapter Auth. Normalizza lo username operatore e non salva password nei record `Operator`. L'adapter Firebase è attivabile soltanto con emulator autorizzato. I ruoli supportati sono `office` e `operator`; il routing applicativo deve utilizzare l'identità sottoscritta, mentre la modalità memory resta una sessione office locale per sviluppo.

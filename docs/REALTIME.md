# Realtime

`RealtimePort` appartiene all'infrastruttura e le feature non importano Firebase né `onSnapshot`. Le snapshot provocano refresh read-side, mai scritture. Le subscription hanno cleanup nel lifecycle. Un form dirty mantiene lo stato locale e segnala “Sono disponibili aggiornamenti dal server”. Gli echi locali dei rapportini non aggiungono nuovamente foto già identificate.

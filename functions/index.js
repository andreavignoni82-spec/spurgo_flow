import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

initializeApp();

export const deleteOperator = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Accesso richiesto.');
  const uid = String(request.data?.uid ?? '').trim();
  if (!uid) throw new HttpsError('invalid-argument', 'UID operatore obbligatorio.');
  if (uid === request.auth.uid) throw new HttpsError('failed-precondition', 'Non puoi eliminare il tuo stesso account.');

  const db = getFirestore();
  const callerSnap = await db.doc(`profiles/${request.auth.uid}`).get();
  const caller = callerSnap.data();
  if (!callerSnap.exists || caller?.role !== 'office' || caller?.active === false) {
    throw new HttpsError('permission-denied', 'Operazione consentita solo all’ufficio.');
  }

  const targetProfileRef = db.doc(`profiles/${uid}`);
  const targetProfileSnap = await targetProfileRef.get();
  const targetProfile = targetProfileSnap.data();
  if (targetProfileSnap.exists && targetProfile?.role !== 'operator') {
    throw new HttpsError('failed-precondition', 'L’account selezionato non è un operatore.');
  }

  const operatorIds = new Set([uid]);
  const directOperatorRef = db.doc(`operators/${uid}`);
  if ((await directOperatorRef.get()).exists) operatorIds.add(uid);
  const byCloudUid = await db.collection('operators').where('cloudUid', '==', uid).get();
  byCloudUid.forEach(doc => operatorIds.add(doc.id));

  try {
    await getAuth().deleteUser(uid);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      console.error('deleteOperator auth deletion failed', { uid, error });
      throw new HttpsError('internal', 'Impossibile eliminare l’account Firebase Authentication.');
    }
  }

  const batch = db.batch();
  batch.delete(targetProfileRef);
  for (const operatorId of operatorIds) batch.delete(db.doc(`operators/${operatorId}`));

  const touchedTeams = new Set();
  for (const operatorId of operatorIds) {
    const teams = await db.collection('teams').where('operatorIds', 'array-contains', operatorId).get();
    teams.forEach(teamDoc => {
      if (touchedTeams.has(teamDoc.id)) return;
      touchedTeams.add(teamDoc.id);
      const current = Array.isArray(teamDoc.data().operatorIds) ? teamDoc.data().operatorIds : [];
      const cleaned = current.filter(id => !operatorIds.has(String(id)));
      batch.update(teamDoc.ref, { operatorIds: cleaned, updatedAt: new Date().toISOString() });
    });
  }

  await batch.commit();
  console.info('Operator deleted permanently', { uid, operatorIds: [...operatorIds], teamsUpdated: touchedTeams.size, by: request.auth.uid });
  return { ok: true, uid, operatorIds: [...operatorIds], teamsUpdated: touchedTeams.size };
});

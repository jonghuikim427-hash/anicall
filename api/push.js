const webpush = require('web-push');

const VAPID_PUBLIC = 'BCBUOHPV5tT5QOyZwDZwr4fEITDcCTL_GqYbpsoJyDYSU8wMTNWalZQL0SzAVxT6tIlQEhqDFitvSjXZ3giur2w';
const VAPID_PRIVATE = 'mLFtR6tSCpVrZqh2pmwzPcXDXrpCxbOG7pyEBgW2iS4';

webpush.setVapidDetails('mailto:anicall@naver.com', VAPID_PUBLIC, VAPID_PRIVATE);

// Firebase Admin SDK
const admin = require('firebase-admin');
if(!admin.apps.length){
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'anicall-taxi',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY||'').replace(/\\n/g,'\n')
    }),
    databaseURL: 'https://anicall-taxi-default-rtdb.asia-southeast1.firebasedatabase.app'
  });
}
const db = admin.database();

module.exports = async function(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  const { action, subscription, title, body, badge } = req.body||{};

  // 구독 저장
  if(action==='subscribe'){
    if(!subscription) return res.status(400).json({error:'no subscription'});
    const key = Buffer.from(subscription.endpoint).toString('base64').slice(-20);
    await db.ref('pushSubscriptions/'+key).set({
      subscription: JSON.stringify(subscription),
      createdAt: Date.now()
    });
    return res.status(200).json({ok:true});
  }

  // 전체 푸시 전송
  if(action==='send'){
    const snap = await db.ref('pushSubscriptions').once('value');
    const subs = snap.val()||{};
    const payload = JSON.stringify({ title: title||'애니콜택시', body: body||'새 예약이 들어왔어요!', badge: badge||1 });
    const results = await Promise.allSettled(
      Object.values(subs).map(async function(s){
        try{
          await webpush.sendNotification(JSON.parse(s.subscription), payload);
        }catch(e){
          if(e.statusCode===410||e.statusCode===404){
            // 만료된 구독 삭제
            const key = Buffer.from(JSON.parse(s.subscription).endpoint).toString('base64').slice(-20);
            await db.ref('pushSubscriptions/'+key).remove();
          }
        }
      })
    );
    return res.status(200).json({ok:true, sent: results.length});
  }

  return res.status(400).json({error:'unknown action'});
};

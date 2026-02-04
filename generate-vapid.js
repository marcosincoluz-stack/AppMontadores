const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- VAPID KEYS START ---');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('--- VAPID KEYS END ---');

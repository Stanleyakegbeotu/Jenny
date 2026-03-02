const fs = require('fs');
const fetch = require('node-fetch');
(async ()=>{
  try{
    const env = fs.readFileSync('.env.local','utf8');
    const url = env.split(/\r?\n/).find(l=>l.startsWith('VITE_SUPABASE_URL=')).split('=')[1].trim();
    const key = env.split(/\r?\n/).find(l=>l.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1].trim();
    console.log('Supabase URL:', url);
    const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' };

    // Author upsert
    const authorBody = { name: 'CLI Test', bio: 'Saved from CLI test', email: 'cli@test.local', is_default: true };
    let res = await fetch(`${url}/rest/v1/author_settings?on_conflict=is_default&select=*`, { method: 'POST', headers, body: JSON.stringify(authorBody) });
    console.log('\nAUTHOR STATUS', res.status, res.statusText);
    console.log('AUTHOR BODY:', await res.text());

    // Notification upsert
    const notifBody = { notify_new_subscribers: false, notify_contact_form: true, notify_book_views: true, is_default: true };
    res = await fetch(`${url}/rest/v1/notification_settings?on_conflict=is_default&select=*`, { method: 'POST', headers, body: JSON.stringify(notifBody) });
    console.log('\nNOTIF STATUS', res.status, res.statusText);
    console.log('NOTIF BODY:', await res.text());

    // Analytics insert
    const analyticsBody = { event_type: 'cli_test', user_agent: 'node', ip_address: '127.0.0.1', referrer: 'cli', event_data: {}, book_id: null };
    res = await fetch(`${url}/rest/v1/analytics_events?select=*`, { method: 'POST', headers, body: JSON.stringify(analyticsBody) });
    console.log('\nANALYTICS STATUS', res.status, res.statusText);
    console.log('ANALYTICS BODY:', await res.text());
  }catch(e){ console.error('ERR', e); process.exit(1);} 
})();
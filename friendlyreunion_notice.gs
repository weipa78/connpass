// Slack の Incoming Webhook URL を指定
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

function fetchEventsWithFriendlyReunion() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twentyfourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const apiUrl = `https://connpass.com/api/v1/event/?keyword=懇親会&keyword=東京都&count=100`;

  const options = {
    method: 'get',
  };

  const response = UrlFetchApp.fetch(apiUrl, options);
  const json = JSON.parse(response.getContentText());
  let events = json.events;

  // Filter events that were updated within the last 24 hours and have a start date on or after today
  events = events.filter(event => {
    const updatedDate = new Date(event.updated_at);
    const startedDate = new Date(event.started_at);
    return updatedDate >= twelveHoursAgo && updatedDate <= now && startedDate >= today;
  });

  // Sort events by start date
  events.sort((a, b) => new Date(a.started_at) - new Date(b.started_at));

  let eventExists = events.length > 0;
  let eventMessage = '直近24時間以内に更新されたイベントは以下の通りです。\n';

  events.forEach((event) => {
    eventMessage += `\n*${event.title}* \n${event.catch} \n${event.event_url} \n開始: ${event.started_at} \n場所: ${event.address ? event.address : "オンライン"} \n更新日時: ${event.updated_at}\n`;
  });

  if (eventExists) {
    sendEventToSlack(eventMessage);
  }
}

function sendEventToSlack(message) {
  const payload = {
    text: message,
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
}

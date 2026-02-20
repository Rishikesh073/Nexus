class Campaign {
  constructor(clientId, name, channel, status, spend, roi, leads, progress) {
    this.clientId = clientId;
    this.name = name;
    this.channel = channel;
    this.status = status || 'draft';
    this.spend = spend || 0;
    this.roi = roi || 0;
    this.leads = leads || 0;
    this.progress = progress || 0;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = Campaign;
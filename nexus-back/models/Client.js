class Client {
  constructor(name, contact, email, plan, mrr, campaignsCount, avatar) {
    this.name = name;
    this.contact = contact;
    this.email = email;
    this.plan = plan || 'Starter';
    this.mrr = mrr || 0;
    this.campaignsCount = campaignsCount || 0;
    this.avatar = avatar || name.substring(0, 2).toUpperCase();
    this.since = new Date().toISOString();
  }
}

module.exports = Client;
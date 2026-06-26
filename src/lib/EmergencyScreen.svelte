<script>
  import { view } from '../stores/filters.js';
  import contacts from '../data/contacts.json';

  function back() { view.set({ name: 'list', params: {} }); }
</script>

<button class="back" on:click={back}>← Back</button>

<article>
  <header>
    <h1>🚨 Emergency</h1>
    <p class="lead">If you're having a reaction or got the wrong food, here's what to do.</p>
  </header>

  <section class="critical">
    <h2>Having a reaction right now</h2>
    <ol>
      <li><strong>Find First Aid.</strong> Every Disney park has multiple First Aid stations staffed by nurses.</li>
      <li>Tell them what you ate and what reactions you're having.</li>
      <li>Use your epinephrine auto-injector if prescribed and you haven't already.</li>
      <li>Call 911 if symptoms are severe (difficulty breathing, throat swelling).</li>
    </ol>
  </section>

  <section>
    <h2>First Aid locations</h2>
    <ul>
      <li><strong>Magic Kingdom:</strong> Town Square Theater, Adventureland (near Jungle Cruise), Haunted Mansion area, Tomorrowland (near Space Mountain)</li>
      <li><strong>EPCOT:</strong> Future World (Odyssey building), World Showcase (American Adventure pavilion)</li>
    </ul>
  </section>

  <section>
    <h2>Got the wrong order?</h2>
    <ol>
      <li>Tell a Cast Member immediately — don't eat it.</li>
      <li>They'll remake the item at no charge.</li>
      <li>If you're at quick-service, ask to speak with a manager.</li>
      <li>If at table-service, your server will fix it.</li>
    </ol>
  </section>

  <section>
    <h2>Disney contacts</h2>
    <dl>
      <dt>Specialty Diets email</dt>
      <dd><a href="mailto:{contacts.specialDietsEmail}">{contacts.specialDietsEmail}</a></dd>
      <dt>Dining reservations</dt>
      <dd><a href="tel:{contacts.diningPhoneNumeric.replace(/[^0-9]/g, '')}">{contacts.diningPhone}</a></dd>
    </dl>
  </section>

  <section class="pack">
    <h2>Pack these in your bag</h2>
    <ul>
      <li>Epinephrine auto-injector (2 if prescribed) — keep accessible, not in checked bag</li>
      <li>Antihistamine</li>
      <li>Hand sanitizer / wipes</li>
      <li>Backup protein bars (verified safe)</li>
      <li>Your chef card (printed from this app)</li>
      <li>List of safe restaurants nearby</li>
    </ul>
  </section>
</article>

<style>
  .back {
    color: var(--accent);
    font-size: 14px;
    margin-bottom: 12px;
    padding: 4px 0;
  }
  article { display: flex; flex-direction: column; gap: 18px; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .lead { color: var(--text-dim); font-size: 14px; }
  h2 { font-size: 16px; margin-bottom: 8px; }

  .critical {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--danger);
    border-radius: var(--radius);
    padding: 14px;
  }
  .critical h2 { color: var(--danger); }
  .critical ol {
    list-style: none;
    counter-reset: step;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 0;
  }
  .critical ol li {
    counter-increment: step;
    padding-left: 32px;
    position: relative;
    line-height: 1.5;
    font-size: 14px;
  }
  .critical ol li::before {
    content: counter(step);
    position: absolute;
    left: 0;
    top: 0;
    width: 24px;
    height: 24px;
    background: var(--danger);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  ul, ol {
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    line-height: 1.5;
  }
  li strong { color: var(--text); }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 12px;
    font-size: 14px;
  }
  dt { color: var(--text-mute); font-weight: 500; }
  dd { color: var(--text); }

  .pack {
    background: var(--bg-elev);
    border-radius: var(--radius);
    padding: 14px;
  }
  .pack h2 { margin-bottom: 10px; }
  .pack ul {
    list-style: none;
    padding-left: 0;
  }
  .pack li {
    padding-left: 20px;
    position: relative;
  }
  .pack li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--safe);
    font-weight: 700;
  }
</style>